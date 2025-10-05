// ==================== User Service ====================
// 用户相关API服务

import api from './client';
import {
  User,
  CreateUserRequest,
  ApiResponse,
} from '../../types/api';

// ==================== User API Functions ====================


/**
 * 创建新用户
 * POST /users
 */
export const createUser = async (userData: CreateUserRequest): Promise<ApiResponse<User>> => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
};

/**
 * 根据ID获取用户信息
 * GET /users/me
 */
export const getUserById = async (): Promise<ApiResponse<User>> => {
  try {
    const response = await api.get(`/users/me`);
    return response.data;
  } catch (error: any) {
    console.error('获取用户信息失败:', error);
    return {
      success: false,
      error: error.message as string
    };
  }
};
