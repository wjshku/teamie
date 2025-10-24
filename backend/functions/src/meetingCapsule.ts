import { Router, Request, Response } from 'express';
import { db } from './firebase';
import { verifyAuth, checkMeetingAccess } from './client';
import { MeetingCapsule } from './types';
import { generateMeetingSuggestions, generateMeetingCapsule, generateCapsuleFromTranscript } from './aiService';

const router = Router();

// ==================== MeetingCapsule Routes ====================

/**
 * 获取用户的所有会议胶囊
 * GET /meetingCapsules
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const uid = await verifyAuth(req);

    const capsulesSnapshot = await db.collection('meetingCapsules')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    const capsules: MeetingCapsule[] = capsulesSnapshot.docs.map(doc => ({
      capsuleId: doc.id,
      ...doc.data()
    } as MeetingCapsule));

    res.json({ success: true, data: { capsules } });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('获取会议胶囊失败:', error);
    res.status(500).json({ success: false, error: '获取会议胶囊失败' });
  }
});

/**
 * 从会议生成会议胶囊（使用 AI 总结）
 * POST /meetingCapsules/generate
 * Body: { meetingId: string, title?: string }
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const uid = await verifyAuth(req);
    const { meetingId, title } = req.body;

    if (!meetingId) {
      res.status(400).json({ success: false, error: '缺少 meetingId' });
      return;
    }

    // 检查用户是否有权限访问此会议
    const hasAccess = await checkMeetingAccess(meetingId, uid);
    if (!hasAccess) {
      res.status(404).json({ success: false, error: '会议不存在或无权限访问' });
      return;
    }

    // 获取会议数据
    const meetingDoc = await db.collection('meetings').doc(meetingId).get();
    if (!meetingDoc.exists) {
      res.status(404).json({ success: false, error: '会议不存在' });
      return;
    }

    const meetingData = meetingDoc.data();

    // 获取 pre/in/post meeting 数据
    const preMeetingDoc = await db.collection('meetings').doc(meetingId).collection('preMeeting').doc('data').get();
    const inMeetingDoc = await db.collection('meetings').doc(meetingId).collection('inMeeting').doc('data').get();
    const postMeetingDoc = await db.collection('meetings').doc(meetingId).collection('postMeeting').doc('data').get();

    const preMeetingData = preMeetingDoc.exists ? preMeetingDoc.data() : null;
    const inMeetingData = inMeetingDoc.exists ? inMeetingDoc.data() : null;
    const postMeetingData = postMeetingDoc.exists ? postMeetingDoc.data() : null;

    // 使用 AI 生成摘要和关键点
    const aiResult = await generateMeetingCapsule({
      meetingTitle: meetingData?.title || '未命名会议',
      objective: preMeetingData?.objective,
      questions: preMeetingData?.questions,
      notes: inMeetingData?.notes,
      summary: postMeetingData?.summary,
      feedbacks: postMeetingData?.feedbacks,
      actionItems: postMeetingData?.actionItems,
    });

    const summary = aiResult.summary;
    const keyPoints = aiResult.keyPoints;

    // 创建会议胶囊
    const capsuleData: Omit<MeetingCapsule, 'capsuleId'> = {
      userId: uid,
      title: title || meetingData?.title || '未命名会议',
      summary,
      keyPoints,
      sourceMeetingId: meetingId,
      createdAt: new Date().toISOString(),
      metadata: {
        participants: meetingData?.participants?.map((p: any) => p.name) || [],
        meetingDate: meetingData?.time || '',
        topics: preMeetingData?.objective ? preMeetingData.objective.split(/[，。、；：\s]+/).filter((w: string) => w.length > 2).slice(0, 3) : []
      }
    };

    const capsuleRef = await db.collection('meetingCapsules').add(capsuleData);
    const capsule: MeetingCapsule = {
      capsuleId: capsuleRef.id,
      ...capsuleData
    };

    res.json({ success: true, data: { capsule } });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('生成会议胶囊失败:', error);
    res.status(500).json({ success: false, error: '生成会议胶囊失败' });
  }
});

/**
 * 导入外部会议生成胶囊
 * POST /meetingCapsules/import
 * Body: { title: string, content: string, metadata?: {...} }
 */
router.post('/import', async (req: Request, res: Response) => {
  try {
    const uid = await verifyAuth(req);
    const { title, content, metadata } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, error: '缺少 title 或 content' });
      return;
    }

    // 使用 AI 处理导入的会议记录
    const aiResult = await generateCapsuleFromTranscript({ title, content });

    const capsuleData: Omit<MeetingCapsule, 'capsuleId'> = {
      userId: uid,
      title,
      summary: aiResult.summary,
      keyPoints: aiResult.keyPoints,
      createdAt: new Date().toISOString(),
      metadata: metadata || {}
    };

    const capsuleRef = await db.collection('meetingCapsules').add(capsuleData);
    const capsule: MeetingCapsule = {
      capsuleId: capsuleRef.id,
      ...capsuleData
    };

    res.json({ success: true, data: { capsule } });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('导入会议胶囊失败:', error);
    res.status(500).json({ success: false, error: '导入会议胶囊失败' });
  }
});

/**
 * 获取单个会议胶囊
 * GET /meetingCapsules/:capsuleId
 */
router.get('/:capsuleId', async (req: Request, res: Response) => {
  try {
    const uid = await verifyAuth(req);
    const { capsuleId } = req.params;

    const capsuleDoc = await db.collection('meetingCapsules').doc(capsuleId).get();

    if (!capsuleDoc.exists) {
      res.status(404).json({ success: false, error: '会议胶囊不存在' });
      return;
    }

    const capsuleData = capsuleDoc.data();
    if (capsuleData?.userId !== uid) {
      res.status(403).json({ success: false, error: '无权限访问此胶囊' });
      return;
    }

    const capsule: MeetingCapsule = {
      capsuleId: capsuleDoc.id,
      ...capsuleData
    } as MeetingCapsule;

    res.json({ success: true, data: capsule });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('获取会议胶囊失败:', error);
    res.status(500).json({ success: false, error: '获取会议胶囊失败' });
  }
});

/**
 * 删除会议胶囊
 * DELETE /meetingCapsules/:capsuleId
 */
router.delete('/:capsuleId', async (req: Request, res: Response) => {
  try {
    const uid = await verifyAuth(req);
    const { capsuleId } = req.params;

    const capsuleDoc = await db.collection('meetingCapsules').doc(capsuleId).get();

    if (!capsuleDoc.exists) {
      res.status(404).json({ success: false, error: '会议胶囊不存在' });
      return;
    }

    const capsuleData = capsuleDoc.data();
    if (capsuleData?.userId !== uid) {
      res.status(403).json({ success: false, error: '无权限删除此胶囊' });
      return;
    }

    await db.collection('meetingCapsules').doc(capsuleId).delete();

    res.json({ success: true, data: { message: '胶囊已删除' } });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('删除会议胶囊失败:', error);
    res.status(500).json({ success: false, error: '删除会议胶囊失败' });
  }
});

/**
 * 生成会议建议（使用 AI）
 * POST /meetingCapsules/generateSuggestions
 * Body: { capsuleIds: string[], currentObjective?: string }
 */
router.post('/generateSuggestions', async (req: Request, res: Response) => {
  try {
    const uid = await verifyAuth(req);
    const { capsuleIds, currentObjective } = req.body;

    if (!capsuleIds || !Array.isArray(capsuleIds) || capsuleIds.length === 0) {
      res.status(400).json({ success: false, error: '缺少 capsuleIds' });
      return;
    }

    // 获取胶囊数据
    const capsulesData: Array<{ title: string; summary: string; keyPoints: string[] }> = [];

    for (const capsuleId of capsuleIds) {
      const capsuleDoc = await db.collection('meetingCapsules').doc(capsuleId).get();

      if (!capsuleDoc.exists) {
        continue;
      }

      const capsuleData = capsuleDoc.data();
      if (capsuleData?.userId !== uid) {
        continue; // 跳过不属于该用户的胶囊
      }

      capsulesData.push({
        title: capsuleData.title || '',
        summary: capsuleData.summary || '',
        keyPoints: capsuleData.keyPoints || [],
      });
    }

    if (capsulesData.length === 0) {
      res.status(404).json({ success: false, error: '未找到有效的胶囊数据' });
      return;
    }

    // 调用 AI 服务生成建议
    const suggestions = await generateMeetingSuggestions({
      capsules: capsulesData,
      currentObjective: currentObjective
    });

    res.json({ success: true, data: suggestions });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('生成建议失败:', error);
    res.status(500).json({ success: false, error: '生成建议失败' });
  }
});

export default router;
