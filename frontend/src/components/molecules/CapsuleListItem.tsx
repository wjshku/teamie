import React from "react";
import { MeetingCapsule } from "../../types/api";
import { Sparkles, Calendar, Users, Tag, Trash2, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

interface CapsuleListItemProps {
  capsule: MeetingCapsule;
  onView?: (capsuleId: string) => void;
  onDelete?: (capsuleId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const CapsuleListItem: React.FC<CapsuleListItemProps> = ({
  capsule,
  onView,
  onDelete,
  isLoading = false,
  className = "",
}) => {
  const { t } = useTranslation();

  const handleClick = () => {
    if (!isLoading && onView) {
      onView(capsule.capsuleId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(capsule.capsuleId);
    }
  };

  return (
    <div
      className={`group relative border-2 border-yellow-200 rounded-lg p-3 sm:p-4 hover:shadow-lg hover:border-yellow-300 transition-all ${isLoading ? 'cursor-wait' : 'cursor-pointer'} bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 w-full overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {/* Delete button - positioned absolute */}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-7 w-7 p-0"
          onClick={handleDelete}
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </Button>
      )}

      <div className="flex flex-col gap-2.5">
        {/* Title with icon */}
        <div className="flex items-start gap-2 pr-8">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <h3 className="font-semibold text-base sm:text-lg leading-tight">{capsule.title}</h3>
          {isLoading && (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 animate-spin flex-shrink-0 mt-0.5 ml-auto" />
          )}
        </div>

        {/* Summary */}
        {isLoading ? (
          <div className="pl-6 sm:pl-7">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-2 pl-6 sm:pl-7">
            {capsule.summary}
          </p>
        )}

        {/* Key Points - More compact */}
        {!isLoading && capsule.keyPoints && capsule.keyPoints.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pl-6 sm:pl-7">
            {capsule.keyPoints.slice(0, 3).map((point, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/80 backdrop-blur-sm rounded-md text-xs text-gray-700 border border-yellow-200"
              >
                <Tag className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                <span className="hidden sm:inline max-w-[200px] truncate">{point}</span>
                <span className="sm:hidden max-w-[120px] truncate">{point}</span>
              </span>
            ))}
            {capsule.keyPoints.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 rounded-md text-xs text-yellow-700 font-medium">
                +{capsule.keyPoints.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Metadata - Inline and compact */}
        {!isLoading && (capsule.metadata?.meetingDate || (capsule.metadata?.participants && capsule.metadata.participants.length > 0)) && (
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 pl-6 sm:pl-7 pt-1 border-t border-yellow-100">
            {capsule.metadata?.meetingDate && (
              <div className="flex items-center gap-1 pt-1.5">
                <Calendar className="w-3 h-3 text-yellow-600" />
                <span className="font-medium">{capsule.metadata.meetingDate}</span>
              </div>
            )}
            {capsule.metadata?.participants && capsule.metadata.participants.length > 0 && (
              <div className="flex items-center gap-1 pt-1.5">
                <Users className="w-3 h-3 text-yellow-600" />
                <span className="font-medium">{capsule.metadata.participants.length} {t("MeetingListItem.participants")}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CapsuleListItem;
