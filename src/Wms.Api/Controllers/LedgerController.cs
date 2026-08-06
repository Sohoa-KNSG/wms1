using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/ledger")]
[Authorize(Policy = PolicyNames.LedgerRead)]
public class LedgerController : ControllerBase
{
    private readonly IStoredProcedureExecutor _spExecutor;

    public LedgerController(IStoredProcedureExecutor spExecutor)
    {
        _spExecutor = spExecutor;
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions([FromQuery] string? type, [FromQuery] string? fromDate, [FromQuery] string? toDate)
    {
        var parameters = new
        {
            Type = string.IsNullOrWhiteSpace(type) ? null : type,
            FromDate = string.IsNullOrWhiteSpace(fromDate) ? null : fromDate,
            ToDate = string.IsNullOrWhiteSpace(toDate) ? null : toDate
        };

        var result = await _spExecutor.QueryAsync<dynamic>("usp_WMS_GetTransactions", parameters);
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("transactions/{transactionId}/details")]
    public async Task<IActionResult> GetTransactionDetails([FromRoute] string transactionId)
    {
        var parameters = new { TransactionId = transactionId };
        var result = await _spExecutor.QueryAsync<dynamic>("usp_WMS_GetTransactionDetails", parameters);
        return Ok(ApiResponse<object>.Success(result));
    }
}
