import React from "react";
import { MeetingCapsule } from "../../types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Sparkles, Calendar, Users, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CapsuleDetailModalProps {
  capsule: MeetingCapsule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CapsuleDetailModal: React.FC<CapsuleDetailModalProps> = ({
  capsule,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();

  if (!capsule) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return t("capsuleDetail.dateUnavailable") || "Date unavailable";
      }
      return date.toLocaleString();
    } catch {
      return t("capsuleDetail.dateUnavailable") || "Date unavailable";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <DialogTitle className="text-2xl">{capsule.title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {t("capsuleDetail.created")}: {formatDate(capsule.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Summary Section */}
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              {t("capsuleDetail.summary")}
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              {capsule.summary}
            </p>
          </div>

          {/* Key Points Section */}
          {capsule.keyPoints && capsule.keyPoints.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                {t("capsuleDetail.keyPoints")}
              </h3>
              <ul className="space-y-2">
                {capsule.keyPoints.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="flex-1">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metadata Section */}
          <div className="border-t pt-4 space-y-3">
            {capsule.metadata?.meetingDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {t("capsuleDetail.meetingDate")}: {capsule.metadata.meetingDate}
                </span>
              </div>
            )}

            {capsule.metadata?.participants && capsule.metadata.participants.length > 0 && (
              <div className="flex items-start gap-2 text-gray-600">
                <Users className="w-4 h-4 mt-0.5" />
                <div className="flex-1">
                  <span className="text-sm font-medium">{t("capsuleDetail.participants")}:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {capsule.metadata.participants.map((participant, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs"
                      >
                        {participant}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {capsule.metadata?.topics && capsule.metadata.topics.length > 0 && (
              <div className="flex items-start gap-2 text-gray-600">
                <Tag className="w-4 h-4 mt-0.5" />
                <div className="flex-1">
                  <span className="text-sm font-medium">{t("capsuleDetail.topics")}:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {capsule.metadata.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CapsuleDetailModal;
