import api from './client';
import {
  MeetingCapsule,
  CreateMeetingCapsuleRequest,
  GenerateMeetingCapsuleResponse,
  MeetingCapsuleListResponse,
  ImportMeetingCapsuleRequest,
  ApiResponse,
} from '../../types/api';

// ==================== Meeting Capsule API ====================

/**
 * 获取用户的所有会议胶囊
 */
export const getMeetingCapsules = async (): Promise<ApiResponse<MeetingCapsuleListResponse>> => {
  try {
    const response = await api.get<ApiResponse<MeetingCapsuleListResponse>>('/meetingCapsules');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || '获取会议胶囊失败',
    };
  }
};

/**
 * 从会议生成会议胶囊（使用 AI 总结）
 */
export const generateMeetingCapsule = async (
  request: CreateMeetingCapsuleRequest
): Promise<ApiResponse<GenerateMeetingCapsuleResponse>> => {
  try {
    const response = await api.post<ApiResponse<GenerateMeetingCapsuleResponse>>(
      '/meetingCapsules/generate',
      request
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || '生成会议胶囊失败',
    };
  }
};

/**
 * 导入外部会议生成胶囊
 */
export const importMeetingCapsule = async (
  request: ImportMeetingCapsuleRequest
): Promise<ApiResponse<GenerateMeetingCapsuleResponse>> => {
  try {
    const response = await api.post<ApiResponse<GenerateMeetingCapsuleResponse>>(
      '/meetingCapsules/import',
      request
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || '导入会议胶囊失败',
    };
  }
};

/**
 * 获取单个会议胶囊详情
 */
export const getMeetingCapsule = async (
  capsuleId: string
): Promise<ApiResponse<MeetingCapsule>> => {
  try {
    const response = await api.get<ApiResponse<MeetingCapsule>>(
      `/meetingCapsules/${capsuleId}`
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || '获取会议胶囊详情失败',
    };
  }
};

/**
 * 删除会议胶囊
 */
export const deleteMeetingCapsule = async (
  capsuleId: string
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/meetingCapsules/${capsuleId}`
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || '删除会议胶囊失败',
    };
  }
};

/**
 * 生成会议建议（使用 AI）
 */
export const generateMeetingSuggestions = async (
  capsuleIds: string[]
): Promise<ApiResponse<{ objective: string; questions: string[] }>> => {
  try {
    const response = await api.post<ApiResponse<{ objective: string; questions: string[] }>>(
      '/meetingCapsules/generateSuggestions',
      { capsuleIds }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || '生成建议失败',
    };
  }
};
