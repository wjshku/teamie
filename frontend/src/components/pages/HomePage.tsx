import React from 'react';
import HomeTemplate from '../templates/HomeTemplate';
import { useMeetings } from '../../hooks/useMeetings';
import { useAuth } from '../../hooks/useAuth';

interface HomePageProps {
  onViewMeeting: (meetingId: string) => void;
  onNavigateToCreate: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  onViewMeeting,
  onNavigateToCreate,
}) => {
  const { meetings } = useMeetings();
  const { isAuthenticated } = useAuth();

  const handleViewMeeting = (meetingId: string) => {
    onViewMeeting(meetingId);
  };

  return (
    <HomeTemplate
      recentMeetings={meetings}
      onViewMeeting={handleViewMeeting}
      onNavigateToCreate={onNavigateToCreate}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default HomePage;
