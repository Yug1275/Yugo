import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import authReducer from './authSlice';
import rideReducer from './rideSlice';
import driverReducer from './driverSlice';
import notificationReducer from './notificationSlice';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    ride: rideReducer,
    driver: driverReducer,
    notifications: notificationReducer,
  },
});

export default store;