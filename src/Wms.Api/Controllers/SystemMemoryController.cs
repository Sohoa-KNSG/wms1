using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/system/memory")]
public class SystemMemoryController : ControllerBase
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public SystemMemoryController(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetChangeHistory([FromQuery] string? featureCode, [FromQuery] string? moduleName)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = @"
            SELECT 
                id,
                change_date,
                feature_code,
                module_name,
                change_type,
                summary,
                detailed_description,
                affected_files,
                verification_status,
                performed_by,
                created_at
            FROM tbl_system_change_history WITH (NOLOCK)
            WHERE (@FeatureCode IS NULL OR feature_code = @FeatureCode)
              AND (@ModuleName IS NULL OR module_name = @ModuleName)
            ORDER BY change_date DESC";

        var result = await connection.QueryAsync(sql, new { FeatureCode = featureCode, ModuleName = moduleName });
        return Ok(ApiResponse<object>.Success(result));
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> RecordChangeHistory([FromBody] RecordSystemChangeDto request)
    {
        if (string.IsNullOrWhiteSpace(request.FeatureCode) || string.IsNullOrWhiteSpace(request.Summary))
        {
            return BadRequest(ApiResponse<string>.Error("Mã tính năng (feature_code) và Tóm tắt (summary) không được để rỗng.", "BAD_REQUEST"));
        }

        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = @"
            INSERT INTO tbl_system_change_history 
            (change_date, feature_code, module_name, change_type, summary, detailed_description, affected_files, verification_status, performed_by)
            VALUES 
            (GETDATE(), @FeatureCode, @ModuleName, @ChangeType, @Summary, @DetailedDescription, @AffectedFiles, @VerificationStatus, @PerformedBy)";

        await connection.ExecuteAsync(sql, new
        {
            FeatureCode = request.FeatureCode,
            ModuleName = request.ModuleName ?? "General",
            ChangeType = request.ChangeType ?? "FEATURE_UPDATE",
            Summary = request.Summary,
            DetailedDescription = request.DetailedDescription,
            AffectedFiles = request.AffectedFiles,
            VerificationStatus = request.VerificationStatus ?? "VERIFIED_SUCCESS",
            PerformedBy = request.PerformedBy ?? "ANTIGRAVITY_AGENT"
        });

        return Ok(ApiResponse<string>.Success("Đã lưu vết bộ nhớ lịch sử thay đổi hệ thống thành công."));
    }
}

public record RecordSystemChangeDto(
    string FeatureCode,
    string? ModuleName,
    string? ChangeType,
    string Summary,
    string? DetailedDescription,
    string? AffectedFiles,
    string? VerificationStatus,
    string? PerformedBy
);
