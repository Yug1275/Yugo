import axiosInstance from './axiosInstance';

export const getMyDriverProfileApi = () =>
  axiosInstance.get('/drivers/me');

export const completeDriverProfileApi = (data) =>
  axiosInstance.post('/drivers/profile', data);

export const toggleAvailabilityApi = () =>
  axiosInstance.put('/drivers/availability');

export const updateLocationApi = (lat, lng) =>
  axiosInstance.put('/drivers/location', { lat, lng });

export const getDriverRidesApi = (params) =>
  axiosInstance.get('/drivers/rides', { params });

export const getDriverEarningsApi = () =>
  axiosInstance.get('/drivers/earnings');

export const getPendingRidesApi = () =>
  axiosInstance.get('/drivers/pending-rides');

export const acceptRideApi = (rideId) =>
  axiosInstance.put(`/rides/${rideId}/accept`);

export const startRideApi = (rideId) =>
  axiosInstance.put(`/rides/${rideId}/start`);

export const completeRideApi = (rideId) =>
  axiosInstance.put(`/rides/${rideId}/complete`);

export const searchApi = (q, type = 'all') =>
  axiosInstance.get('/search', { params: { q, type } });