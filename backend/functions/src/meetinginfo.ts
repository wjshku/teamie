import { Router, Request, Response } from 'express';
import { db } from './firebase';
import { verifyAuth, checkMeetingAccess, checkMeetingOwnership } from './client';
import { Meeting, UpdateMeetingRequest, InviteLinkResponse, JoinMeetingResponse, MeetingInvite } from './types';
import { generateInviteToken } from './utils';

const router = Router();

// ==================== Single Meeting Operations ====================

/**
 * 通过token加入会议
 * GET /meetings/join?token=abc123xyz
 */
router.get('/join', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, error: '缺少邀请token' });
      return;
    }

    // 查找邀请记录
    const inviteQuery = await db.collection('meeting_invites')
      .where('token', '==', token)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (inviteQuery.empty) {
      res.status(404).json({ success: false, error: '邀请链接无效或已失效' });
      return;
    }

    const inviteDoc = inviteQuery.docs[0];
    const inviteData = inviteDoc.data() as MeetingInvite;

    // 获取会议详情
    const meetingDoc = await db.collection('meetings').doc(inviteData.meetingId).get();
    if (!meetingDoc.exists) {
      res.status(404).json({ success: false, error: '会议不存在' });
      return;
    }

    const meetingData = meetingDoc.data();
    const fullMeetingData: Meeting = {
      meetingid: inviteData.meetingId,
      ...meetingData,
    } as Meeting;

    // 检查用户是否已登录并添加到参与者列表
    let isParticipant = false;
    let message = '';

    try {
      const uid = await verifyAuth(req);
      if (uid) {
        // 已登录用户，检查是否已经是参与者
        const isAlreadyParticipant = fullMeetingData.participants.some(p => p.id === uid);
        
        if (!isAlreadyParticipant) {
          // 获取用户完整信息
          const userDoc = await db.collection('users').doc(uid).get();
          const userData = userDoc.data();
          
          // 将用户添加到参与者列表
          const updatedParticipants = [
            ...fullMeetingData.participants,
            { 
              id: uid, 
              name: userData?.name || '', 
              avatar: userData?.avatar || '' 
            }
          ];
          
          await db.collection('meetings').doc(inviteData.meetingId).update({
            participants: updatedParticipants,
            updatedAt: new Date()
          });
          
          fullMeetingData.participants = updatedParticipants;
          isParticipant = true;
          message = '已成功加入会议';
        } else {
          isParticipant = true;
          message = '您已经是会议参与者';
        }
      } else {
        message = '请登录后加入会议';
      }
    } catch (authError) {
      // 未登录用户，返回会议信息但不加入参与者列表
      message = '请登录后加入会议';
    }

    // 更新邀请使用次数
    await inviteDoc.ref.update({
      usedCount: inviteData.usedCount + 1
    });

    const response: JoinMeetingResponse = {
      success: true,
      meeting: fullMeetingData,
      isParticipant,
      message
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('加入会议失败:', error);
    res.status(500).json({ success: false, error: '加入会议失败' });
  }
});

/**
 * 根据ID获取会议详情
 * GET /meetings/:meetingId
 */
router.get('/:meetingId', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const uid = await verifyAuth(req); // 验证认证令牌

    // 检查用户是否有权限访问此会议
    const hasAccess = await checkMeetingAccess(meetingId, uid);
    if (!hasAccess) {
      res.status(404).json({ success: false, error: '会议不存在或无权限访问' });
      return;
    }

    const meetingDoc = await db.collection('meetings').doc(meetingId).get();
    const meetingData = meetingDoc.data();

    const fullMeetingData: Meeting = {
      meetingid: meetingId,
      ...meetingData,
    } as Meeting;

    res.json({ success: true, data: fullMeetingData });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('获取会议详情失败:', error);
    res.status(500).json({ success: false, error: '获取会议详情失败' });
  }
});

/**
 * 更新会议信息
 * PATCH /meetings/:meetingId
 */
router.patch('/:meetingId', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const updateData: UpdateMeetingRequest = req.body;
    const uid = await verifyAuth(req); // 验证认证令牌

    // 检查用户是否有权限更新此会议（只有创建者可以更新）
    const isOwner = await checkMeetingOwnership(meetingId, uid);
    if (!isOwner) {
      res.status(404).json({ success: false, error: '会议不存在或无权限更新此会议' });
      return;
    }

    await db.collection('meetings').doc(meetingId).update({
      ...updateData,
      updatedAt: new Date()
    });

    res.json({ success: true, data: { success: true } });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('更新会议失败:', error);
    res.status(500).json({ success: false, error: '更新会议失败' });
  }
});

/**
 * 删除会议
 * DELETE /meetings/:meetingId
 */
router.delete('/:meetingId', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const uid = await verifyAuth(req); // 验证认证令牌

    // 检查用户是否有权限删除此会议（只有创建者可以删除）
    const isOwner = await checkMeetingOwnership(meetingId, uid);
    if (!isOwner) {
      res.status(404).json({ success: false, error: '会议不存在或无权限删除此会议' });
      return;
    }

    // 删除会议及其所有子集合
    const batch = db.batch();
    
    // 删除子集合
    const [preMeetingSnapshot, inMeetingSnapshot, postMeetingSnapshot] = await Promise.all([
      db.collection('meetings').doc(meetingId).collection('preMeeting').get(),
      db.collection('meetings').doc(meetingId).collection('inMeeting').get(),
      db.collection('meetings').doc(meetingId).collection('postMeeting').get()
    ]);

    preMeetingSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
    inMeetingSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
    postMeetingSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
    
    // 删除主文档
    batch.delete(db.collection('meetings').doc(meetingId));
    
    await batch.commit();

    res.json({ success: true, data: { success: true } });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('删除会议失败:', error);
    res.status(500).json({ success: false, error: '删除会议失败' });
  }
});

// ==================== Meeting Invite Operations ====================

/**
 * 生成邀请链接
 * POST /meetings/:meetingId/invite-link
 */
router.post('/:meetingId/invite-link', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const uid = await verifyAuth(req); // 验证认证令牌

    // 检查用户是否有权限创建邀请链接（只有创建者可以）
    const isOwner = await checkMeetingOwnership(meetingId, uid);
    if (!isOwner) {
      res.status(404).json({ success: false, error: '会议不存在或无权限创建邀请链接' });
      return;
    }

    // 验证会议是否存在
    const meetingDoc = await db.collection('meetings').doc(meetingId).get();
    if (!meetingDoc.exists) {
      res.status(404).json({ success: false, error: '会议不存在' });
      return;
    }

    // 检查是否已存在有效的邀请链接
    const existingInvites = await db.collection('meeting_invites')
      .where('meetingId', '==', meetingId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    let token: string;

    if (!existingInvites.empty) {
      // 如果存在有效的邀请链接，重复利用
      const existingInvite = existingInvites.docs[0];
      const existingData = existingInvite.data() as MeetingInvite;
      token = existingData.token;
      
      console.log(`重复利用现有邀请链接: ${token} for meeting: ${meetingId}`);
    } else {
      // 如果不存在有效的邀请链接，生成新的
      token = generateInviteToken();
      
      // 创建邀请记录
      const inviteData: Omit<MeetingInvite, 'id'> = {
        meetingId,
        token,
        createdAt: new Date(),
        status: 'active',
        usedCount: 0
      };

      await db.collection('meeting_invites').add(inviteData);
      
      console.log(`创建新邀请链接: ${token} for meeting: ${meetingId}`);
    }
    
    // 返回相对路径，由前端组合完整URL
    const invitePath = `/meetings/join?token=${token}`;

    const response: InviteLinkResponse = {
      invite_link: invitePath,
      token
    };

    res.json({ success: true, data: response });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('生成邀请链接失败:', error);
    res.status(500).json({ success: false, error: '生成邀请链接失败' });
  }
});

// ==================== Future Meeting Operations ====================
// 这里可以添加更多单一会议相关的功能，比如：
// - 会议身份验证
// - 会议权限管理
// - 会议状态变更
// - 会议参与者管理

export default router;
