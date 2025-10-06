"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("./firebase");
const client_1 = require("./client");
const utils_1 = require("./utils");
const router = (0, express_1.Router)();
// ==================== Single Meeting Operations ====================
/**
 * 通过token加入会议
 * GET /meetings/join?token=abc123xyz
 */
router.get('/join', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            res.status(400).json({ success: false, error: '缺少邀请token' });
            return;
        }
        // 查找邀请记录
        const inviteQuery = await firebase_1.db.collection('meeting_invites')
            .where('token', '==', token)
            .where('status', '==', 'active')
            .limit(1)
            .get();
        if (inviteQuery.empty) {
            res.status(404).json({ success: false, error: '邀请链接无效或已失效' });
            return;
        }
        const inviteDoc = inviteQuery.docs[0];
        const inviteData = inviteDoc.data();
        // 获取会议详情
        const meetingDoc = await firebase_1.db.collection('meetings').doc(inviteData.meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        const fullMeetingData = Object.assign({ meetingid: inviteData.meetingId }, meetingData);
        // 检查用户是否已登录并添加到参与者列表
        let isParticipant = false;
        let message = '';
        try {
            const uid = await (0, client_1.verifyAuth)(req);
            if (uid) {
                // 已登录用户，检查是否已经是参与者
                const isAlreadyParticipant = fullMeetingData.participants.some(p => p.id === uid);
                if (!isAlreadyParticipant) {
                    // 获取用户完整信息
                    const userDoc = await firebase_1.db.collection('users').doc(uid).get();
                    const userData = userDoc.data();
                    // 将用户添加到参与者列表
                    const updatedParticipants = [
                        ...fullMeetingData.participants,
                        {
                            id: uid,
                            name: (userData === null || userData === void 0 ? void 0 : userData.name) || '',
                            avatar: (userData === null || userData === void 0 ? void 0 : userData.avatar) || ''
                        }
                    ];
                    await firebase_1.db.collection('meetings').doc(inviteData.meetingId).update({
                        participants: updatedParticipants,
                        updatedAt: new Date()
                    });
                    fullMeetingData.participants = updatedParticipants;
                    isParticipant = true;
                    message = '已成功加入会议';
                }
                else {
                    isParticipant = true;
                    message = '您已经是会议参与者';
                }
            }
            else {
                message = '请登录后加入会议';
            }
        }
        catch (authError) {
            // 未登录用户，返回会议信息但不加入参与者列表
            message = '请登录后加入会议';
        }
        // 更新邀请使用次数
        await inviteDoc.ref.update({
            usedCount: inviteData.usedCount + 1
        });
        const response = {
            success: true,
            meeting: fullMeetingData,
            isParticipant,
            message
        };
        res.json({ success: true, data: response });
    }
    catch (error) {
        console.error('加入会议失败:', error);
        res.status(500).json({ success: false, error: '加入会议失败' });
    }
});
/**
 * 根据ID获取会议详情
 * GET /meetings/:meetingId
 */
router.get('/:meetingId', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const uid = await (0, client_1.verifyAuth)(req); // 验证认证令牌
        // 检查用户是否有权限访问此会议
        const hasAccess = await (0, client_1.checkMeetingAccess)(meetingId, uid);
        if (!hasAccess) {
            res.status(404).json({ success: false, error: '会议不存在或无权限访问' });
            return;
        }
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        const meetingData = meetingDoc.data();
        const fullMeetingData = Object.assign({ meetingid: meetingId }, meetingData);
        res.json({ success: true, data: fullMeetingData });
    }
    catch (error) {
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
router.patch('/:meetingId', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const updateData = req.body;
        const uid = await (0, client_1.verifyAuth)(req); // 验证认证令牌
        // 检查用户是否有权限更新此会议（只有创建者可以更新）
        const isOwner = await (0, client_1.checkMeetingOwnership)(meetingId, uid);
        if (!isOwner) {
            res.status(404).json({ success: false, error: '会议不存在或无权限更新此会议' });
            return;
        }
        await firebase_1.db.collection('meetings').doc(meetingId).update(Object.assign(Object.assign({}, updateData), { updatedAt: new Date() }));
        res.json({ success: true, data: { success: true } });
    }
    catch (error) {
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
router.delete('/:meetingId', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const uid = await (0, client_1.verifyAuth)(req); // 验证认证令牌
        // 检查用户是否有权限删除此会议（只有创建者可以删除）
        const isOwner = await (0, client_1.checkMeetingOwnership)(meetingId, uid);
        if (!isOwner) {
            res.status(404).json({ success: false, error: '会议不存在或无权限删除此会议' });
            return;
        }
        // 删除会议及其所有子集合
        const batch = firebase_1.db.batch();
        // 删除子集合
        const [preMeetingSnapshot, inMeetingSnapshot, postMeetingSnapshot] = await Promise.all([
            firebase_1.db.collection('meetings').doc(meetingId).collection('preMeeting').get(),
            firebase_1.db.collection('meetings').doc(meetingId).collection('inMeeting').get(),
            firebase_1.db.collection('meetings').doc(meetingId).collection('postMeeting').get()
        ]);
        preMeetingSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        inMeetingSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        postMeetingSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        // 删除主文档
        batch.delete(firebase_1.db.collection('meetings').doc(meetingId));
        await batch.commit();
        res.json({ success: true, data: { success: true } });
    }
    catch (error) {
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
router.post('/:meetingId/invite-link', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const uid = await (0, client_1.verifyAuth)(req); // 验证认证令牌
        // 检查用户是否有权限创建邀请链接（只有创建者可以）
        const isOwner = await (0, client_1.checkMeetingOwnership)(meetingId, uid);
        if (!isOwner) {
            res.status(404).json({ success: false, error: '会议不存在或无权限创建邀请链接' });
            return;
        }
        // 验证会议是否存在
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        // 检查是否已存在有效的邀请链接
        const existingInvites = await firebase_1.db.collection('meeting_invites')
            .where('meetingId', '==', meetingId)
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
        let token;
        if (!existingInvites.empty) {
            // 如果存在有效的邀请链接，重复利用
            const existingInvite = existingInvites.docs[0];
            const existingData = existingInvite.data();
            token = existingData.token;
            console.log(`重复利用现有邀请链接: ${token} for meeting: ${meetingId}`);
        }
        else {
            // 如果不存在有效的邀请链接，生成新的
            token = (0, utils_1.generateInviteToken)();
            // 创建邀请记录
            const inviteData = {
                meetingId,
                token,
                createdAt: new Date(),
                status: 'active',
                usedCount: 0
            };
            await firebase_1.db.collection('meeting_invites').add(inviteData);
            console.log(`创建新邀请链接: ${token} for meeting: ${meetingId}`);
        }
        // 返回相对路径，由前端组合完整URL
        const invitePath = `/meetings/join?token=${token}`;
        const response = {
            invite_link: invitePath,
            token
        };
        res.json({ success: true, data: response });
    }
    catch (error) {
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
exports.default = router;
//# sourceMappingURL=meetinginfo.js.map