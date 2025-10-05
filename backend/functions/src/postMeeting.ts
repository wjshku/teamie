import { Router, Request, Response } from 'express';
import { db } from './firebase';
import { verifyAuth, checkMeetingAccess } from './client';
import { PostMeeting, Feedback } from './types';

const router = Router();

// ==================== PostMeeting Routes ====================

/**
 * 获取会后总结信息
 * GET /meetings/:meetingId/postMeeting
 */
router.get('/:meetingId/postMeeting', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const uid = await verifyAuth(req); // 验证认证令牌

    // 检查用户是否有权限访问此会议
    const hasAccess = await checkMeetingAccess(meetingId, uid);
    if (!hasAccess) {
      res.status(404).json({ success: false, error: '会议不存在或无权限访问' });
      return;
    }

    const postMeetingDoc = await db.collection('meetings').doc(meetingId).collection('postMeeting').doc('data').get();
    
    if (!postMeetingDoc.exists) {
      res.status(404).json({ success: false, error: '会后总结不存在' });
      return;
    }

    res.json({ success: true, data: postMeetingDoc.data() });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('获取会后总结失败:', error);
    res.status(500).json({ success: false, error: '获取会后总结失败' });
  }
});

/**
 * 创建会后总结信息
 * POST /meetings/:meetingId/postMeeting
 */
router.post('/:meetingId/postMeeting', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const uid = await verifyAuth(req); // 验证认证令牌

    // 检查用户是否有权限操作此会议
    const hasAccess = await checkMeetingAccess(meetingId, uid);
    if (!hasAccess) {
      res.status(404).json({ success: false, error: '会议不存在或无权限操作' });
      return;
    }

    const postMeetingData: PostMeeting = {
      meetingid: meetingId,
      summary: '',
      feedbacks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('meetings').doc(meetingId).collection('postMeeting').doc('data').set(postMeetingData);
    
    res.json({ success: true, data: postMeetingData });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('创建会后总结失败:', error);
    res.status(500).json({ success: false, error: '创建会后总结失败' });
  }
});

/**
 * 更新会后总结
 * PATCH /meetings/:meetingId/postMeeting/summary
 */
router.patch('/:meetingId/postMeeting/summary', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { summary } = req.body;
    const uid = await verifyAuth(req); // 验证认证令牌

    // 检查用户是否有权限操作此会议
    const hasAccess = await checkMeetingAccess(meetingId, uid);
    if (!hasAccess) {
      res.status(404).json({ success: false, error: '会议不存在或无权限操作' });
      return;
    }

    await db.collection('meetings').doc(meetingId).collection('postMeeting').doc('data').update({
      summary,
      updatedAt: new Date()
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('更新总结失败:', error);
    res.status(500).json({ success: false, error: '更新总结失败' });
  }
});

// ==================== Feedback Routes ====================

/**
 * 添加反馈到会后总结
 * POST /meetings/:meetingId/postMeeting/feedbacks
 */
router.post('/:meetingId/postMeeting/feedbacks', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { content, author, authorInitial }: Omit<Feedback, 'timestamp' | 'meetingid'> = req.body;
    const uid = await verifyAuth(req); // 验证认证令牌

    // 检查用户是否有权限操作此会议
    const hasAccess = await checkMeetingAccess(meetingId, uid);
    if (!hasAccess) {
      res.status(404).json({ success: false, error: '会议不存在或无权限操作' });
      return;
    }

    const feedback: Feedback = {
      id: Date.now().toString(),
      meetingid: meetingId,
      author,
      authorInitial,
      content,
      timestamp: new Date().toISOString()
    };

    // 获取现有反馈列表
    const postMeetingDoc = await db.collection('meetings').doc(meetingId).collection('postMeeting').doc('data').get();
    const existingData = postMeetingDoc.data() || { feedbacks: [] };
    
    // 添加新反馈
    const updatedFeedbacks = [...existingData.feedbacks, feedback];
    
    await db.collection('meetings').doc(meetingId).collection('postMeeting').doc('data').update({
      feedbacks: updatedFeedbacks,
      updatedAt: new Date()
    });

    res.json({ success: true, data: feedback });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('添加反馈失败:', error);
    res.status(500).json({ success: false, error: '添加反馈失败' });
  }
});

export default router;
