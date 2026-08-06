// OPS-01: HealthController đã được vô hiệu hóa để tránh xung đột route với MapHealthChecks("/health").
// Health checks được đăng ký hoàn toàn trong Program.cs qua:
//   /health      — liveness (không cần DB)
//   /health/live — liveness
//   /health/ready — readiness (kiểm tra DB thật)
//
// File này được giữ lại để không mất lịch sử code nhưng KHÔNG được re-enable HealthController route
// mà không xóa MapHealthChecks("/health") trong Program.cs trước.
//
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
//
// namespace Wms.Api.Controllers;
//
// [ApiController]
// [Route("health")]
// public class HealthController : ControllerBase
// {
//     [HttpGet]
//     [AllowAnonymous]
//     public IActionResult HealthCheck()
//     {
//         return Ok(new { status = "HEALTHY", timestamp = DateTime.UtcNow });
//     }
//
//     [HttpGet("readiness")]
//     [AllowAnonymous]
//     public IActionResult ReadinessCheck()
//     {
//         return Ok(new { status = "READY", db = "CONNECTED", timestamp = DateTime.UtcNow });
//     }
// }
