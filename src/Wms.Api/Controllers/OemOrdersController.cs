using System.Text.Json;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/oem-orders")]
[Authorize]
public class OemOrdersController : ControllerBase
{
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly ICurrentUserService _currentUserService;

    public OemOrdersController(ISqlConnectionFactory connectionFactory, ICurrentUserService currentUserService)
    {
        _connectionFactory = connectionFactory;
        _currentUserService = currentUserService;
    }

    [HttpGet("products")]
    [Authorize(Policy = PolicyNames.OemRead)]
    public async Task<IActionResult> GetProducts()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var result = await connection.QueryAsync<dynamic>("SELECT DISTINCT MFInvtID FROM vw_WMS_Product WHERE MFInvtID IS NOT NULL ORDER BY MFInvtID");
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet]
    [Authorize(Policy = PolicyNames.OemRead)]
    public async Task<IActionResult> GetOrders([FromQuery] string? search, [FromQuery] string? status, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = @"
            SELECT oem_order_no, product_code, batch_no, customer_code, customer_name,
                   target_qty, actual_qty, order_receive_date, start_date, due_date, status, created_at, created_by
            FROM tbl_oem_orders
            WHERE 1=1
        ";

        var dynamicParams = new DynamicParameters();
        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += " AND (oem_order_no LIKE @search OR product_code LIKE @search)";
            dynamicParams.Add("search", $"%{search}%");
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            sql += " AND status = @status";
            dynamicParams.Add("status", status);
        }

        if (startDate.HasValue && endDate.HasValue)
        {
            sql += " AND due_date BETWEEN @startDate AND @endDate";
            dynamicParams.Add("startDate", startDate.Value);
            dynamicParams.Add("endDate", endDate.Value);
        }

        sql += " ORDER BY due_date ASC, created_at DESC";

        var result = await connection.QueryAsync<dynamic>(sql, dynamicParams);
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpPost("import")]
    [Authorize(Policy = PolicyNames.OemManage)]
    public async Task<IActionResult> ImportOrders([FromBody] OemImportRequest request)
    {
        if (request.Orders == null || !request.Orders.Any())
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Không có dữ liệu đơn hàng được cung cấp"));
        }

        if (request.Orders.Count() > 500)
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Mỗi lần import tối đa 500 đơn hàng."));
        }

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            int insertedCount = 0;
            string currentUser = _currentUserService.Username;

            foreach (var order in request.Orders)
            {
                if (string.IsNullOrWhiteSpace(order.OemOrderNo) || string.IsNullOrWhiteSpace(order.ProductCode) || order.BatchNo <= 0 || order.TargetQty <= 0)
                {
                    transaction.Rollback();
                    return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu trường thông tin bắt buộc (Số ĐH, Mã SP, Đợt giao, SL > 0)"));
                }

                var exists = await connection.ExecuteScalarAsync<int>(@"
                    SELECT COUNT(1) FROM tbl_oem_orders 
                    WHERE oem_order_no = @OemOrderNo AND product_code = @ProductCode AND batch_no = @BatchNo",
                    new { order.OemOrderNo, order.ProductCode, order.BatchNo }, transaction);

                if (exists > 0)
                {
                    transaction.Rollback();
                    return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.DuplicateRecord, $"Đơn hàng {order.OemOrderNo} - SP {order.ProductCode} (Đợt {order.BatchNo}) đã tồn tại"));
                }

                var productExists = await connection.ExecuteScalarAsync<int>(@"
                    SELECT COUNT(1) FROM vw_WMS_Product WHERE MFInvtID = @ProductCode",
                    new { order.ProductCode }, transaction);

                if (productExists == 0)
                {
                    transaction.Rollback();
                    return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.NotFound, $"Mã sản phẩm {order.ProductCode} không tồn tại trong hệ thống ERP."));
                }

                await connection.ExecuteAsync(@"
                    INSERT INTO tbl_oem_orders (
                        oem_order_no, product_code, batch_no, customer_code, customer_name, 
                        target_qty, order_receive_date, start_date, due_date, status, created_by
                    ) VALUES (
                        @OemOrderNo, @ProductCode, @BatchNo, @CustomerCode, @CustomerName, 
                        @TargetQty, @OrderReceiveDate, @StartDate, @DueDate, @Status, @CreatedBy
                    )", new
                {
                    order.OemOrderNo,
                    order.ProductCode,
                    order.BatchNo,
                    order.CustomerCode,
                    order.CustomerName,
                    order.TargetQty,
                    order.OrderReceiveDate,
                    order.StartDate,
                    order.DueDate,
                    Status = string.IsNullOrWhiteSpace(order.Status) ? "NEW" : order.Status,
                    CreatedBy = currentUser
                }, transaction);

                insertedCount++;
            }

            transaction.Commit();
            return Ok(CommandResponse.Success($"Import thành công {insertedCount} đơn hàng."));
        }
        catch (Exception)
        {
            transaction.Rollback();
            throw;
        }
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.OemManage)]
    public async Task<IActionResult> CreateOrder([FromBody] OemOrderDto order)
    {
        if (string.IsNullOrWhiteSpace(order.OemOrderNo) || string.IsNullOrWhiteSpace(order.ProductCode) || order.BatchNo <= 0 || order.TargetQty <= 0)
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu trường thông tin bắt buộc"));
        }

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            var exists = await connection.ExecuteScalarAsync<int>(@"
                SELECT COUNT(1) FROM tbl_oem_orders 
                WHERE oem_order_no = @OemOrderNo AND product_code = @ProductCode AND batch_no = @BatchNo",
                new { order.OemOrderNo, order.ProductCode, order.BatchNo }, transaction);

            if (exists > 0)
            {
                transaction.Rollback();
                return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.DuplicateRecord, "Đơn hàng đã tồn tại."));
            }

            var productExists = await connection.ExecuteScalarAsync<int>(@"
                SELECT COUNT(1) FROM vw_WMS_Product WHERE MFInvtID = @ProductCode",
                new { order.ProductCode }, transaction);

            if (productExists == 0)
            {
                transaction.Rollback();
                return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.NotFound, "Mã sản phẩm không tồn tại trong hệ thống ERP."));
            }

            string currentUser = _currentUserService.Username;

            await connection.ExecuteAsync(@"
                INSERT INTO tbl_oem_orders (
                    oem_order_no, product_code, batch_no, customer_code, customer_name, 
                    target_qty, order_receive_date, start_date, due_date, status, created_by
                ) VALUES (
                    @OemOrderNo, @ProductCode, @BatchNo, @CustomerCode, @CustomerName, 
                    @TargetQty, @OrderReceiveDate, @StartDate, @DueDate, @Status, @CreatedBy
                )", new
            {
                order.OemOrderNo,
                order.ProductCode,
                order.BatchNo,
                order.CustomerCode,
                order.CustomerName,
                order.TargetQty,
                order.OrderReceiveDate,
                order.StartDate,
                order.DueDate,
                Status = string.IsNullOrWhiteSpace(order.Status) ? "NEW" : order.Status,
                CreatedBy = currentUser
            }, transaction);

            await connection.ExecuteAsync(@"
                INSERT INTO tbl_oem_orders_history (oem_order_no, product_code, batch_no, action_type, new_data, action_by)
                VALUES (@OemOrderNo, @ProductCode, @BatchNo, 'CREATE', @NewData, @ActionBy)", new
            {
                order.OemOrderNo,
                order.ProductCode,
                order.BatchNo,
                NewData = JsonSerializer.Serialize(order),
                ActionBy = currentUser
            }, transaction);

            transaction.Commit();
            return Ok(CommandResponse.Success("Tạo đơn hàng OEM thành công."));
        }
        catch (Exception)
        {
            transaction.Rollback();
            throw;
        }
    }

    [HttpPut("{orderNo}/{productCode}/{batchNo}")]
    [Authorize(Policy = PolicyNames.OemManage)]
    public async Task<IActionResult> UpdateOrder(
        [FromRoute] string orderNo,
        [FromRoute] string productCode,
        [FromRoute] int batchNo,
        [FromBody] OemOrderDto order)
    {
        if (order.TargetQty <= 0)
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Số lượng kế hoạch phải > 0."));
        }

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            var existing = await connection.QueryFirstOrDefaultAsync<dynamic>(@"
                SELECT * FROM tbl_oem_orders WITH (UPDLOCK)
                WHERE oem_order_no = @orderNo AND product_code = @productCode AND batch_no = @batchNo",
                new { orderNo, productCode, batchNo }, transaction);

            if (existing == null)
            {
                transaction.Rollback();
                return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, "Đơn hàng không tồn tại."));
            }

            if ((string)existing.status == "COMPLETED")
            {
                transaction.Rollback();
                return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Không thể cập nhật đơn hàng đã COMPLETED."));
            }

            string currentUser = _currentUserService.Username;

            await connection.ExecuteAsync(@"
                UPDATE tbl_oem_orders SET
                    customer_code = @CustomerCode,
                    customer_name = @CustomerName,
                    target_qty = @TargetQty,
                    order_receive_date = @OrderReceiveDate,
                    start_date = @StartDate,
                    due_date = @DueDate,
                    status = @Status,
                    updated_at = GETDATE()
                WHERE oem_order_no = @orderNo AND product_code = @productCode AND batch_no = @batchNo",
                new
                {
                    orderNo,
                    productCode,
                    batchNo,
                    order.CustomerCode,
                    order.CustomerName,
                    order.TargetQty,
                    order.OrderReceiveDate,
                    order.StartDate,
                    order.DueDate,
                    Status = string.IsNullOrWhiteSpace(order.Status) ? (string)existing.status : order.Status
                }, transaction);

            await connection.ExecuteAsync(@"
                INSERT INTO tbl_oem_orders_history (oem_order_no, product_code, batch_no, action_type, old_data, new_data, action_by)
                VALUES (@orderNo, @productCode, @batchNo, 'UPDATE', @OldData, @NewData, @ActionBy)", new
            {
                orderNo,
                productCode,
                batchNo,
                OldData = JsonSerializer.Serialize(existing),
                NewData = JsonSerializer.Serialize(order),
                ActionBy = currentUser
            }, transaction);

            transaction.Commit();
            return Ok(CommandResponse.Success("Cập nhật đơn hàng OEM thành công."));
        }
        catch (Exception)
        {
            transaction.Rollback();
            throw;
        }
    }

    [HttpGet("{orderNo}/{productCode}/{batchNo}/history")]
    [Authorize(Policy = PolicyNames.OemRead)]
    public async Task<IActionResult> GetOrderHistory(
        [FromRoute] string orderNo,
        [FromRoute] string productCode,
        [FromRoute] int batchNo)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var result = await connection.QueryAsync<dynamic>(@"
            SELECT history_id, oem_order_no, product_code, batch_no, action_type, old_data, new_data, action_by, action_at
            FROM tbl_oem_orders_history
            WHERE oem_order_no = @orderNo AND product_code = @productCode AND batch_no = @batchNo
            ORDER BY action_at DESC",
            new { orderNo, productCode, batchNo });

        return Ok(ApiResponse<object>.Success(result));
    }
}

public record OemImportRequest(IEnumerable<OemOrderDto> Orders);

public record OemOrderDto(
    string OemOrderNo,
    string ProductCode,
    int BatchNo,
    string? CustomerCode,
    string? CustomerName,
    int TargetQty,
    DateTime? OrderReceiveDate,
    DateTime? StartDate,
    DateTime? DueDate,
    string? Status
);
