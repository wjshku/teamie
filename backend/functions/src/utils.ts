// ==================== Utility Functions ====================
// 通用工具函数

import { CloudFunctionRequest, CloudFunctionResponse } from './types';

/**
 * 验证认证令牌
 * @param req Cloud Function 请求对象
 * @returns 用户ID或null
 */
export const validateAuthToken = (req: CloudFunctionRequest): string | null => {
  const authHeader = req.headers.authorization;
  
  // Handle both string and string[] types
  const authString = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  
  if (!authString || !authString.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authString.split(' ')[1];
  return token || null;
};

/**
 * 发送错误响应
 * @param res Cloud Function 响应对象
 * @param statusCode HTTP状态码
 * @param message 错误消息
 */
export const sendErrorResponse = (
  res: CloudFunctionResponse, 
  statusCode: number, 
  message: string
): void => {
  res.status(statusCode).json({
    success: false,
    error: message
  });
};

/**
 * 发送成功响应
 * @param res Cloud Function 响应对象
 * @param data 响应数据
 * @param statusCode HTTP状态码，默认为200
 */
export const sendSuccessResponse = (
  res: CloudFunctionResponse, 
  data: any, 
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    data
  });
};

/**
 * 生成唯一ID
 * @returns 基于时间戳的唯一ID
 */
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * 验证必需字段
 * @param data 要验证的数据对象
 * @param requiredFields 必需字段数组
 * @returns 验证结果和错误消息
 */
export const validateRequiredFields = (
  data: any, 
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * 清理和验证字符串输入
 * @param input 输入字符串
 * @param maxLength 最大长度
 * @returns 清理后的字符串
 */
export const sanitizeString = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, ''); // 移除潜在的HTML标签
};

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 格式化日期为ISO字符串
 * @param date 日期对象
 * @returns ISO格式的日期字符串
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * 从ISO字符串解析日期
 * @param dateString ISO格式的日期字符串
 * @returns 日期对象
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * 检查用户权限
 * @param userId 用户ID
 * @param resourceOwnerId 资源所有者ID
 * @returns 是否有权限
 */
export const checkPermission = (userId: string, resourceOwnerId: string): boolean => {
  return userId === resourceOwnerId;
};

/**
 * 处理异步操作错误
 * @param operation 异步操作
 * @param errorMessage 错误消息
 * @returns 操作结果或错误
 */
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    console.error(errorMessage, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : errorMessage 
    };
  }
};

/**
 * 创建分页参数
 * @param page 页码
 * @param limit 每页数量
 * @returns 分页参数对象
 */
export const createPaginationParams = (page: number = 1, limit: number = 10) => {
  const pageNum = Math.max(1, page);
  const limitNum = Math.min(100, Math.max(1, limit));
  const offset = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    offset
  };
};

/**
 * 创建分页响应
 * @param data 数据数组
 * @param total 总数量
 * @param page 当前页码
 * @param limit 每页数量
 * @returns 分页响应对象
 */
export const createPaginationResponse = (
  data: any[],
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

/**
 * 生成邀请链接的唯一token
 * @param length token长度，默认为32
 * @returns 唯一的token字符串
 */
export const generateInviteToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

