using System.IdentityModel.Tokens.Jwt;
using System.Globalization;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Wms.Application.Common.Interfaces;

namespace Wms.Infrastructure.Identity;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(
        string userId,
        string username,
        IEnumerable<string> roles,
        IEnumerable<string>? permissions = null,
        bool mustChangePassword = false)
    {
        var jwtSecret = _configuration["Jwt:Secret"] 
            ?? throw new InvalidOperationException("Bắt buộc phải cấu hình Secret JWT trong appsettings.");
        
        if (jwtSecret.Length < 32)
        {
            throw new InvalidOperationException("Khóa bí mật JWT phải có độ dài tối thiểu 32 ký tự.");
        }

        var issuer = _configuration["Jwt:Issuer"] ?? "WmsApi";
        var audience = _configuration["Jwt:Audience"] ?? "WmsClient";
        var expiryInMinutes = int.TryParse(_configuration["Jwt:ExpiryMinutes"], out var minutes) ? minutes : 480;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var issuedAt = DateTimeOffset.UtcNow;
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Name, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(
                JwtRegisteredClaimNames.Iat,
                issuedAt.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture),
                ClaimValueTypes.Integer64),
            new(
                "issued_at_utc_ticks",
                issuedAt.UtcTicks.ToString(CultureInfo.InvariantCulture),
                ClaimValueTypes.Integer64),
            new("must_change_password", mustChangePassword ? "true" : "false", ClaimValueTypes.Boolean)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        if (permissions != null)
        {
            foreach (var perm in permissions)
            {
                claims.Add(new Claim("permission", perm));
            }
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: issuedAt.UtcDateTime.AddMinutes(expiryInMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
