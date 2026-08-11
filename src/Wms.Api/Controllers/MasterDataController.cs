using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/master")]
[Authorize(Policy = PolicyNames.MasterDataRead)]
public class MasterDataController : ControllerBase
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public MasterDataController(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet("trucks")]
    public async Task<IActionResult> GetTrucks()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var result = await connection.QueryAsync("SELECT * FROM tbl_trucks WHERE status = 'ACTIVE'");
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("drivers")]
    public async Task<IActionResult> GetDrivers()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var result = await connection.QueryAsync("SELECT * FROM tbl_drivers WHERE status = 'ACTIVE'");
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("guards")]
    public async Task<IActionResult> GetGuards()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var result = await connection.QueryAsync("SELECT * FROM tbl_guards WHERE status = 'ACTIVE'");
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts()
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = @"
            SELECT DISTINCT p.code
            FROM (
                SELECT MFInvtID AS code FROM vw_WMS_Product WHERE MFInvtID IS NOT NULL AND MFInvtID <> ''
                UNION
                SELECT product_code AS code FROM tbl_thung60_kho WHERE product_code IS NOT NULL AND product_code <> ''
            ) p
            ORDER BY p.code ASC";
        var result = await connection.QueryAsync<string>(sql);
        return Ok(ApiResponse<object>.Success(result));
    }

    [HttpPost("trucks")]
    [Authorize(Policy = PolicyNames.MasterDataManage)]
    public async Task<IActionResult> CreateTruck([FromBody] CreateTruckDto request)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        await connection.ExecuteAsync(
            "INSERT INTO tbl_trucks (license_plate, max_weight_kg, max_volume) VALUES (@LicensePlate, @MaxWeightKg, @MaxVolume)",
            request);
        return Ok(ApiResponse<string>.Success("Thêm mới xe tải thành công"));
    }

    [HttpPost("drivers")]
    [Authorize(Policy = PolicyNames.MasterDataManage)]
    public async Task<IActionResult> CreateDriver([FromBody] CreateDriverDto request)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        await connection.ExecuteAsync(
            "INSERT INTO tbl_drivers (driver_name, phone) VALUES (@DriverName, @Phone)",
            request);
        return Ok(ApiResponse<string>.Success("Thêm mới tài xế thành công"));
    }

    [HttpPost("guards")]
    [Authorize(Policy = PolicyNames.MasterDataManage)]
    public async Task<IActionResult> CreateGuard([FromBody] CreateGuardDto request)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        await connection.ExecuteAsync(
            "INSERT INTO tbl_guards (guard_name) VALUES (@GuardName)",
            request);
        return Ok(ApiResponse<string>.Success("Thêm mới bảo vệ thành công"));
    }

    [HttpPost("customers")]
    [Authorize(Policy = PolicyNames.MasterDataManage)]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerDto request)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        await connection.ExecuteAsync(
            "INSERT INTO tbl_customers (customer_code, customer_name, address) VALUES (@CustomerCode, @CustomerName, @Address)",
            request);
        return Ok(ApiResponse<string>.Success("Thêm mới khách hàng thành công"));
    }
}

public record CreateTruckDto(string LicensePlate, decimal MaxWeightKg, decimal? MaxVolume);
public record CreateDriverDto(string DriverName, string? Phone);
public record CreateGuardDto(string GuardName);
public record CreateCustomerDto(string CustomerCode, string CustomerName, string? Address);
