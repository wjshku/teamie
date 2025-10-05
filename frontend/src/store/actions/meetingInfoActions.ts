// ==================== Meeting Info Actions ====================
// 单个会议详情相关业务逻辑和异步操作

import { useCallback } from 'react';
import { getMeetingById, updateMeeting, deleteMeeting, generateInviteLink } from '../../services/api/meetingService';
import { useMeetinginfoSlice } from '../slices/useMeetinginfoSlice';
import { Meeting, UpdateMeetingRequest } from '../../types/api';

export const useMeetingInfoActions = (meetingId?: string) => {
  const meetingInfoSlice = useMeetinginfoSlice();

  const fetchMeetingDetails = useCallback(async () => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    try {
      meetingInfoSlice.setLoading(true);
      meetingInfoSlice.clearError();
      const details = await getMeetingById(meetingId);
      if (!details.success) {
        throw new Error(details.error);
      }
      meetingInfoSlice.setCurrentMeeting(details.data as Meeting);
      return { success: true, data: details.data };
    } catch (error: any) {
      console.error('获取会议详情失败:', error);
      meetingInfoSlice.setError(error.message || '获取会议详情失败');
      return { success: false, error: error.message };
    } finally {
      meetingInfoSlice.setLoading(false);
    }
  }, [meetingId]);

  const updateMeetingData = useCallback(async (updates: UpdateMeetingRequest) => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    try {
      meetingInfoSlice.clearError();
      const response = await updateMeeting(meetingId, updates);
      if (!response.success) {
        throw new Error(response.error);
      }
      meetingInfoSlice.updateCurrentMeeting(updates);
      return { success: true };
    } catch (error: any) {
      console.error('更新会议失败:', error);
      meetingInfoSlice.setError(error.message || '更新会议失败');
      return { success: false, error: error.message };
    }
  }, [meetingId]);

  const deleteMeetingData = useCallback(async () => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    try {
      meetingInfoSlice.setLoading(true);
      meetingInfoSlice.clearError();
      const response = await deleteMeeting(meetingId);
      if (!response.success) {
        throw new Error('删除会议失败');
      }
      meetingInfoSlice.clearCurrentMeeting();
      return { success: true };
    } catch (error: any) {
      console.error('删除会议失败:', error);
      meetingInfoSlice.setError(error.message || '删除会议失败');
      return { success: false, error: error.message };
    } finally {
      meetingInfoSlice.setLoading(false);
    }
  }, [meetingId]);

  const generateInviteLinkData = useCallback(async () => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    try {
      meetingInfoSlice.clearError();
      const response = await generateInviteLink(meetingId);
      if (!response.success) {
        throw new Error(response.error);
      }
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('生成邀请链接失败:', error);
      meetingInfoSlice.setError(error.message || '生成邀请链接失败');
      return { success: false, error: error.message };
    }
  }, [meetingId]);

  return {
    fetchMeetingDetails,
    updateMeetingData,
    deleteMeetingData,
    generateInviteLinkData,
  };
};


