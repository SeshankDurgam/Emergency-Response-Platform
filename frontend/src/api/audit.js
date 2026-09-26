/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import apiClient from './client';

export const auditApi = {
  getLogs: (params = {}) => {
    const q = new URLSearchParams();
    if (params.eventType) q.set('eventType', params.eventType);
    if (params.from) q.set('from', params.from);
    if (params.to) q.set('to', params.to);
    q.set('page', params.page ?? 0);
    q.set('size', params.size ?? 20);
    q.set('sort', 'occurredAt,desc');
    return apiClient.get(`/api/v1/audit/logs?${q}`);
  },
  getByIncident: (incidentId, page = 0) =>
    apiClient.get(`/api/v1/audit/logs/incident/${incidentId}?page=${page}&size=20&sort=occurredAt,desc`),
  getByUser: (userId, page = 0) =>
    apiClient.get(`/api/v1/audit/logs/user/${userId}?page=${page}&size=20&sort=occurredAt,desc`),
  getDashboard: () => apiClient.get('/api/v1/audit/dashboard'),
  verifyEntry: (id) => apiClient.get(`/api/v1/audit/integrity/verify/${id}`),
  verifyChain: (limit = 100) => apiClient.get(`/api/v1/audit/integrity/verify-chain?limit=${limit}`),
  commitMerkle: (limit = 100) => apiClient.post(`/api/v1/audit/integrity/commit-merkle?limit=${limit}`),
  getMerkleRoots: (page = 0) => apiClient.get(`/api/v1/audit/integrity/merkle-roots?page=${page}&size=5`),
};
