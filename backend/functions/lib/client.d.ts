import { Request } from 'firebase-functions';
/**
 * 验证用户认证令牌
 * @param req HTTP 请求对象
 * @returns 验证后的用户ID
 */
declare const verifyAuth: (req: Request) => Promise<string>;
/**
 * 检查用户是否有权限访问会议
 * @param meetingId 会议ID
 * @param uid 用户ID
 * @returns 是否有权限访问会议
 */
declare const checkMeetingAccess: (meetingId: string, uid: string) => Promise<boolean>;
/**
 * 检查用户是否有权限操作会议（创建者权限）
 * @param meetingId 会议ID
 * @param uid 用户ID
 * @returns 是否有权限操作会议
 */
declare const checkMeetingOwnership: (meetingId: string, uid: string) => Promise<boolean>;
/**
 * 获取用户参与的会议列表
 * @param uid 用户ID
 * @returns 用户参与的会议列表
 */
declare const getUserMeetings: (uid: string) => Promise<any[]>;
export { verifyAuth, checkMeetingAccess, checkMeetingOwnership, getUserMeetings };
//# sourceMappingURL=client.d.ts.map