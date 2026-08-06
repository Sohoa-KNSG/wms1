import axios from 'axios';
import { getDeviceAgentUrl } from './deviceConfig.js';

export const deviceClient = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

deviceClient.interceptors.request.use((config) => {
  config.baseURL = getDeviceAgentUrl();
  return config;
});

deviceClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isOffline = !error.response || error.code === 'ECONNABORTED';
    const message = isOffline ? 'Trạm Device Agent không phản hồi hoặc đang Offline.' : error.message;
    return Promise.reject({ isOffline, message, status: error.response?.status || 0 });
  }
);
