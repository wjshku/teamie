import React from "react";
import { useTranslation } from "react-i18next";

interface FullScreenLoadingProps {
  text?: string;
  minHeight?: string;
}

const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  text,
  minHeight = "min-h-screen",
}) => {
  const { t } = useTranslation();
  const displayText = text ?? t("common.loading");
  return (
    <div className={`flex items-center justify-center ${minHeight} bg-gray-50`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">{displayText}</p>
      </div>
    </div>
  );
};

export default FullScreenLoading;
