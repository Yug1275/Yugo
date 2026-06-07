import axiosInstance from './axiosInstance';

export const createReviewApi = (data) =>
  axiosInstance.post('/reviews', data);

export const getDriverReviewsApi = (driverId, params) =>
  axiosInstance.get(`/reviews/driver/${driverId}`, { params });

export const getMyReviewsApi = (params) =>
  axiosInstance.get('/reviews/my', { params });

export const getReviewByRideApi = (rideId) =>
  axiosInstance.get(`/reviews/ride/${rideId}`);