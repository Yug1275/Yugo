import { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import AppRouter from './routes/AppRouter';
import { createSocket, disconnectSocket } from './socket/socket';

// Initialize/cleanup socket based on auth state
const SocketManager = () => {
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      createSocket(token);
    } else {
      disconnectSocket();
    }
  }, [token]);

  return null;
};

// Apply saved theme on initial load
const ThemeInit = () => {
  useEffect(() => {
    const saved = localStorage.getItem('yugo-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);
  return null;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeInit />
      <SocketManager />
      <AppRouter />
    </Provider>
  );
}

export default App;