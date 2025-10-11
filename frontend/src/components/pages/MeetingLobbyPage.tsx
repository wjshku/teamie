import React from "react";
import { useParams } from "react-router-dom";
import MeetingLobbyTemplate from "../templates/MeetingLobbyTemplate";
import FullScreenLoading from "../molecules/FullScreenLoading";
import FullScreenError from "../molecules/FullScreenError";
import { useAuth } from "../../hooks/useAuth";
import { useMeetinginfo } from "../../hooks/useMeetinginfo";

interface MeetingLobbyPageProps {}

const MeetingLobbyPage: React.FC<MeetingLobbyPageProps> = ({}) => {
  const { id } = useParams<{ id: string }>();
  const { loading, error, fetchMeetingDetails } = useMeetinginfo(id);
  const { isAuthenticated } = useAuth();

  // 认证与会议详情加载（未登录时不请求后端）
  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (id) {
      fetchMeetingDetails();
    }
  }, [id, isAuthenticated, fetchMeetingDetails]);

  if (loading) {
    return <FullScreenLoading text="加载会议中..." minHeight="min-h-[60vh]" />;
  }

  if (error) {
    return (
      <FullScreenError
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return <MeetingLobbyTemplate meetingId={id || ""} />;
};

export default MeetingLobbyPage;
