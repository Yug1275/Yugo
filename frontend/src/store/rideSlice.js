import { createSlice } from '@reduxjs/toolkit';

const rideSlice = createSlice({
  name: 'ride',
  initialState: {
    currentRide: null,
    rideHistory: [],
    totalRides: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentRide: (state, action) => {
      state.currentRide = action.payload;
    },
    clearCurrentRide: (state) => {
      state.currentRide = null;
    },
    setRideHistory: (state, action) => {
      state.rideHistory = action.payload.rides;
      state.totalRides = action.payload.total;
    },
    updateRideStatus: (state, action) => {
      const { rideId, status } = action.payload;
      if (state.currentRide?._id === rideId) {
        state.currentRide.status = status;
      }
      const ride = state.rideHistory.find((r) => r._id === rideId);
      if (ride) ride.status = status;
    },
    setRideLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRideError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearRideError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCurrentRide,
  clearCurrentRide,
  setRideHistory,
  updateRideStatus,
  setRideLoading,
  setRideError,
  clearRideError,
} = rideSlice.actions;

export default rideSlice.reducer;