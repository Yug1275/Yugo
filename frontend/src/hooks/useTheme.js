import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, setTheme } from '../store/themeSlice';

const useTheme = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  return {
    mode,
    isDark: mode === 'dark',
    toggleTheme: () => dispatch(toggleTheme()),
    setTheme: (theme) => dispatch(setTheme(theme)),
  };
};

export default useTheme;