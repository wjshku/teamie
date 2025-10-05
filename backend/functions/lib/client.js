"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserMeetings = exports.checkMeetingOwnership = exports.checkMeetingAccess = exports.verifyAuth = void 0;
const firebase_1 = require("./firebase");
// ==================== 认证辅助函数 ====================
/**
 * 验证用户认证令牌
 * @param req HTTP 请求对象
 * @returns 验证后的用户ID
 */
const verifyAuth = async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('未提供认证令牌');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = await firebase_1.auth.verifyIdToken(token);
        // console.log('decodedToken', decodedToken);
        return decodedToken.uid;
    }
    catch (error) {
        throw new Error('无效的认证令牌');
    }
};
exports.verifyAuth = verifyAuth;
// ==================== 权限验证辅助函数 ====================
/**
 * 检查用户是否有权限访问会议
 * @param meetingId 会议ID
 * @param uid 用户ID
 * @returns 是否有权限访问会议
 */
const checkMeetingAccess = async (meetingId, uid) => {
    var _a;
    // 验证 meetingId 是否有效
    if (!meetingId || typeof meetingId !== 'string' || meetingId.trim() === '') {
        return false;
    }
    const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
    if (!meetingDoc.exists) {
        return false;
    }
    const meetingData = meetingDoc.data();
    return (meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) === uid ||
        ((_a = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _a === void 0 ? void 0 : _a.some((participant) => participant.id === uid));
};
exports.checkMeetingAccess = checkMeetingAccess;
/**
 * 检查用户是否有权限操作会议（创建者权限）
 * @param meetingId 会议ID
 * @param uid 用户ID
 * @returns 是否有权限操作会议
 */
const checkMeetingOwnership = async (meetingId, uid) => {
    // 验证 meetingId 是否有效
    if (!meetingId || typeof meetingId !== 'string' || meetingId.trim() === '') {
        return false;
    }
    const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
    if (!meetingDoc.exists) {
        return false;
    }
    const meetingData = meetingDoc.data();
    return (meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) === uid;
};
exports.checkMeetingOwnership = checkMeetingOwnership;
/**
 * 获取用户参与的会议列表
 * @param uid 用户ID
 * @returns 用户参与的会议列表
 */
const getUserMeetings = async (uid) => {
    const meetingsSnapshot = await firebase_1.db.collection('meetings')
        .orderBy('createdAt', 'desc')
        .get();
    return meetingsSnapshot.docs
        .filter((doc) => {
        var _a;
        const meetingData = doc.data();
        return (_a = meetingData.participants) === null || _a === void 0 ? void 0 : _a.some((participant) => participant.id === uid);
    })
        .map((doc) => (Object.assign({ meetingid: doc.id }, doc.data())));
};
exports.getUserMeetings = getUserMeetings;
//# sourceMappingURL=client.js.map