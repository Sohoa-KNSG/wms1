using BCrypt.Net;
using Dapper;
using Wms.Application.Auth.Models;
using Wms.Application.Auth.Services;
using Wms.Application.Common.Interfaces;
using Wms.Domain.Common;
using Wms.Domain.Constants;

namespace Wms.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly IStoredProcedureExecutor _spExecutor;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(
        ISqlConnectionFactory connectionFactory,
        IStoredProcedureExecutor spExecutor,
        IJwtTokenService jwtTokenService)
    {
        _connectionFactory = connectionFactory;
        _spExecutor = spExecutor;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);

        const string sql = @"
            SELECT u.user_id, u.username, u.password_hash, u.full_name, u.is_active, u.failed_attempts, u.lockout_until, u.must_change_password,
                   STRING_AGG(r.role_id, ',') AS roles
            FROM sec_user u
            LEFT JOIN sec_user_role ur ON u.user_id = ur.user_id
            LEFT JOIN sec_role r ON ur.role_id = r.role_id
            WHERE u.username = @Username
            GROUP BY u.user_id, u.username, u.password_hash, u.full_name, u.is_active, u.failed_attempts, u.lockout_until, u.must_change_password;
        ";

        var user = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, new { Username = request.Username });
        if (user == null)
        {
            return Result<LoginResponseDto>.Failure(WmsErrorCodes.Unauthorized, "Tài khoản không tồn tại.");
        }

        bool isActive = Convert.ToBoolean(user.is_active ?? true);
        if (!isActive)
        {
            return Result<LoginResponseDto>.Failure(WmsErrorCodes.Forbidden, "Tài khoản đã bị khóa.");
        }

        DateTime? lockoutUntil = user.lockout_until != null ? Convert.ToDateTime(user.lockout_until) : null;
        if (lockoutUntil.HasValue && lockoutUntil.Value > DateTime.UtcNow)
        {
            return Result<LoginResponseDto>.Failure(WmsErrorCodes.Forbidden, "Tài khoản đang bị khóa tạm thời do nhập sai quá nhiều lần. Vui lòng thử lại sau.");
        }

        string passwordHash = (string)user.password_hash;
        bool validPassword = BCrypt.Net.BCrypt.Verify(request.Password, passwordHash);

        string userId = (string)user.user_id;
        int failedAttempts = Convert.ToInt32(user.failed_attempts ?? 0);

        if (!validPassword)
        {
            int newFailCount = failedAttempts + 1;
            if (newFailCount >= 5)
            {
                await connection.ExecuteAsync(
                    "UPDATE sec_user SET failed_attempts = @FailCount, lockout_until = DATEADD(MINUTE, 15, GETDATE()) WHERE user_id = @UserId",
                    new { FailCount = newFailCount, UserId = userId });

                return Result<LoginResponseDto>.Failure(WmsErrorCodes.Forbidden, "Nhập sai quá 5 lần. Tài khoản của bạn đã bị khóa 15 phút.");
            }

            await connection.ExecuteAsync(
                "UPDATE sec_user SET failed_attempts = @FailCount WHERE user_id = @UserId",
                new { FailCount = newFailCount, UserId = userId });

            return Result<LoginResponseDto>.Failure(WmsErrorCodes.Unauthorized, "Mật khẩu không chính xác.");
        }

        if (failedAttempts > 0 || lockoutUntil.HasValue)
        {
            await connection.ExecuteAsync(
                "UPDATE sec_user SET failed_attempts = 0, lockout_until = NULL WHERE user_id = @UserId",
                new { UserId = userId });
        }

        string rawRoles = (string)(user.roles ?? "");
        var roleList = string.IsNullOrWhiteSpace(rawRoles)
            ? Array.Empty<string>()
            : rawRoles.Split(',', StringSplitOptions.RemoveEmptyEntries);

        // SEC-01: Query permissions từ DB để gán vào JWT token dưới dạng claim "permission"
        // Mỗi permission_id trong sec_role_permission phải khớp với PolicyNames constants
        IEnumerable<string> permissionList = Array.Empty<string>();
        if (roleList.Length > 0)
        {
            const string permSql = @"
                SELECT DISTINCT rp.permission_id
                FROM sec_role_permission rp
                WHERE rp.role_id IN @Roles";
            var dbPerms = await connection.QueryAsync<string>(permSql, new { Roles = roleList });
            permissionList = dbPerms ?? Array.Empty<string>();
        }

        // Grant full permissions for ADMIN, STOREKEEPER, OPERATOR, or if permission list is empty
        var allPolicies = typeof(PolicyNames).GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static)
            .Select(f => f.GetValue(null)?.ToString())
            .Where(p => !string.IsNullOrEmpty(p))
            .Cast<string>();

        if (!permissionList.Any() || roleList.Any(r => r.Equals("ADMIN", StringComparison.OrdinalIgnoreCase) || r.Equals("IT_ADMIN", StringComparison.OrdinalIgnoreCase) || r.Equals("STOREKEEPER", StringComparison.OrdinalIgnoreCase) || r.Equals("OPERATOR", StringComparison.OrdinalIgnoreCase)))
        {
            permissionList = permissionList.Concat(allPolicies).Distinct();
        }

        bool mustChangePassword = Convert.ToBoolean(user.must_change_password ?? false);
        // Truyền permissions vào token — RequireClaim("permission", policyName) sẽ kiểm tra
        string token = _jwtTokenService.GenerateToken(userId, (string)user.username, roleList, permissionList);

        var userDto = new UserDto(
            userId,
            (string)user.username,
            (string)(user.full_name ?? ""),
            roleList,
            mustChangePassword,
            isActive,
            0,
            null,
            permissionList
        );

        return Result<LoginResponseDto>.Success(new LoginResponseDto(token, userDto));
    }

    public async Task<Result> ChangePasswordAsync(string currentUserId, ChangePasswordRequestDto request, string? clientIp = null, string? userAgent = null, CancellationToken cancellationToken = default)
    {
        if (request.NewPassword != request.ConfirmNewPassword)
        {
            return Result.Failure(WmsErrorCodes.ValidationFailed, "Mật khẩu xác nhận không khớp.");
        }

        if (request.NewPassword == request.CurrentPassword)
        {
            return Result.Failure(WmsErrorCodes.ValidationFailed, "Mật khẩu mới không được trùng mật khẩu hiện tại.");
        }

        if (request.NewPassword.Length < 8)
        {
            return Result.Failure(WmsErrorCodes.ValidationFailed, "Mật khẩu mới phải có ít nhất 8 ký tự.");
        }

        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        var passwordHash = await connection.QueryFirstOrDefaultAsync<string>(
            "SELECT password_hash FROM sec_user WHERE user_id = @UserId", new { UserId = currentUserId });

        if (string.IsNullOrEmpty(passwordHash) || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, passwordHash))
        {
            return Result.Failure(WmsErrorCodes.Unauthorized, "Mật khẩu hiện tại không chính xác.");
        }

        string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        await _spExecutor.ExecuteAsync("usp_WMS_AUTH_ChangePassword", new
        {
            UserID = currentUserId,
            NewPasswordHash = newPasswordHash,
            ClientIP = clientIp,
            UserAgent = userAgent
        }, cancellationToken);

        return Result.Success();
    }

    public async Task<Result<IEnumerable<UserDto>>> GetUsersAsync(CancellationToken cancellationToken = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        const string sql = @"
            SELECT u.user_id, u.username, u.full_name, u.is_active, u.failed_attempts, u.lockout_until, u.must_change_password,
                   STRING_AGG(r.role_id, ',') AS roles
            FROM sec_user u
            LEFT JOIN sec_user_role ur ON u.user_id = ur.user_id
            LEFT JOIN sec_role r ON ur.role_id = r.role_id
            GROUP BY u.user_id, u.username, u.full_name, u.is_active, u.failed_attempts, u.lockout_until, u.must_change_password;
        ";

        var rawUsers = await connection.QueryAsync<dynamic>(sql);
        var userDtos = rawUsers.Select(u => new UserDto(
            (string)u.user_id,
            (string)u.username,
            (string)(u.full_name ?? ""),
            string.IsNullOrWhiteSpace((string)(u.roles ?? "")) ? Array.Empty<string>() : ((string)u.roles).Split(','),
            Convert.ToBoolean(u.must_change_password ?? false),
            Convert.ToBoolean(u.is_active ?? true),
            Convert.ToInt32(u.failed_attempts ?? 0),
            u.lockout_until != null ? Convert.ToDateTime(u.lockout_until) : null
        ));

        return Result<IEnumerable<UserDto>>.Success(userDtos);
    }

    public async Task<Result> CreateUserAsync(CreateUserRequestDto request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.FullName))
        {
            return Result.Failure(WmsErrorCodes.ValidationFailed, "Vui lòng điền đầy đủ thông tin.");
        }

        // Tự động sinh mật khẩu ngẫu nhiên an toàn (không dùng '123456' mặc định cố định)
        string randomDefaultPassword = "Wms@" + Guid.NewGuid().ToString("N")[..8];
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(randomDefaultPassword);

        await _spExecutor.ExecuteAsync("usp_WMS_AUTH_CreateUser", new
        {
            Username = request.Username,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            Roles = request.Roles != null ? string.Join(",", request.Roles) : ""
        }, cancellationToken);

        return Result.Success();
    }

    public async Task<Result> ResetPasswordAsync(string adminUsername, ResetPasswordRequestDto request, string? clientIp = null, string? userAgent = null, CancellationToken cancellationToken = default)
    {
        string randomResetPassword = "Reset@" + Guid.NewGuid().ToString("N")[..8];
        string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(randomResetPassword);

        await _spExecutor.ExecuteAsync("usp_WMS_AUTH_AdminResetPassword", new
        {
            TargetUserID = request.TargetUserId,
            AdminUserName = adminUsername,
            DefaultPasswordHash = newPasswordHash,
            ClientIP = clientIp,
            UserAgent = userAgent
        }, cancellationToken);

        return Result.Success();
    }

    public async Task<Result> UpdateUserStatusAsync(string currentUserId, string targetUserId, UpdateUserStatusRequestDto request, CancellationToken cancellationToken = default)
    {
        if (currentUserId == targetUserId)
        {
            return Result.Failure(WmsErrorCodes.ValidationFailed, "Không thể tự khóa hoặc mở khóa tài khoản của chính mình.");
        }

        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        await connection.ExecuteAsync(
            "UPDATE sec_user SET is_active = @IsActive WHERE user_id = @TargetUserId",
            new { IsActive = request.IsActive ? 1 : 0, TargetUserId = targetUserId });

        return Result.Success();
    }

    public async Task<Result> UpdateUserRolesAsync(string targetUserId, UpdateUserRolesRequestDto request, CancellationToken cancellationToken = default)
    {
        await _spExecutor.ExecuteAsync("usp_WMS_AUTH_UpdateUserRoles", new
        {
            TargetUserID = targetUserId,
            Roles = request.Roles != null ? string.Join(",", request.Roles) : ""
        }, cancellationToken);

        return Result.Success();
    }
}
