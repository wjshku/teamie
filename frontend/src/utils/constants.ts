// API 相关常量
export const API_ENDPOINTS = {
  USER: {
    INFO: '/user',
    LOGIN: '/user/login',
  },
  MEETING: {
    LIST: '/meeting/list',
    CREATE: '/meeting/create',
    DETAILS: '/meeting',
    PRE: '/meeting',
    NOTE: '/meeting',
    POST: '/meeting',
  },
  AUTH: {
    VERIFY: '/auth',
    REGISTER: '/auth',
  },
} as const;

// 会议状态
export const MEETING_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// 用户角色
export const USER_ROLES = {
  CREATOR: 'creator',
  PARTICIPANT: 'participant',
  OBSERVER: 'observer',
} as const;

// 通知类型
export const NOTIFICATION_TYPES = {
  MEETING_INVITE: 'meeting_invite',
  MEETING_REMINDER: 'meeting_reminder',
  MEETING_UPDATE: 'meeting_update',
  NOTE_UPDATE: 'note_update',
} as const;

// 本地存储键
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
} as const;
