using System.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using Wms.Api.Middleware;
using Xunit;

namespace Wms.UnitTests.Middleware;

public class GlobalExceptionMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_WhenExceptionOccursInProduction_ShouldReturn500WithoutLeakingDetails()
    {
        var loggerMock = new Mock<ILogger<GlobalExceptionMiddleware>>();
        var envMock = new Mock<IHostEnvironment>();
        envMock.Setup(e => e.EnvironmentName).Returns("Production");

        var middleware = new GlobalExceptionMiddleware(
            _ => throw new Exception("Sensitive SQL Server Error details table tbl_users"),
            loggerMock.Object,
            envMock.Object);

        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        Assert.Equal((int)HttpStatusCode.InternalServerError, context.Response.StatusCode);
        Assert.Equal("application/json", context.Response.ContentType);

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(context.Response.Body);
        var responseText = await reader.ReadToEndAsync();

        Assert.DoesNotContain("tbl_users", responseText);
        Assert.Contains("INTERNAL_SERVER_ERROR", responseText);
    }
}
