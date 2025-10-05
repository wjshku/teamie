import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  id,
}) => {
  return (
    <div className={`checkbox-container ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="checkbox-input"
      />
      {label && (
        <label htmlFor={id} className="checkbox-label">
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
