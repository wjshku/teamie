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

  // 认证与会议详情加载
  React.useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    if (id) {
      fetchMeetingDetails();
    }
  }, [id, isAuthenticated, fetchMeetingDetails]);

  // 未登录时提示登录
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavBar />
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-yellow-800 mb-2">需要登录</h2>
                  <p className="text-yellow-600 mb-4">请先登录以查看会议详情</p>
                  <p className="text-sm text-gray-500">请使用顶部导航栏的登录按钮</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavBar />
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">加载会议中...</p>
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
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-red-800 mb-2">加载失败</h2>
                  <p className="text-red-600 mb-4">{error}</p>
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
