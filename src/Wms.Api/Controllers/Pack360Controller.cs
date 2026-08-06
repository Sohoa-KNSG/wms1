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
    public async Task<IActionResult> CompletePack([FromBody] PackCompleteRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Pack360Id) || request.Weight <= 0)
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Thiếu tham số bắt buộc."));
        }

        string actor = _currentUserService.Username;
        var parameters = new
        {
            pack360_id = request.Pack360Id,
            weight = request.Weight,
            user_code = actor
        };

        var row = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_Pack360_Complete", parameters);
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var listQr60 = await connection.QueryAsync<string>(@"
            SELECT t.qr_60 
            FROM pack360_unit u 
            INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60 
            WHERE u.pack360_id = @id AND u.is_current = 1", new { id = request.Pack360Id });

        return Ok(ApiResponse<object>.Success(new
        {
            pack360_qr = row?.Pack360_QR,
            weight = row?.Weight,
            product_code = row?.ProductCode,
            channel = row?.Channel,
            units = listQr60,
            message = "Hoàn tất Đóng gói Thùng 360."
        }));
    }

    [HttpPost("cancel")]
    public async Task<IActionResult> CancelPack([FromBody] PackCancelRequest request)
    {
        string actor = _currentUserService.Username;
        await _spExecutor.ExecuteAsync("usp_Pack360_Cancel", new { pack360_id = request.Pack360Id, user_code = actor });
        return Ok(CommandResponse.Success("Đã hủy thao tác đóng gói và giải phóng các thùng."));
    }

    [HttpGet("{id}")]
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
    public async Task<IActionResult> CompleteRepack([FromBody] PackCompleteRequest request)
    {
        return await CompletePack(request);
    }

    [HttpPost("transfer-order")]
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
}

public record PackScanUnitRequest(string? Pack360Id, string Qr60, string? PackingStandardType, string? TargetOemOrderNo, bool IsRepack = false);
public record PackCompleteRequest(string Pack360Id, decimal Weight);
public record PackCancelRequest(string Pack360Id);
public record PackReleaseRequest(string Pack360Id, string? Reason);
public record PackDetachRequest(string Pack360Id, IEnumerable<string> UnitIds, string? Reason);
public record PackTransferOrderRequest(string Pack360Id, string TargetOemOrderNo, int TargetOemBatchNo = 1, string? Reason = null);

