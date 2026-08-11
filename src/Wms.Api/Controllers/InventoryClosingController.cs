using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/inventory")]
[Authorize(Policy = PolicyNames.InventoryClosingManage)]
public class InventoryClosingController : ControllerBase
{
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly ICurrentUserService _currentUserService;

    public InventoryClosingController(
        ISqlConnectionFactory connectionFactory,
        ICurrentUserService currentUserService)
    {
        _connectionFactory = connectionFactory;
        _currentUserService = currentUserService;
    }

    [HttpPost("migrate-initial")]
    public async Task<IActionResult> MigrateInitialInventory()
    {
        string? requestId = GetRequestId();
        if (requestId is null)
        {
            return MissingRequestId();
        }

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction(IsolationLevel.Serializable);
        try
        {
            var existingCommand = await connection.QueryFirstOrDefaultAsync<CommandState>(@"
                SELECT command_type AS CommandType, status AS Status
                FROM command_request_log WITH (UPDLOCK, HOLDLOCK)
                WHERE request_id = @RequestId", new { RequestId = requestId }, transaction);

            if (existingCommand is not null)
            {
                transaction.Rollback();
                if (existingCommand.CommandType == "INITIAL_INVENTORY_MIGRATION" && existingCommand.Status == "SUCCESS")
                {
                    return Ok(CommandResponse.Success("Yêu cầu kết chuyển tồn đầu đã được xử lý trước đó."));
                }

                return Conflict(ApiResponse<object>.Error(
                    WmsErrorCodes.InvalidStateTransition,
                    "X-Request-Id đã được sử dụng cho một yêu cầu khác."));
            }

            await connection.ExecuteAsync(@"
                INSERT INTO command_request_log(request_id, command_type, status)
                VALUES (@RequestId, 'INITIAL_INVENTORY_MIGRATION', 'PROCESSING')",
                new { RequestId = requestId }, transaction);

            await connection.ExecuteAsync(
                "usp_wms_migrate_initial_inventory",
                transaction: transaction,
                commandType: CommandType.StoredProcedure);

            await connection.ExecuteAsync(@"
                UPDATE command_request_log
                SET status = 'SUCCESS'
                WHERE request_id = @RequestId",
                new { RequestId = requestId }, transaction);

            transaction.Commit();
            return Ok(CommandResponse.Success("Kết chuyển Tồn kho Ban đầu (UC24) thành công và đã hạch toán Sổ cái Kép (Dual Ledger)."));
        }
        catch
        {
            TryRollback(transaction);
            throw;
        }
    }

    [HttpPost("period-close")]
    public async Task<IActionResult> PeriodEndClose([FromBody] PeriodClosingRequest request)
    {
        if (request.Year < 2020 || request.Month < 1 || request.Month > 12)
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Kỳ chốt kho (Tháng/Năm) không hợp lệ."));
        }

        string? requestId = GetRequestId();
        if (requestId is null)
        {
            return MissingRequestId();
        }

        string currentUser = _currentUserService.Username;
        using var connection = await _connectionFactory.CreateConnectionAsync();

        // Perform UC25 Period-End Closing Transaction
        using var transaction = connection.BeginTransaction(IsolationLevel.Serializable);

        try
        {
            string closingId = $"CLOSE_{request.Year:D4}{request.Month:D2}";

            var existingRequest = await connection.QueryFirstOrDefaultAsync<string>(@"
                SELECT closing_id
                FROM inventory_period_closing WITH (UPDLOCK, HOLDLOCK)
                WHERE request_id = @RequestId",
                new { RequestId = requestId }, transaction);

            if (!string.IsNullOrWhiteSpace(existingRequest))
            {
                transaction.Rollback();
                return Ok(CommandResponse.Success($"Yêu cầu chốt sổ đã được xử lý trước đó. Document No: {existingRequest}"));
            }

            var existingPeriod = await connection.QueryFirstOrDefaultAsync<string>(@"
                SELECT closing_id
                FROM inventory_period_closing WITH (UPDLOCK, HOLDLOCK)
                WHERE closing_year = @Year AND closing_month = @Month",
                new { request.Year, request.Month }, transaction);

            if (!string.IsNullOrWhiteSpace(existingPeriod))
            {
                transaction.Rollback();
                return Conflict(ApiResponse<object>.Error(
                    WmsErrorCodes.InvalidStateTransition,
                    $"Kỳ {request.Month:D2}/{request.Year} đã được chốt với chứng từ {existingPeriod}."));
            }

            await connection.ExecuteAsync(@"
                INSERT INTO command_request_log(request_id, command_type, status)
                VALUES (@RequestId, 'INVENTORY_PERIOD_CLOSE', 'PROCESSING');

                INSERT INTO inventory_period_closing
                    (closing_id, request_id, closing_year, closing_month, status, closed_by)
                VALUES
                    (@ClosingId, @RequestId, @Year, @Month, 'PROCESSING', @CurrentUser);",
                new
                {
                    ClosingId = closingId,
                    RequestId = requestId,
                    request.Year,
                    request.Month,
                    CurrentUser = currentUser
                }, transaction);

            // 1. Snapshot Carton Level (`monthly_carton_balances`)
            await connection.ExecuteAsync(@"
                INSERT INTO monthly_carton_balances (closing_id, closing_year, closing_month, id_60, product_code, closing_qty, current_location_code, stock_type, created_at)
                SELECT @closingId, @Year, @Month, id_60, product_code, current_qty, current_location_code, stock_type, GETUTCDATE()
                FROM tbl_thung60_kho
                WHERE status != 'DISPATCHED'", new { closingId, request.Year, request.Month }, transaction);

            // 2. Snapshot SKU Level (`monthly_inventory_balances`)
            await connection.ExecuteAsync(@"
                INSERT INTO monthly_inventory_balances (closing_id, closing_year, closing_month, product_code, total_closing_qty, created_at)
                SELECT @closingId, @Year, @Month, product_code, SUM(current_qty), GETUTCDATE()
                FROM tbl_thung60_kho
                WHERE status != 'DISPATCHED'
                GROUP BY product_code", new { closingId, request.Year, request.Month }, transaction);

            // 3. Post Dual Ledger Period-End Header
            Guid transactionId = Guid.NewGuid();
            await connection.ExecuteAsync(@"
                INSERT INTO stock_transaction_book (transaction_id, transaction_type, document_no, posted_by, posted_at)
                VALUES (@transactionId, 'PERIOD_END_CLOSING', @closingId, @currentUser, GETUTCDATE())",
                new { transactionId, closingId, currentUser }, transaction);

            await connection.ExecuteAsync(@"
                UPDATE inventory_period_closing
                SET status = 'SUCCESS', closed_at = GETUTCDATE()
                WHERE closing_id = @ClosingId;

                UPDATE command_request_log
                SET status = 'SUCCESS'
                WHERE request_id = @RequestId;",
                new { ClosingId = closingId, RequestId = requestId }, transaction);

            transaction.Commit();
            return Ok(CommandResponse.Success($"Chốt sổ kỳ {request.Month:D2}/{request.Year} (UC25) thành công. Document No: {closingId}"));
        }
        catch (Exception)
        {
            TryRollback(transaction);
            throw;
        }
    }

    private string? GetRequestId()
    {
        if (!Request.Headers.TryGetValue("X-Request-Id", out var values))
        {
            return null;
        }

        var requestId = values.FirstOrDefault();
        return string.IsNullOrWhiteSpace(requestId) ? null : requestId.Trim();
    }

    private BadRequestObjectResult MissingRequestId() => BadRequest(
        ApiResponse<object>.Error(
            WmsErrorCodes.ValidationFailed,
            "Thiếu header X-Request-Id để đảm bảo idempotency."));

    private static void TryRollback(IDbTransaction transaction)
    {
        try
        {
            transaction.Rollback();
        }
        catch (InvalidOperationException)
        {
            // Stored procedure may already have rolled back the ambient SQL transaction.
        }
    }

    private sealed class CommandState
    {
        public string CommandType { get; init; } = string.Empty;
        public string Status { get; init; } = string.Empty;
    }
}

public record PeriodClosingRequest(int Year, int Month);
