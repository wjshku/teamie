import React from 'react';
import { useParams } from 'react-router-dom';
import MeetingLobbyTemplate from '../templates/MeetingLobbyTemplate';
import TopNavBar from '../organisms/TopNavBar';
import { useAuth } from '../../hooks/useAuth';
import { useMeetinginfo } from '../../hooks/useMeetinginfo';

interface MeetingLobbyPageProps {
}

const MeetingLobbyPage: React.FC<MeetingLobbyPageProps> = ({
}) => {
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
    return (
      <div className="min-h-screen bg-background">
        <TopNavBar />
        <main className="container mx-auto section">
          <div className="container-max">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="body-sm text-gray-600 mt-4">加载会议中...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavBar />
        <main className="container mx-auto section">
          <div className="container-max">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="alert alert--error max-w-md">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="heading-sm text-red-800 mb-2">加载失败</h2>
                  <p className="body-sm text-red-600 mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="btn btn-primary"
                  >
                    重试
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <MeetingLobbyTemplate
      meetingId={id || ''}
    />
  );
};

export default MeetingLobbyPage;
