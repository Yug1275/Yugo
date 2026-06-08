import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setNotifications,
  addNotification,
  setUnreadCount,
  markOneRead,
  markAllRead,
  removeNotification,
  clearAll,
} from '../store/notificationSlice';
import {
  getNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
  clearAllNotificationsApi,
} from '../api/notificationApi';
import useSocket from './useSocket';

const useNotifications = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { notifications, unreadCount, loading } = useSelector(
    (s) => s.notifications
  );
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  // ─── Fetch notifications on mount ──────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchInitial = async () => {
      try {
        const res = await getNotificationsApi({ limit: 20, page: 1 });
        dispatch(setNotifications(res.data.data || []));
        dispatch(setUnreadCount(res.data.unreadCount || 0));
      } catch {
        // silent fail
      }
    };

    fetchInitial();
  }, [isAuthenticated, dispatch]);

  // ─── Socket: listen for new real-time notifications ────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
      dispatch(addNotification(notif));

      // Browser notification if tab is not focused
      if (
        document.hidden &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        new Notification(notif.title, {
          body: notif.message,
          icon: '/favicon.svg',
        });
      }
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, dispatch]);

  // ─── Actions ───────────────────────────────────────────────────────────
  const markRead = useCallback(
    async (id) => {
      dispatch(markOneRead(id));
      try {
        await markAsReadApi(id);
      } catch {
        // silent
      }
    },
    [dispatch]
  );

  const markAllReadAction = useCallback(async () => {
    dispatch(markAllRead());
    try {
      await markAllAsReadApi();
    } catch {
      // silent
    }
  }, [dispatch]);

  const deleteOne = useCallback(
    async (id) => {
      dispatch(removeNotification(id));
      try {
        await deleteNotificationApi(id);
      } catch {
        // silent
      }
    },
    [dispatch]
  );

  const clearAllAction = useCallback(async () => {
    dispatch(clearAll());
    try {
      await clearAllNotificationsApi();
    } catch {
      // silent
    }
  }, [dispatch]);

  const requestBrowserPermission = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead: markAllReadAction,
    deleteOne,
    clearAll: clearAllAction,
    requestBrowserPermission,
  };
};

export default useNotifications;
