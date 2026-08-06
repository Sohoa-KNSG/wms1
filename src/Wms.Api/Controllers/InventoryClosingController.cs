using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/inventory")]
[Authorize(Roles = "ADMIN,IT_ADMIN,THU_KHO")]
public class InventoryClosingController : ControllerBase
{
    private readonly IStoredProcedureExecutor _spExecutor;
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly ICurrentUserService _currentUserService;

    public InventoryClosingController(
        IStoredProcedureExecutor spExecutor,
        ISqlConnectionFactory connectionFactory,
        ICurrentUserService currentUserService)
    {
        _spExecutor = spExecutor;
        _connectionFactory = connectionFactory;
        _currentUserService = currentUserService;
    }

    [HttpPost("migrate-initial")]
    public async Task<IActionResult> MigrateInitialInventory()
    {
        await _spExecutor.ExecuteAsync("usp_wms_migrate_initial_inventory");
        return Ok(CommandResponse.Success("Kết chuyển Tồn kho Ban đầu (UC24) thành công và đã hạch toán Sổ cái Kép (Dual Ledger)."));
    }

    [HttpPost("period-close")]
    public async Task<IActionResult> PeriodEndClose([FromBody] PeriodClosingRequest request)
    {
        if (request.Year < 2020 || request.Month < 1 || request.Month > 12)
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Kỳ chốt kho (Tháng/Năm) không hợp lệ."));
        }

        string currentUser = _currentUserService.Username;
        using var connection = await _connectionFactory.CreateConnectionAsync();

        // Perform UC25 Period-End Closing Transaction
        using var transaction = connection.BeginTransaction();

        try
        {
            string closingId = $"CLOSE_{request.Year:D4}{request.Month:D2}";

            // 1. Snapshot Carton Level (`monthly_carton_balances`)
            await connection.ExecuteAsync(@"
                INSERT INTO monthly_carton_balances (closing_id, closing_year, closing_month, id_60, product_code, closing_qty, current_location_code, stock_type, created_at)
                SELECT @closingId, @Year, @Month, id_60, product_code, current_qty, current_location_code, stock_type, GETDATE()
                FROM tbl_thung60_kho
                WHERE status != 'DISPATCHED'", new { closingId, request.Year, request.Month }, transaction);

            // 2. Snapshot SKU Level (`monthly_inventory_balances`)
            await connection.ExecuteAsync(@"
                INSERT INTO monthly_inventory_balances (closing_id, closing_year, closing_month, product_code, total_closing_qty, created_at)
                SELECT @closingId, @Year, @Month, product_code, SUM(current_qty), GETDATE()
                FROM tbl_thung60_kho
                WHERE status != 'DISPATCHED'
                GROUP BY product_code", new { closingId, request.Year, request.Month }, transaction);

            // 3. Post Dual Ledger Period-End Header
            Guid transactionId = Guid.NewGuid();
            await connection.ExecuteAsync(@"
                INSERT INTO stock_transaction_book (transaction_id, transaction_type, document_no, posted_by, posted_at)
                VALUES (@transactionId, 'PERIOD_END_CLOSING', @closingId, @currentUser, GETDATE())",
                new { transactionId, closingId, currentUser }, transaction);

            transaction.Commit();
            return Ok(CommandResponse.Success($"Chốt sổ kỳ {request.Month:D2}/{request.Year} (UC25) thành công. Document No: {closingId}"));
        }
        catch (Exception)
        {
            transaction.Rollback();
            throw;
        }
    }
}

public record PeriodClosingRequest(int Year, int Month);
