import React from 'react';

interface TextAreaProps {
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  placeholder,
  onChange,
  rows = 4,
  disabled = false,
  className = '',
  id,
  name,
}) => {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      className={`textarea ${className}`}
      id={id}
      name={name}
    />
  );
};

export default TextArea;
