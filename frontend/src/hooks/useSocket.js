import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createSocket, disconnectSocket, getSocket } from '../socket/socket';

const useSocket = () => {
  const token = useSelector((state) => state.auth.token);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Create socket connection
    socketRef.current = createSocket(token);

    return () => {
      // Don't disconnect on unmount — keep alive during session
      // disconnectSocket() called on logout instead
    };
  }, [token]);

  return socketRef.current || getSocket();
};

export default useSocket;