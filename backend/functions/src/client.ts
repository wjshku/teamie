import { Request } from 'firebase-functions';
import { auth, db } from './firebase';

// ==================== 认证辅助函数 ====================

/**
 * 验证用户认证令牌
 * @param req HTTP 请求对象
 * @returns 验证后的用户ID
 */
const verifyAuth = async (req: Request): Promise<string> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('未提供认证令牌');
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    // console.log('decodedToken', decodedToken);
    return decodedToken.uid;
  } catch (error) {
    throw new Error('无效的认证令牌');
  }
};

// ==================== 权限验证辅助函数 ====================

/**
 * 检查用户是否有权限访问会议
 * @param meetingId 会议ID
 * @param uid 用户ID
 * @returns 是否有权限访问会议
 */
const checkMeetingAccess = async (meetingId: string, uid: string): Promise<boolean> => {
  // 验证 meetingId 是否有效
  if (!meetingId || typeof meetingId !== 'string' || meetingId.trim() === '') {
    return false;
  }

  const meetingDoc = await db.collection('meetings').doc(meetingId).get();
  
  if (!meetingDoc.exists) {
    return false;
  }

  const meetingData = meetingDoc.data();
  return meetingData?.createdBy === uid || 
         meetingData?.participants?.some((participant: any) => participant.id === uid);
};

/**
 * 检查用户是否有权限操作会议（创建者权限）
 * @param meetingId 会议ID
 * @param uid 用户ID
 * @returns 是否有权限操作会议
 */
const checkMeetingOwnership = async (meetingId: string, uid: string): Promise<boolean> => {
  // 验证 meetingId 是否有效
  if (!meetingId || typeof meetingId !== 'string' || meetingId.trim() === '') {
    return false;
  }

  const meetingDoc = await db.collection('meetings').doc(meetingId).get();
  
  if (!meetingDoc.exists) {
    return false;
  }

  const meetingData = meetingDoc.data();
  return meetingData?.createdBy === uid;
};

/**
 * 获取用户参与的会议列表
 * @param uid 用户ID
 * @returns 用户参与的会议列表
 */
const getUserMeetings = async (uid: string) => {
  const meetingsSnapshot = await db.collection('meetings')
    .orderBy('createdAt', 'desc')
    .get();

  return meetingsSnapshot.docs
    .filter((doc: any) => {
      const meetingData = doc.data();
      return meetingData.participants?.some((participant: any) => participant.id === uid);
    })
    .map((doc: any) => ({
      meetingid: doc.id,
      ...doc.data()
    }));
};

export { verifyAuth, checkMeetingAccess, checkMeetingOwnership, getUserMeetings };
