/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import apiClient from './client';

export const resourcesApi = {
  listUnits: (params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.emirate) q.set('emirate', params.emirate);
    if (params.type) q.set('type', params.type);
    q.set('page', params.page || 0);
    q.set('size', params.size || 20);
    return apiClient.get(`/api/v1/resources/units?${q}`);
  },
  getUnit: (id) => apiClient.get(`/api/v1/resources/units/${id}`),
  updateUnitStatus: (id, status) => apiClient.put(`/api/v1/resources/units/${id}/status?status=${status}`),
  listAvailableUnits: (emirate) => apiClient.get(`/api/v1/resources/units/available${emirate ? `?emirate=${emirate}` : ''}`),
  countAvailableUnits: (emirate) => apiClient.get(`/api/v1/resources/availability${emirate ? `?emirate=${emirate}` : ''}`),

  listHospitals: (params = {}) => {
    const q = new URLSearchParams();
    if (params.emirate) q.set('emirate', params.emirate);
    q.set('page', params.page || 0);
    q.set('size', params.size || 20);
    return apiClient.get(`/api/v1/resources/hospitals?${q}`);
  },
  getHospital: (id) => apiClient.get(`/api/v1/resources/hospitals/${id}`),
  updateHospitalCapacity: (id, data) => apiClient.put(`/api/v1/resources/hospitals/${id}/capacity`, data),

  listMedicalResources: (params = {}) => {
    const q = new URLSearchParams();
    if (params.hospitalId) q.set('hospitalId', params.hospitalId);
    q.set('page', params.page || 0);
    q.set('size', params.size || 20);
    return apiClient.get(`/api/v1/resources/medical?${q}`);
  },
  reserveResource: (resourceId, incidentId) =>
    apiClient.post(`/api/v1/resources/medical/${resourceId}/reserve?incidentId=${incidentId}`),
  releaseResource: (resourceId) => apiClient.post(`/api/v1/resources/medical/${resourceId}/release`),
};
