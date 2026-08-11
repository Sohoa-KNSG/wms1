using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/pallet")]
public class PalletController : ControllerBase
{
    private readonly IStoredProcedureExecutor _spExecutor;
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly ICurrentUserService _currentUserService;

    public PalletController(
        IStoredProcedureExecutor spExecutor,
        ISqlConnectionFactory connectionFactory,
        ICurrentUserService currentUserService)
    {
        _spExecutor = spExecutor;
        _connectionFactory = connectionFactory;
        _currentUserService = currentUserService;
    }

    [HttpPost("init")]
    [Authorize(Policy = PolicyNames.PalletManage)]
    public async Task<IActionResult> InitPallet([FromBody] InitPalletRequest request)
    {
        var parameters = new
        {
            PalletId = request.PalletId,
            UserName = _currentUserService.Username
        };

        var data = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC06_InitPallet", parameters);
        return StoredProcedureResult(data);
    }

    [HttpPost("{id}/add-unit")]
    [Authorize(Policy = PolicyNames.PalletManage)]
    public async Task<IActionResult> AddUnitToPallet([FromRoute] string id, [FromBody] AddUnitPalletRequest request)
    {
        var parameters = new
        {
            PalletId = id,
            UnitId = request.UnitId,
            UnitType = request.UnitType,
            UserName = _currentUserService.Username
        };

        var data = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC06_AddUnitToPallet", parameters);
        return StoredProcedureResult(data);
    }

    [HttpPost("{id}/complete")]
    [Authorize(Policy = PolicyNames.PalletManage)]
    public async Task<IActionResult> CompletePallet([FromRoute] string id)
    {
        var parameters = new
        {
            PalletId = id,
            UserName = _currentUserService.Username
        };

        var data = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC06_CompletePallet", parameters);
        return StoredProcedureResult(data);
    }

    [HttpPost("remove-unit")]
    [Authorize(Policy = PolicyNames.PalletManage)]
    public async Task<IActionResult> RemoveUnitFromPallet([FromBody] RemoveUnitPalletRequest request)
    {
        var parameters = new
        {
            PalletId = (string?)null,
            UnitId = request.UnitId,
            UnitType = request.UnitType,
            UserName = _currentUserService.Username
        };

        var data = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC06_1_RemoveUnit", parameters);
        return StoredProcedureResult(data);
    }

    [HttpPost("transfer-unit")]
    [Authorize(Policy = PolicyNames.PalletManage)]
    public async Task<IActionResult> TransferUnitPallet([FromBody] TransferUnitPalletRequest request)
    {
        var parameters = new
        {
            OldPalletId = (string?)null,
            NewPalletId = request.NewPalletId,
            UnitId = request.UnitId,
            UnitType = request.UnitType,
            UserName = _currentUserService.Username
        };

        var data = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC06_1_TransferUnit", parameters);
        return StoredProcedureResult(data);
    }

    [HttpGet("{id}/info")]
    [Authorize(Policy = PolicyNames.PalletRead)]
    public async Task<IActionResult> GetPalletInfo([FromRoute] string id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var multi = await connection.QueryMultipleAsync("usp_WMS_UC06_2_GetPalletInfo", new { PalletId = id }, commandType: System.Data.CommandType.StoredProcedure);

        var pallet = (await multi.ReadAsync<dynamic>()).FirstOrDefault();
        if (pallet == null)
        {
            return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, "Không tìm thấy Pallet."));
        }

        var summary = await multi.ReadAsync<dynamic>();
        var details = await multi.ReadAsync<dynamic>();

        return Ok(ApiResponse<object>.Success(new { 
            pallet = pallet as IDictionary<string, object>, 
            summary = summary.Select(r => (IDictionary<string, object>)r), 
            details = details.Select(r => (IDictionary<string, object>)r) 
        }));
    }

    [HttpPost("{id}/putaway")]
    [Authorize(Policy = PolicyNames.PalletManage)]
    public async Task<IActionResult> PutawayPallet([FromRoute] string id, [FromBody] PutawayPalletRequest request)
    {
        var parameters = new
        {
            PalletId = id,
            LocationCode = request.LocationCode,
            UserName = _currentUserService.Username
        };

        var data = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC11_PutawayPallet", parameters);
        return StoredProcedureResult(data);
    }

    [HttpPost("{id}/letdown")]
    [Authorize(Policy = PolicyNames.PalletManage)]
    public async Task<IActionResult> LetdownPallet([FromRoute] string id)
    {
        var parameters = new
        {
            PalletId = id,
            UserName = _currentUserService.Username
        };

        var data = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC11_LetdownPallet", parameters);
        return StoredProcedureResult(data);
    }

    private IActionResult StoredProcedureResult(object? data)
    {
        if (data is not IDictionary<string, object> payload)
        {
            return StatusCode(StatusCodes.Status502BadGateway,
                ApiResponse<object>.Error(
                    WmsErrorCodes.InternalServerError,
                    "Stored procedure không trả về kết quả nghiệp vụ hợp lệ."));
        }

        return Ok(ApiResponse<object>.Success(payload));
    }
}

public record InitPalletRequest(string PalletId);
public record AddUnitPalletRequest(string UnitId, string UnitType);
public record RemoveUnitPalletRequest(string UnitId, string UnitType);
public record TransferUnitPalletRequest(string NewPalletId, string UnitId, string UnitType);
public record PutawayPalletRequest(string LocationCode);
