import React from 'react';
import MeetingCreationForm from '../molecules/MeetingCreationForm';

interface MeetingTemplateSectionProps {
  onCreateMeeting: (data: { title: string }) => void;
  className?: string;
}

const MeetingTemplateSection: React.FC<MeetingTemplateSectionProps> = ({
  onCreateMeeting,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 会议创建表单卡片 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">创建新会议</h2>
          <p className="card-description">设置会议基本信息</p>
        </div>
        <div className="card-content">
          <MeetingCreationForm onSubmit={onCreateMeeting} />
        </div>
      </div>
    </div>
  );
};

export default MeetingTemplateSection;
