import { Router, Request, Response } from 'express';
import { db } from './firebase';
import { verifyAuth } from './client';
import { User, CreateUserRequest } from './types';

const router = Router();

// ==================== User Routes ====================

/**
 * 创建新用户
 * POST /users
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, avatar }: CreateUserRequest = req.body;
    const uid = await verifyAuth(req); // 验证认证令牌

    const userData: User = {
      id: uid,
      name,
      avatar,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').doc(uid).set(userData);
    
    res.json({ success: true, data: userData });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('创建用户失败:', error);
    res.status(500).json({ success: false, error: '创建用户失败' });
  }
});

/**
 * 获取当前用户信息
 * GET /users/me
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const uid = await verifyAuth(req); // 验证认证令牌

    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      res.status(404).json({ success: false, error: '用户不存在' });
      return;
    }

    res.json({ success: true, data: userDoc.data() });
  } catch (error) {
    if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    console.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
});

export default router;
