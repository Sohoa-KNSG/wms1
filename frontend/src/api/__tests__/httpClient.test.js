import { describe, it, expect } from 'vitest';
import { ApiError } from '../apiError.js';

describe('ApiError Unit Tests', () => {
  it('should parse standard network error correctly', () => {
    const error = new ApiError('Lỗi kết nối', 'NETWORK_ERROR', 0);
    expect(error.message).toBe('Lỗi kết nối');
    expect(error.errorCode).toBe('NETWORK_ERROR');
    expect(error.statusCode).toBe(0);
  });

  it('should parse problem details response correctly', () => {
    const mockAxiosError = {
      response: {
        status: 409,
        headers: { 'x-trace-id': 'trace-123', 'x-request-id': 'req-456' },
        data: {
          message: 'Trạng thái không hợp lệ',
          errorCode: 'INVALID_STATUS'
        }
      }
    };

    const apiError = ApiError.fromResponse(mockAxiosError);
    expect(apiError.message).toBe('Trạng thái không hợp lệ');
    expect(apiError.errorCode).toBe('INVALID_STATUS');
    expect(apiError.statusCode).toBe(409);
    expect(apiError.traceId).toBe('trace-123');
    expect(apiError.requestId).toBe('req-456');
  });
});
