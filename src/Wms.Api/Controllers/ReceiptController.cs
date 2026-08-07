using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/receipt")]
[Authorize]
public class ReceiptController : ControllerBase
{
    private readonly IStoredProcedureExecutor _spExecutor;
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly ICurrentUserService _currentUserService;

    public ReceiptController(
        IStoredProcedureExecutor spExecutor,
        ISqlConnectionFactory connectionFactory,
        ICurrentUserService currentUserService)
    {
        _spExecutor = spExecutor;
        _connectionFactory = connectionFactory;
        _currentUserService = currentUserService;
    }

    [HttpGet("handovers")]
    public async Task<IActionResult> GetAllHandovers()
    {
        var result = await _spExecutor.QueryAsync<dynamic>("usp_Receipt_GetAllProductionHandovers");
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("handover/{no}")]
    public async Task<IActionResult> GetHandoverDetails([FromRoute] string no)
    {
        var parameters = new
        {
            handover_no = no,
            request_id = Guid.NewGuid().ToString("N"),
            user_code = _currentUserService.Username,
            user_email = $"{_currentUserService.Username}@wms.local",
            device_id = Request.Headers["X-Device-Id"].ToString() ?? "WEB-API"
        };

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var multi = await connection.QueryMultipleAsync("usp_Receipt_GetProductionHandoverLines", parameters, commandType: System.Data.CommandType.StoredProcedure);

        var header = (await multi.ReadAsync<dynamic>()).FirstOrDefault();
        var lines = await multi.ReadAsync<dynamic>();

        return Ok(ApiResponse<object>.Success(new { header, lines }));
    }

    [HttpGet("orders/search")]
    public async Task<IActionResult> SearchOrders([FromQuery] string? keyword)
    {
        var result = await _spExecutor.QueryAsync<dynamic>("usp_WMS_UC02_SearchDonHang", new { Keyword = keyword ?? "" });
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpPost("map-order")]
    public async Task<IActionResult> MapOemOrder([FromBody] MapOemOrderRequest request)
    {
        try
        {
            var parameters = new
            {
                SoPhieuNhap = request.HandoverNo?.ToString() ?? "",
                MaChiTietPhieu = request.LineNo?.ToString() ?? "",
                MaSanPham = request.ProductCode?.ToString() ?? "",
                MaDonHang = request.OrderNo?.ToString() ?? "",
                UserId = _currentUserService.Username ?? "SYSTEM"
            };

            var result = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC02_UpdateMaDonHang", parameters);
            return Ok(ApiResponse<object>.Success(result ?? new { message = "Gán mã đơn hàng OEM thành công." }));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.Error("ERR_UC02", ex.Message));
        }
    }

    [HttpPost("unmap-order")]
    public async Task<IActionResult> UnmapOemOrder([FromBody] UnmapOemOrderRequest request)
    {
        try
        {
            var parameters = new
            {
                SoPhieuNhap = request.HandoverNo?.ToString() ?? "",
                MaChiTietPhieu = request.LineNo?.ToString() ?? "",
                MaSanPham = request.ProductCode?.ToString() ?? "",
                UserId = _currentUserService.Username ?? "SYSTEM"
            };

            var result = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC02_UnmapMaDonHang", parameters);
            return Ok(ApiResponse<object>.Success(result ?? new { message = "Hủy gán mã đơn hàng OEM thành công." }));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.Error("ERR_UC02_UNMAP", ex.Message));
        }
    }

    [HttpPost("scan")]
    public async Task<IActionResult> ScanBarcode([FromBody] ReceiptScanRequest request)
    {
        var parameters = new
        {
            receipt_session_no = request.ReceiptSessionNo,
            qr_60 = request.Qr60,
            request_id = Guid.NewGuid().ToString("N"),
            user_code = _currentUserService.Username,
            user_email = $"{_currentUserService.Username}@wms.local",
            device_id = Request.Headers["X-Device-Id"].ToString() ?? "WEB-API"
        };

        var spResult = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_Receipt_ScanThung60", parameters);
        return Ok(spResult);
    }

    [HttpPost("confirm")]
    public async Task<IActionResult> OfficialConfirm([FromBody] ReceiptConfirmRequest request)
    {
        var parameters = new
        {
            receipt_session_no = request.ReceiptSessionNo,
            request_id = Guid.NewGuid().ToString("N"),
            user_code = _currentUserService.Username,
            user_email = $"{_currentUserService.Username}@wms.local",
            device_id = Request.Headers["X-Device-Id"].ToString() ?? "WEB-API"
        };

        var spResult = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_Receipt_OfficialConfirm", parameters);
        return Ok(spResult);
    }

    [HttpPost("scan-thung60")]
    public async Task<IActionResult> ScanThung60([FromBody] ScanThung60Request request)
    {
        if (string.IsNullOrWhiteSpace(request.HandoverNo) ||
            string.IsNullOrWhiteSpace(request.LineNo) ||
            string.IsNullOrWhiteSpace(request.Qr60))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu thông tin quét mã (HandoverNo, LineNo, Qr60)."));
        }

        try
        {
            var parameters = new
            {
                SoPhieuNhap = request.HandoverNo,
                MaChiTietPhieu = request.LineNo,
                MaSanPham = request.ProductCode,
                MaThung60 = request.Qr60,
                UserName = _currentUserService.Username ?? "SYSTEM_PDA"
            };

            var result = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC03_ScanThung60", parameters);
            return Ok(ApiResponse<object>.Success(result));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<object>.Error("ERR_SCAN_THUNG60", ex.Message));
        }
    }

    [HttpPost("confirm-nhap-kho")]
    public async Task<IActionResult> ConfirmNhapKho([FromBody] ConfirmNhapKhoRequest request)
    {
        var parameters = new
        {
            SoPhieuNhap = request.HandoverNo,
            MaChiTietPhieu = request.LineNo,
            UserName = _currentUserService.Username,
            PartnerName = request.PartnerName
        };

        var result = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC04_ConfirmNhapKho", parameters);
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpPost("confirm-nhap-le")]
    public async Task<IActionResult> ConfirmNhapLe([FromBody] ConfirmNhapLeRequest request)
    {
        var parameters = new
        {
            SoPhieuNhap = request.HandoverNo,
            MaChiTietPhieu = request.LineNo,
            SoLuongLe = request.LooseQty,
            UserName = _currentUserService.Username,
            PartnerName = request.PartnerName
        };

        await _spExecutor.ExecuteAsync("usp_WMS_UC04_1_ConfirmNhapLe", parameters);
        return Ok(CommandResponse.Success("Nhập lẻ thành công (đã tự động tạo thùng ảo)."));
    }

    [HttpPost("confirm-nhap-le-batch")]
    public async Task<IActionResult> ConfirmNhapLeBatch([FromBody] ConfirmNhapLeBatchRequest request)
    {
        if (request.Lines == null || !request.Lines.Any())
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu danh sách dòng nhập lẻ."));
        }

        foreach (var item in request.Lines)
        {
            var parameters = new
            {
                SoPhieuNhap = request.HandoverNo,
                MaChiTietPhieu = item.LineNo,
                SoLuongLe = item.LooseQty,
                UserName = _currentUserService.Username,
                PartnerName = request.PartnerName
            };
            await _spExecutor.ExecuteAsync("usp_WMS_UC04_1_ConfirmNhapLe", parameters);
        }

        return Ok(CommandResponse.Success($"Nhập lẻ thành công cho {request.Lines.Count()} dòng (đã tự động tạo thùng ảo)."));
    }

    [HttpPost("cancel-scan")]
    public async Task<IActionResult> CancelScan([FromBody] CancelScanRequest request)
    {
        var parameters = new
        {
            ScanLogID = request.ScanLogId,
            UserName = _currentUserService.Username,
            CancelReason = string.IsNullOrWhiteSpace(request.Reason) ? "Scanner UI" : request.Reason
        };

        var result = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC03_CancelScan", parameters);
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("confirm-list")]
    public async Task<IActionResult> GetPendingHandovers()
    {
        var result = await _spExecutor.QueryAsync<dynamic>("usp_WMS_UC04_GetPendingHandovers");
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("confirm-handover/{handoverNo}/lines")]
    public async Task<IActionResult> GetHandoverLines([FromRoute] string handoverNo)
    {
        var result = await _spExecutor.QueryAsync<dynamic>("usp_WMS_UC04_GetHandoverLines", new { SoPhieuNhap = handoverNo });
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("confirm-detail/{handoverNo}/{lineNo}")]
    public async Task<IActionResult> GetPendingBoxes([FromRoute] string handoverNo, [FromRoute] string lineNo)
    {
        var result = await _spExecutor.QueryAsync<dynamic>("usp_WMS_UC04_GetPendingBoxes", new { SoPhieuNhap = handoverNo, MaChiTietPhieu = lineNo });
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("handover/{handoverNo}/line/{lineNo}/progress")]
    public async Task<IActionResult> GetHandoverLineProgress([FromRoute] string handoverNo, [FromRoute] string lineNo, [FromQuery] string? productCode)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = @"
            SELECT * FROM dbo.vw_WMS_UC03_TienDoQuetNhap
            WHERE SoPhieuNhap = @handoverNo 
              AND MaChiTietPhieu = @lineNo
              AND MaSanPham = @productCode";
        var row = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, new { handoverNo, lineNo, productCode = productCode ?? "" });
        return Ok(ApiResponse<object>.Success(row ?? new
        {
            SoLuongCanNhap = 0,
            SoLuongDaQuetHopLe = 0,
            SoLuongConLai = 0,
            SoThungHopLe = 0,
            SoThungLoi = 0
        }));
    }

    [HttpGet("handover/{handoverNo}/line/{lineNo}/scanned-boxes")]
    public async Task<IActionResult> GetHandoverLineScannedBoxes([FromRoute] string handoverNo, [FromRoute] string lineNo, [FromQuery] string? productCode)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = @"
            SELECT ScanLogID, MaThung60, SoLuongThung, TrangThaiScan, KetQuaKiemTra, CreatedAt
            FROM dbo.WMS_UC03_ScanLog
            WHERE SoPhieuNhap = @handoverNo 
              AND MaChiTietPhieu = @lineNo
              AND MaSanPham = @productCode
              AND TrangThaiScan IN (N'VALID', N'CONFIRMED')
              AND IsDeleted = 0
            ORDER BY CreatedAt DESC";
        var rows = await connection.QueryAsync<dynamic>(sql, new { handoverNo, lineNo, productCode = productCode ?? "" });
        return Ok(ApiResponse<object>.Success(rows));
    }

    [HttpPost("handover/{handoverNo}/cancel-scan")]
    public async Task<IActionResult> CancelHandoverScan([FromRoute] string handoverNo, [FromBody] CancelScanRequest request)
    {
        var parameters = new
        {
            SoPhieuNhap = handoverNo,
            LyDoHuy = string.IsNullOrWhiteSpace(request.Reason) ? "Handover Cancel" : request.Reason,
            UserName = _currentUserService.Username
        };

        var result = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC04_2_CancelScan", parameters);
        return Ok(ApiResponse<object>.Success(result));
    }
}

public record ReceiptScanRequest(string ReceiptSessionNo, string Qr60);
public record ReceiptConfirmRequest(string ReceiptSessionNo);
public record ScanThung60Request(string HandoverNo, string LineNo, string ProductCode, string Qr60);
public record ConfirmNhapKhoRequest(string HandoverNo, string? LineNo, string? PartnerName);
public record ConfirmNhapLeRequest(string HandoverNo, string LineNo, decimal LooseQty, string? PartnerName);
public record ConfirmNhapLeBatchRequest(string HandoverNo, IEnumerable<LooseLineItem> Lines, string? PartnerName);
public record LooseLineItem(string LineNo, decimal LooseQty);
public record CancelScanRequest(long ScanLogId, string? Reason);
public record MapOemOrderRequest(object? HandoverNo, object? LineNo, object? ProductCode, object? OrderNo);
public record UnmapOemOrderRequest(object? HandoverNo, object? LineNo, object? ProductCode);
