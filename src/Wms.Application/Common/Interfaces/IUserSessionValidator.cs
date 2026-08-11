namespace Wms.Application.Common.Interfaces;

public sealed record UserSessionValidationResult(
    bool IsValid,
    bool MustChangePassword,
    string? FailureCode = null);

public interface IUserSessionValidator
{
    Task<UserSessionValidationResult> ValidateAsync(
        string userId,
        long issuedAtUtcTicks,
        CancellationToken cancellationToken = default);
}
