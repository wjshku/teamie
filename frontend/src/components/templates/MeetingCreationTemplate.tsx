import React from 'react';
import { useTranslation } from 'react-i18next';
import MeetingCreationForm from '../molecules/MeetingCreationForm';

interface MeetingTemplateSectionProps {
  onCreateMeeting: (data: { title: string }) => void;
  className?: string;
}

const MeetingTemplateSection: React.FC<MeetingTemplateSectionProps> = ({
  onCreateMeeting,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 会议创建表单卡片 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{t('meetingTemplate.createTitle')}</h2>
          <p className="card-description">{t('meetingTemplate.createDescription')}</p>
        </div>
        <div className="card-content">
          <MeetingCreationForm onSubmit={onCreateMeeting} />
        </div>
      </div>
    </div>
  );
};

export default MeetingTemplateSection;