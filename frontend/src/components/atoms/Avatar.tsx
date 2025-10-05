import React from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  onClick,
  size = 'md',
  className = '',
}) => {
  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      onClick={onClick}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="avatar-placeholder">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default Avatar;
