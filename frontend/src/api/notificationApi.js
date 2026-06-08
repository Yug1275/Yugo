import axiosInstance from './axiosInstance';

export const getNotificationsApi = (params) =>
  axiosInstance.get('/notifications', { params });

export const getUnreadCountApi = () =>
  axiosInstance.get('/notifications/unread-count');

export const markAsReadApi = (id) =>
  axiosInstance.put(`/notifications/${id}/read`);

export const markAllAsReadApi = () =>
  axiosInstance.put('/notifications/read-all');

export const deleteNotificationApi = (id) =>
  axiosInstance.delete(`/notifications/${id}`);

export const clearAllNotificationsApi = () =>
  axiosInstance.delete('/notifications');
