// ==================== PostMeeting Service ====================
// 会后总结相关API服务

import api from './client';
import {
  PostMeeting,
  CreatePostMeetingRequest,
  Feedback,
  ApiResponse,
} from '../../types/api';
import { mockPostMeeting, mockFeedback, mockMeetings, getCurrentTimestamp } from './mockData';

// 环境变量控制是否使用mock数据
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// ==================== PostMeeting API Functions ====================

/**
 * 获取会后总结信息
 * GET /meetings/{meetingId}/postMeeting
 */
export const getPostMeeting = async (meetingId: string): Promise<ApiResponse<PostMeeting>> => {
  if (USE_MOCK_DATA) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 返回mock数据，实际应该根据meetingId查找
    return mockPostMeeting;
  }

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
  if (USE_MOCK_DATA) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPostMeeting: PostMeeting = {
      meetingid: meetingId,
      summary: '',
      feedbacks: [],
    };
    
    return newPostMeeting;
  }

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
  if (USE_MOCK_DATA) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 查找对应的会议并更新 summary
    const meeting = mockMeetings.find(m => m.meetingid === meetingId);
    if (!meeting?.postMeeting) {
      throw new Error('会后总结信息不存在');
    }
    
    meeting.postMeeting.summary = summary;
    return summary;
  }

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
  if (USE_MOCK_DATA) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newFeedback: Feedback = {
      meetingid: meetingId,
      timestamp: getCurrentTimestamp(),
      ...feedbackData,
    };
    
    // 添加到mock数据中
    mockFeedback.push(newFeedback);
    
    return newFeedback;
  }

  try {
    const response = await api.post(`/meetings/${meetingId}/postMeeting/feedbacks`, feedbackData);
    return response.data;
  } catch (error) {
    console.error('添加反馈失败:', error);
    throw error;
  }
};