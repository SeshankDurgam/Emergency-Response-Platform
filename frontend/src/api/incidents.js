/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import apiClient from './client';

export const incidentsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.emirate) q.set('emirate', params.emirate);
    if (params.severity) q.set('severity', params.severity);
    q.set('page', params.page || 0);
    q.set('size', params.size || 20);
    q.set('sort', params.sort || 'createdAt,desc');
    return apiClient.get(`/api/v1/incidents?${q}`);
  },
  get: (id) => apiClient.get(`/api/v1/incidents/${id}`),
  create: (data) => apiClient.post('/api/v1/incidents', data),
  updateStatus: (id, data) => apiClient.patch(`/api/v1/incidents/${id}/status`, data),
  cancel: (id) => apiClient.delete(`/api/v1/incidents/${id}`),
  getHistory: (id, page = 0) => apiClient.get(`/api/v1/incidents/${id}/history?page=${page}&size=20`),
  getActive: () => apiClient.get('/api/v1/incidents/active'),
  getDashboard: () => apiClient.get('/api/v1/incidents/dashboard/summary'),
};
