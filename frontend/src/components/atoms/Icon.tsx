import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconProps {
  name: string;
  onClick?: () => void;
  className?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, onClick, className = '', size = 24 }) => {
  // 这里需要根据实际使用的图标库来实现
  // 暂时使用占位符
  return (
    <div
      className={`icon icon-${name} ${className}`}
      onClick={onClick}
      style={{ width: size, height: size }}
    >
      {/* 图标内容 */}
    </div>
  );
};

export default Icon;
