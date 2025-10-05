// ==================== User Slice ====================
// 用户状态管理切片

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../../types/api';

// 扩展User接口以支持额外字段
export interface ExtendedUser extends User {
  email?: string;
}

interface UserSliceState {
  // 用户数据
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // 用户操作
  setUser: (user: ExtendedUser | null) => void;
  logout: () => void;
  
  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useUserSlice = create<UserSliceState>()(
  persist(
    (set) => ({
      // 用户数据
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // 用户操作
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Firebase Auth 会自动清理 token，不需要手动清理 localStorage
      },

      // 状态管理
      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
