import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSocket, getSocket } from '../socket/socket';

const useSocket = () => {
  const token = useSelector((state) => state.auth.token);
  const [socket, setSocket] = useState(() => {
    if (token) {
      return createSocket(token);
    }
    return getSocket();
  });

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const s = createSocket(token);
    setSocket(s);
  }, [token]);

  return socket;
};

export default useSocket;