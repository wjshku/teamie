import React from 'react';
import MeetingListItem from '../molecules/MeetingListItem';
import { Meeting } from '../../types/api';

interface PersonalCenterSectionProps {
  meetings: Meeting[];
  onViewMeeting: (meetingId: string) => void;
  className?: string;
}

const PersonalCenterSection: React.FC<PersonalCenterSectionProps> = ({
  meetings,
  onViewMeeting,
  className = '',
}) => {
  return (
    <section className={`space-y-8 ${className}`}>
      {/* 我的历史会议卡片 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">我的历史会议</h2>
          <p className="card-description">查看您参与过的所有会议记录</p>
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
                <p>暂无历史会议</p>
                <p className="text-sm mt-2">开始创建您的第一个会议吧！</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalCenterSection;