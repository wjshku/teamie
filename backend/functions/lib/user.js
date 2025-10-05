"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("./firebase");
const client_1 = require("./client");
const router = (0, express_1.Router)();
// ==================== User Routes ====================
/**
 * 创建新用户
 * POST /users
 */
router.post('/', async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const uid = await (0, client_1.verifyAuth)(req); // 验证认证令牌
        const userData = {
            id: uid,
            name,
            avatar,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await firebase_1.db.collection('users').doc(uid).set(userData);
        res.json({ success: true, data: userData });
    }
    catch (error) {
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
router.get('/me', async (req, res) => {
    try {
        const uid = await (0, client_1.verifyAuth)(req); // 验证认证令牌
        const userDoc = await firebase_1.db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            res.status(404).json({ success: false, error: '用户不存在' });
            return;
        }
        res.json({ success: true, data: userDoc.data() });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('获取用户信息失败:', error);
        res.status(500).json({ success: false, error: '获取用户信息失败' });
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map