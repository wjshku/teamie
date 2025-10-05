import React from 'react';
import MeetingCreationTemplate from '../templates/MeetingCreationTemplate';

interface MeetingCreationPageProps {
  onCreateMeeting: (data: { title: string }) => void;
}

const MeetingCreationPage: React.FC<MeetingCreationPageProps> = ({
  onCreateMeeting,
}) => {
  const handleCreateMeeting = (data: { title: string }) => {
    // 只透传数据到下游表单与模板，不在页面承载业务
    onCreateMeeting(data);
  };

  return (
    <MeetingCreationTemplate
      onCreateMeeting={handleCreateMeeting}
    />
  );
};

export default MeetingCreationPage;
