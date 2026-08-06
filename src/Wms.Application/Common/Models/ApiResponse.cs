namespace Wms.Application.Common.Models;

public class ApiResponse<T>
{
    public string Status { get; set; } = "SUCCESS";
    public string Message { get; set; } = "Xử lý thành công";
    public string? ErrorCode { get; set; }
    public T? Data { get; set; }
    public string? RequestId { get; set; }
    public string? TraceId { get; set; }

    public static ApiResponse<T> Success(T data, string message = "Xử lý thành công", string? requestId = null, string? traceId = null) =>
        new() { Status = "SUCCESS", Message = message, Data = data, RequestId = requestId, TraceId = traceId };

    public static ApiResponse<T> Error(string errorCode, string message, string? requestId = null, string? traceId = null) =>
        new() { Status = "ERROR", ErrorCode = errorCode, Message = message, Data = default, RequestId = requestId, TraceId = traceId };
}
