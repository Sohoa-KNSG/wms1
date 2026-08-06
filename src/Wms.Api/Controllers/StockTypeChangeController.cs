using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/stock-type-change")]
[Authorize]
public class StockTypeChangeController : ControllerBase
{
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly ICurrentUserService _currentUserService;

    public StockTypeChangeController(ISqlConnectionFactory connectionFactory, ICurrentUserService currentUserService)
    {
        _connectionFactory = connectionFactory;
        _currentUserService = currentUserService;
    }

    [HttpPost]
    public async Task<IActionResult> ChangeStockType([FromBody] StockTypeChangeRequest request)
    {
        if (request.Items == null || !request.Items.Any())
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu danh sách thùng 60 cần chuyển stock type."));
        }

        if (!Request.Headers.TryGetValue("X-Request-Id", out var requestIdValues) || string.IsNullOrEmpty(requestIdValues.FirstOrDefault()))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu header X-Request-Id để đảm bảo Idempotency."));
        }
        string requestId = requestIdValues.First() ?? Guid.NewGuid().ToString();


        string actor = _currentUserService.Username;
        string requestNo = "STC-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            // Idempotency check
            var existingRequest = await connection.QueryFirstOrDefaultAsync<int?>(
                "SELECT 1 FROM command_request_log WITH (UPDLOCK, HOLDLOCK) WHERE request_id = @requestId", 
                new { requestId }, transaction);

            if (existingRequest.HasValue)
            {
                transaction.Rollback();
                return Ok(ApiResponse<object>.Success(new { request_no = requestId }, "Yêu cầu đã được xử lý trước đó (Idempotent)."));
            }

            await connection.ExecuteAsync(
                "INSERT INTO command_request_log (request_id, command_type, status) VALUES (@requestId, 'STOCK_TYPE_CHANGE', 'COMPLETED')",
                new { requestId }, transaction);

            await connection.ExecuteAsync(@"
                INSERT INTO stock_type_change_request_header (
                    request_no, change_type, reason_code, status, requested_by, requested_at, posted_by, posted_at
                ) VALUES (
                    @requestNo, @ChangeType, @ReasonCode, 'POSTED', @actor, GETDATE(), @actor, GETDATE()
                )", new
            {
                requestNo,
                ChangeType = request.ChangeType.ToString().ToUpper(),
                request.ReasonCode,
                actor
            }, transaction);

            int lineNo = 1;
            foreach (var item in request.Items)
            {
                var carton = await connection.QueryFirstOrDefaultAsync<dynamic>(@"
                    SELECT id_60, product_code, current_qty, stock_type, block_reason_code, status 
                    FROM tbl_thung60_kho WITH (UPDLOCK, HOLDLOCK)
                    WHERE id_60 = @Id60 OR qr_60 = @Id60",
                    new { item.Id60 }, transaction);

                if (carton == null)
                {
                    transaction.Rollback();
                    return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, $"Không tìm thấy thùng 60 có mã: {item.Id60}"));
                }

                string currentStatus = (string)carton.status;
                if (currentStatus == "PICKED" || currentStatus == "STAGED" || currentStatus == "DISPATCHED")
                {
                    transaction.Rollback();
                    return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.InvalidState, $"Thùng {item.Id60} đang ở trạng thái {currentStatus}, không thể đổi stock type."));
                }

                string oldStockType = (string)carton.stock_type;
                string oldReason = (string)carton.block_reason_code ?? "";
                string newStockType = request.NewStockType.ToUpper();
                string newReason = request.ReasonCode;

                await connection.ExecuteAsync(@"
                    INSERT INTO stock_type_change_request_detail (
                        request_no, line_no, id_60, product_code, qty, old_stock_type, new_stock_type, old_block_reason_code, new_block_reason_code
                    ) VALUES (
                        @requestNo, @lineNo, @Id60, @ProductCode, @Qty, @oldStockType, @newStockType, @oldReason, @newReason
                    )", new
                {
                    requestNo,
                    lineNo = lineNo++,
                    Id60 = (string)carton.id_60,
                    ProductCode = (string)carton.product_code,
                    Qty = (decimal)carton.current_qty,
                    oldStockType,
                    newStockType,
                    oldReason,
                    newReason
                }, transaction);

                await connection.ExecuteAsync(@"
                    UPDATE tbl_thung60_kho SET
                        stock_type = @newStockType,
                        block_reason_code = @newReason,
                        updated_at = GETDATE()
                    WHERE id_60 = @Id60",
                    new { newStockType, newReason, Id60 = (string)carton.id_60 }, transaction);

                await connection.ExecuteAsync(@"
                    INSERT INTO thung60_event (event_id, id_60, event_type, old_stock_type, new_stock_type, message, performed_by, performed_at, request_id)
                    VALUES (@EventId, @Id60, 'STOCK_TYPE_CHANGE', @oldStockType, @newStockType, @newReason, @actor, GETDATE(), @requestId)",
                    new { EventId = "EVT-" + Guid.NewGuid().ToString("N").Substring(0, 10), Id60 = (string)carton.id_60, oldStockType, newStockType, newReason, actor, requestId }, transaction);

                var txId = "TX-" + Guid.NewGuid().ToString("N").Substring(0, 10);
                
                await connection.ExecuteAsync(@"
                    INSERT INTO stock_transaction_book (transaction_id, transaction_type, document_no, posted_by, posted_at)
                    VALUES (@TxId, 'STOCK_RECLASSIFY', @requestNo, @actor, GETDATE())",
                    new { TxId = txId, requestNo, actor }, transaction);

                await connection.ExecuteAsync(@"
                    INSERT INTO inventory_ledger (ledger_date, id_60, product_code, transaction_id, source_document_no, quantity_change, old_stock_type, new_stock_type, created_at)
                    VALUES (CAST(GETDATE() AS DATE), @Id60, @ProductCode, @TxId, @requestNo, 0, @oldStockType, @newStockType, GETDATE())",
                    new
                    {
                        Id60 = (string)carton.id_60,
                        ProductCode = (string)carton.product_code,
                        TxId = txId,
                        requestNo,
                        oldStockType,
                        newStockType
                    }, transaction);
            }

            transaction.Commit();
            return Ok(ApiResponse<object>.Success(new { request_no = requestNo }, $"Khóa/chuyển stock type thành công cho {request.Items.Count()} thùng 60."));
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}

public enum StockTypeChangeType { BLOCK, RELEASE, RECLASSIFY }
public record StockTypeChangeItemDto(string Id60);
public record StockTypeChangeRequest(StockTypeChangeType ChangeType, string NewStockType, string ReasonCode, IEnumerable<StockTypeChangeItemDto> Items);
