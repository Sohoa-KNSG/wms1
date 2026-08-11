using System.Globalization;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Middleware;

public sealed class UserSessionValidationMiddleware
{
    private const string ChangePasswordPath = "/api/v1/auth/change-password";
    private readonly RequestDelegate _next;

    public UserSessionValidationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        IUserSessionValidator sessionValidator)
    {
        if (context.User.Identity?.IsAuthenticated != true ||
            context.GetEndpoint()?.Metadata.GetMetadata<IAllowAnonymous>() is not null)
        {
            await _next(context);
            return;
        }

        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var issuedAtClaim = context.User.FindFirstValue("issued_at_utc_ticks");
        if (string.IsNullOrWhiteSpace(userId) ||
            !long.TryParse(issuedAtClaim, NumberStyles.None, CultureInfo.InvariantCulture, out var issuedAtUtcTicks))
        {
            await WriteErrorAsync(
                context,
                StatusCodes.Status401Unauthorized,
                WmsErrorCodes.Unauthorized,
                "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
            return;
        }

        var validation = await sessionValidator.ValidateAsync(
            userId,
            issuedAtUtcTicks,
            context.RequestAborted);

        if (!validation.IsValid)
        {
            await WriteErrorAsync(
                context,
                StatusCodes.Status401Unauthorized,
                validation.FailureCode ?? WmsErrorCodes.Unauthorized,
                "Phiên đăng nhập đã hết hiệu lực. Vui lòng đăng nhập lại.");
            return;
        }

        if (validation.MustChangePassword &&
            !context.Request.Path.Equals(ChangePasswordPath, StringComparison.OrdinalIgnoreCase))
        {
            await WriteErrorAsync(
                context,
                StatusCodes.Status403Forbidden,
                WmsErrorCodes.Forbidden,
                "Bạn phải đổi mật khẩu trước khi sử dụng các chức năng khác.");
            return;
        }

        await _next(context);
    }

    private static async Task WriteErrorAsync(
        HttpContext context,
        int statusCode,
        string errorCode,
        string message)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = ApiResponse<object>.Error(
            errorCode,
            message,
            context.Items["RequestId"]?.ToString(),
            context.Items["TraceId"]?.ToString());

        await context.Response.WriteAsync(JsonSerializer.Serialize(
            response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}
