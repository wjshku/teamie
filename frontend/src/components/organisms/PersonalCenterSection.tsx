import React from "react";
import { useTranslation } from "react-i18next";
import MeetingListItem from "../molecules/MeetingListItem";
import { Meeting } from "../../types/api";

interface PersonalCenterSectionProps {
  meetings: Meeting[];
  onViewMeeting: (meetingId: string) => void;
  className?: string;
}

const PersonalCenterSection: React.FC<PersonalCenterSectionProps> = ({
  meetings,
  onViewMeeting,
  className = "",
}) => {
  const { t } = useTranslation();

  return (
    <section className={`space-y-8 ${className}`}>
      {/* 我的历史会议卡片 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{t("personalCenter.historyTitle")}</h2>
          <p className="card-description">{t("personalCenter.historyDesc")}</p>
        </div>
        <div className="card-content">
          <div className="grid gap-4">
            {meetings.length > 0 ? (
              meetings.map((meeting) => (
                <MeetingListItem
                  key={meeting.meetingid}
                  meeting={meeting}
                  onView={() => onViewMeeting(meeting.meetingid)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("personalCenter.noHistory")}</p>
                <p className="text-sm mt-2">
                  {t("personalCenter.createFirst")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalCenterSection;
