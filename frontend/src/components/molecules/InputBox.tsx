import React from "react";

interface InputBoxProps {
  label: string;
  labelIcon?: React.ReactNode;
  value: string;
  placeholder?: string;
  rows?: number;
  saving?: boolean;
  saved?: boolean;
  onChange: (val: string) => void;
}

const InputBox: React.FC<InputBoxProps> = ({
  label,
  labelIcon,
  value,
  placeholder = "",
  rows = 3,
  saving = false,
  saved = false,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {labelIcon && <span>{labelIcon}</span>}
        <span className="text-lg font-semibold text-gray-900">{label}</span>
        {saving && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span>保存中...</span>
          </div>
        )}
        {saved && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            已保存
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

export default InputBox;
