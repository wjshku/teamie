import { Router, Request, Response } from 'express';
import { db } from './firebase';
import { verifyAuth, checkMeetingAccess } from './client';
import { PreMeeting, CreatePreMeetingRequest, Question } from './types';

const router = Router();

// ==================== PreMeeting Routes ====================

/**
 * 获取会前准备信息
 * GET /meetings/:meetingId/preMeeting
 */
router.get('/:meetingId/preMeeting', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const uid = await verifyAuth(req); // 验证认证令牌

    // 检查用户是否有权限访问此会议
    const hasAccess = await checkMeetingAccess(meetingId, uid);
    if (!hasAccess) {
      res.status(404).json({ success: false, error: '会议不存在或无权限访问' });
      return;
    }

    const preMeetingDoc = await db.collection('meetings').doc(meetingId).collection('preMeeting').doc('data').get();
    
    if (!preMeetingDoc.exists) {
      res.status(404).json({ success: false, error: '会前准备不存在' });
      return;
    }

    res.json({ success: true, data: preMeetingDoc.data() });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('获取会前准备失败:', error);
    res.status(500).json({ success: false, error: '获取会前准备失败' });
  }
});

/**
 * 创建会前准备信息
 * POST /meetings/:meetingId/preMeeting
 */
router.post('/:meetingId/preMeeting', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { objective, questions = [] }: CreatePreMeetingRequest = req.body;
    const uid = await verifyAuth(req); // 验证认证令牌


    // 检查用户是否有权限操作此会议
    const hasAccess = await checkMeetingAccess(meetingId, uid);
    if (!hasAccess) {
      res.status(404).json({ success: false, error: '会议不存在或无权限操作' });
      return;
    }

    const preMeetingData: PreMeeting = {
      meetingid: meetingId,
      objective: objective || '',
      questions: questions.map((q: any) => ({
        ...q,
        id: Date.now().toString(),
        meetingid: meetingId,
        timestamp: new Date().toISOString()
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('meetings').doc(meetingId).collection('preMeeting').doc('data').set(preMeetingData);
    
    res.json({ success: true, data: preMeetingData });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('创建会前准备失败:', error);
    res.status(500).json({ success: false, error: '创建会前准备失败' });
  }
});

/**
 * 更新会前准备目标
 * PATCH /meetings/:meetingId/preMeeting/objective
 */
router.patch('/:meetingId/preMeeting/objective', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { objective } = req.body;
    const uid = await verifyAuth(req); // 验证认证令牌

    // 检查用户是否有权限操作此会议
    const hasAccess = await checkMeetingAccess(meetingId, uid);
    if (!hasAccess) {
      res.status(404).json({ success: false, error: '会议不存在或无权限操作' });
      return;
    }

    await db.collection('meetings').doc(meetingId).collection('preMeeting').doc('data').update({
      objective,
      updatedAt: new Date()
    });

    res.json({ success: true, data: objective });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('更新目标失败:', error);
    res.status(500).json({ success: false, error: '更新目标失败' });
  }
});

// ==================== Question Routes ====================

/**
 * 添加问题到会前准备
 * POST /meetings/:meetingId/preMeeting/questions
 */
router.post('/:meetingId/preMeeting/questions', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { content, author, authorInitial }: Omit<Question, 'timestamp' | 'meetingid'> = req.body;
    const uid = await verifyAuth(req); // 验证认证令牌

    // 检查用户是否有权限操作此会议
    const hasAccess = await checkMeetingAccess(meetingId, uid);
    if (!hasAccess) {
      res.status(404).json({ success: false, error: '会议不存在或无权限操作' });
      return;
    }

    const question: Question = {
      id: Date.now().toString(),
      meetingid: meetingId,
      author,
      authorInitial,
      content,
      timestamp: new Date().toISOString()
    };

    // 获取现有问题列表
    const preMeetingDoc = await db.collection('meetings').doc(meetingId).collection('preMeeting').doc('data').get();
    const existingData = preMeetingDoc.data() || { questions: [] };
    
    // 添加新问题
    const updatedQuestions = [...existingData.questions, question];
    
    await db.collection('meetings').doc(meetingId).collection('preMeeting').doc('data').update({
      questions: updatedQuestions,
      updatedAt: new Date()
    });

    res.json({ success: true, data: question });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('添加问题失败:', error);
    res.status(500).json({ success: false, error: '添加问题失败' });
  }
});

export default router;
