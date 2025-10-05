import React from 'react';
import TopNavBar from '../organisms/TopNavBar';
import PersonalCenterSection from '../organisms/PersonalCenterSection';
import { Meeting } from '../../types/api';

interface PersonalCenterTemplateProps {
  meetings: Meeting[];
  onViewMeeting: (meetingId: string) => void;
  className?: string;
}

const PersonalCenterTemplate: React.FC<PersonalCenterTemplateProps> = ({
  meetings,
  onViewMeeting,
  className = '',
}) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <TopNavBar />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <PersonalCenterSection
            meetings={meetings}
            onViewMeeting={onViewMeeting}
          />
        </div>
      </main>
    </div>
  );
};

export default PersonalCenterTemplate;
