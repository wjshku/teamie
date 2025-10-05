import axios from 'axios';
import { getCurrentUserToken } from '../auth';

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 2000,
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
  (error) => {
    // 统一错误处理
    // if (error.response?.status === 401) {
    //   // 未授权，跳转登录
    //   // Firebase Auth 会自动处理 token 过期，这里只需要跳转
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

export default api;
