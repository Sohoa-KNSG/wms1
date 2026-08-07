using System.Text.Json.Serialization;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/export")]
[Authorize]
public class ExportRequirementsController : ControllerBase
{
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly ICurrentUserService _currentUserService;

    public ExportRequirementsController(ISqlConnectionFactory connectionFactory, ICurrentUserService currentUserService)
    {
        _connectionFactory = connectionFactory;
        _currentUserService = currentUserService;
    }

    [HttpPost("paste-data")]
    public async Task<IActionResult> PasteData([FromBody] IEnumerable<ExportRequirementItemDto> data)
    {
        if (data == null || !data.Any())
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Dữ liệu yêu cầu xuất kho không hợp lệ."));
        }

        string actor = _currentUserService.Username;
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            string requestNo = "REQ-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            await connection.ExecuteAsync(@"
                INSERT INTO export_request_header (request_no, request_date, imported_by) 
                VALUES (@requestNo, GETDATE(), @actor)", new { requestNo, actor }, transaction);

            var invalidProducts = new List<string>();

            foreach (var item in data)
            {
                string pCode = item.EffectiveProductCode;
                if (string.IsNullOrWhiteSpace(pCode)) continue;

                var valid = await connection.ExecuteScalarAsync<int>(@"
                    SELECT COUNT(1) FROM vw_WMS_Product WHERE MFInvtID = @pCode",
                    new { pCode }, transaction);

                if (valid == 0)
                {
                    // Fallback check against tbl_thung60_kho or product catalog if view differs
                    var validFallback = await connection.ExecuteScalarAsync<int>(@"
                        SELECT COUNT(1) FROM tbl_thung60_kho WHERE MaSp = @pCode",
                        new { pCode }, transaction);
                    if (validFallback == 0)
                    {
                        invalidProducts.Add(pCode);
                    }
                }
            }

            if (invalidProducts.Any())
            {
                transaction.Rollback();
                return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed,
                    $"Có mã sản phẩm không tồn tại trong hệ thống: {string.Join(", ", invalidProducts.Distinct())}"));
            }

            int lineNo = 1;
            foreach (var item in data)
            {
                string pCode = item.EffectiveProductCode;
                string cCode = item.EffectiveChannelCode;
                decimal qQty = item.EffectiveRequestedQty;

                if (string.IsNullOrWhiteSpace(pCode)) continue;

                await connection.ExecuteAsync(@"
                    INSERT INTO export_request_detail (request_no, line_no, product_code, channel_code, requested_qty) 
                    VALUES (@requestNo, @lineNo, @pCode, @cCode, @qQty)", new
                {
                    requestNo,
                    lineNo = lineNo++,
                    pCode,
                    cCode,
                    qQty
                }, transaction);
            }

            transaction.Commit();
            return Ok(ApiResponse<object>.Success(new { request_no = requestNo }, "Nhập dữ liệu nhu cầu xuất thành công."));
        }
        catch (Exception)
        {
            transaction.Rollback();
            throw;
        }
    }

    [HttpGet("requirements")]
    public async Task<IActionResult> GetRequirements(
        [FromQuery] string? status = null, 
        [FromQuery] string? fromDate = null, 
        [FromQuery] string? toDate = null)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();

        // Tự động đồng bộ allocated_qty từ delivery_note_detail sang export_request_detail nếu có phiếu xuất đã tạo
        await connection.ExecuteAsync(@"
            UPDATE d
            SET allocated_qty = ISNULL(dn.total_allocated, 0)
            FROM export_request_detail d
            JOIN (
                SELECT product_code, channel_code, SUM(qty) as total_allocated
                FROM delivery_note_detail
                GROUP BY product_code, channel_code
            ) dn ON d.product_code = dn.product_code AND d.channel_code = dn.channel_code");

        var sql = @"
            SELECT 
                h.request_no,
                d.line_no,
                h.request_date,
                h.imported_by,
                ISNULL(h.status, 'NEW') as status,
                d.product_code, 
                d.channel_code, 
                d.requested_qty as total_requested_qty,
                ISNULL(d.allocated_qty, 0) as allocated_qty,
                CASE WHEN (d.requested_qty - ISNULL(d.allocated_qty, 0)) < 0 THEN 0 
                     ELSE (d.requested_qty - ISNULL(d.allocated_qty, 0)) END as remaining_qty,
                (SELECT ISNULL(SUM(current_qty), 0) FROM tbl_thung60_kho t WHERE t.product_code = d.product_code AND t.status = 'AVAILABLE') as total_stock
            FROM export_request_detail d
            JOIN export_request_header h ON d.request_no = h.request_no
            WHERE (@status IS NULL OR @status = '' OR h.status = @status)
              AND (@fromDate IS NULL OR @fromDate = '' OR CAST(h.request_date AS DATE) >= @fromDate)
              AND (@toDate IS NULL OR @toDate = '' OR CAST(h.request_date AS DATE) <= @toDate)
            ORDER BY h.request_date DESC, h.request_no DESC, d.line_no ASC
        ";

        var result = await connection.QueryAsync<dynamic>(sql, new { status, fromDate, toDate });
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpDelete("requirements")]
    public async Task<IActionResult> DeleteRequirement([FromBody] DeleteRequirementRequest request)
    {
        string requestNo = !string.IsNullOrWhiteSpace(request.RequestNo) ? request.RequestNo : (!string.IsNullOrWhiteSpace(request.Request_No) ? request.Request_No : "");
        string productCode = !string.IsNullOrWhiteSpace(request.ProductCode) ? request.ProductCode : (!string.IsNullOrWhiteSpace(request.Product_Code) ? request.Product_Code : "");
        string channelCode = !string.IsNullOrWhiteSpace(request.ChannelCode) ? request.ChannelCode : (!string.IsNullOrWhiteSpace(request.Channel_Code) ? request.Channel_Code : "");
        int lineNo = request.LineNo > 0 ? request.LineNo : request.Line_No;

        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        if (!string.IsNullOrWhiteSpace(requestNo) && lineNo > 0)
        {
            await connection.ExecuteAsync(@"
                DELETE FROM export_request_detail 
                WHERE request_no = @requestNo AND line_no = @lineNo", new { requestNo, lineNo });
        }
        else if (!string.IsNullOrWhiteSpace(requestNo))
        {
            await connection.ExecuteAsync(@"
                DELETE FROM export_request_detail 
                WHERE request_no = @requestNo", new { requestNo });
        }
        else
        {
            await connection.ExecuteAsync(@"
                DELETE d 
                FROM export_request_detail d
                JOIN export_request_header h ON d.request_no = h.request_no
                WHERE d.product_code = @productCode AND d.channel_code = @channelCode", new { productCode, channelCode });
        }

        // Xóa các Header rỗng không còn dòng chi tiết
        await connection.ExecuteAsync(@"
            DELETE h
            FROM export_request_header h
            WHERE NOT EXISTS (SELECT 1 FROM export_request_detail d WHERE d.request_no = h.request_no)");

        return Ok(CommandResponse.Success("Xóa nhu cầu xuất kho thành công."));
    }

    [HttpPut("requirements")]
    public async Task<IActionResult> UpdateRequirement([FromBody] UpdateRequirementRequest request)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();
        try
        {
            var firstRow = await connection.QueryFirstOrDefaultAsync<dynamic>(@"
                SELECT TOP 1 d.request_no, d.line_no 
                FROM export_request_detail d
                JOIN export_request_header h ON d.request_no = h.request_no
                WHERE d.product_code = @ProductCode AND d.channel_code = @ChannelCode AND h.status = 'NEW'
                ORDER BY d.request_no ASC, d.line_no ASC",
                new { request.ProductCode, request.ChannelCode }, transaction);

            if (firstRow != null)
            {
                string firstReqNo = firstRow.request_no;
                int firstLineNo = firstRow.line_no;

                await connection.ExecuteAsync(@"
                    UPDATE export_request_detail 
                    SET requested_qty = @NewQty 
                    WHERE request_no = @firstReqNo AND line_no = @firstLineNo",
                    new { request.NewQty, firstReqNo, firstLineNo }, transaction);

                await connection.ExecuteAsync(@"
                    DELETE d FROM export_request_detail d
                    JOIN export_request_header h ON d.request_no = h.request_no
                    WHERE d.product_code = @ProductCode AND d.channel_code = @ChannelCode 
                      AND h.status = 'NEW' AND NOT (d.request_no = @firstReqNo AND d.line_no = @firstLineNo)",
                    new { request.ProductCode, request.ChannelCode, firstReqNo, firstLineNo }, transaction);
            }

            transaction.Commit();
            return Ok(CommandResponse.Success("Cập nhật nhu cầu xuất thành công."));
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    [HttpPost("delivery-notes")]
    public async Task<IActionResult> CreateDeliveryNotes([FromBody] CreateDeliveryNotesRequest request)
    {
        if (request == null || request.Details == null || !request.Details.Any())
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu thông tin chi tiết đơn xuất kho."));
        }

        string actor = _currentUserService.Username;
        string noteNo = "PXK-" + DateTime.Now.ToString("yyyyMMdd-HHmmss");

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            string truckPlate = !string.IsNullOrWhiteSpace(request.TruckPlate) ? request.TruckPlate : (!string.IsNullOrWhiteSpace(request.LicensePlate) ? request.LicensePlate : "CHƯA_RÕ");
            string driverId = !string.IsNullOrWhiteSpace(request.DriverId) ? request.DriverId : "1";
            string guardId = !string.IsNullOrWhiteSpace(request.GuardId) ? request.GuardId : "1";
            string deliveryLocation = !string.IsNullOrWhiteSpace(request.DeliveryLocation) ? request.DeliveryLocation : "Kho Thành Phẩm";

            decimal? maxWeight = await connection.QueryFirstOrDefaultAsync<decimal?>(
                "SELECT max_weight_kg FROM tbl_trucks WHERE license_plate = @truckPlate", new { truckPlate }, transaction);

            var totalRequestedWeight = request.Details.Sum(d => d.TotalWeightKg > 0 ? d.TotalWeightKg : d.Total_Weight_Kg);
            if (maxWeight.HasValue && totalRequestedWeight > maxWeight.Value)
            {
                transaction.Rollback();
                return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, $"Tổng tải trọng hàng ({totalRequestedWeight}kg) vượt quá tải trọng cho phép của xe {truckPlate} ({maxWeight.Value}kg)."));
            }

            var customerGroups = request.Details.GroupBy(d => !string.IsNullOrWhiteSpace(d.CustomerName) ? d.CustomerName : (!string.IsNullOrWhiteSpace(d.Customer_Name) ? d.Customer_Name : "Khách Hàng KNSG")).ToList();
            var createdNotes = new List<string>();

            foreach (var group in customerGroups)
            {
                string customerName = group.Key;
                string currentNoteNo = "PXK-" + DateTime.Now.ToString("yyyyMMddHHmmssfff") + "-" + createdNotes.Count;

                await connection.ExecuteAsync(@"
                    INSERT INTO delivery_note_header (
                        delivery_note_no, license_plate, driver_id, guard_id, customer_name, delivery_location, status, created_by, created_at
                    ) VALUES (
                        @currentNoteNo, @truckPlate, @driverId, @guardId, @customerName, @deliveryLocation, 'NEW', @actor, GETDATE()
                    )", new
                {
                    currentNoteNo,
                    truckPlate,
                    driverId,
                    guardId,
                    customerName,
                    deliveryLocation,
                    actor
                }, transaction);

                int lineNo = 1;
                foreach (var d in group)
                {
                    string productCode = !string.IsNullOrWhiteSpace(d.ProductCode) ? d.ProductCode : (!string.IsNullOrWhiteSpace(d.Product_Code) ? d.Product_Code : "");
                    string channelCode = !string.IsNullOrWhiteSpace(d.ChannelCode) ? d.ChannelCode : (!string.IsNullOrWhiteSpace(d.Channel_Code) ? d.Channel_Code : "");
                    decimal qty = d.Qty > 0 ? d.Qty : (d.Requested_Qty > 0 ? d.Requested_Qty : 0);
                    int boxLarge = d.BoxLarge > 0 ? d.BoxLarge : d.Box_Large;
                    int boxSmall = d.BoxSmall > 0 ? d.BoxSmall : d.Box_Small;
                    int boxVirtual = d.BoxVirtual > 0 ? d.BoxVirtual : d.Box_Virtual;
                    decimal totalWeightKg = d.TotalWeightKg > 0 ? d.TotalWeightKg : d.Total_Weight_Kg;

                    await connection.ExecuteAsync(@"
                        INSERT INTO delivery_note_detail (
                            delivery_note_no, line_no, customer_name, product_code, channel_code, qty, box_large, box_small, box_virtual, total_weight_kg
                        ) VALUES (
                            @currentNoteNo, @lineNo, @customerName, @productCode, @channelCode, @qty, @boxLarge, @boxSmall, @boxVirtual, @totalWeightKg
                        )", new
                    {
                        currentNoteNo,
                        lineNo = lineNo++,
                        customerName,
                        productCode,
                        channelCode,
                        qty,
                        boxLarge,
                        boxSmall,
                        boxVirtual,
                        totalWeightKg
                    }, transaction);

                    // Cập nhật số lượng đã phân bổ xe vào export_request_detail
                    await connection.ExecuteAsync(@"
                        UPDATE d
                        SET allocated_qty = ISNULL(allocated_qty, 0) + @qty
                        FROM export_request_detail d
                        JOIN export_request_header h ON d.request_no = h.request_no
                        WHERE d.product_code = @productCode 
                          AND d.channel_code = @channelCode 
                          AND h.status IN ('NEW', 'PARTIAL')", new
                    {
                        productCode,
                        channelCode,
                        qty
                    }, transaction);
                }

                createdNotes.Add(currentNoteNo);
            }

            // Cập nhật trạng thái Header Nhu Cầu thành PARTIAL hoặc PROCESSED
            await connection.ExecuteAsync(@"
                UPDATE h
                SET status = CASE 
                    WHEN NOT EXISTS (
                        SELECT 1 FROM export_request_detail d2 
                        WHERE d2.request_no = h.request_no 
                          AND ISNULL(d2.allocated_qty, 0) < d2.requested_qty
                    ) THEN 'PROCESSED'
                    ELSE 'PARTIAL'
                END
                FROM export_request_header h
                WHERE h.status IN ('NEW', 'PARTIAL')", null, transaction);

            transaction.Commit();
            return Ok(ApiResponse<object>.Success(new { delivery_notes = createdNotes }, $"Tạo thành công {createdNotes.Count} phiếu xuất kho."));
        }
        catch (Exception)
        {
            transaction.Rollback();
            throw;
        }
    }

    [AllowAnonymous]
    [HttpPost("clear-test-data")]
    [HttpDelete("clear-test-data")]
    public async Task<IActionResult> ClearTestData()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();
        try
        {
            await connection.ExecuteAsync(@"
                IF OBJECT_ID('WMS_UC16_ScanLog', 'U') IS NOT NULL DELETE FROM WMS_UC16_ScanLog;
                IF OBJECT_ID('delivery_note_detail', 'U') IS NOT NULL DELETE FROM delivery_note_detail;
                IF OBJECT_ID('delivery_note_header', 'U') IS NOT NULL DELETE FROM delivery_note_header;
                IF OBJECT_ID('export_request_detail', 'U') IS NOT NULL UPDATE export_request_detail SET allocated_qty = 0;
                IF OBJECT_ID('export_request_header', 'U') IS NOT NULL UPDATE export_request_header SET status = 'NEW';", transaction: transaction);

            transaction.Commit();
            return Ok(CommandResponse.Success("Đã xóa sạch toàn bộ dữ liệu phân bổ và phiếu chờ soạn thành công."));
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}

public class ExportRequirementItemDto
{
    [JsonPropertyName("product_code")]
    public string? Product_Code { get; set; }
    public string? ProductCode { get; set; }

    [JsonPropertyName("channel_code")]
    public string? Channel_Code { get; set; }
    public string? ChannelCode { get; set; }

    [JsonPropertyName("requested_qty")]
    public decimal Requested_Qty { get; set; }
    public decimal RequestedQty { get; set; }

    public string EffectiveProductCode => !string.IsNullOrWhiteSpace(ProductCode) ? ProductCode : (Product_Code ?? "");
    public string EffectiveChannelCode => !string.IsNullOrWhiteSpace(ChannelCode) ? ChannelCode : (Channel_Code ?? "");
    public decimal EffectiveRequestedQty => RequestedQty > 0 ? RequestedQty : Requested_Qty;
}
public class DeleteRequirementRequest
{
    [JsonPropertyName("request_no")]
    public string? Request_No { get; set; }
    public string? RequestNo { get; set; }

    [JsonPropertyName("line_no")]
    public int Line_No { get; set; }
    public int LineNo { get; set; }

    [JsonPropertyName("product_code")]
    public string? Product_Code { get; set; }
    public string? ProductCode { get; set; }

    [JsonPropertyName("channel_code")]
    public string? Channel_Code { get; set; }
    public string? ChannelCode { get; set; }
}
public record UpdateRequirementRequest(string ProductCode, string ChannelCode, decimal NewQty);

public class DeliveryNoteDetailDto
{
    [JsonPropertyName("customer_name")]
    public string? Customer_Name { get; set; }
    public string? CustomerName { get; set; }

    [JsonPropertyName("product_code")]
    public string? Product_Code { get; set; }
    public string? ProductCode { get; set; }

    [JsonPropertyName("channel_code")]
    public string? Channel_Code { get; set; }
    public string? ChannelCode { get; set; }

    [JsonPropertyName("qty")]
    public decimal Qty { get; set; }
    [JsonPropertyName("requested_qty")]
    public decimal Requested_Qty { get; set; }

    [JsonPropertyName("box_large")]
    public int Box_Large { get; set; }
    public int BoxLarge { get; set; }

    [JsonPropertyName("box_small")]
    public int Box_Small { get; set; }
    public int BoxSmall { get; set; }

    [JsonPropertyName("box_virtual")]
    public int Box_Virtual { get; set; }
    public int BoxVirtual { get; set; }

    [JsonPropertyName("total_weight_kg")]
    public decimal Total_Weight_Kg { get; set; }
    public decimal TotalWeightKg { get; set; }
}

public class CreateDeliveryNotesRequest
{
    [JsonPropertyName("license_plate")]
    public string? LicensePlate { get; set; }
    [JsonPropertyName("truck_plate")]
    public string? TruckPlate { get; set; }

    [JsonPropertyName("driver_id")]
    public string? DriverId { get; set; }

    [JsonPropertyName("guard_id")]
    public string? GuardId { get; set; }

    [JsonPropertyName("delivery_location")]
    public string? DeliveryLocation { get; set; }

    [JsonPropertyName("details")]
    public IEnumerable<DeliveryNoteDetailDto>? Details { get; set; }
}


