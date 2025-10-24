import React from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "../ui/skeleton";
import { Loader2 } from "lucide-react";

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
    <div className={`flex items-center justify-center ${minHeight} bg-background`}>
      <div className="text-center space-y-4 p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground text-sm font-medium">{displayText}</p>
        <div className="space-y-2 w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
          <Skeleton className="h-4 w-4/6 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default FullScreenLoading;
