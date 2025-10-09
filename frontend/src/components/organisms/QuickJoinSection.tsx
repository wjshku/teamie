import React from 'react';
import MeetingListItem from '../molecules/MeetingListItem';
import QuickJoinForm from '../molecules/QuickJoinForm';
import { Meeting } from '../../types/api';

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
  className = '',
}) => {
  return (
    <section className={`space-y-8 ${className}`}>
      {/* 快速创建会议卡片 */}
      <QuickJoinForm onNavigateToCreate={onNavigateToCreate} />
      
      {/* 最近会议卡片 */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">最近会议</h3>
          <p className="card-description">查看您最近参与的会议</p>
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
                <p>暂无最近会议</p>
                <p className="text-sm mt-2">开始创建您的第一个会议吧！</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickJoinSection;