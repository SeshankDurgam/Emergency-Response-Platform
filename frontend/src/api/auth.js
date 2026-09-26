/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import apiClient from './client';

export const authApi = {
  register: (data) => apiClient.post('/api/v1/auth/register', data),
  login: (data) => apiClient.post('/api/v1/auth/login', data),
  logout: () => apiClient.post('/api/v1/auth/logout'),
  refresh: (refreshToken) => apiClient.post('/api/v1/auth/refresh', { refreshToken }),
  setupMfa: (userId) => apiClient.post(`/api/v1/auth/mfa/setup?userId=${userId}`),
  sendMfaCode: (userId) => apiClient.post(`/api/v1/auth/mfa/send-code?userId=${userId}`),
  verifyMfa: (data) => apiClient.post('/api/v1/auth/mfa/verify', data),
  listUsers: (page = 0, size = 20) => apiClient.get(`/api/v1/users?page=${page}&size=${size}`),
  activateUser: (id) => apiClient.put(`/api/v1/users/${id}/activate`),
  deactivateUser: (id) => apiClient.put(`/api/v1/users/${id}/deactivate`),
  blacklistIp: (data) => apiClient.post('/api/v1/security/blacklist/ip', data),
  unblacklistIp: (ip) => apiClient.delete(`/api/v1/security/blacklist/ip/${ip}`),
  listBlacklist: (page = 0, size = 20) => apiClient.get(`/api/v1/security/blacklist/ips?page=${page}&size=${size}`),
  whitelistIp: (data) => apiClient.post('/api/v1/security/whitelist/ip', data),
  removeFromWhitelist: (ip) => apiClient.delete(`/api/v1/security/whitelist/ip/${ip}`),
  listWhitelist: (page = 0, size = 20) => apiClient.get(`/api/v1/security/whitelist/ips?page=${page}&size=${size}`),
};
