using System.Text.Json.Serialization;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/pack360")]
[Authorize]
public class Pack360Controller : ControllerBase
{
    private readonly IStoredProcedureExecutor _spExecutor;
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly ICurrentUserService _currentUserService;

    public Pack360Controller(
        IStoredProcedureExecutor spExecutor,
        ISqlConnectionFactory connectionFactory,
        ICurrentUserService currentUserService)
    {
        _spExecutor = spExecutor;
        _connectionFactory = connectionFactory;
        _currentUserService = currentUserService;
    }

    [HttpPost("scan-unit")]
    [Authorize(Policy = PolicyNames.Pack360Scan)]
    public async Task<IActionResult> ScanUnit([FromBody] PackScanUnitRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Qr60))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu tham số qr_60."));
        }

        string actor = _currentUserService.Username;

        using var connection = await _connectionFactory.CreateConnectionAsync();
        var dynamicParams = new DynamicParameters();
        dynamicParams.Add("pack360_id", request.Pack360Id);
        dynamicParams.Add("qr_60", request.Qr60);
        dynamicParams.Add("packing_standard_type", string.IsNullOrWhiteSpace(request.PackingStandardType) ? "TRADITIONAL" : request.PackingStandardType);
        dynamicParams.Add("target_oem_order_no", request.TargetOemOrderNo);
        dynamicParams.Add("user_code", actor);
        dynamicParams.Add("is_repack", request.IsRepack ? 1 : 0);
        dynamicParams.Add("new_pack360_id", dbType: System.Data.DbType.String, direction: System.Data.ParameterDirection.Output, size: 50);

        await connection.ExecuteAsync("usp_Pack360_ScanUnit", dynamicParams, commandType: System.Data.CommandType.StoredProcedure);

        string newPack360Id = dynamicParams.Get<string>("new_pack360_id");
        var countResult = await connection.ExecuteScalarAsync<int>("SELECT actual_unit_count FROM pack360_header WHERE pack360_id = @id", new { id = newPack360Id });

        return Ok(ApiResponse<object>.Success(new
        {
            pack360_id = newPack360Id,
            actual_unit_count = countResult,
            message = "Thêm Thùng 60 vào Kiện 360 thành công."
        }));
    }

    [HttpPost("complete")]
    [Authorize(Policy = PolicyNames.Pack360Complete)]
    public async Task<IActionResult> CompletePack([FromBody] PackCompleteRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Pack360Id) || request.Weight <= 0)
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu tham số bắt buộc."));
        }

        string weightSource = string.IsNullOrWhiteSpace(request.WeightSource)
            ? "SCALE"
            : request.WeightSource.Trim().ToUpperInvariant();
        if (weightSource is not ("SCALE" or "MANUAL"))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Nguồn cân không hợp lệ."));
        }
        if (weightSource == "MANUAL" && string.IsNullOrWhiteSpace(request.ManualWeightReason))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Bắt buộc nhập lý do khi nhập trọng lượng thủ công."));
        }

        string actor = _currentUserService.Username;
        string printJobId = Guid.NewGuid().ToString("N");

        var parameters = new
        {
            pack360_id = request.Pack360Id,
            weight = request.Weight,
            user_code = actor,
            weight_source = weightSource,
            manual_weight_reason = request.ManualWeightReason?.Trim(),
            print_job_id = printJobId,
            print_status = "PENDING"
        };

        var row = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_Pack360_Complete", parameters);
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var listQr60 = await connection.QueryAsync<string>(@"
            SELECT t.qr_60 
            FROM pack360_unit u 
            INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60 
            WHERE u.pack360_id = @id AND u.is_current = 1", new { id = request.Pack360Id });

        string labelData = string.Empty;
        if (row != null)
        {
            labelData = TsplHelper.GenerateLabel((string)row.Pack360_QR, (decimal)row.Weight, (string)row.ProductCode, (string)row.Channel);
        }

        return Ok(ApiResponse<object>.Success(new
        {
            pack360_id = request.Pack360Id,
            pack360_qr = row?.Pack360_QR,
            weight = row?.Weight,
            product_code = row?.ProductCode,
            channel = row?.Channel,
            units = listQr60,
            print_job_id = printJobId,
            label_data = labelData,
            label_tspl = labelData,
            message = "Hoàn tất Đóng gói Thùng 360."
        }));
    }

    [HttpPost("cancel")]
    [Authorize(Policy = PolicyNames.Pack360Cancel)]
    public async Task<IActionResult> CancelPack([FromBody] PackCancelRequest request)
    {
        string actor = _currentUserService.Username;
        await _spExecutor.ExecuteAsync("usp_Pack360_Cancel", new { pack360_id = request.Pack360Id, user_code = actor });
        return Ok(CommandResponse.Success("Đã hủy thao tác đóng gói và giải phóng các thùng."));
    }

    [HttpGet("{id}")]
    [Authorize(Policy = PolicyNames.Pack360Read)]
    public async Task<IActionResult> GetPackInfo([FromRoute] string id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var header = await connection.QueryFirstOrDefaultAsync<dynamic>(@"
            SELECT pack360_id, pack360_qr, packing_standard_type, oem_order_no, oem_batch_no, status, weight, actual_unit_count, created_by, created_at
            FROM pack360_header
            WHERE pack360_id = @id OR pack360_qr = @id", new { id });

        if (header == null)
        {
            return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, "Không tìm thấy thông tin Kiện 360."));
        }

        var units = await connection.QueryAsync<dynamic>(@"
            SELECT u.id_60, t.qr_60, t.product_code, t.current_qty, t.status, t.current_location_code
            FROM pack360_unit u
            INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60
            WHERE u.pack360_id = @packId AND u.is_current = 1", new { packId = (string)header.pack360_id });

        return Ok(ApiResponse<object>.Success(new
        {
            pack360_id = header.pack360_id,
            pack360_qr = header.pack360_qr,
            packing_standard_type = header.packing_standard_type,
            oem_order_no = header.oem_order_no,
            oem_batch_no = header.oem_batch_no,
            status = header.status,
            weight = header.weight,
            actual_unit_count = header.actual_unit_count,
            created_by = header.created_by,
            units = units
        }));
    }

    [HttpPost("release")]
    [Authorize(Policy = PolicyNames.Pack360Release)]
    public async Task<IActionResult> ReleasePack([FromBody] PackReleaseRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Pack360Id))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu tham số pack360_id."));
        }

        string actor = _currentUserService.Username;
        await _spExecutor.ExecuteAsync("usp_Pack360_Release", new
        {
            pack360_id = request.Pack360Id,
            release_reason = request.Reason ?? "Release pack360",
            user_code = actor
        });

        return Ok(CommandResponse.Success("Giải phóng Kiện 360 thành công."));
    }

    [HttpPost("detach-units")]
    [Authorize(Policy = PolicyNames.Pack360Detach)]
    public async Task<IActionResult> DetachUnits([FromBody] PackDetachRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Pack360Id) || request.UnitIds == null || !request.UnitIds.Any())
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu thông tin kiện hoặc thùng 60 cần tách."));
        }

        string actor = _currentUserService.Username;
        await _spExecutor.ExecuteAsync("usp_Pack360_DetachUnits", new
        {
            pack360_id = request.Pack360Id,
            unit_ids = string.Join(",", request.UnitIds),
            reason = request.Reason ?? "Tách thùng 60 khỏi kiện 360",
            user_code = actor
        });

        return Ok(CommandResponse.Success("Tách thùng 60 khỏi Kiện 360 thành công."));
    }

    [HttpPost("complete-repack")]
    [Authorize(Policy = PolicyNames.Pack360Complete)]
    public async Task<IActionResult> CompleteRepack([FromBody] PackCompleteRequest request)
    {
        return await CompletePack(request);
    }

    [HttpPost("transfer-order")]
    [Authorize(Policy = PolicyNames.Pack360Transfer)]
    public async Task<IActionResult> TransferOrder([FromBody] PackTransferOrderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Pack360Id) || string.IsNullOrWhiteSpace(request.TargetOemOrderNo))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu thông tin kiện 360 hoặc mã đơn OEM đích."));
        }

        string actor = _currentUserService.Username;
        await _spExecutor.ExecuteAsync("usp_Pack360_TransferOEM", new
        {
            pack360_id = request.Pack360Id,
            target_oem_order_no = request.TargetOemOrderNo,
            target_oem_batch_no = request.TargetOemBatchNo > 0 ? request.TargetOemBatchNo : 1,
            reason = request.Reason ?? "Chuyển đơn OEM",
            user_code = actor
        });

        return Ok(CommandResponse.Success("Chuyển đơn OEM cho Kiện 360 thành công."));
    }

    [HttpPost("{id}/reprint")]
    [Authorize(Policy = PolicyNames.Pack360Reprint)]
    public async Task<IActionResult> ReprintPack([FromRoute] string id, [FromBody] PackReprintRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu lý do in lại."));
        }

        string actor = _currentUserService.Username;
        var dynamicParams = new DynamicParameters();
        dynamicParams.Add("pack360_id", id);
        dynamicParams.Add("reason", request.Reason);
        dynamicParams.Add("user_code", actor);
        dynamicParams.Add("print_job_id", dbType: System.Data.DbType.String, direction: System.Data.ParameterDirection.Output, size: 50);

        using var connection = await _connectionFactory.CreateConnectionAsync();
        await connection.ExecuteAsync("usp_Pack360_Reprint_Audit", dynamicParams, commandType: System.Data.CommandType.StoredProcedure);

        string printJobId = dynamicParams.Get<string>("print_job_id");

        var row = await connection.QueryFirstOrDefaultAsync<dynamic>(@"
            SELECT pack360_qr, weight 
            FROM pack360_header 
            WHERE pack360_id = @id", new { id });
        
        string labelData = string.Empty;
        if (row != null) {
            labelData = TsplHelper.GenerateLabel((string)row.pack360_qr, (decimal)(row.weight ?? 0), "REPRINT", "REPRINT");
        }

        return Ok(ApiResponse<object>.Success(new
        {
            pack360_id = id,
            print_job_id = printJobId,
            label_data = labelData,
            label_tspl = labelData,
            message = "Đã ghi nhận yêu cầu in lại."
        }));
    }
}


public record PackScanUnitRequest(
    [property: JsonPropertyName("pack360_id")] string? Pack360Id, 
    [property: JsonPropertyName("qr_60")] string Qr60, 
    [property: JsonPropertyName("packing_standard_type")] string? PackingStandardType, 
    [property: JsonPropertyName("target_oem_order_no")] string? TargetOemOrderNo, 
    [property: JsonPropertyName("is_repack")] bool IsRepack = false);

public record PackCompleteRequest(
    [property: JsonPropertyName("pack360_id")] string Pack360Id, 
    [property: JsonPropertyName("weight")] decimal Weight,
    [property: JsonPropertyName("weight_source")] string? WeightSource = null,
    [property: JsonPropertyName("manual_weight_reason")] string? ManualWeightReason = null);

public record PackCancelRequest(
    [property: JsonPropertyName("pack360_id")] string Pack360Id);

public record PackReleaseRequest(
    [property: JsonPropertyName("pack360_id")] string Pack360Id, 
    [property: JsonPropertyName("reason")] string? Reason);

public record PackDetachRequest(
    [property: JsonPropertyName("pack360_id")] string Pack360Id, 
    [property: JsonPropertyName("unit_ids")] IEnumerable<string> UnitIds, 
    [property: JsonPropertyName("reason")] string? Reason);

public record PackTransferOrderRequest(
    [property: JsonPropertyName("pack360_id")] string Pack360Id, 
    [property: JsonPropertyName("target_oem_order_no")] string TargetOemOrderNo, 
    [property: JsonPropertyName("target_oem_batch_no")] int TargetOemBatchNo = 1, 
    [property: JsonPropertyName("reason")] string? Reason = null);

public record PackReprintRequest(
    [property: JsonPropertyName("reason")] string Reason);

public static class TsplHelper
{
    public static string GenerateLabel(string pack360Qr, decimal weight, string productCode, string channel)
    {
        var escapedQr = pack360Qr?.Replace("\"", "\\\"") ?? "";
        return $"SIZE 100 mm, 150 mm\r\nGAP 3 mm, 0 mm\r\nCLS\r\nTEXT 50,50,\"3\",0,1,1,\"Weight: {weight} kg\"\r\nTEXT 50,100,\"3\",0,1,1,\"Code: {productCode}\"\r\nTEXT 50,150,\"3\",0,1,1,\"Channel: {channel}\"\r\nQRCODE 50,200,H,6,A,0,\"{escapedQr}\"\r\nPRINT 1,1\r\n";
    }
}

