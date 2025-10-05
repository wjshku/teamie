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
  isAuthenticated,
  className = '',
}) => {
  return (
    <section className={`space-y-8 ${className}`}>
      {/* 快速创建会议卡片 - 只在登录后显示 */}
      {isAuthenticated && (
        <QuickJoinForm onNavigateToCreate={onNavigateToCreate} />
      )}
      
      {/* 最近会议卡片 - 只在登录后显示 */}
      {isAuthenticated && (
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
                  <button 
                    onClick={onNavigateToCreate}
                    className="btn btn-primary btn-sm mt-4"
                  >
                    创建会议
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 未登录状态提示 */}
      {!isAuthenticated && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">欢迎使用 Teamie</h3>
            <p className="card-description">登录后即可查看您的会议历史和管理团队</p>
          </div>
          <div className="card-content">
            <div className="text-center py-8">
              <p className="text-muted-foreground">请先登录以访问完整功能</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default QuickJoinSection;