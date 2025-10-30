import axios, { AxiosError } from 'axios';
import { getCurrentUserToken } from '../auth';
import i18n from '../../i18n/i18n';

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    // 添加 Firebase 认证 token
    const token = await getCurrentUserToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // 统一错误处理
    let errorMessage: string | undefined;

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      // Timeout error - add localized message
      errorMessage = i18n.t('errors.requestTimeout', {
        defaultValue: 'Request timeout. Please check your network connection.'
      });
      console.warn(errorMessage);
    } else if (error.code === 'ERR_NETWORK' || error.message.toLowerCase().includes('network')) {
      // Network error - add localized message
      errorMessage = i18n.t('errors.networkError', {
        defaultValue: 'Network error. Please check your connection.'
      });
      console.warn(errorMessage);
    } else if (error.response?.status && error.response.status >= 500) {
      // Server error - add localized message
      errorMessage = i18n.t('errors.serverError', {
        defaultValue: 'Server error. Please try again later.'
      });
      console.warn(errorMessage);
    }

    // Enhance error with localized message
    if (errorMessage && error.response) {
      const existingData = typeof error.response.data === 'object' && error.response.data !== null
        ? error.response.data
        : {};

      error.response.data = {
        ...existingData,
        error: errorMessage
      };
    }

    // if (error.response?.status === 401) {
    //   // 未授权，跳转登录
    //   // Firebase Auth 会自动处理 token 过期，这里只需要跳转
    //   window.location.href = '/login';
    // }

    return Promise.reject(error);
  }
);

// 游客模式 API 实例（无需认证）
export const guestApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// 游客API响应拦截器（简化版）
guestApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // 简化的错误处理
    let errorMessage: string | undefined;

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = i18n.t('errors.requestTimeout', {
        defaultValue: 'Request timeout. Please check your network connection.'
      });
    } else if (error.code === 'ERR_NETWORK' || error.message.toLowerCase().includes('network')) {
      errorMessage = i18n.t('errors.networkError', {
        defaultValue: 'Network error. Please check your connection.'
      });
    } else if (error.response?.status && error.response.status >= 500) {
      errorMessage = i18n.t('errors.serverError', {
        defaultValue: 'Server error. Please try again later.'
      });
    }

    if (errorMessage && error.response) {
      const existingData = typeof error.response.data === 'object' && error.response.data !== null
        ? error.response.data
        : {};

      error.response.data = {
        ...existingData,
        error: errorMessage
      };
    }

    return Promise.reject(error);
  }
);

export default api;
