"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMeetingCreated = exports.onMeetingStatusChange = exports.addFeedback = exports.updateSummary = exports.getPostMeeting = exports.createPostMeeting = exports.addNote = exports.getInMeeting = exports.createInMeeting = exports.addQuestion = exports.updateObjective = exports.getPreMeeting = exports.createPreMeeting = exports.deleteMeeting = exports.updateMeeting = exports.getMeeting = exports.createMeeting = exports.getMeetings = exports.getUser = exports.createUser = void 0;
const functions = __importStar(require("firebase-functions"));
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
// ==================== 用户管理 ====================
// 创建用户
exports.createUser = functions.region('asia-east1').https.onRequest(async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const uid = await verifyAuth(req); // 验证认证令牌
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
// 获取用户信息
exports.getUser = functions.region('asia-east1').https.onRequest(async (req, res) => {
    try {
        const uid = await verifyAuth(req); // 验证认证令牌
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
// ==================== 会议管理 ====================
// 获取会议列表
exports.getMeetings = functions.region('asia-east1').https.onRequest(async (req, res) => {
    try {
        const uid = await verifyAuth(req); // 验证认证令牌
        // 获取用户是参会者的会议
        const meetingsSnapshot = await firebase_1.db.collection('meetings')
            .where('participants', 'array-contains', uid)
            .orderBy('createdAt', 'desc')
            .get();
        const meetings = meetingsSnapshot.docs.map((doc) => (Object.assign({ meetingid: doc.id }, doc.data())));
        res.json({ success: true, data: meetings });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('获取会议列表失败:', error);
        res.status(500).json({ success: false, error: '获取会议列表失败' });
    }
});
// 创建会议
exports.createMeeting = functions.region('asia-east1').https.onRequest(async (req, res) => {
    try {
        const { title } = req.body;
        const uid = await verifyAuth(req); // 验证认证令牌
        const meetingData = {
            title,
            status: 'scheduled',
            time: '',
            participants: [uid],
            votelink: '',
            createdBy: uid,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const meetingRef = await firebase_1.db.collection('meetings').add(meetingData);
        res.json({
            success: true,
            data: Object.assign({ meetingid: meetingRef.id }, meetingData)
        });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('创建会议失败:', error);
        res.status(500).json({ success: false, error: '创建会议失败' });
    }
});
// 获取会议详情
exports.getMeeting = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        console.log('meetingId', meetingId);
        if (!meetingId) {
            res.status(400).json({ success: false, error: 'meetingId 缺失' });
            return;
        }
        const uid = await verifyAuth(req); // 验证认证令牌
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        // 检查用户是否有权限访问此会议
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid && !((_d = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _d === void 0 ? void 0 : _d.some((p) => p.id === uid))) {
            res.status(403).json({ success: false, error: '无权限访问此会议' });
            return;
        }
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
// 更新会议
exports.updateMeeting = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        const updateData = req.body;
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限更新此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid) {
            res.status(403).json({ success: false, error: '无权限更新此会议' });
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
// 删除会议
exports.deleteMeeting = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限删除此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid) {
            res.status(403).json({ success: false, error: '无权限删除此会议' });
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
// ==================== 会前准备 ====================
// 创建会前准备
exports.createPreMeeting = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        const { objective, questions = [] } = req.body;
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限操作此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid && !((_d = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _d === void 0 ? void 0 : _d.some((p) => p.id === uid))) {
            res.status(403).json({ success: false, error: '无权限操作此会议' });
            return;
        }
        const preMeetingData = {
            meetingid: meetingId,
            objective: objective || '',
            questions: questions.map((q) => (Object.assign(Object.assign({}, q), { id: Date.now().toString(), meetingid: meetingId, timestamp: new Date().toISOString() }))),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await firebase_1.db.collection('meetings').doc(meetingId).collection('preMeeting').doc('data').set(preMeetingData);
        res.json({ success: true, data: preMeetingData });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('创建会前准备失败:', error);
        res.status(500).json({ success: false, error: '创建会前准备失败' });
    }
});
// 获取会前准备
exports.getPreMeeting = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        console.log('meetingId', meetingId);
        if (!meetingId) {
            res.status(400).json({ success: false, error: 'meetingId 缺失' });
            return;
        }
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限访问此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid && !((_d = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _d === void 0 ? void 0 : _d.some((p) => p.id === uid))) {
            res.status(403).json({ success: false, error: '无权限访问此会议' });
            return;
        }
        const preMeetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).collection('preMeeting').doc('data').get();
        if (!preMeetingDoc.exists) {
            res.status(404).json({ success: false, error: '会前准备不存在' });
            return;
        }
        res.json({ success: true, data: preMeetingDoc.data() });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('获取会前准备失败:', error);
        res.status(500).json({ success: false, error: '获取会前准备失败' });
    }
});
// 更新目标
exports.updateObjective = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        console.log('meetingId', meetingId);
        if (!meetingId) {
            res.status(400).json({ success: false, error: 'meetingId 缺失' });
            return;
        }
        const { objective } = req.body;
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限操作此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid && !((_d = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _d === void 0 ? void 0 : _d.some((p) => p.id === uid))) {
            res.status(403).json({ success: false, error: '无权限操作此会议' });
            return;
        }
        await firebase_1.db.collection('meetings').doc(meetingId).collection('preMeeting').doc('data').update({
            objective,
            updatedAt: new Date()
        });
        res.json({ success: true, data: { success: true } });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('更新目标失败:', error);
        res.status(500).json({ success: false, error: '更新目标失败' });
    }
});
// 添加问题
exports.addQuestion = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        console.log('meetingId', meetingId);
        if (!meetingId) {
            res.status(400).json({ success: false, error: 'meetingId 缺失' });
            return;
        }
        const { content, author, authorInitial } = req.body;
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限操作此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid && !((_d = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _d === void 0 ? void 0 : _d.some((p) => p.id === uid))) {
            res.status(403).json({ success: false, error: '无权限操作此会议' });
            return;
        }
        const question = {
            id: Date.now().toString(),
            meetingid: meetingId,
            author,
            authorInitial,
            content,
            timestamp: new Date().toISOString()
        };
        // 获取现有问题列表
        const preMeetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).collection('preMeeting').doc('data').get();
        const existingData = preMeetingDoc.data() || { questions: [] };
        // 添加新问题
        const updatedQuestions = [...existingData.questions, question];
        await firebase_1.db.collection('meetings').doc(meetingId).collection('preMeeting').doc('data').update({
            questions: updatedQuestions,
            updatedAt: new Date()
        });
        res.json({ success: true, data: question });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('添加问题失败:', error);
        res.status(500).json({ success: false, error: '添加问题失败' });
    }
});
// ==================== 会中笔记 ====================
// 创建会中笔记
exports.createInMeeting = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        console.log('meetingId', meetingId);
        if (!meetingId) {
            res.status(400).json({ success: false, error: 'meetingId 缺失' });
            return;
        }
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限操作此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid && !((_d = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _d === void 0 ? void 0 : _d.some((p) => p.id === uid))) {
            res.status(403).json({ success: false, error: '无权限操作此会议' });
            return;
        }
        const inMeetingData = {
            meetingid: meetingId,
            notes: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await firebase_1.db.collection('meetings').doc(meetingId).collection('inMeeting').doc('data').set(inMeetingData);
        res.json({ success: true, data: inMeetingData });
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
// 获取会中笔记
exports.getInMeeting = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        console.log('meetingId', meetingId);
        if (!meetingId) {
            res.status(400).json({ success: false, error: 'meetingId 缺失' });
            return;
        }
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限访问此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid && !((_d = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _d === void 0 ? void 0 : _d.some((p) => p.id === uid))) {
            res.status(403).json({ success: false, error: '无权限访问此会议' });
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
// 添加笔记
exports.addNote = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        console.log('meetingId', meetingId);
        if (!meetingId) {
            res.status(400).json({ success: false, error: 'meetingId 缺失' });
            return;
        }
        const { content, author, authorInitial } = req.body;
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限操作此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid && !((_d = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _d === void 0 ? void 0 : _d.some((p) => p.id === uid))) {
            res.status(403).json({ success: false, error: '无权限操作此会议' });
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
// ==================== 会后总结 ====================
// 创建会后总结
exports.createPostMeeting = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限操作此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid && !((_d = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _d === void 0 ? void 0 : _d.some((p) => p.id === uid))) {
            res.status(403).json({ success: false, error: '无权限操作此会议' });
            return;
        }
        const postMeetingData = {
            meetingid: meetingId,
            summary: '',
            feedbacks: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await firebase_1.db.collection('meetings').doc(meetingId).collection('postMeeting').doc('data').set(postMeetingData);
        res.json({ success: true, data: postMeetingData });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('创建会后总结失败:', error);
        res.status(500).json({ success: false, error: '创建会后总结失败' });
    }
});
// 获取会后总结
exports.getPostMeeting = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限访问此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid && !((_d = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _d === void 0 ? void 0 : _d.some((p) => p.id === uid))) {
            res.status(403).json({ success: false, error: '无权限访问此会议' });
            return;
        }
        const postMeetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).collection('postMeeting').doc('data').get();
        if (!postMeetingDoc.exists) {
            res.status(404).json({ success: false, error: '会后总结不存在' });
            return;
        }
        res.json({ success: true, data: postMeetingDoc.data() });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('获取会后总结失败:', error);
        res.status(500).json({ success: false, error: '获取会后总结失败' });
    }
});
// 更新总结
exports.updateSummary = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        const { summary } = req.body;
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限操作此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid && !((_d = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _d === void 0 ? void 0 : _d.some((p) => p.id === uid))) {
            res.status(403).json({ success: false, error: '无权限操作此会议' });
            return;
        }
        await firebase_1.db.collection('meetings').doc(meetingId).collection('postMeeting').doc('data').update({
            summary,
            updatedAt: new Date()
        });
        res.json({ success: true, data: { success: true } });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('更新总结失败:', error);
        res.status(500).json({ success: false, error: '更新总结失败' });
    }
});
// 添加反馈
exports.addFeedback = functions.region('asia-east1').https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const meetingId = String(((_a = req.query) === null || _a === void 0 ? void 0 : _a.meetingId) || // GET ?meetingId=...
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.meetingId) || // 非 GET 时从 body
            ((_c = req.path) === null || _c === void 0 ? void 0 : _c.split('/').filter(Boolean).pop()) // /getMeeting/:id 的最后一段
            || '');
        const { content, author, authorInitial } = req.body;
        const uid = await verifyAuth(req); // 验证认证令牌
        // 检查用户是否有权限操作此会议
        const meetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).get();
        if (!meetingDoc.exists) {
            res.status(404).json({ success: false, error: '会议不存在' });
            return;
        }
        const meetingData = meetingDoc.data();
        if ((meetingData === null || meetingData === void 0 ? void 0 : meetingData.createdBy) !== uid && !((_d = meetingData === null || meetingData === void 0 ? void 0 : meetingData.participants) === null || _d === void 0 ? void 0 : _d.some((p) => p.id === uid))) {
            res.status(403).json({ success: false, error: '无权限操作此会议' });
            return;
        }
        const feedback = {
            id: Date.now().toString(),
            meetingid: meetingId,
            author,
            authorInitial,
            content,
            timestamp: new Date().toISOString()
        };
        // 获取现有反馈列表
        const postMeetingDoc = await firebase_1.db.collection('meetings').doc(meetingId).collection('postMeeting').doc('data').get();
        const existingData = postMeetingDoc.data() || { feedbacks: [] };
        // 添加新反馈
        const updatedFeedbacks = [...existingData.feedbacks, feedback];
        await firebase_1.db.collection('meetings').doc(meetingId).collection('postMeeting').doc('data').update({
            feedbacks: updatedFeedbacks,
            updatedAt: new Date()
        });
        res.json({ success: true, data: feedback });
    }
    catch (error) {
        if (error instanceof Error && (error.message === '未提供认证令牌' || error.message === '无效的认证令牌')) {
            res.status(401).json({ success: false, error: error.message });
            return;
        }
        console.error('添加反馈失败:', error);
        res.status(500).json({ success: false, error: '添加反馈失败' });
    }
});
// ==================== 实时监听器 ====================
// 会议状态变更监听
exports.onMeetingStatusChange = functions.firestore.document('meetings/{meetingId}').onUpdate(async (event) => {
    var _a, _b;
    const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if ((beforeData === null || beforeData === void 0 ? void 0 : beforeData.status) !== (afterData === null || afterData === void 0 ? void 0 : afterData.status)) {
        console.log(`会议 ${event.params.meetingId} 状态从 ${beforeData === null || beforeData === void 0 ? void 0 : beforeData.status} 变更为 ${afterData === null || afterData === void 0 ? void 0 : afterData.status}`);
        // 这里可以添加状态变更通知逻辑
    }
});
// 新会议创建监听
exports.onMeetingCreated = functions.firestore.document('meetings/{meetingId}').onCreate(async (event) => {
    var _a;
    const meetingData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    console.log(`新会议创建: ${event.params.meetingId}`, meetingData);
    // 这里可以添加新会议通知逻辑
});
//# sourceMappingURL=old%20legacy%20code(to%20delete).js.map