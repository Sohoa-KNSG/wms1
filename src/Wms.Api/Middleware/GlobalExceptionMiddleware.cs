using System.Net;
using System.Text.Json;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var requestId = context.Items["RequestId"]?.ToString();
            var traceId = context.Items["TraceId"]?.ToString();

            _logger.LogError(ex, "Unhandled Exception occurred. RequestId: {RequestId}, TraceId: {TraceId}", requestId, traceId);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var userMessage = _env.IsDevelopment()
                ? $"Lỗi hệ thống: {ex.Message}"
                : "Đã xảy ra lỗi hệ thống. Vui lòng liên hệ quản trị viên với Trace ID.";

            var response = CommandResponse.Error(WmsErrorCodes.InternalServerError, userMessage, requestId, traceId);
            
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
        }
    }
}
