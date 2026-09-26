/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import apiClient from './client';

export const dispatchApi = {
  getRecommendations: (incidentId, lat, lon, severity, emirate) =>
    apiClient.get(`/api/v1/dispatch/recommendations/${incidentId}`, {
      params: { lat, lon, severity, emirate },
    }),
  assign: (data) => apiClient.post('/api/v1/dispatch/assign', data),
  getAssignment: (id) => apiClient.get(`/api/v1/dispatch/assignments/${id}`),
  listByIncident: (incidentId) =>
    apiClient.get(`/api/v1/dispatch/incidents/${incidentId}/assignments`),
  updateAssignmentStatus: (id, body) =>
    apiClient.patch(`/api/v1/dispatch/assignments/${id}/status`, body),
};
