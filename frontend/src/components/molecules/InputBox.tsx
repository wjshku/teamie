import React from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {labelIcon && <span>{labelIcon}</span>}
        <h4 className="text-lg font-semibold text-gray-900">{label}</h4>
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {saving && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-gray-500 px-2 py-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span>{t("common.saving")}</span>
          </div>
        )}
        {saved && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-green-600 px-2 py-1 animate-in fade-in duration-200">
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
            <span>{t("common.saved")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputBox;
