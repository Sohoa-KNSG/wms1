export class ApiError extends Error {
  constructor(message, errorCode = null, statusCode = 500, traceId = null, requestId = null, details = null) {
    super(message);
    this.name = 'ApiError';
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.traceId = traceId;
    this.requestId = requestId;
    this.details = details;
  }

  static fromResponse(error) {
    if (!error.response) {
      return new ApiError(error.message || 'Lỗi kết nối mạng.', 'NETWORK_ERROR', 0);
    }

    const { status, data } = error.response;
    const message = data?.message || data?.title || 'Đã xảy ra lỗi hệ thống.';
    const errorCode = data?.errorCode || data?.error_code || 'INTERNAL_ERROR';
    const traceId = data?.traceId || data?.trace_id || error.response.headers['x-trace-id'];
    const requestId = data?.requestId || data?.request_id || error.response.headers['x-request-id'];

    return new ApiError(message, errorCode, status, traceId, requestId, data?.errors || null);
  }
}
