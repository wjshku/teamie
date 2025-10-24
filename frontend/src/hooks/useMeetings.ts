// ==================== useMeetings Hook ====================
// 会议相关 Hook - 重构为接口层

import { useEffect } from 'react';
import { useMeetingSlice } from '../store/slices/useMeetingSlice';
import { useMeetingActions } from '../store/actions/meetingActions';
import { useAuth } from './useAuth';

export const useMeetings = () => {
  // 获取状态
  const meetingSlice = useMeetingSlice();
  const { isAuthenticated } = useAuth();
  
  // 获取操作
  const meetingActions = useMeetingActions();

  // 只在用户已认证时获取会议列表
  useEffect(() => {
    if (isAuthenticated) {
      meetingActions.fetchMeetings();
    }
  }, [isAuthenticated, meetingActions.fetchMeetings]);

  return {
    // 状态（仅列表相关）
    meetings: meetingSlice.meetings,
    loading: meetingSlice.loading,
    error: meetingSlice.error,

    // 操作（仅列表相关）
    fetchMeetings: meetingActions.fetchMeetings,
    createNewMeeting: meetingActions.createNewMeeting,
    getMeetingById: meetingActions.getMeetingById,
    clearError: meetingSlice.clearError,
  };
};