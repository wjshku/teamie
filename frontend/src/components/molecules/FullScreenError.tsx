import React from "react";
import TopNavBar from "../organisms/TopNavBar";
import { Button } from "../atoms/Button";

interface FullScreenErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  minHeight?: string;
  icon?: React.ReactNode;
}

const FullScreenError: React.FC<FullScreenErrorProps> = ({
  title = "加载失败",
  message,
  onRetry,
  minHeight = "min-h-screen",
  icon,
}) => {
  return (
    <div className={`min-h-screen bg-background`}>
      <TopNavBar />
      <main className="container mx-auto section">
        <div className="container-max flex items-center justify-center">
          <div className={`flex items-center justify-center ${minHeight}`}>
            <div className="text-center max-w-md">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  {icon ?? (
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  {title}
                </h2>
                <p className="text-red-600 mb-4">{message}</p>
                {onRetry && (
                  <Button onClick={onRetry} variant="default" size="sm">
                    重试
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FullScreenError;
