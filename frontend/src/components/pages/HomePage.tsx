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

  // 只有在用户登录时才显示会议列表
  const recentMeetings = isAuthenticated ? meetings : [];

  return (
    <HomeTemplate
      recentMeetings={recentMeetings}
      onViewMeeting={handleViewMeeting}
      onNavigateToCreate={onNavigateToCreate}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default HomePage;
