namespace Wms.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(string userId, string username, IEnumerable<string> roles, IEnumerable<string>? permissions = null);
}
