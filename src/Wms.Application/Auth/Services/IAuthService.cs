using Wms.Application.Auth.Models;
using Wms.Domain.Common;

namespace Wms.Application.Auth.Services;

public interface IAuthService
{
    Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<Result> ChangePasswordAsync(string currentUserId, ChangePasswordRequestDto request, string? clientIp = null, string? userAgent = null, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<UserDto>>> GetUsersAsync(CancellationToken cancellationToken = default);
    Task<Result<string>> CreateUserAsync(CreateUserRequestDto request, CancellationToken cancellationToken = default);
    Task<Result<string>> ResetPasswordAsync(string adminUsername, ResetPasswordRequestDto request, string? clientIp = null, string? userAgent = null, CancellationToken cancellationToken = default);
    Task<Result> UpdateUserStatusAsync(string currentUserId, string targetUserId, UpdateUserStatusRequestDto request, CancellationToken cancellationToken = default);
    Task<Result> UpdateUserRolesAsync(string targetUserId, UpdateUserRolesRequestDto request, CancellationToken cancellationToken = default);
}
