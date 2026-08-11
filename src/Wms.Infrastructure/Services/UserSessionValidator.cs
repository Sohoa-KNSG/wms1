using Dapper;
using Wms.Application.Common.Interfaces;

namespace Wms.Infrastructure.Services;

public sealed class UserSessionValidator : IUserSessionValidator
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public UserSessionValidator(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<UserSessionValidationResult> ValidateAsync(
        string userId,
        long issuedAtUtcTicks,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId) || issuedAtUtcTicks < DateTime.UnixEpoch.Ticks)
        {
            return new UserSessionValidationResult(false, false, "INVALID_TOKEN_SESSION");
        }

        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        const string sql = @"
            SELECT is_active AS IsActive,
                   must_change_password AS MustChangePassword,
                   lockout_until AS LockoutUntil,
                   last_password_changed_at AS LastPasswordChangedAt
            FROM sec_user
            WHERE user_id = @UserId;";

        var state = await connection.QueryFirstOrDefaultAsync<SessionState>(sql, new { UserId = userId });
        if (state is null || !state.IsActive)
        {
            return new UserSessionValidationResult(false, false, "ACCOUNT_DISABLED");
        }

        if (state.LockoutUntil.HasValue && AsUtc(state.LockoutUntil.Value) > DateTime.UtcNow)
        {
            return new UserSessionValidationResult(false, false, "ACCOUNT_LOCKED");
        }

        if (state.LastPasswordChangedAt.HasValue &&
            issuedAtUtcTicks < AsUtc(state.LastPasswordChangedAt.Value).Ticks)
        {
            return new UserSessionValidationResult(false, false, "TOKEN_REVOKED");
        }

        return new UserSessionValidationResult(true, state.MustChangePassword);
    }

    public static DateTime AsUtc(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
    };

    private sealed class SessionState
    {
        public bool IsActive { get; init; }
        public bool MustChangePassword { get; init; }
        public DateTime? LockoutUntil { get; init; }
        public DateTime? LastPasswordChangedAt { get; init; }
    }
}
