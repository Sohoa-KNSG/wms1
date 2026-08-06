namespace Wms.Application.Common.Models;

public class CommandResponse
{
    public string Status { get; set; } = "SUCCESS";
    public string Message { get; set; } = "Xử lý thành công";
    public string? ErrorCode { get; set; }
    public string? DocumentNo { get; set; }
    public string? ObjectCode { get; set; }
    public string? RequestId { get; set; }
    public string? TraceId { get; set; }

    public static CommandResponse Success(string message = "Xử lý thành công", string? documentNo = null, string? objectCode = null, string? requestId = null, string? traceId = null) =>
        new() { Status = "SUCCESS", Message = message, DocumentNo = documentNo, ObjectCode = objectCode, RequestId = requestId, TraceId = traceId };

    public static CommandResponse Error(string errorCode, string message, string? requestId = null, string? traceId = null) =>
        new() { Status = "ERROR", ErrorCode = errorCode, Message = message, RequestId = requestId, TraceId = traceId };
}
