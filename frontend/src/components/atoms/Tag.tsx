import React from 'react';

interface TagProps {
  text: string;
  clickable?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

const Tag: React.FC<TagProps> = ({
  text,
  clickable = false,
  onClick,
  variant = 'default',
  className = '',
}) => {
  return (
    <span
      className={`tag tag-${variant} ${clickable ? 'tag-clickable' : ''} ${className}`}
      onClick={clickable ? onClick : undefined}
    >
      {text}
    </span>
  );
};

export default Tag;
