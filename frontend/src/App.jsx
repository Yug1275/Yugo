import { Provider } from 'react-redux';
import store from './store';
import AppRouter from './routes/AppRouter';
import { useEffect } from 'react';

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
      <AppRouter />
    </Provider>
  );
}

export default App;