// ==================== Meeting Service ====================
// 会议相关API服务

import api from './client';
import {
  Meeting,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  ApiResponse,
} from '../../types/api';

// ==================== Invite Link Types ====================
export interface InviteLinkResponse {
  invite_link: string;
  token: string;
}

export interface JoinMeetingResponse {
  success: boolean;
  meeting: Meeting;
  isParticipant: boolean;
  message?: string;
}

// ==================== Meeting API Functions ====================

/**
 * 获取所有会议列表
 * GET /meetings
 */
export const getMeetings = async (): Promise<ApiResponse<Meeting[]>> => {

  try {
    const response = await api.get('/meetings');
    return response.data;
  } catch (error) {
    console.error('获取会议列表失败:', error);
    throw error;
  }
};

/**
 * 创建新会议
 * POST /meetings
 */
export const createMeeting = async (meetingData: CreateMeetingRequest): Promise<ApiResponse<Meeting>> => {

  try {
    const response = await api.post('/meetings', meetingData);
    return response.data;
  } catch (error) {
    console.error('创建会议失败:', error);
    throw error;
  }
};

/**
 * 根据ID获取会议详情
 * GET /meetings/{meetingId}
 */
export const getMeetingById = async (meetingId: string): Promise<ApiResponse<Meeting>> => {

  try {
    const response = await api.get(`/meetings/${meetingId}`);
    return response.data;
  } catch (error) {
    console.error('获取会议详情失败:', error);
    throw error;
  }
};

/**
 * 更新会议信息
 * PATCH /meetings/{meetingId}
 */
export const updateMeeting = async (meetingId: string, meetingData: UpdateMeetingRequest): Promise<ApiResponse<Meeting>> => {

  try {
    const response = await api.patch(`/meetings/${meetingId}`, meetingData);
    return response.data;
  } catch (error) {
    console.error('更新会议信息失败:', error);
    throw error;
  }
};

/**
 * 删除会议
 * DELETE /meetings/{meetingId}
 */
export const deleteMeeting = async (meetingId: string): Promise<ApiResponse<{ success: true }>> => {

  try {
    const response = await api.delete(`/meetings/${meetingId}`);
    return response.data;
  } catch (error) {
    console.error('删除会议失败:', error);
    throw error;
  }
};

/**
 * 生成会议邀请链接
 * POST /meetings/{meetingId}/invite-link
 */
export const generateInviteLink = async (meetingId: string): Promise<ApiResponse<InviteLinkResponse>> => {
  try {
    const response = await api.post(`/meetings/${meetingId}/invite-link`, {});
    return response.data;
  } catch (error) {
    console.error('生成邀请链接失败:', error);
    throw error;
  }
};

/**
 * 通过token加入会议
 * GET /meetings/join?token=abc123xyz
 */
export const joinMeetingByToken = async (token: string): Promise<ApiResponse<JoinMeetingResponse>> => {
  try {
    const response = await api.get(`/meetings/join?token=${token}`);
    return response.data;
  } catch (error) {
    console.error('加入会议失败:', error);
    throw error;
  }
};