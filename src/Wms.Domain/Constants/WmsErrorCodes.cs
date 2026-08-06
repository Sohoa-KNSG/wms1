namespace Wms.Domain.Constants;

public static class WmsErrorCodes
{
    public const string Unauthorized = "UNAUTHORIZED";
    public const string Forbidden = "FORBIDDEN";
    public const string NotFound = "NOT_FOUND";
    public const string ValidationFailed = "VALIDATION_FAILED";
    public const string ConcurrencyConflict = "CONCURRENCY_CONFLICT";
    public const string InvalidStateTransition = "INVALID_STATE_TRANSITION";
    public const string DuplicateRequest = "DUPLICATE_REQUEST";
    public const string DuplicateRecord = "DUPLICATE_RECORD";
    public const string InvalidState = "INVALID_STATE";
    public const string InternalServerError = "INTERNAL_SERVER_ERROR";
}
