import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout, setError, clearError, updateUser } from '../store/authSlice';
import { loginApi, registerApi, logoutApi } from '../api/authApi';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const login = async (email, password) => {
    try {
      dispatch(clearError());
      const res = await loginApi({ email, password });
      dispatch(setCredentials(res.data.data));
      return { success: true, user: res.data.data.user };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      dispatch(setError(message));
      return { success: false, error: message };
    }
  };

  const register = async (formData) => {
    try {
      dispatch(clearError());
      const res = await registerApi(formData);
      dispatch(setCredentials(res.data.data));
      return { success: true, user: res.data.data.user };
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      dispatch(setError(message));
      return { success: false, error: message };
    }
  };

  const logoutUser = async () => {
    try {
      await logoutApi();
    } catch {
      // fail silently
    } finally {
      dispatch(logout());
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: logoutUser,
    clearError: () => dispatch(clearError()),
    updateUser: (data) => dispatch(updateUser(data)),
  };
};

export default useAuth;