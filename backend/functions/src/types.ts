// ==================== API Types Definition ====================
// 基于数据接口文档的统一类型定义

// ----------------- User -----------------
export interface User {
  id: string;
  name: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  createdAt?: Date;
  updatedAt?: Date;
}

// ----------------- InMeeting -----------------
export interface InMeeting {
  meetingid: string;
  notes: Note[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ----------------- PostMeeting -----------------
export interface PostMeeting {
  meetingid: string;
  summary: string;
  feedbacks: Feedback[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ----------------- Meeting -----------------
export interface Meeting {
  meetingid: string;
  title: string;
  time: string;
  participants: User[];
  votelink: string;
  createdBy: string;
  contextCapsuleIds?: string[]; // 关联的会议胶囊 IDs
  createdAt?: Date;
  updatedAt?: Date;
}

// ----------------- MeetingCapsule (会议胶囊) -----------------
export interface MeetingCapsule {
  capsuleId: string;
  userId: string;
  title: string;
  summary: string; // AI 生成的总结
  keyPoints: string[]; // 关键点
  sourceMeetingId?: string; // 如果是从会议生成的
  createdAt: string;
  metadata: {
    participants?: string[];
    meetingDate?: string;
    topics?: string[];
  };
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
  contextCapsuleIds?: string[];
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

// ----------------- Meeting Invite -----------------
export interface MeetingInvite {
  id: string;
  meetingId: string;
  token: string;
  createdAt: Date;
  status: "active" | "revoked";
  usedCount: number;
}

export interface CreateInviteLinkRequest {
  // 空接口，用于未来扩展
}

export interface InviteLinkResponse {
  invite_link: string;
  token: string;
}

export interface JoinMeetingRequest {
  token: string;
}

export interface JoinMeetingResponse {
  success: boolean;
  meeting: Meeting;
  isParticipant: boolean;
  message?: string;
}

// ----------------- PreMeeting API -----------------
export interface CreatePreMeetingRequest {
  objective?: string;
  questions?: Omit<Question, "timestamp" | "meetingid">[];
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
export type ApiResponse<T> = T | ErrorResponse;

// ==================== Cloud Functions Types ====================
export interface CloudFunctionRequest {
  body: any;
  headers: { [key: string]: string | string[] | undefined };
  params: { [key: string]: string };
  query: { [key: string]: string | string[] | undefined };
}

export interface CloudFunctionResponse {
  status: (code: number) => CloudFunctionResponse;
  json: (data: any) => void;
  send: (data: any) => void;
}
