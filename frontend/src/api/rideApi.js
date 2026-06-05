import axiosInstance from './axiosInstance';

export const estimateFareApi = (data) =>
  axiosInstance.post('/rides/estimate', data);

export const createRideApi = (data) =>
  axiosInstance.post('/rides', data);

export const getActiveRideApi = () =>
  axiosInstance.get('/rides/active');

export const getRideByIdApi = (id) =>
  axiosInstance.get(`/rides/${id}`);

export const cancelRideApi = (id, reason) =>
  axiosInstance.put(`/rides/${id}/cancel`, { reason });

export const getRiderRidesApi = (params) =>
  axiosInstance.get('/users/rides', { params });

export const getNearbyDriversApi = (lat, lng) =>
  axiosInstance.get('/drivers/nearby', { params: { lat, lng } });