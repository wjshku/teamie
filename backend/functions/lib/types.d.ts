export interface User {
    id: string;
    name: string;
    avatar?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Question {
    id: string;
    meetingid: string;
    author: string;
    authorInitial: string;
    content: string;
    timestamp: string;
}
export interface Note {
    id: string;
    meetingid: string;
    author: string;
    authorInitial: string;
    content: string;
    timestamp: string;
}
export interface Feedback {
    id: string;
    meetingid: string;
    author: string;
    authorInitial: string;
    content: string;
    timestamp: string;
}
export interface PreMeeting {
    meetingid: string;
    objective: string;
    questions: Question[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface InMeeting {
    meetingid: string;
    notes: Note[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface PostMeeting {
    meetingid: string;
    summary: string;
    feedbacks: Feedback[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Meeting {
    meetingid: string;
    title: string;
    time: string;
    participants: User[];
    votelink: string;
    createdBy: string;
    contextCapsuleIds?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface MeetingCapsule {
    capsuleId: string;
    userId: string;
    title: string;
    summary: string;
    keyPoints: string[];
    sourceMeetingId?: string;
    createdAt: string;
    metadata: {
        participants?: string[];
        meetingDate?: string;
        topics?: string[];
    };
}
export interface CreateUserRequest {
    name: string;
    avatar?: string;
}
export interface UserListResponse {
    users: User[];
}
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
export interface MeetingInvite {
    id: string;
    meetingId: string;
    token: string;
    createdAt: Date;
    status: "active" | "revoked";
    usedCount: number;
}
export interface CreateInviteLinkRequest {
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
export interface CreatePreMeetingRequest {
    objective?: string;
    questions?: Omit<Question, "timestamp" | "meetingid">[];
}
export interface UpdatePreMeetingRequest {
    objective?: string;
    questions?: Question[];
}
export interface CreateInMeetingRequest {
}
export interface CreatePostMeetingRequest {
}
export interface UpdatePostMeetingRequest {
    summary?: string;
    feedbacks?: Feedback[];
}
export interface ErrorResponse {
    success: false;
    error: string;
}
export interface SuccessResponse {
    success: true;
    data?: any;
}
export type ApiResponse<T> = T | ErrorResponse;
export interface CloudFunctionRequest {
    body: any;
    headers: {
        [key: string]: string | string[] | undefined;
    };
    params: {
        [key: string]: string;
    };
    query: {
        [key: string]: string | string[] | undefined;
    };
}
export interface CloudFunctionResponse {
    status: (code: number) => CloudFunctionResponse;
    json: (data: any) => void;
    send: (data: any) => void;
}
//# sourceMappingURL=types.d.ts.map