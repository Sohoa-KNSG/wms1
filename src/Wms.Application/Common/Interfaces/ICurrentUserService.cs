namespace Wms.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string Username { get; }
    bool IsAuthenticated { get; }
    IEnumerable<string> Roles { get; }
    bool HasPermission(string permission);
}
