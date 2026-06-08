import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      // Add new notification at the top
      state.notifications = [action.payload, ...state.notifications];
      state.unreadCount += 1;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    markOneRead: (state, action) => {
      const notif = state.notifications.find((n) => n._id === action.payload);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: (state) => {
      state.notifications.forEach((n) => { n.read = true; });
      state.unreadCount = 0;
    },
    removeNotification: (state, action) => {
      const notif = state.notifications.find((n) => n._id === action.payload);
      if (notif && !notif.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter((n) => n._id !== action.payload);
    },
    clearAll: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setNotificationLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  setUnreadCount,
  markOneRead,
  markAllRead,
  removeNotification,
  clearAll,
  setNotificationLoading,
} = notificationSlice.actions;

export default notificationSlice.reducer;
