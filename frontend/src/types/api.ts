// ==================== API Types Definition ====================
// 基于数据接口文档的统一类型定义

// ----------------- User -----------------
export interface User {
  id: string;
  name: string;
  avatar?: string;
}

// ----------------- Question -----------------
export interface Question {
  id: string;
  meetingid: string;
  author: string;
  authorInitial: string;
  content: string;
  timestamp: string;
}

// ----------------- Note -----------------
export interface Note {
  id: string;
  meetingid: string;
  author: string;
  authorInitial: string;
  content: string;
  timestamp: string;
}

// ----------------- Feedback -----------------
export interface Feedback {
  id: string;
  meetingid: string;
  author: string;
  authorInitial: string;
  content: string;
  timestamp: string;
}

// ----------------- PreMeeting -----------------
export interface PreMeeting {
  meetingid: string;
  objective: string;
  questions: Question[];
}

// ----------------- InMeeting -----------------
export interface InMeeting {
  meetingid: string;
  notes: Note[];
}

// ----------------- PostMeeting -----------------
export interface PostMeeting {
  meetingid: string;
  summary: string;
  feedbacks: Feedback[];
}

// ----------------- Meeting -----------------
export interface Meeting {
  meetingid: string;
  title: string;
  status: string;
  time: string;
  participants: User[];
  votelink: string;
}

// ==================== API Request/Response Types ====================

// ----------------- User API -----------------
export interface CreateUserRequest {
  name: string;
  avatar?: string;
}

export interface UserListResponse {
  users: User[];
}

// ----------------- Meeting API -----------------
export interface CreateMeetingRequest {
  title: string;
}

export interface UpdateMeetingRequest {
  title?: string;
  status?: string;
  time?: string;
  participants?: User[];
  votelink?: string;
}

export interface MeetingListResponse {
  meetings: Meeting[];
}

// ----------------- PreMeeting API -----------------
export interface CreatePreMeetingRequest {
  objective?: string;
  questions?: Omit<Question, 'timestamp' | 'meetingid'>[];
}

export interface UpdatePreMeetingRequest {
  objective?: string;
  questions?: Question[];
}

// ----------------- InMeeting API -----------------
export interface CreateInMeetingRequest {
  // 空接口，用于初始化
}

// ----------------- PostMeeting API -----------------
export interface CreatePostMeetingRequest {
  // 空接口，用于初始化
}

export interface UpdatePostMeetingRequest {
  summary?: string;
  feedbacks?: Feedback[];
}

// ==================== Error Response ====================
export interface ErrorResponse {
  success: false;
  error: string;
}

// ==================== Success Response ====================
export interface SuccessResponse {
  success: true;
  data?: any;
}

// ==================== API Response Wrapper ====================
export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};
