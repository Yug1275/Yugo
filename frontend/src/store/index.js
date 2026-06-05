import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import authReducer from './authSlice';
import rideReducer from './rideSlice';
import driverReducer from './driverSlice';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    ride: rideReducer,
    driver: driverReducer,
  },
});

export default store;