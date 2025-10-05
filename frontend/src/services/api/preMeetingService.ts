// ==================== PreMeeting Service ====================
// 会前准备相关API服务

import api from './client';
import {
  PreMeeting,
  CreatePreMeetingRequest,
  Question,
  ApiResponse,
} from '../../types/api';

// ==================== PreMeeting API Functions ====================

/**
 * 获取会前准备信息
 * GET /meetings/{meetingId}/preMeeting
 */
export const getPreMeeting = async (meetingId: string): Promise<ApiResponse<PreMeeting>> => {

  try {
    const response = await api.get(`/meetings/${meetingId}/preMeeting`);
    return response.data;
  } catch (error) {
    console.error('获取会前准备信息失败:', error);
    throw error;
  }
};

/**
 * 创建会前准备信息
 * POST /meetings/{meetingId}/preMeeting
 */
export const createPreMeeting = async (meetingId: string, preMeetingData: CreatePreMeetingRequest = {}): Promise<ApiResponse<PreMeeting>> => {

  try {
    const response = await api.post(`/meetings/${meetingId}/preMeeting`, preMeetingData);
    return response.data;
  } catch (error) {
    console.error('创建会前准备信息失败:', error);
    throw error;
  }
};

/**
 * 更新会前准备目标
 * PATCH /meetings/{meetingId}/preMeeting/objective
 */
export const updateObjective = async (meetingId: string, objective: string): Promise<ApiResponse<string>> => {

  try {
    const response = await api.patch(`/meetings/${meetingId}/preMeeting/objective`, { objective });
    return response.data;
  } catch (error) {
    console.error('更新会前准备目标失败:', error);
    throw error;
  }
};

// ==================== Question API Functions ====================

/**
 * 添加问题到会前准备
 * POST /meetings/{meetingId}/preMeeting/questions
 */
export const addQuestion = async (meetingId: string, questionData: Omit<Question, 'timestamp' | 'meetingid'>): Promise<ApiResponse<Question>> => {

  try {
    const response = await api.post(`/meetings/${meetingId}/preMeeting/questions`, questionData);
    return response.data;
  } catch (error) {
    console.error('添加问题失败:', error);
    throw error;
  }
};