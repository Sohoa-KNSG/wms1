using System.Data;
using System.Text.Json;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/picking")]
[Authorize]
public class PickingOutboundController : ControllerBase
{
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly ICurrentUserService _currentUserService;

    public PickingOutboundController(ISqlConnectionFactory connectionFactory, ICurrentUserService currentUserService)
    {
        _connectionFactory = connectionFactory;
        _currentUserService = currentUserService;
    }

    private string GetRequestId()
    {
        if (Request.Headers.TryGetValue("X-Request-Id", out var reqId) && !string.IsNullOrWhiteSpace(reqId))
        {
            return reqId.ToString();
        }
        return "REQ-PICKING-" + Guid.NewGuid().ToString("N");
    }

    [HttpGet("delivery-notes")]
    [HttpGet("notes")]
    [Authorize(Policy = PolicyNames.PickingRead)]
    public async Task<IActionResult> GetDeliveryNotes([FromQuery] string? status)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var result = await connection.QueryAsync<dynamic>(
            "usp_WMS_UC16_GetDeliveryNotes",
            new { Status = status },
            commandType: CommandType.StoredProcedure
        );

        return Ok(ApiResponse<object>.Success(result, requestId: GetRequestId()));
    }

    [HttpGet("delivery-notes/{id}")]
    [HttpGet("notes/{id}")]
    [Authorize(Policy = PolicyNames.PickingRead)]
    public async Task<IActionResult> GetDeliveryNoteDetails([FromRoute] string id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var multi = await connection.QueryMultipleAsync(
            "usp_WMS_UC16_GetDeliveryNoteDetail",
            new { DeliveryNoteNo = id },
            commandType: CommandType.StoredProcedure
        );

        var header = await multi.ReadFirstOrDefaultAsync<dynamic>();
        if (header == null)
        {
            return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, $"Không tìm thấy Phiếu xuất kho {id}.", requestId: GetRequestId()));
        }

        var lines = (await multi.ReadAsync<dynamic>()).ToList();
        var scannedBarcodes = (await multi.ReadAsync<dynamic>()).ToList();

        return Ok(ApiResponse<object>.Success(new { header, lines, scannedBarcodes }, requestId: GetRequestId()));
    }

    [HttpGet("delivery-notes/{id}/lines/{productCode}/scans")]
    [HttpGet("notes/{id}/line/{productCode}")]
    [Authorize(Policy = PolicyNames.PickingRead)]
    public async Task<IActionResult> GetLineScanHistory([FromRoute] string id, [FromRoute] string productCode)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var history = await connection.QueryAsync<dynamic>(@"
            SELECT id, delivery_note_no, barcode, barcode_type, product_code, qty, scanned_by, scanned_at
            FROM delivery_note_barcode WITH (NOLOCK)
            WHERE delivery_note_no = @id AND product_code = @productCode
            ORDER BY scanned_at DESC", new { id, productCode });

        return Ok(ApiResponse<object>.Success(history, requestId: GetRequestId()));
    }

    [HttpGet("fifo-suggestions/{productCode}")]
    [Authorize(Policy = PolicyNames.PickingRead)]
    public async Task<IActionResult> GetFifoSuggestions([FromRoute] string productCode)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var multi = await connection.QueryMultipleAsync(
            "usp_WMS_UC16_GetFifoSuggestions",
            new { ProductCode = productCode },
            commandType: CommandType.StoredProcedure
        );

        var pack360_suggestions = (await multi.ReadAsync<dynamic>()).ToList();
        var box60_suggestions = (await multi.ReadAsync<dynamic>()).ToList();
        var virtual_box_suggestions = (await multi.ReadAsync<dynamic>()).ToList();

        return Ok(ApiResponse<object>.Success(new { pack360_suggestions, box60_suggestions, virtual_box_suggestions }, requestId: GetRequestId()));
    }

    [HttpGet("available-boxes/{productCode}")]
    [Authorize(Policy = PolicyNames.PickingRead)]
    public async Task<IActionResult> GetAvailableBoxes([FromRoute] string productCode)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var boxes = await connection.QueryAsync<dynamic>(
            "usp_WMS_UC16_GetAvailableBoxes",
            new { ProductCode = productCode },
            commandType: CommandType.StoredProcedure
        );

        return Ok(ApiResponse<object>.Success(boxes, requestId: GetRequestId()));
    }

    [HttpGet("truck-summary/{licensePlate}")]
    [Authorize(Policy = PolicyNames.PickingRead)]
    public async Task<IActionResult> GetTruckSummary([FromRoute] string licensePlate)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var summary = await connection.QueryAsync<dynamic>(@"
            SELECT d.product_code, d.channel_code, SUM(d.qty) as total_qty, COUNT(DISTINCT h.delivery_note_no) as total_notes
            FROM delivery_note_detail d WITH (NOLOCK)
            INNER JOIN delivery_note_header h WITH (NOLOCK) ON d.delivery_note_no = h.delivery_note_no
            WHERE h.license_plate = @licensePlate
            GROUP BY d.product_code, d.channel_code", new { licensePlate });

        return Ok(ApiResponse<object>.Success(summary, requestId: GetRequestId()));
    }

    [HttpPost("scan")]
    [Authorize(Policy = PolicyNames.PickingScan)]
    public async Task<IActionResult> ScanPickingUnit([FromBody] ScanPickingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DeliveryNoteNo) || string.IsNullOrWhiteSpace(request.Barcode))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Mã quét và số phiếu không được để trống.", requestId: GetRequestId()));
        }

        string user = _currentUserService.Username;
        string requestId = GetRequestId();

        using var connection = await _connectionFactory.CreateConnectionAsync();
        try
        {
            var resultJson = await connection.QueryFirstOrDefaultAsync<string>(
                "usp_WMS_UC16_ScanBarcode",
                new
                {
                    DeliveryNoteNo = request.DeliveryNoteNo,
                    Barcode = request.Barcode,
                    ExpectedProductCode = request.ExpectedProductCode,
                    ScannedBy = user,
                    RequestId = requestId
                },
                commandType: CommandType.StoredProcedure
            );

            object? data = null;
            if (!string.IsNullOrWhiteSpace(resultJson))
            {
                data = JsonSerializer.Deserialize<object>(resultJson);
            }

            return Ok(ApiResponse<object>.Success(data ?? new object(), "Quét mã vạch thành công.", requestId: requestId));
        }
        catch (Microsoft.Data.SqlClient.SqlException ex)
        {
            return Conflict(ApiResponse<object>.Error(WmsErrorCodes.InvalidStateTransition, ex.Message, requestId: requestId));
        }
    }

    [HttpPost("split-box")]
    [Authorize(Policy = PolicyNames.PickingScan)]
    public async Task<IActionResult> SplitBox([FromBody] SplitBoxRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DeliveryNoteNo) || string.IsNullOrWhiteSpace(request.SourceId60) || request.SplitQty <= 0)
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thông tin tách thùng không hợp lệ.", requestId: GetRequestId()));
        }

        string user = _currentUserService.Username;
        string requestId = GetRequestId();

        using var connection = await _connectionFactory.CreateConnectionAsync();
        try
        {
            var resultJson = await connection.QueryFirstOrDefaultAsync<string>(
                "usp_WMS_UC16_SplitBox",
                new
                {
                    DeliveryNoteNo = request.DeliveryNoteNo,
                    ProductCode = request.ProductCode,
                    SourceId60 = request.SourceId60,
                    SplitQty = request.SplitQty,
                    ScannedBy = user,
                    RequestId = requestId
                },
                commandType: CommandType.StoredProcedure
            );

            object? data = null;
            if (!string.IsNullOrWhiteSpace(resultJson))
            {
                data = JsonSerializer.Deserialize<object>(resultJson);
            }

            return Ok(ApiResponse<object>.Success(data ?? new object(), "Tách lẻ thùng thành công.", requestId: requestId));
        }
        catch (Microsoft.Data.SqlClient.SqlException ex)
        {
            return Conflict(ApiResponse<object>.Error(WmsErrorCodes.InvalidStateTransition, ex.Message, requestId: requestId));
        }
    }

    [HttpPost("complete")]
    [Authorize(Policy = PolicyNames.PickingManage)]
    public async Task<IActionResult> CompletePicking([FromBody] CompletePickingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DeliveryNoteNo))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu số phiếu xuất kho.", requestId: GetRequestId()));
        }

        string user = _currentUserService.Username;
        string requestId = GetRequestId();

        using var connection = await _connectionFactory.CreateConnectionAsync();
        try
        {
            var resultJson = await connection.QueryFirstOrDefaultAsync<string>(
                "usp_WMS_UC16_CompletePicking",
                new
                {
                    DeliveryNoteNo = request.DeliveryNoteNo,
                    CompletedBy = user,
                    RequestId = requestId
                },
                commandType: CommandType.StoredProcedure
            );

            return Ok(ApiResponse<object>.Success(new object(), "Hoàn tất soạn hàng thành công.", requestId: requestId));
        }
        catch (Microsoft.Data.SqlClient.SqlException ex)
        {
            return Conflict(ApiResponse<object>.Error(WmsErrorCodes.InvalidStateTransition, ex.Message, requestId: requestId));
        }
    }

    [HttpPost("stage")]
    [Authorize(Policy = PolicyNames.PickingApprove)]
    public async Task<IActionResult> ApproveStaging([FromBody] ApproveStagingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DeliveryNoteNo))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu số phiếu xuất kho.", requestId: GetRequestId()));
        }

        string user = _currentUserService.Username;
        string requestId = GetRequestId();

        using var connection = await _connectionFactory.CreateConnectionAsync();
        try
        {
            var resultJson = await connection.QueryFirstOrDefaultAsync<string>(
                "usp_WMS_UC16_ApproveStage",
                new
                {
                    DeliveryNoteNo = request.DeliveryNoteNo,
                    Note = request.Note,
                    ApprovedBy = user,
                    RequestId = requestId
                },
                commandType: CommandType.StoredProcedure
            );

            return Ok(ApiResponse<object>.Success(new object(), "Duyệt tập kết thành công.", requestId: requestId));
        }
        catch (Microsoft.Data.SqlClient.SqlException ex)
        {
            return Conflict(ApiResponse<object>.Error(WmsErrorCodes.InvalidStateTransition, ex.Message, requestId: requestId));
        }
    }

    [HttpPost("gate-out")]
    [HttpPost("gate-check")]
    [Authorize(Policy = PolicyNames.PickingShip)]
    public async Task<IActionResult> ConfirmGateOut([FromBody] GateOutRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DeliveryNoteNo))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu số phiếu xuất bến.", requestId: GetRequestId()));
        }

        string securityUser = _currentUserService.Username;
        string requestId = GetRequestId();

        using var connection = await _connectionFactory.CreateConnectionAsync();
        try
        {
            var resultJson = await connection.QueryFirstOrDefaultAsync<string>(
                "usp_WMS_UC16_GateOut",
                new
                {
                    DeliveryNoteNo = request.DeliveryNoteNo,
                    DriverName = request.DriverName,
                    SealNo = request.SealNo,
                    GateNote = request.GateNote,
                    SecurityUser = securityUser,
                    RequestId = requestId
                },
                commandType: CommandType.StoredProcedure
            );

            object? data = null;
            if (!string.IsNullOrWhiteSpace(resultJson))
            {
                data = JsonSerializer.Deserialize<object>(resultJson);
            }

            return Ok(ApiResponse<object>.Success(data ?? new object(), "Bảo vệ đã xác nhận xuất bến thành công. Sổ cái Kép đã hạch toán.", requestId: requestId));
        }
        catch (Microsoft.Data.SqlClient.SqlException ex)
        {
            return Conflict(ApiResponse<object>.Error(WmsErrorCodes.InvalidStateTransition, ex.Message, requestId: requestId));
        }
    }

    [HttpPost("trucks/{licensePlate}/complete")]
    [Authorize(Policy = PolicyNames.PickingManage)]
    public async Task<IActionResult> CompleteTruck([FromRoute] string licensePlate)
    {
        string user = _currentUserService.Username;
        string requestId = GetRequestId();

        using var connection = await _connectionFactory.CreateConnectionAsync();
        var notes = await connection.QueryAsync<string>(@"
            SELECT delivery_note_no 
            FROM delivery_note_header WITH (NOLOCK)
            WHERE license_plate = @licensePlate AND status IN ('PENDING_PICK', 'PICKING')", new { licensePlate });

        int completedCount = 0;
        foreach (var noteNo in notes)
        {
            try
            {
                await connection.ExecuteAsync("usp_WMS_UC16_CompletePicking", new
                {
                    DeliveryNoteNo = noteNo,
                    CompletedBy = user,
                    RequestId = $"{requestId}-{noteNo}"
                }, commandType: CommandType.StoredProcedure);
                completedCount++;
            }
            catch { }
        }

        return Ok(ApiResponse<object>.Success(new { completed_count = completedCount }, $"Đã hoàn tất soạn hàng cho {completedCount} phiếu của xe {licensePlate}.", requestId: requestId));
    }

    [HttpPost("trucks/{licensePlate}/stage")]
    [Authorize(Policy = PolicyNames.PickingApprove)]
    public async Task<IActionResult> StageTruck([FromRoute] string licensePlate)
    {
        string user = _currentUserService.Username;
        string requestId = GetRequestId();

        using var connection = await _connectionFactory.CreateConnectionAsync();
        var notes = await connection.QueryAsync<string>(@"
            SELECT delivery_note_no 
            FROM delivery_note_header WITH (NOLOCK)
            WHERE license_plate = @licensePlate AND status = 'PICKED'", new { licensePlate });

        int stagedCount = 0;
        foreach (var noteNo in notes)
        {
            try
            {
                await connection.ExecuteAsync("usp_WMS_UC16_ApproveStage", new
                {
                    DeliveryNoteNo = noteNo,
                    Note = $"Duyệt tập kết theo chuyến xe {licensePlate}",
                    ApprovedBy = user,
                    RequestId = $"{requestId}-{noteNo}"
                }, commandType: CommandType.StoredProcedure);
                stagedCount++;
            }
            catch { }
        }

        return Ok(ApiResponse<object>.Success(new { staged_count = stagedCount }, $"Đã duyệt tập kết cho {stagedCount} phiếu của xe {licensePlate}.", requestId: requestId));
    }
}

public record CompletePickingRequest(string DeliveryNoteNo);
public record SplitBoxRequest(string DeliveryNoteNo, string ProductCode, string SourceId60, decimal SplitQty);
public record ScanPickingRequest(string DeliveryNoteNo, string Barcode, string? ExpectedProductCode);
public record ApproveStagingRequest(string DeliveryNoteNo, string? Note);
public record GateOutRequest(string DeliveryNoteNo, string? DriverName, string? SealNo, string? GateNote);
