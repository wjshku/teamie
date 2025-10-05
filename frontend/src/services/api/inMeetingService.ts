// ==================== InMeeting Service ====================
// 会中笔记相关API服务

import { ApiResponse, CreateInMeetingRequest, InMeeting } from '@/types/api';
import { Note } from '@/types/api';
import api from './client';

// ==================== InMeeting API Functions ====================

/**
 * 获取会中笔记信息
 * GET /meetings/{meetingId}/inMeeting
 */
export const getInMeeting = async (meetingId: string): Promise<ApiResponse<InMeeting>> => {

  try {
    const response = await api.get(`/meetings/${meetingId}/inMeeting`);
    return response.data;
  } catch (error) {
    console.error('获取会中笔记信息失败:', error);
    throw error;
  }
};

/**
 * 创建会中笔记信息
 * POST /meetings/{meetingId}/inMeeting
 */
export const createInMeeting = async (meetingId: string, inMeetingData: CreateInMeetingRequest = {}): Promise<ApiResponse<InMeeting>> => {


  try {
    const response = await api.post(`/meetings/${meetingId}/inMeeting`, inMeetingData);
    return response.data;
  } catch (error) {
    console.error('创建会中笔记信息失败:', error);
    throw error;
  }
};

// ==================== Note API Functions ====================

/**
 * 添加笔记到会中
 * POST /meetings/{meetingId}/inMeeting/notes
 */
export const addNote = async (meetingId: string, noteData: Omit<Note, 'timestamp' | 'meetingid'>): Promise<ApiResponse<Note>> => {

  try {
    const response = await api.post(`/meetings/${meetingId}/inMeeting/notes`, noteData);
    return response.data;
  } catch (error) {
    console.error('添加笔记失败:', error);
    throw error;
  }
};
