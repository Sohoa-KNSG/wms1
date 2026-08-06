using System.Diagnostics;

namespace Wms.Api.Middleware;

public class TraceAndRequestIdMiddleware
{
    private readonly RequestDelegate _next;
    public const string RequestIdHeader = "X-Request-Id";

    public TraceAndRequestIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Headers.TryGetValue(RequestIdHeader, out var requestId) || string.IsNullOrWhiteSpace(requestId))
        {
            requestId = Guid.NewGuid().ToString("N");
            context.Request.Headers[RequestIdHeader] = requestId;
        }

        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;
        context.Response.Headers[RequestIdHeader] = requestId;
        context.Response.Headers["X-Trace-Id"] = traceId;

        context.Items["RequestId"] = requestId.ToString();
        context.Items["TraceId"] = traceId;

        await _next(context);
    }
}
