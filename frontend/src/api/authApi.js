import axiosInstance from './axiosInstance';

export const registerApi = (data) =>
  axiosInstance.post('/auth/register', data);

export const loginApi = (data) =>
  axiosInstance.post('/auth/login', data);

export const forgotPasswordApi = (data) =>
  axiosInstance.post('/auth/forgot-password', data);

export const resetPasswordApi = (token, data) =>
  axiosInstance.put(`/auth/reset-password/${token}`, data);

export const getProfileApi = () =>
  axiosInstance.get('/auth/profile');

export const updateProfileApi = (data) =>
  axiosInstance.put('/auth/profile', data);

export const changePasswordApi = (data) =>
  axiosInstance.put('/auth/change-password', data);

export const logoutApi = () =>
  axiosInstance.post('/auth/logout');