// ==================== useAuth Hook ====================
// 用户认证相关 Hook - 重构为纯接口层

import { useUserSlice } from '../store/slices/useUserSlice';
import { useUserActions } from '../store/actions/userActions';

export const useAuth = () => {
  // 获取状态
  const userSlice = useUserSlice();
  
  // 获取操作
  const userActions = useUserActions();

  return {
    // 状态
    user: userSlice.user,
    isAuthenticated: userSlice.isAuthenticated,
    loading: userSlice.loading,
    error: userSlice.error,
    
    // 操作
    loginUser: userActions.loginUser,
    logout: userActions.logoutUser,
    clearError: userSlice.clearError,
  };
};