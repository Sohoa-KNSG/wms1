import { httpClient } from '../../../api/httpClient.js';

export const adminApi = {
  getUsers: () => httpClient.get('/auth/admin/users'),
  createUser: (payload) => httpClient.post('/auth/admin/users', payload),
  resetPassword: (payload) => httpClient.post('/auth/admin/reset-password', payload),
  updateUserStatus: (userId, payload) => httpClient.put(`/auth/admin/users/${userId}/status`, payload),
  updateUserRoles: (userId, payload) => httpClient.put(`/auth/admin/users/${userId}/roles`, payload)
};
