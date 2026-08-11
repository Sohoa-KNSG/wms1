using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/reports")]
[Authorize(Policy = PolicyNames.ReportsRead)]
public class ReportsController : ControllerBase
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public ReportsController(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet("inventory/macro")]
    public async Task<IActionResult> GetMacroReport([FromQuery] string? search)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = @"
            SELECT 
                product_code, 
                customer_code, 
                current_oem_order_no, 
                status, 
                stock_type, 
                SUM(current_qty) AS total_qty,
                SUM(CASE WHEN is_virtual = 1 THEN 1 ELSE 0 END) AS count_thung_ao,
                SUM(CASE WHEN is_virtual = 0 AND current_pack360_id IS NULL THEN 1 ELSE 0 END) AS count_thung_60_roi,
                COUNT(DISTINCT current_pack360_id) AS count_kien_360
            FROM tbl_thung60_kho
            WHERE status != 'DISPATCHED'
        ";

        var dynamicParams = new DynamicParameters();
        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += " AND product_code LIKE @search ";
            dynamicParams.Add("search", $"%{search}%");
        }

        sql += " GROUP BY product_code, customer_code, current_oem_order_no, status, stock_type ORDER BY product_code;";

        var result = await connection.QueryAsync(sql, dynamicParams);
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("inventory/micro")]
    public async Task<IActionResult> GetMicroReport(
        [FromQuery] string? search,
        [FromQuery] string? product_code,
        [FromQuery] string? status,
        [FromQuery] string? stock_type)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = @"
            SELECT 
                COALESCE(t.current_pack360_id, t.id_60) AS package_id,
                CASE WHEN t.current_pack360_id IS NOT NULL THEN 'THÙNG 360' ELSE 'THÙNG 60' END AS package_type,
                t.product_code, 
                SUM(t.current_qty) AS current_qty, 
                MAX(t.uom) AS uom,
                MAX(t.status) AS status, 
                MAX(t.stock_type) AS stock_type, 
                MAX(CAST(t.is_virtual AS INT)) AS is_virtual,
                MAX(t.current_location_code) AS current_location_code, 
                MAX(t.customer_code) AS customer_code, 
                MAX(t.current_oem_order_no) AS current_oem_order_no
            FROM tbl_thung60_kho t
            WHERE t.status != 'DISPATCHED'
        ";

        var dynamicParams = new DynamicParameters();
        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += " AND (t.product_code LIKE @search OR t.id_60 LIKE @search OR t.current_pack360_id LIKE @search)";
            dynamicParams.Add("search", $"%{search}%");
        }
        if (!string.IsNullOrWhiteSpace(product_code))
        {
            sql += " AND t.product_code = @product_code";
            dynamicParams.Add("product_code", product_code);
        }
        if (!string.IsNullOrWhiteSpace(status))
        {
            sql += " AND t.status = @status";
            dynamicParams.Add("status", status);
        }
        if (!string.IsNullOrWhiteSpace(stock_type))
        {
            sql += " AND t.stock_type = @stock_type";
            dynamicParams.Add("stock_type", stock_type);
        }

        sql += @"
            GROUP BY 
                COALESCE(t.current_pack360_id, t.id_60),
                CASE WHEN t.current_pack360_id IS NOT NULL THEN 'THÙNG 360' ELSE 'THÙNG 60' END,
                t.product_code
            ORDER BY package_type, package_id;
        ";

        var result = await connection.QueryAsync(sql, dynamicParams);
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("inventory/location")]
    public async Task<IActionResult> GetLocationReport([FromQuery] string? search)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = @"
            SELECT 
                COALESCE(current_location_code, 'CHƯA LÊN KỆ') AS current_location_code,
                product_code, 
                customer_code, 
                current_oem_order_no, 
                status, 
                stock_type, 
                SUM(current_qty) AS total_qty
            FROM tbl_thung60_kho
            WHERE status != 'DISPATCHED'
        ";

        var dynamicParams = new DynamicParameters();
        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += " AND (current_location_code LIKE @search OR product_code LIKE @search) ";
            dynamicParams.Add("search", $"%{search}%");
        }

        sql += @"
            GROUP BY 
                current_location_code, product_code, customer_code, current_oem_order_no, status, stock_type
            ORDER BY current_location_code, product_code;
        ";

        var result = await connection.QueryAsync(sql, dynamicParams);
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("inventory/export")]
    public async Task<IActionResult> GetInventoryExport(
        [FromQuery] string? view,
        [FromQuery] string? search,
        [FromQuery] string? product_code,
        [FromQuery] string? status,
        [FromQuery] string? stock_type)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var selectedView = view?.ToLower() ?? "macro";
        var dynamicParams = new DynamicParameters();
        string sql;

        if (selectedView == "micro")
        {
            sql = @"
                SELECT 
                    COALESCE(t.current_pack360_id, t.id_60) AS package_id,
                    CASE WHEN t.current_pack360_id IS NOT NULL THEN 'THÙNG 360' ELSE 'THÙNG 60' END AS package_type,
                    t.product_code, 
                    SUM(t.current_qty) AS current_qty, 
                    MAX(t.uom) AS uom,
                    MAX(t.status) AS status, 
                    MAX(t.stock_type) AS stock_type,
                    MAX(t.current_location_code) AS current_location_code, 
                    MAX(t.customer_code) AS customer_code, 
                    MAX(t.current_oem_order_no) AS current_oem_order_no
                FROM tbl_thung60_kho t
                WHERE t.status != 'DISPATCHED'
            ";
            if (!string.IsNullOrWhiteSpace(search))
            {
                sql += " AND (t.product_code LIKE @search OR t.id_60 LIKE @search OR t.current_pack360_id LIKE @search)";
                dynamicParams.Add("search", $"%{search}%");
            }
            if (!string.IsNullOrWhiteSpace(product_code))
            {
                sql += " AND t.product_code = @product_code";
                dynamicParams.Add("product_code", product_code);
            }
            if (!string.IsNullOrWhiteSpace(status))
            {
                sql += " AND t.status = @status";
                dynamicParams.Add("status", status);
            }
            if (!string.IsNullOrWhiteSpace(stock_type))
            {
                sql += " AND t.stock_type = @stock_type";
                dynamicParams.Add("stock_type", stock_type);
            }
            sql += " GROUP BY COALESCE(t.current_pack360_id, t.id_60), CASE WHEN t.current_pack360_id IS NOT NULL THEN 'THÙNG 360' ELSE 'THÙNG 60' END, t.product_code ORDER BY package_type, package_id;";
        }
        else
        {
            sql = @"
                SELECT 
                    product_code, 
                    customer_code, 
                    current_oem_order_no, 
                    status, 
                    stock_type, 
                    SUM(current_qty) AS total_qty,
                    SUM(CASE WHEN is_virtual = 1 THEN 1 ELSE 0 END) AS count_thung_ao,
                    SUM(CASE WHEN is_virtual = 0 AND current_pack360_id IS NULL THEN 1 ELSE 0 END) AS count_thung_60_roi,
                    COUNT(DISTINCT current_pack360_id) AS count_kien_360
                FROM tbl_thung60_kho
                WHERE status != 'DISPATCHED'
            ";
            if (!string.IsNullOrWhiteSpace(search))
            {
                sql += " AND product_code LIKE @search ";
                dynamicParams.Add("search", $"%{search}%");
            }
            sql += " GROUP BY product_code, customer_code, current_oem_order_no, status, stock_type ORDER BY product_code;";
        }

        var rows = (await connection.QueryAsync<dynamic>(sql, dynamicParams)).ToList();
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("\uFEFFMã_Hàng,Khách_Hàng,Số_Đơn_Hàng,Trạng_Thái,Loại_Kho,Tổng_SL");
        foreach (var r in rows)
        {
            IDictionary<string, object> dict = (IDictionary<string, object>)r;
            dict.TryGetValue("product_code", out var pCode);
            if (pCode == null) dict.TryGetValue("package_id", out pCode);
            dict.TryGetValue("customer_code", out var cust);
            dict.TryGetValue("current_oem_order_no", out var oem);
            dict.TryGetValue("status", out var stt);
            dict.TryGetValue("stock_type", out var stype);
            dict.TryGetValue("total_qty", out var qty);
            if (qty == null) dict.TryGetValue("current_qty", out qty);
            sb.AppendLine($"\"{pCode}\",\"{cust}\",\"{oem}\",\"{stt}\",\"{stype}\",\"{qty}\"");
        }

        var fileName = $"Inventory_Report_{selectedView}_{DateTime.Now:yyyyMMddHHmmss}.csv";
        var bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv; charset=utf-8", fileName);
    }

    [HttpGet("smart/abc-xyz")]
    public async Task<IActionResult> GetAbcXyzReport()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = "SELECT * FROM vw_WMS_UC22_3_ABC_XYZ_Analysis";
        var result = (await connection.QueryAsync(sql)).Select(r => (IDictionary<string, object>)r);
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("smart/heatmap")]
    public async Task<IActionResult> GetHeatmapReport()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = "EXEC usp_WMS_UC22_3_GetWarehouseHeatmap";
        var result = (await connection.QueryAsync(sql)).Select(r => (IDictionary<string, object>)r);
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("smart/picking-kpi")]
    public async Task<IActionResult> GetPickingKpiReport()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = "EXEC usp_WMS_UC22_4_GetPickingPerformanceKPI";
        var result = (await connection.QueryAsync(sql)).Select(r => (IDictionary<string, object>)r);
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("smart/aging")]
    public async Task<IActionResult> GetAgingReport()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = "EXEC usp_WMS_UC22_5_GetStockAgingPrediction";
        var result = (await connection.QueryAsync(sql)).Select(r => (IDictionary<string, object>)r);
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("smart/reconciliation")]
    public async Task<IActionResult> GetReconciliationReport()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = "EXEC usp_WMS_UC22_6_ReconcilePhysicalVsLedger";
        var result = (await connection.QueryAsync(sql)).Select(r => (IDictionary<string, object>)r);
        return Ok(ApiResponse<object>.Success(result));
    }
}
