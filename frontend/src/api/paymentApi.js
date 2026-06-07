import axiosInstance from './axiosInstance';

export const createOrderApi = (rideId) =>
  axiosInstance.post('/payments/create-order', { rideId });

export const verifyPaymentApi = (data) =>
  axiosInstance.post('/payments/verify', data);

export const recordCashPaymentApi = (rideId) =>
  axiosInstance.post('/payments/cash', { rideId });

export const getPaymentByRideApi = (rideId) =>
  axiosInstance.get(`/payments/ride/${rideId}`);

export const getMyPaymentsApi = (params) =>
  axiosInstance.get('/payments/my', { params });