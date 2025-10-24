import React from "react";
import { useTranslation } from "react-i18next";
import TopNavBar from "../organisms/TopNavBar";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, XCircle } from "lucide-react";

interface FullScreenErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  minHeight?: string;
  icon?: React.ReactNode;
}

const FullScreenError: React.FC<FullScreenErrorProps> = ({
  title,
  message,
  onRetry,
  minHeight = "min-h-screen",
  icon,
}) => {
  const { t } = useTranslation();
  const displayTitle = title ?? t("common.loadFailed");

  return (
    <div className={`min-h-screen bg-background`}>
      <TopNavBar />
      <main className="container mx-auto section">
        <div className="container-max">
          <div className="pt-8 pb-4">
            <div className="max-w-2xl mx-auto px-4">
              <Alert variant="destructive" className="text-left">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {icon ?? <XCircle className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <AlertTitle className="text-base font-semibold">
                      {displayTitle}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {message}
                    </AlertDescription>
                    {onRetry && (
                      <div className="pt-2">
                        <Button
                          onClick={onRetry}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          {t("common.retry")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FullScreenError;
