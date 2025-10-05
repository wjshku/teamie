// ==================== PostMeeting Actions ====================
// 会后总结相关业务逻辑和异步操作

import { useCallback } from 'react';
import {
  getPostMeeting,
  createPostMeeting,
  updateSummary,
  addFeedback,
} from '../../services/api/postMeetingService';
import { usePostMeetingSlice } from '../slices/usePostMeetingSlice';
import { PostMeeting, Feedback } from '../../types/api';

export const usePostMeetingActions = (meetingId?: string) => {
  const postMeetingSlice = usePostMeetingSlice();

  // 获取会后总结信息
  const fetchPostMeeting = useCallback(async () => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    
    try {
      postMeetingSlice.setPostMeetingLoading(true);
      postMeetingSlice.setPostMeetingError(null);
      const postMeetingData = await getPostMeeting(meetingId);
      if (!postMeetingData.success) {
        throw new Error(postMeetingData.error);
      }
      postMeetingSlice.setPostMeeting(postMeetingData.data as PostMeeting);
      return { success: true, data: postMeetingData };
    } catch (error: any) {
      console.error('获取会后总结信息失败:', error);
      postMeetingSlice.setPostMeetingError(error.message || '获取会后总结信息失败');
      return { success: false, error: error.message };
    } finally {
      postMeetingSlice.setPostMeetingLoading(false);
    }
  }, [meetingId]);

  // 创建会后总结信息
  const createPostMeetingData = useCallback(async () => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    
    try {
      postMeetingSlice.setPostMeetingLoading(true);
      postMeetingSlice.setPostMeetingError(null);
      const postMeetingData = await createPostMeeting(meetingId, {});
      if (!postMeetingData.success) {
        throw new Error(postMeetingData.error);
      }
      postMeetingSlice.setPostMeeting(postMeetingData.data as PostMeeting);
      return { success: true, data: postMeetingData };
    } catch (error: any) {
      console.error('创建会后总结信息失败:', error);
      postMeetingSlice.setPostMeetingError(error.message || '创建会后总结信息失败');
      return { success: false, error: error.message };
    } finally {
      postMeetingSlice.setPostMeetingLoading(false);
    }
  }, [meetingId]);

  // 更新总结
  const updateSummaryData = useCallback(async (summary: string) => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    
    try {
      postMeetingSlice.setSummarySaving(true); // 使用专门的 summary saving 状态
      postMeetingSlice.setPostMeetingError(null);
      const updatedSummary = await updateSummary(meetingId, summary);
      if (!updatedSummary.success) {
        throw new Error(updatedSummary.error);
      }
      postMeetingSlice.updateSummary(meetingId, updatedSummary.data as string);
      postMeetingSlice.setSummarySaved(true); // 标记为已保存
      // 3秒后隐藏已保存状态
      setTimeout(() => postMeetingSlice.setSummarySaved(false), 3000);
      return { success: true, data: updatedSummary };
    } catch (error: any) {
      console.error('更新总结失败:', error);
      postMeetingSlice.setPostMeetingError(error.message || '更新总结失败');
      return { success: false, error: error.message };
    } finally {
      postMeetingSlice.setSummarySaving(false); // 清除 summary saving 状态
    }
  }, [meetingId]);

  // 添加反馈
  const addFeedbackData = useCallback(async (feedbackData: Omit<Feedback, 'timestamp' | 'meetingid'>) => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    
    try {
      postMeetingSlice.setFeedbackAdding(true); // 使用专门的 feedback adding 状态
      postMeetingSlice.setPostMeetingError(null);
      const response = await addFeedback(meetingId, feedbackData);
      if (!response.success) {
        throw new Error(response.error);
      }
      postMeetingSlice.addFeedback(meetingId, response.data as Feedback);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('添加反馈失败:', error);
      postMeetingSlice.setPostMeetingError(error.message || '添加反馈失败');
      return { success: false, error: error.message };
    } finally {
      postMeetingSlice.setFeedbackAdding(false); // 清除 feedback adding 状态
    }
  }, [meetingId]);

  return {
    fetchPostMeeting,
    createPostMeetingData,
    updateSummaryData,
    addFeedbackData,
  };
};
