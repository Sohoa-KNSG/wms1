using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Models;
using Wms.Application.Common.Interfaces;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers
{
    [ApiController]
    [Route("api/v1/temporary-dispatch")]
    [Authorize]
    public class TemporaryDispatchController : ControllerBase
    {
        private readonly ISqlConnectionFactory _dbConnectionFactory;
        private readonly ICurrentUserService _currentUserService;

        public TemporaryDispatchController(
            ISqlConnectionFactory dbConnectionFactory,
            ICurrentUserService currentUserService)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTemporaryDispatches([FromQuery] string search, [FromQuery] string status, [FromQuery] bool? overdueOnly)
        {
            using var connection = _dbConnectionFactory.CreateConnection();
            var query = @"
                SELECT dispatch_no, reason_code, borrower_name, dispatch_date, due_date,
                       total_cartons, total_qty, returned_qty, converted_qty, status, created_by, created_at,
                       CASE WHEN due_date < CAST(GETDATE() AS DATE) AND status = 'TEMPORARY_ISSUE' THEN 1 ELSE 0 END AS is_overdue
                FROM tbl_temporary_dispatch_header
                WHERE 1=1";

            var dp = new DynamicParameters();
            if (!string.IsNullOrEmpty(search))
            {
                query += " AND (dispatch_no LIKE @search OR borrower_name LIKE @search)";
                dp.Add("search", $"%{search}%");
            }
            if (!string.IsNullOrEmpty(status) && status != "All")
            {
                query += " AND status = @status";
                dp.Add("status", status);
            }
            if (overdueOnly == true)
            {
                query += " AND due_date < CAST(GETDATE() AS DATE) AND status = 'TEMPORARY_ISSUE'";
            }

            query += " ORDER BY created_at DESC";

            var list = await connection.QueryAsync<object>(query, dp);
            return Ok(ApiResponse<object>.Success(list, "Lấy danh sách phiếu xuất tạm thành công."));
        }

        [HttpPost]
        public async Task<IActionResult> CreateTemporaryDispatch([FromBody] CreateTempDispatchRequest request)
        {
            if (request == null || request.Items == null || !request.Items.Any() || string.IsNullOrEmpty(request.BorrowerName))
            {
                return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu thông tin bắt buộc (Đơn vị mượn, Danh sách thùng)."));
            }

            if (!Request.Headers.TryGetValue("X-Request-Id", out var requestIdValues) || string.IsNullOrEmpty(requestIdValues.FirstOrDefault()))
            {
                return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu header X-Request-Id để đảm bảo Idempotency."));
            }
            string requestId = requestIdValues.First() ?? Guid.NewGuid().ToString();
            string actor = _currentUserService.Username ?? "THU_KHO";
            string dispatchNo = "TEMP-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            using var connection = _dbConnectionFactory.CreateConnection();
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                var existingLog = await connection.QueryFirstOrDefaultAsync<int?>(
                    "SELECT 1 FROM command_request_log WITH (UPDLOCK, HOLDLOCK) WHERE request_id = @requestId",
                    new { requestId }, transaction);

                if (existingLog.HasValue)
                {
                    transaction.Rollback();
                    return Ok(ApiResponse<object>.Success(new { dispatch_no = requestId }, "Yêu cầu đã được xử lý trước đó (Idempotent)."));
                }

                await connection.ExecuteAsync(
                    "INSERT INTO command_request_log (request_id, command_type, status) VALUES (@requestId, 'TEMPORARY_DISPATCH', 'COMPLETED')",
                    new { requestId }, transaction);

                decimal totalQty = 0;
                var validItems = new List<dynamic>();

                foreach (var item in request.Items)
                {
                    var carton = await connection.QueryFirstOrDefaultAsync<dynamic>(@"
                        SELECT id_60, product_code, current_qty, stock_type, status 
                        FROM tbl_thung60_kho WITH (UPDLOCK, HOLDLOCK)
                        WHERE id_60 = @Id60",
                        new { Id60 = item.Id60 }, transaction);

                    if (carton == null)
                    {
                        transaction.Rollback();
                        return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.NotFound, $"Thùng {item.Id60} không tồn tại."));
                    }

                    if ((string)carton.stock_type != "UNRESTRICTED")
                    {
                        transaction.Rollback();
                        return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, $"Thùng {item.Id60} không ở trạng thái UNRESTRICTED."));
                    }

                    totalQty += (decimal)carton.current_qty;
                    validItems.Add(carton);
                }

                await connection.ExecuteAsync(@"
                    INSERT INTO tbl_temporary_dispatch_header (
                        dispatch_no, reason_code, borrower_name, dispatch_date, due_date, 
                        total_cartons, total_qty, status, created_by, created_at
                    ) VALUES (
                        @dispatchNo, @reasonCode, @borrowerName, CAST(GETDATE() AS DATE), @dueDate, 
                        @totalCartons, @totalQty, 'TEMPORARY_ISSUE', @actor, GETDATE()
                    )",
                    new
                    {
                        dispatchNo,
                        reasonCode = request.ReasonCode ?? "EXHIBITION",
                        borrowerName = request.BorrowerName,
                        dueDate = request.DueDate,
                        totalCartons = validItems.Count,
                        totalQty,
                        actor
                    }, transaction);

                string txId = "TX-" + Guid.NewGuid().ToString("N").Substring(0, 10);
                await connection.ExecuteAsync(@"
                    INSERT INTO stock_transaction_book (transaction_id, transaction_type, document_no, posted_by, posted_at)
                    VALUES (@txId, 'TEMPORARY_DISPATCH', @dispatchNo, @actor, GETDATE())",
                    new { txId, dispatchNo, actor }, transaction);

                foreach (var c in validItems)
                {
                    await connection.ExecuteAsync(@"
                        INSERT INTO tbl_temporary_dispatch_detail (dispatch_no, id_60, product_code, qty, item_status)
                        VALUES (@dispatchNo, @Id60, @ProductCode, @Qty, 'TEMPORARY_ISSUE')",
                        new { dispatchNo, Id60 = (string)c.id_60, ProductCode = (string)c.product_code, Qty = (decimal)c.current_qty }, transaction);

                    await connection.ExecuteAsync(@"
                        UPDATE tbl_thung60_kho SET stock_type = 'TEMPORARY_ISSUE', status = 'DISPATCHED'
                        WHERE id_60 = @Id60",
                        new { Id60 = (string)c.id_60 }, transaction);

                    await connection.ExecuteAsync(@"
                        INSERT INTO thung60_event (event_id, id_60, event_type, old_stock_type, new_stock_type, message, performed_by, performed_at, request_id)
                        VALUES (@EventId, @Id60, 'TEMPORARY_DISPATCH', 'UNRESTRICTED', 'TEMPORARY_ISSUE', N'Xuất tạm thành phẩm', @actor, GETDATE(), @requestId)",
                        new { EventId = "EVT-" + Guid.NewGuid().ToString("N").Substring(0, 10), Id60 = (string)c.id_60, actor, requestId }, transaction);

                    await connection.ExecuteAsync(@"
                        INSERT INTO inventory_ledger (ledger_date, id_60, product_code, transaction_id, source_document_no, quantity_change, old_stock_type, new_stock_type, created_at)
                        VALUES (CAST(GETDATE() AS DATE), @Id60, @ProductCode, @txId, @dispatchNo, -@Qty, 'UNRESTRICTED', 'TEMPORARY_ISSUE', GETDATE())",
                        new { Id60 = (string)c.id_60, ProductCode = (string)c.product_code, txId, dispatchNo, Qty = (decimal)c.current_qty }, transaction);
                }

                transaction.Commit();
                return Ok(ApiResponse<object>.Success(new { dispatch_no = dispatchNo }, "Tạo phiếu xuất tạm thành công."));
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return StatusCode(500, ApiResponse<object>.Error("SystemError", ex.Message));
            }
        }
    }

    public class CreateTempDispatchRequest
    {
        public string ReasonCode { get; set; } = string.Empty;
        public string BorrowerName { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public List<TempDispatchItemDto> Items { get; set; } = new();
    }

    public class TempDispatchItemDto
    {
        public string Id60 { get; set; } = string.Empty;
    }
}
