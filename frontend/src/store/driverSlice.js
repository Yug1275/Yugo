import { createSlice } from '@reduxjs/toolkit';

const driverSlice = createSlice({
  name: 'driver',
  initialState: {
    profile: null,
    vehicle: null,
    availability: false,
    earnings: null,
    pendingRides: [],
    loading: false,
    error: null,
  },
  reducers: {
    setDriverProfile: (state, action) => {
      state.profile = action.payload.driver;
      state.vehicle = action.payload.vehicle;
      state.availability = action.payload.driver?.availability || false;
    },
    setAvailability: (state, action) => {
      state.availability = action.payload;
      if (state.profile) state.profile.availability = action.payload;
    },
    setEarnings: (state, action) => {
      state.earnings = action.payload;
    },
    setPendingRides: (state, action) => {
      state.pendingRides = action.payload;
    },
    setDriverLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDriverError: (state, action) => {
      state.error = action.payload;
    },
    clearDriverError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setDriverProfile,
  setAvailability,
  setEarnings,
  setPendingRides,
  setDriverLoading,
  setDriverError,
  clearDriverError,
} = driverSlice.actions;

export default driverSlice.reducer;