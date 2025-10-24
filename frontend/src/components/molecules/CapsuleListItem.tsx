import React from "react";
import { MeetingCapsule } from "../../types/api";
import { Sparkles, Calendar, Users, Tag, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

interface CapsuleListItemProps {
  capsule: MeetingCapsule;
  onView?: (capsuleId: string) => void;
  onDelete?: (capsuleId: string) => void;
  className?: string;
}

const CapsuleListItem: React.FC<CapsuleListItemProps> = ({
  capsule,
  onView,
  onDelete,
  className = "",
}) => {
  const { t } = useTranslation();

  const handleClick = () => {
    if (onView) {
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
      className={`group relative border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <h3 className="font-semibold text-lg truncate">{capsule.title}</h3>
          </div>

          {/* Summary */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {capsule.summary}
          </p>

          {/* Key Points */}
          {capsule.keyPoints && capsule.keyPoints.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {capsule.keyPoints.slice(0, 3).map((point, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white/70 rounded text-xs text-gray-700 border border-gray-200"
                >
                  <Tag className="w-3 h-3" />
                  {point.length > 30 ? `${point.substring(0, 30)}...` : point}
                </span>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            {capsule.metadata?.meetingDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{capsule.metadata.meetingDate}</span>
              </div>
            )}
            {capsule.metadata?.participants && capsule.metadata.participants.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{capsule.metadata.participants.length} {t("MeetingListItem.participants")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delete button */}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CapsuleListItem;
