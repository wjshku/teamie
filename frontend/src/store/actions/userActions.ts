// ==================== User Actions ====================
// 用户认证相关业务逻辑和异步操作

import { useCallback } from 'react';
import { loginWithGoogle, logoutUser } from '../../services/auth';
import { useUserSlice } from '../slices/useUserSlice';
import { createUser, getUserById } from '../../services/api/userService';

export const useUserActions = () => {
  const userSlice = useUserSlice();

  // Google 用户登录
  const loginUser = useCallback(async () => {
    try {
      const response = await loginWithGoogle();
      // 获取用户信息
      const userData = await getUserById();
      if (!userData.success) {
        // 创建用户
        const createUserResponse = await createUser(response.user);
        if (!createUserResponse.success) {
          throw new Error(createUserResponse.error);
        }
      }
      // 设置用户状态
      userSlice.setUser(response.user);
      return { success: true, user: response.user };
    } catch (error: any) {
      console.error('Google 登录失败:', error);
      return { success: false, error: error.message };
    }
  }, [userSlice]);

  // 用户登出
  const logoutUserAction = useCallback(async () => {
    try {
      await logoutUser();
      userSlice.logout();
      return { success: true };
    } catch (error: any) {
      console.error('登出失败:', error);
      return { success: false, error: error.message };
    }
  }, [userSlice]);

  return {
    loginUser,
    logoutUser: logoutUserAction,
  };
};