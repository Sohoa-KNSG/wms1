using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Moq;
using Wms.Api.Middleware;
using Wms.Application.Common.Interfaces;
using Wms.Infrastructure.Identity;
using Wms.Infrastructure.Services;
using Xunit;

namespace Wms.UnitTests.Security;

public class SessionSecurityTests
{
    [Fact]
    public void GeneratedToken_ContainsRevocationAndForcedChangeClaims()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "unit-test-secret-with-at-least-32-characters",
                ["Jwt:Issuer"] = "WmsApi",
                ["Jwt:Audience"] = "WmsClient"
            })
            .Build();

        var service = new JwtTokenService(configuration);
        var token = service.GenerateToken(
            "U001",
            "tester",
            new[] { "NHAN_VIEN" },
            new[] { "Receipt.Read" },
            mustChangePassword: true);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.NotNull(jwt.Claims.SingleOrDefault(claim => claim.Type == JwtRegisteredClaimNames.Iat));
        Assert.True(long.TryParse(jwt.Claims.Single(claim => claim.Type == "issued_at_utc_ticks").Value, out var ticks));
        Assert.True(ticks >= DateTime.UnixEpoch.Ticks);
        Assert.Equal("true", jwt.Claims.Single(claim => claim.Type == "must_change_password").Value);
    }

    [Fact]
    public async Task ForcedPasswordChange_BlocksOtherAuthenticatedEndpoints()
    {
        bool nextCalled = false;
        var middleware = new UserSessionValidationMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });
        var validator = new Mock<IUserSessionValidator>();
        validator
            .Setup(service => service.ValidateAsync("U001", 123456789L, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserSessionValidationResult(true, true));

        var context = AuthenticatedContext("/api/v1/receipt", 123456789L);
        await middleware.InvokeAsync(context, validator.Object);

        Assert.False(nextCalled);
        Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);
    }

    [Fact]
    public async Task ForcedPasswordChange_AllowsChangePasswordEndpoint()
    {
        bool nextCalled = false;
        var middleware = new UserSessionValidationMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });
        var validator = new Mock<IUserSessionValidator>();
        validator
            .Setup(service => service.ValidateAsync("U001", 123456789L, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserSessionValidationResult(true, true));

        var context = AuthenticatedContext("/api/v1/auth/change-password", 123456789L);
        await middleware.InvokeAsync(context, validator.Object);

        Assert.True(nextCalled);
    }

    [Fact]
    public async Task RevokedSession_ReturnsUnauthorized()
    {
        var middleware = new UserSessionValidationMiddleware(_ => Task.CompletedTask);
        var validator = new Mock<IUserSessionValidator>();
        validator
            .Setup(service => service.ValidateAsync("U001", 123456789L, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserSessionValidationResult(false, false, "TOKEN_REVOKED"));

        var context = AuthenticatedContext("/api/v1/receipt", 123456789L);
        await middleware.InvokeAsync(context, validator.Object);

        Assert.Equal(StatusCodes.Status401Unauthorized, context.Response.StatusCode);
    }

    [Fact]
    public void UnspecifiedDatabaseTimestamps_AreTreatedAsUtc()
    {
        var value = new DateTime(2026, 8, 11, 12, 0, 0, DateTimeKind.Unspecified);

        var normalized = UserSessionValidator.AsUtc(value);

        Assert.Equal(DateTimeKind.Utc, normalized.Kind);
        Assert.Equal(value.Ticks, normalized.Ticks);
    }

    private static DefaultHttpContext AuthenticatedContext(string path, long issuedAtTicks)
    {
        var identity = new ClaimsIdentity(
            new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "U001"),
                new Claim("issued_at_utc_ticks", issuedAtTicks.ToString())
            },
            "test");

        return new DefaultHttpContext
        {
            User = new ClaimsPrincipal(identity),
            Request = { Path = path },
            Response = { Body = new MemoryStream() }
        };
    }
}
