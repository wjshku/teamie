import React from 'react';
import { useNavigate } from 'react-router-dom';
import PersonalCenterTemplate from '../templates/PersonalCenterTemplate';
import { useMeetings } from '../../hooks/useMeetings';

interface PersonalCenterPageProps {
  onViewMeeting: (meetingId: string) => void;
}

const PersonalCenterPage: React.FC<PersonalCenterPageProps> = ({
  onViewMeeting,
}) => {
  const navigate = useNavigate();
  const { meetings } = useMeetings();

  const handleViewMeeting = (meetingId: string) => {
    navigate(`/meeting/${meetingId}`);
    onViewMeeting(meetingId);
  };

  return (
    <PersonalCenterTemplate
      meetings={meetings}
      onViewMeeting={handleViewMeeting}
    />
  );
};

export default PersonalCenterPage;
