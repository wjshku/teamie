import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  disabled = false,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
