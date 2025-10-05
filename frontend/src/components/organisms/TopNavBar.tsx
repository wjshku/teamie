import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { useAuth } from '../../hooks/useAuth';

interface TopNavBarProps {
  className?: string;
}

const TopNavBar: React.FC<TopNavBarProps> = ({
  className = '',
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loginUser, logout } = useAuth();

  const handleBrandClick = () => {
    navigate('/');
  };

  const handleLogin = async () => {
    try {
      const result = await loginUser();
      if (result.success) {
        console.log('登录成功:', result.user);
      } else {
        console.error('登录失败:', result.error);
      }
    } catch (error) {
      console.error('登录出错:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('登出成功');
    } catch (error) {
      console.error('登出出错:', error);
    }
  };

  const handlePersonalCenterClick = () => {
    navigate('/personal');
  };

  return (
    <nav className={`nav-bar ${className}`}>
      <div className="nav-brand" onClick={handleBrandClick} style={{ cursor: 'pointer' }}>
        <Icon name="logo" size={32} />
        <span className="brand-text">Teamie</span>
      </div>
      
      <div className="nav-actions">
        {isAuthenticated ? (
          // 已登录：显示用户名、Home按钮和登出按钮
          <div className="flex items-center gap-3">
            <Button onClick={handleBrandClick} variant="ghost" size="sm">
              Home
            </Button>
            <Button onClick={handlePersonalCenterClick} variant="primary" size="sm">
              {user?.name}
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              登出
            </Button>
          </div>
        ) : (
          // 未登录：显示登录按钮
          <Button onClick={handleLogin} variant="ghost" size="sm">
            登录
          </Button>
        )}
      </div>
    </nav>
  );
};

export default TopNavBar;
