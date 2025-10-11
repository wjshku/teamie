import React from "react";
import { useTranslation } from "react-i18next";
import MeetingListItem from "../molecules/MeetingListItem";
import QuickJoinForm from "../molecules/QuickJoinForm";
import { Meeting } from "../../types/api";

interface QuickJoinSectionProps {
  recentMeetings: Meeting[];
  onViewMeeting: (meetingId: string) => void;
  onNavigateToCreate: () => void;
  isAuthenticated: boolean;
  className?: string;
}

const QuickJoinSection: React.FC<QuickJoinSectionProps> = ({
  recentMeetings,
  onViewMeeting,
  onNavigateToCreate,
  className = "",
}) => {
  const { t } = useTranslation();

  return (
    <section className={`space-y-8 ${className}`}>
      {/* 快速创建会议卡片 */}
      <QuickJoinForm onNavigateToCreate={onNavigateToCreate} />

      {/* 最近会议卡片 */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t("quickJoin.recentMeetingsTitle")}</h3>
          <p className="card-description">
            {t("quickJoin.recentMeetingsDesc")}
          </p>
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
    </section>
  );
};

export default QuickJoinSection;
