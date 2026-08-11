using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/stock-type-change")]
[Authorize(Policy = PolicyNames.StockTypeManage)]
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

        if (string.IsNullOrWhiteSpace(request.NewStockType) || string.IsNullOrWhiteSpace(request.ReasonCode))
        {
            return BadRequest(ApiResponse<object>.Error(
                WmsErrorCodes.ValidationFailed,
                "Loại tồn mới và mã lý do là bắt buộc."));
        }

        var items = request.Items
            .Where(item => !string.IsNullOrWhiteSpace(item.Id60))
            .GroupBy(item => item.Id60.Trim(), StringComparer.OrdinalIgnoreCase)
            .Select(group => group.First() with { Id60 = group.Key })
            .ToList();

        if (items.Count == 0)
        {
            return BadRequest(ApiResponse<object>.Error(
                WmsErrorCodes.ValidationFailed,
                "Danh sách thùng 60 không có mã hợp lệ."));
        }

        if (!Request.Headers.TryGetValue("X-Request-Id", out var requestIdValues) || string.IsNullOrEmpty(requestIdValues.FirstOrDefault()))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu header X-Request-Id để đảm bảo Idempotency."));
        }
        string requestId = requestIdValues.First() ?? Guid.NewGuid().ToString();


        string actor = _currentUserService.Username;
        string requestNo = "STC-" + Guid.NewGuid().ToString("N");

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            // Idempotency check
            var existingRequestNo = await connection.QueryFirstOrDefaultAsync<string>(@"
                SELECT request_no
                FROM stock_type_change_request_header WITH (UPDLOCK, HOLDLOCK)
                WHERE request_id = @requestId",
                new { requestId }, transaction);

            if (!string.IsNullOrWhiteSpace(existingRequestNo))
            {
                transaction.Rollback();
                return Ok(ApiResponse<object>.Success(
                    new { request_no = existingRequestNo },
                    "Yêu cầu đã được xử lý trước đó (Idempotent)."));
            }

            await connection.ExecuteAsync(
                "INSERT INTO command_request_log (request_id, command_type, status) VALUES (@requestId, 'STOCK_TYPE_CHANGE', 'PROCESSING')",
                new { requestId }, transaction);

            await connection.ExecuteAsync(@"
                INSERT INTO stock_type_change_request_header (
                    request_no, request_id, change_type, reason_code, status, requested_by, requested_at, posted_by, posted_at
                ) VALUES (
                    @requestNo, @requestId, @ChangeType, @ReasonCode, 'POSTED', @actor, GETUTCDATE(), @actor, GETUTCDATE()
                )", new
            {
                requestNo,
                requestId,
                ChangeType = request.ChangeType.ToString().ToUpper(),
                request.ReasonCode,
                actor
            }, transaction);

            int lineNo = 1;
            foreach (var item in items)
            {
                await connection.ExecuteAsync(
                    "dbo.usp_StockType_Change",
                    new
                    {
                        requestNo,
                        lineNo = lineNo++,
                        id60 = item.Id60,
                        changeType = request.ChangeType.ToString().ToUpper(),
                        newStockType = request.NewStockType.ToUpper(),
                        newReason = request.ReasonCode,
                        actor,
                        requestId
                    },
                    transaction,
                    commandType: System.Data.CommandType.StoredProcedure);
            }

            await connection.ExecuteAsync(
                "UPDATE command_request_log SET status = 'SUCCESS' WHERE request_id = @requestId",
                new { requestId },
                transaction);

            transaction.Commit();
            return Ok(ApiResponse<object>.Success(new { request_no = requestNo }, $"Khóa/chuyển stock type thành công cho {items.Count} thùng 60."));
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
