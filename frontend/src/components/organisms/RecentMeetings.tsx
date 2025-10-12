import React from "react";
import { useTranslation } from "react-i18next";
import MeetingListItem from "../molecules/MeetingListItem";
import { Meeting } from "../../types/api";

interface RecentMeetingsProps {
  recentMeetings: Meeting[];
  onViewMeeting: (meetingId: string) => void;
  className?: string;
}

const RecentMeetings: React.FC<RecentMeetingsProps> = ({
  recentMeetings,
  onViewMeeting,
  className = "",
}) => {
  const { t } = useTranslation();

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="card-title">{t("quickJoin.recentMeetingsTitle")}</h3>
        <p className="card-description">{t("quickJoin.recentMeetingsDesc")}</p>
      </div>
      <div className="card-content">
        <div className="grid gap-4">
          {recentMeetings.length > 0 ? (
            recentMeetings.map((meeting) => (
              <MeetingListItem
                key={meeting.meetingid}
                meeting={meeting}
                onView={() => onViewMeeting(meeting.meetingid)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("quickJoin.noRecentMeetings")}</p>
              <p className="text-sm mt-2">
                {t("quickJoin.createFirstMeeting")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentMeetings;
