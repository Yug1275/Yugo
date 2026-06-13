import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout, setError, clearError, updateUser } from '../store/authSlice';
import { loginApi, registerApi, logoutApi, forgotPasswordApi, resetPasswordApi } from '../api/authApi';
import { disconnectSocket } from '../socket/socket';


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
      disconnectSocket();
      dispatch(logout());
    }
  };

  const forgotPassword = async (email) => {
    try {
      dispatch(clearError());
      const res = await forgotPasswordApi({ email });
      return { success: true, message: res.data.message || 'Email sent' };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to send reset email';
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      dispatch(clearError());
      const res = await resetPasswordApi(token, { password });
      return { success: true, message: res.data.message || 'Password reset successful' };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to reset password';
      return { success: false, error: message };
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
    forgotPassword,
    resetPassword,
    clearError: () => dispatch(clearError()),
    updateUser: (data) => dispatch(updateUser(data)),
  };
};

export default useAuth;