import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import authReducer from './authSlice';
import rideReducer from './rideSlice';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    ride: rideReducer,
  },
});

export default store;