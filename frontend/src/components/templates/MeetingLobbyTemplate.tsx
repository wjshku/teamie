import React, { useState } from 'react';
import TopNavBar from '../organisms/TopNavBar';
import Tab from '../atoms/Tab';
import MeetingInfoSection from '../organisms/MeetingInfoSection';
import PreMeetingSection from '../organisms/PreMeetingSection';
import InMeetingNotesSection from '../organisms/InMeetingNotesSection';
import PostMeetingSummarySection from '../organisms/PostMeetingSummarySection';

interface MeetingLobbyTemplateProps {
  meetingId: string;
  className?: string;
}

const MeetingLobbyTemplate: React.FC<MeetingLobbyTemplateProps> = ({
  meetingId,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 'info',
      label: '基本信息',
      content: (
        <MeetingInfoSection
          meetingId={meetingId}
        />
      ),
    },
    {
      id: 'pre',
      label: '会前准备',
      content: (
        <PreMeetingSection
          meetingId={meetingId}
        />
      ),
    },
    {
      id: 'notes',
      label: '协作笔记',
      content: (
        <InMeetingNotesSection
          meetingId={meetingId}
        />
      ),
    },
    {
      id: 'summary',
      label: '会后总结',
      content: (
        <PostMeetingSummarySection
          meetingId={meetingId}
        />
      ),
    },
  ];

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <TopNavBar />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* 会议功能标签页 */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">会议管理</h2>
                <p className="card-description">管理会议信息、准备事项、协作笔记和会后总结</p>
              </div>
              <div className="card-content">
                <Tab
                  tabs={tabs}
                  activeIndex={activeTab}
                  onChange={setActiveTab}
                  className="meeting-tabs"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MeetingLobbyTemplate;
