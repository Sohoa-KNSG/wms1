namespace Wms.Application.Auth.Models;

public record LoginRequestDto(string Username, string Password);

public record LoginResponseDto(string Token, UserDto User);

public record UserDto(
    string UserId,
    string Username,
    string FullName,
    IEnumerable<string> Roles,
    bool MustChangePassword,
    bool IsActive = true,
    int FailedAttempts = 0,
    DateTime? LockoutUntil = null,
    IEnumerable<string>? Permissions = null
);

public record ChangePasswordRequestDto(string CurrentPassword, string NewPassword, string ConfirmNewPassword);

public record CreateUserRequestDto(string Username, string FullName, IEnumerable<string> Roles);

public record UpdateUserStatusRequestDto(bool IsActive);

public record UpdateUserRolesRequestDto(IEnumerable<string> Roles);

public record ResetPasswordRequestDto(string TargetUserId);
