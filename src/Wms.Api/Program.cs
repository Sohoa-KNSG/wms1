using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Wms.Api.Middleware;
using Wms.Application.Auth.Services;
using Wms.Application.Common.Interfaces;
using Wms.Domain.Constants;
using Wms.Infrastructure.Identity;
using Wms.Infrastructure.Persistence;
using Wms.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Structured Logging Setup
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// 2. Validate Essential Configuration On Startup (Fail-fast)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Bắt buộc phải cấu hình ConnectionString 'DefaultConnection'. Đặt qua biến môi trường ConnectionStrings__DefaultConnection.");
}

// SEC-02: JWT secret phải đến từ biến môi trường hoặc user secrets — KHÔNG từ appsettings.json
var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32)
{
    throw new InvalidOperationException(
        "Bắt buộc phải cấu hình 'Jwt:Secret' với độ dài tối thiểu 32 ký tự. " +
        "Đặt qua biến môi trường Jwt__Secret hoặc .NET User Secrets. " +
        "Không được để giá trị thật trong appsettings.json.");
}

// 3. Add Infrastructure & Services
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<ISqlConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<IStoredProcedureExecutor, StoredProcedureExecutor>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// 4. Configure Authentication
System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "WmsApi",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "WmsClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.FromSeconds(30)
    };
});

// 5. SEC-01: Authorization Policies — Mỗi policy PHẢI kiểm tra permission claim cụ thể
//    Fallback: yêu cầu đăng nhập cho mọi endpoint không đánh dấu AllowAnonymous
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    // Đăng ký từng policy với RequireClaim("permission", <tên policy>)
    // ADMIN và IT_ADMIN override: họ có claim permission = "<tên policy>" do AuthService gán
    var policyFields = typeof(PolicyNames).GetFields(
        System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);

    foreach (var field in policyFields)
    {
        var policyName = field.GetValue(null)?.ToString();
        if (!string.IsNullOrEmpty(policyName))
        {
            // SEC-01: Yêu cầu claim "permission" với giá trị = tên policy
            // User không có claim này sẽ nhận 403, không phải 401
            options.AddPolicy(policyName, policy =>
                policy.RequireAuthenticatedUser()
                      .RequireClaim("permission", policyName));
        }
    }
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context => {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError("Validation failed: {Error}", System.Text.Json.JsonSerializer.Serialize(context.ModelState));
            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new Microsoft.AspNetCore.Mvc.ValidationProblemDetails(context.ModelState));
        };
    });

// OPS-01: Chỉ dùng Health Checks framework — không dùng HealthController + MapHealthChecks cùng lúc
// HealthController đã bị loại bỏ (hoặc giữ riêng với route khác)
builder.Services.AddHealthChecks()
    .AddSqlServer(
        connectionString: connectionString,
        name: "sqlserver",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "readiness", "db" });

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:5173", "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("WmsCorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 7. OpenAPI / Swagger Documentation Setup
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WMS ASP.NET Core Web API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 8. Configure Middleware Pipeline
app.UseMiddleware<TraceAndRequestIdMiddleware>();
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "WMS Web API v1"));
}

app.UseCors("WmsCorsPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// OPS-01: Liveness — không phụ thuộc DB
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false, // Chỉ trả OK nếu app chạy
    ResponseWriter = async (context, _) =>
    {
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync("{\"status\":\"HEALTHY\",\"timestamp\":\"" + DateTime.UtcNow.ToString("o") + "\"}");
    }
}).AllowAnonymous();

// OPS-01: Readiness — kiểm tra DB thật
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("readiness"),
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var status = report.Status == Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy ? "READY" : "NOT_READY";
        // Không lộ connection string hay chi tiết SQL trong response
        await context.Response.WriteAsync($"{{\"status\":\"{status}\",\"timestamp\":\"{DateTime.UtcNow:o}\"}}");
    }
}).AllowAnonymous();

// Legacy /health endpoint — backward compat, liveness only
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false,
    ResponseWriter = async (context, _) =>
    {
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync("{\"status\":\"HEALTHY\",\"timestamp\":\"" + DateTime.UtcNow.ToString("o") + "\"}");
    }
}).AllowAnonymous();

app.Run();

// Expose the top-level entry point to WebApplicationFactory integration tests.
public partial class Program;
