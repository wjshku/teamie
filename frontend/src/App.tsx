import React, { useEffect } from 'react';
import AppRouter from './router';
import { onAuthStateChange } from './services/auth';
import { useUserSlice } from './store/slices/useUserSlice';

const App: React.FC = () => {
  const { setUser, logout } = useUserSlice();

  // 监听 Firebase 认证状态变化
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        // 用户已登录，设置用户状态
        setUser({
          id: user.id,
          name: user.name,
          avatar: user.avatar
        });
      } else {
        // 用户未登录，清除状态
        logout();
      }
    });

    // 清理监听器
    return () => unsubscribe();
  }, [setUser, logout]);

  return <AppRouter />;
};

export default App;