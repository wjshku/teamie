import React from "react";
import { useTranslation } from "react-i18next";
import { Meeting } from "../../types/api";

interface MeetingListItemProps {
  meeting: Meeting;
  onView: () => void;
  className?: string;
}

const MeetingListItem: React.FC<MeetingListItemProps> = ({
  meeting,
  onView,
  className = "",
}) => {
  const { t } = useTranslation();

  const { title, time, participants } = meeting;

  const getParticipantInitials = (participants: any[]) => {
    return participants.slice(0, 4).map((user) => {
      if (user.name) return user.name.charAt(0).toUpperCase();
      return "?";
    });
  };

  const participantInitials = getParticipantInitials(participants);

  const formatTime = (timeString: string) => {
    if (!timeString) return t("MeetingListItem.timePending");

    try {
      const date = new Date(timeString);
      return date.toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  return (
    <div
      className={`meeting-card group ${className}`}
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView();
        }
      }}
    >
      <div className="meeting-card-header">
        <div className="flex-1">
          <h4 className="meeting-card-title">{title}</h4>
          <div className="meeting-card-meta">
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatTime(time)}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {participants.length} {t("MeetingListItem.participants")}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="meeting-card-members">
          <div className="flex -space-x-2">
            {participantInitials.map((initial, index) => (
              <div key={index} className="avatar avatar-sm">
                <div className="avatar-placeholder">{initial}</div>
              </div>
            ))}
            {participants.length > 4 && (
              <div className="avatar avatar-sm">
                <div className="avatar-placeholder bg-gray-300 text-gray-600">
                  +{participants.length - 4}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <span>{t("MeetingListItem.clickToView")}</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MeetingListItem;
