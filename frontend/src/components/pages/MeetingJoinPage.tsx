import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { joinMeetingByToken } from '../../services/api/meetingService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../atoms/Button';

const MeetingJoinPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingData, setMeetingData] = useState<any>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleJoinMeeting = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('缺少邀请token');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await joinMeetingByToken(token);
        
        if (response.success && response.data) {
          setMeetingData(response.data.meeting);
          setIsParticipant(response.data.isParticipant);
          setMessage(response.data.message || '');
          
          // 如果成功加入会议，跳转到会议页面
          if (response.data.isParticipant) {
            setTimeout(() => {
              navigate(`/meeting/${response.data.meeting.meetingid}`);
            }, 2000); // 2秒后跳转，让用户看到成功消息
          }
        } else {
          setError('加入会议失败');
        }
      } catch (err: any) {
        console.error('加入会议失败:', err);
        setError(err.message || '加入会议失败');
      } finally {
        setLoading(false);
      }
    };

    handleJoinMeeting();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">正在加入会议...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-800 mb-2">加入会议失败</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              size="sm"
            >
              重试
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (meetingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          {isParticipant ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-green-800 mb-2">成功加入会议！</h2>
              <p className="text-green-600 mb-4">{message}</p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{meetingData.title}</h3>
                <p className="text-sm text-gray-600">会议时间: {meetingData.time || '待定'}</p>
                <p className="text-sm text-gray-600">状态: {meetingData.status}</p>
              </div>
              <p className="text-sm text-gray-500">正在跳转到会议页面...</p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">需要登录</h2>
              <p className="text-yellow-600 mb-4">{message}</p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{meetingData.title}</h3>
                <p className="text-sm text-gray-600">会议时间: {meetingData.time || '待定'}</p>
                <p className="text-sm text-gray-600">状态: {meetingData.status}</p>
              </div>
              {!isAuthenticated && (
                <Button
                  onClick={() => navigate('/')}
                  variant="primary"
                  size="sm"
                >
                  前往登录
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default MeetingJoinPage;
