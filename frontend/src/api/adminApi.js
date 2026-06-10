import axiosInstance from './axiosInstance';

export const getAdminStatsApi = () =>
  axiosInstance.get('/admin/stats');

export const getRideAnalyticsApi = (days = 30) =>
  axiosInstance.get('/admin/analytics/rides', { params: { days } });

export const getRevenueAnalyticsApi = (days = 30) =>
  axiosInstance.get('/admin/analytics/revenue', { params: { days } });

export const getAllUsersApi = (params) =>
  axiosInstance.get('/admin/users', { params });

export const updateUserStatusApi = (id, isActive) =>
  axiosInstance.put(`/admin/users/${id}/status`, { isActive });

export const getAllDriversApi = (params) =>
  axiosInstance.get('/admin/drivers', { params });

export const approveDriverApi = (id) =>
  axiosInstance.put(`/admin/drivers/${id}/approve`);

export const suspendDriverApi = (id, reason) =>
  axiosInstance.put(`/admin/drivers/${id}/suspend`, { reason });

export const unsuspendDriverApi = (id) =>
  axiosInstance.put(`/admin/drivers/${id}/unsuspend`);

export const getAllRidesAdminApi = (params) =>
  axiosInstance.get('/admin/rides', { params });

export const getAllPaymentsAdminApi = (params) =>
  axiosInstance.get('/admin/payments', { params });

export const exportRidesApi = (params) =>
  axiosInstance.get('/admin/export/rides', { params });

export const exportPaymentsApi = (params) =>
  axiosInstance.get('/admin/export/payments', { params });
