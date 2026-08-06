using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/reconciliation")]
[Authorize(Policy = PolicyNames.ReconciliationRead)]
public class ReconciliationController : ControllerBase
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public ReconciliationController(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet("transactions/{id}")]
    public async Task<IActionResult> ReconcileTransaction([FromRoute] string id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        var txn = await connection.QueryFirstOrDefaultAsync<dynamic>(
            "SELECT * FROM stock_transaction_book WHERE transaction_id = @id", new { id });

        if (txn == null)
        {
            return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, "Không tìm thấy giao dịch."));
        }

        var invRes = await connection.QueryAsync<dynamic>(@"
            SELECT product_code, SUM(quantity_change) as total_inv_change
            FROM inventory_ledger
            WHERE transaction_id = @id
            GROUP BY product_code", new { id });

        var itemRes = await connection.QueryAsync<dynamic>(@"
            SELECT product_code, SUM(total_quantity_change) as total_item_change
            FROM item_ledger
            WHERE transaction_id = @id
            GROUP BY product_code", new { id });

        var comparisonMap = new Dictionary<string, (decimal invChange, decimal itemChange)>();

        foreach (var r in invRes)
        {
            string pcode = (string)r.product_code;
            decimal invChange = Convert.ToDecimal(r.total_inv_change);
            comparisonMap[pcode] = (invChange, 0m);
        }

        foreach (var r in itemRes)
        {
            string pcode = (string)r.product_code;
            decimal itemChange = Convert.ToDecimal(r.total_item_change);
            if (comparisonMap.TryGetValue(pcode, out var existing))
            {
                comparisonMap[pcode] = (existing.invChange, itemChange);
            }
            else
            {
                comparisonMap[pcode] = (0m, itemChange);
            }
        }

        var comparisonRows = comparisonMap.Select(kv => new
        {
            product_code = kv.Key,
            unit_ledger_change = kv.Value.invChange,
            item_ledger_change = kv.Value.itemChange,
            discrepancy = kv.Value.invChange - kv.Value.itemChange
        }).ToList();

        bool isBalanced = comparisonRows.All(r => Math.Abs(r.discrepancy) < 0.0001m);

        return Ok(ApiResponse<object>.Success(new
        {
            transaction = txn,
            is_balanced = isBalanced,
            comparison = comparisonRows
        }));
    }

    [HttpGet("inventory")]
    public async Task<IActionResult> ReconcileInventory()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        var physicalRes = await connection.QueryAsync<dynamic>(@"
            SELECT product_code, SUM(current_qty) as physical_stock, COUNT(id_60) as total_boxes
            FROM tbl_thung60_kho
            WHERE status IN ('AVAILABLE', 'BLOCKED', 'ALLOCATED', 'PICKED', 'STAGED', 'PALLETIZED', 'PACKED', 'PACKED_360', 'OPEN', 'COMPLETED')
            GROUP BY product_code");

        var ledgerRes = await connection.QueryAsync<dynamic>(@"
            SELECT product_code, SUM(total_quantity_change) as ledger_projected_stock
            FROM item_ledger
            GROUP BY product_code");

        var map = new Dictionary<string, (decimal physical, int boxes, decimal ledger)>();

        foreach (var r in physicalRes)
        {
            string pcode = (string)r.product_code;
            decimal physical = Convert.ToDecimal(r.physical_stock);
            int boxes = Convert.ToInt32(r.total_boxes);
            map[pcode] = (physical, boxes, 0m);
        }

        foreach (var r in ledgerRes)
        {
            string pcode = (string)r.product_code;
            decimal ledger = Convert.ToDecimal(r.ledger_projected_stock);
            if (map.TryGetValue(pcode, out var existing))
            {
                map[pcode] = (existing.physical, existing.boxes, ledger);
            }
            else
            {
                map[pcode] = (0m, 0, ledger);
            }
        }

        var rows = map.Select(kv => new
        {
            product_code = kv.Key,
            physical_stock = kv.Value.physical,
            total_boxes = kv.Value.boxes,
            ledger_projected_stock = kv.Value.ledger,
            discrepancy = kv.Value.physical - kv.Value.ledger
        }).ToList();

        bool isBalanced = rows.All(r => Math.Abs(r.discrepancy) < 0.0001m);

        return Ok(ApiResponse<object>.Success(new
        {
            is_balanced = isBalanced,
            reconciliation = rows
        }));
    }
}
