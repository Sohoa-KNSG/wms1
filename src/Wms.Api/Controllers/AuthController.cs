using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Wms.Application.Auth.Models;
using Wms.Application.Auth.Services;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(IAuthService authService, ICurrentUserService currentUserService)
    {
        _authService = authService;
        _currentUserService = currentUserService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("LoginRateLimit")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        if (!result.IsSuccess)
        {
            return StatusCode(result.ErrorCode == WmsErrorCodes.Forbidden ? 403 : 401,
                ApiResponse<object>.Error(result.ErrorCode!, result.ErrorMessage!));
        }

        return Ok(ApiResponse<LoginResponseDto>.Success(result.Value!, "Đăng nhập thành công"));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request, CancellationToken cancellationToken)
    {
        string? userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse<object>.Error(WmsErrorCodes.Unauthorized, "Chưa xác thực người dùng."));
        }

        string? clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        string? userAgent = Request.Headers.UserAgent.ToString();

        var result = await _authService.ChangePasswordAsync(userId, request, clientIp, userAgent, cancellationToken);
        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<object>.Error(result.ErrorCode!, result.ErrorMessage!));
        }

        return Ok(CommandResponse.Success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại."));
    }

    [HttpGet("users")]
    [Authorize(Policy = PolicyNames.AdminUsersManage)]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var result = await _authService.GetUsersAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<UserDto>>.Success(result.Value!));
    }

    [HttpPost("admin/users")]
    [Authorize(Policy = PolicyNames.AdminUsersManage)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _authService.CreateUserAsync(request, cancellationToken);
        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<object>.Error(result.ErrorCode!, result.ErrorMessage!));
        }

        return Ok(ApiResponse<object>.Success(new { password = result.Value }, "Tạo tài khoản người dùng thành công."));
    }

    [HttpPost("admin/reset-password")]
    [Authorize(Policy = PolicyNames.AdminUsersManage)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request, CancellationToken cancellationToken)
    {
        string adminUsername = _currentUserService.Username;
        string? clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        string? userAgent = Request.Headers.UserAgent.ToString();

        var result = await _authService.ResetPasswordAsync(adminUsername, request, clientIp, userAgent, cancellationToken);
        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<object>.Error(result.ErrorCode!, result.ErrorMessage!));
        }

        return Ok(ApiResponse<object>.Success(new { password = result.Value }, "Đặt lại mật khẩu thành công."));
    }

    [HttpPut("admin/users/{id}/status")]
    [Authorize(Policy = PolicyNames.AdminUsersManage)]
    public async Task<IActionResult> UpdateUserStatus([FromRoute] string id, [FromBody] UpdateUserStatusRequestDto request, CancellationToken cancellationToken)
    {
        string? currentUserId = _currentUserService.UserId;
        var result = await _authService.UpdateUserStatusAsync(currentUserId ?? "", id, request, cancellationToken);
        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<object>.Error(result.ErrorCode!, result.ErrorMessage!));
        }

        return Ok(CommandResponse.Success("Cập nhật trạng thái người dùng thành công."));
    }

    [HttpPut("admin/users/{id}/roles")]
    [Authorize(Policy = PolicyNames.AdminUsersManage)]
    public async Task<IActionResult> UpdateUserRoles([FromRoute] string id, [FromBody] UpdateUserRolesRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _authService.UpdateUserRolesAsync(id, request, cancellationToken);
        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<object>.Error(result.ErrorCode!, result.ErrorMessage!));
        }

        return Ok(CommandResponse.Success("Cập nhật vai trò người dùng thành công."));
    }
}
