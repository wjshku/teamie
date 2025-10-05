// ==================== PostMeeting Service ====================
// 会后总结相关API服务

import api from './client';
import {
  PostMeeting,
  CreatePostMeetingRequest,
  Feedback,
  ApiResponse,
} from '../../types/api';

// ==================== PostMeeting API Functions ====================

/**
 * 获取会后总结信息
 * GET /meetings/{meetingId}/postMeeting
 */
export const getPostMeeting = async (meetingId: string): Promise<ApiResponse<PostMeeting>> => {
  
  try {
    const response = await api.get(`/meetings/${meetingId}/postMeeting`);
    return response.data;
  } catch (error) {
    console.error('获取会后总结信息失败:', error);
    throw error;
  }
};

/**
 * 创建会后总结信息
 * POST /meetings/{meetingId}/postMeeting
 */
export const createPostMeeting = async (meetingId: string, postMeetingData: CreatePostMeetingRequest = {}): Promise<ApiResponse<PostMeeting>> => {

  try {
    const response = await api.post(`/meetings/${meetingId}/postMeeting`, postMeetingData);
    return response.data;
  } catch (error) {
    console.error('创建会后总结信息失败:', error);
    throw error;
  }
};

/**
 * 更新会后总结
 * PATCH /meetings/{meetingId}/postMeeting/summary
 */
export const updateSummary = async (meetingId: string, summary: string): Promise<ApiResponse<string>> => {
  
  try {
    const response = await api.patch(`/meetings/${meetingId}/postMeeting/summary`, { summary });
    return response.data;
  } catch (error) {
    console.error('更新会后总结失败:', error);
    throw error;
  }
};

// ==================== Feedback API Functions ====================

/**
 * 添加反馈到会后总结
 * POST /meetings/{meetingId}/postMeeting/feedbacks
 */
export const addFeedback = async (meetingId: string, feedbackData: Omit<Feedback, 'timestamp' | 'meetingid'>): Promise<ApiResponse<Feedback>> => {

  try {
    const response = await api.post(`/meetings/${meetingId}/postMeeting/feedbacks`, feedbackData);
    return response.data;
  } catch (error) {
    console.error('添加反馈失败:', error);
    throw error;
  }
};