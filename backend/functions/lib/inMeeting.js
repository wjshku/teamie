"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("./firebase");
const client_1 = require("./client");
const router = (0, express_1.Router)();
// ==================== InMeeting Routes ====================
/**
 * 获取会中笔记信息
 * GET /meetings/:meetingId/inMeeting
 */
router.get('/:meetingId/inMeeting', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const uid = await (0, client_1.verifyAuth)(req); // 验证认证令牌
        // 检查用户是否有权限访问此会议
        const hasAccess = await (0, client_1.checkMeetingAccess)(meetingId, uid);
        if (!hasAccess) {
            res.status(404).json({ success: false, error: '会议不存在或无权限访问' });
            return;
        }
        const inMeetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).collection('inMeeting').doc('data').get();
        if (!inMeetingDoc.exists) {
            res.status(404).json({ success: false, error: '会中笔记不存在' });
            return;
        }
        res.json({ success: true, data: inMeetingDoc.data() });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('获取会中笔记失败:', error);
        res.status(500).json({ success: false, error: '获取会中笔记失败' });
    }
});
/**
 * 创建会中笔记信息
 * POST /meetings/:meetingId/inMeeting
 */
router.post('/:meetingId/inMeeting', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const uid = await (0, client_1.verifyAuth)(req); // 验证认证令牌
        // 检查用户是否有权限操作此会议
        const hasAccess = await (0, client_1.checkMeetingAccess)(meetingId, uid);
        if (!hasAccess) {
            res.status(404).json({ success: false, error: '会议不存在或无权限操作' });
            return;
        }
        const newInMeetingData = {
            meetingid: meetingId,
            notes: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await firebase_1.db.collection('meetings').doc(meetingId).collection('inMeeting').doc('data').set(newInMeetingData);
        res.json({ success: true, data: newInMeetingData });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('创建会中笔记失败:', error);
        res.status(500).json({ success: false, error: '创建会中笔记失败' });
    }
});
// ==================== Note Routes ====================
/**
 * 添加笔记到会中
 * POST /meetings/:meetingId/inMeeting/notes
 */
router.post('/:meetingId/inMeeting/notes', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { content, author, authorInitial } = req.body;
        const uid = await (0, client_1.verifyAuth)(req); // 验证认证令牌
        // 检查用户是否有权限操作此会议
        const hasAccess = await (0, client_1.checkMeetingAccess)(meetingId, uid);
        if (!hasAccess) {
            res.status(404).json({ success: false, error: '会议不存在或无权限操作' });
            return;
        }
        const note = {
            id: Date.now().toString(),
            meetingid: meetingId,
            author,
            authorInitial,
            content,
            timestamp: new Date().toISOString()
        };
        // 获取现有笔记列表
        const inMeetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).collection('inMeeting').doc('data').get();
        const existingData = inMeetingDoc.data() || { notes: [] };
        // 添加新笔记
        const updatedNotes = [...existingData.notes, note];
        await firebase_1.db.collection('meetings').doc(meetingId).collection('inMeeting').doc('data').update({
            notes: updatedNotes,
            updatedAt: new Date()
        });
        res.json({ success: true, data: note });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('添加笔记失败:', error);
        res.status(500).json({ success: false, error: '添加笔记失败' });
    }
});
exports.default = router;
//# sourceMappingURL=inMeeting.js.map