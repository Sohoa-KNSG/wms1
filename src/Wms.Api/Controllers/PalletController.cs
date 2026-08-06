using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/pallet")]
[Authorize]
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
    public async Task<IActionResult> InitPallet([FromBody] InitPalletRequest request)
    {
        var parameters = new
        {
            PalletId = request.PalletId,
            UserName = _currentUserService.Username
        };

        var data = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC06_InitPallet", parameters);
        return Ok(ApiResponse<object>.Success(data));
    }

    [HttpPost("{id}/add-unit")]
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
        return Ok(ApiResponse<object>.Success(data));
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompletePallet([FromRoute] string id)
    {
        var parameters = new
        {
            PalletId = id,
            UserName = _currentUserService.Username
        };

        var data = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC06_CompletePallet", parameters);
        return Ok(ApiResponse<object>.Success(data));
    }

    [HttpPost("remove-unit")]
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
        return Ok(ApiResponse<object>.Success(data));
    }

    [HttpPost("transfer-unit")]
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
        return Ok(ApiResponse<object>.Success(data));
    }

    [HttpGet("{id}/info")]
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

        return Ok(ApiResponse<object>.Success(new { pallet, summary, details }));
    }

    [HttpPost("{id}/putaway")]
    public async Task<IActionResult> PutawayPallet([FromRoute] string id, [FromBody] PutawayPalletRequest request)
    {
        var parameters = new
        {
            PalletId = id,
            LocationCode = request.LocationCode,
            UserName = _currentUserService.Username
        };

        var data = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC11_PutawayPallet", parameters);
        return Ok(ApiResponse<object>.Success(data));
    }

    [HttpPost("{id}/letdown")]
    public async Task<IActionResult> LetdownPallet([FromRoute] string id)
    {
        var parameters = new
        {
            PalletId = id,
            UserName = _currentUserService.Username
        };

        var data = await _spExecutor.QueryFirstOrDefaultAsync<dynamic>("usp_WMS_UC11_LetdownPallet", parameters);
        return Ok(ApiResponse<object>.Success(data));
    }
}

public record InitPalletRequest(string PalletId);
public record AddUnitPalletRequest(string UnitId, string UnitType);
public record RemoveUnitPalletRequest(string UnitId, string UnitType);
public record TransferUnitPalletRequest(string NewPalletId, string UnitId, string UnitType);
public record PutawayPalletRequest(string LocationCode);
