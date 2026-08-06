import axios from 'axios';
import { ApiError } from './apiError.js';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const httpClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Helper for generating UUID v4 for X-Request-Id idempotency
const generateRequestId = () => {
  return 'req-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
};

// Request Interceptor
httpClient.interceptors.request.use(
  (config) => {
    // 1. Attach Bearer token
    const token = localStorage.getItem('wms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Attach X-Request-Id for state-changing commands
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      if (!config.headers['X-Request-Id']) {
        config.headers['X-Request-Id'] = generateRequestId();
      }
    }

    // 3. Attach optional Device ID
    const deviceId = localStorage.getItem('wms_device_id') || 'WEB-CLIENT';
    config.headers['X-Device-Id'] = deviceId;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
httpClient.interceptors.response.use(
  (response) => {
    // Return standard response data
    return response.data;
  },
  (error) => {
    const apiError = ApiError.fromResponse(error);

    if (apiError.statusCode === 401) {
      // Clear invalid session & dispatch auth logout event
      localStorage.removeItem('wms_token');
      localStorage.removeItem('wms_user');
      window.dispatchEvent(new CustomEvent('wms_auth_unauthorized'));
    }

    return Promise.reject(apiError);
  }
);
