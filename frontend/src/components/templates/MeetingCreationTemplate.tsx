import React from 'react';
import TopNavBar from '../organisms/TopNavBar';
import MeetingTemplateSection from '../organisms/MeetingTemplateSection';

interface MeetingCreationTemplateProps {
  onCreateMeeting: (data: { title: string }) => void;
  className?: string;
}

const MeetingCreationTemplate: React.FC<MeetingCreationTemplateProps> = ({
  onCreateMeeting,
  className = '',
}) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <TopNavBar />
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <MeetingTemplateSection
            onCreateMeeting={onCreateMeeting}
          />
        </div>
      </main>
    </div>
  );
};

export default MeetingCreationTemplate;
