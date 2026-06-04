import { createSlice } from '@reduxjs/toolkit';

const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('yugo-user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const getTokenFromStorage = () => {
  return localStorage.getItem('yugo-token') || null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getUserFromStorage(),
    token: getTokenFromStorage(),
    isAuthenticated: !!getTokenFromStorage(),
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('yugo-user', JSON.stringify(user));
      localStorage.setItem('yugo-token', token);
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('yugo-user', JSON.stringify(state.user));
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('yugo-user');
      localStorage.removeItem('yugo-token');
    },
  },
});

export const {
  setCredentials,
  updateUser,
  setLoading,
  setError,
  clearError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;