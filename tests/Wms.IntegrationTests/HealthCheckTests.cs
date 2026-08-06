using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Wms.IntegrationTests;

public class HealthCheckTests : IClassFixture<WmsApiFactory>
{
    private readonly HttpClient _client;

    public HealthCheckTests(WmsApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealth_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetProtectedEndpoint_WithoutToken_ShouldReturn401Unauthorized()
    {
        var response = await _client.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Cors_UnconfiguredOrigin_ShouldNotBeAllowed()
    {
        using var request = new HttpRequestMessage(HttpMethod.Options, "/api/v1/auth/me");
        request.Headers.Add("Origin", "https://untrusted.example");
        request.Headers.Add("Access-Control-Request-Method", "GET");

        var response = await _client.SendAsync(request);

        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
    }
}

public sealed class WmsApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting(
            "ConnectionStrings:DefaultConnection",
            "Server=localhost;Database=WmsIntegrationTests;Integrated Security=true;TrustServerCertificate=true;");
        builder.UseSetting("Jwt:Secret", "integration-test-only-jwt-secret-32-characters");
    }
}
