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
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
// ==================== CORS 配置 ====================
/**
 * 设置 CORS 头部
 */
const setCorsHeaders = (res, req) => {
    // 允许的域名列表
    const allowedOrigins = [
        'http://localhost:5173', // Vite 开发服务器
    ];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
    }
    else {
        // 开发环境：允许所有本地域名
        if (process.env.NODE_ENV === 'development') {
            res.set('Access-Control-Allow-Origin', '*');
        }
    }
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
};
/**
 * 处理预检请求
 */
const handleCors = (req, res) => {
    setCorsHeaders(res, req);
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return true;
    }
    return false;
};
// ==================== 导入所有函数 ====================
// 用户相关函数
const index_1 = require("./index");
// 会议相关函数
const index_2 = require("./index");
// 会前准备函数
const index_3 = require("./index");
// 会中笔记函数
const index_4 = require("./index");
// 会后总结函数
const index_5 = require("./index");
// ==================== REST API 路由 ====================
/**
 * 统一的 REST API 入口
 */
exports.api = functions.region('asia-east1').https.onRequest(async (req, res) => {
    // 处理 CORS
    if (handleCors(req, res))
        return;
    setCorsHeaders(res, req);
    try {
        const { method, path } = req;
        const pathSegments = path.split('/').filter(segment => segment);
        // 路由分发
        switch (pathSegments[0]) {
            case 'users':
                await handleUserRoutes(req, res, method, pathSegments);
                break;
            case 'meetings':
                await handleMeetingRoutes(req, res, method, pathSegments);
                break;
            default:
                res.status(404).json({ success: false, error: '接口不存在' });
        }
    }
    catch (error) {
        console.error('API 错误:', error);
        res.status(500).json({ success: false, error: '服务器内部错误' });
    }
});
// ==================== 用户路由处理 ====================
async function handleUserRoutes(req, res, method, pathSegments) {
    switch (method) {
        case 'POST':
            // POST /users - 创建用户
            await (0, index_1.createUser)(req, res);
            break;
        case 'GET':
            if (pathSegments.length === 2) {
                // GET /users/{userId} - 获取用户信息
                req.params = { userId: pathSegments[1] };
                await (0, index_1.getUser)(req, res);
            }
            else {
                res.status(404).json({ success: false, error: '用户接口不存在' });
            }
            break;
        default:
            res.status(405).json({ success: false, error: '方法不允许' });
    }
}
// ==================== 会议路由处理 ====================
async function handleMeetingRoutes(req, res, method, pathSegments) {
    switch (method) {
        case 'GET':
            if (pathSegments.length === 1) {
                // GET /meetings - 获取会议列表
                await (0, index_2.getMeetings)(req, res);
            }
            else if (pathSegments.length === 2) {
                // GET /meetings/{meetingId} - 获取会议详情
                req.params = { meetingId: pathSegments[1] };
                await (0, index_2.getMeeting)(req, res);
            }
            else if (pathSegments.length === 3) {
                // GET /meetings/{meetingId}/preMeeting - 获取会前准备
                if (pathSegments[2] === 'preMeeting') {
                    req.params = { meetingId: pathSegments[1] };
                    await (0, index_3.getPreMeeting)(req, res);
                }
                // GET /meetings/{meetingId}/inMeeting - 获取会中笔记
                else if (pathSegments[2] === 'inMeeting') {
                    req.params = { meetingId: pathSegments[1] };
                    await (0, index_4.getInMeeting)(req, res);
                }
                // GET /meetings/{meetingId}/postMeeting - 获取会后总结
                else if (pathSegments[2] === 'postMeeting') {
                    req.params = { meetingId: pathSegments[1] };
                    await (0, index_5.getPostMeeting)(req, res);
                }
                else {
                    res.status(404).json({ success: false, error: '会议子接口不存在' });
                }
            }
            else {
                res.status(404).json({ success: false, error: '会议接口不存在' });
            }
            break;
        case 'POST':
            if (pathSegments.length === 1) {
                // POST /meetings - 创建会议
                await (0, index_2.createMeeting)(req, res);
            }
            else if (pathSegments.length === 3) {
                // POST /meetings/{meetingId}/preMeeting - 创建会前准备
                if (pathSegments[2] === 'preMeeting') {
                    req.params = { meetingId: pathSegments[1] };
                    await (0, index_3.createPreMeeting)(req, res);
                }
                // POST /meetings/{meetingId}/inMeeting - 创建会中笔记
                else if (pathSegments[2] === 'inMeeting') {
                    req.params = { meetingId: pathSegments[1] };
                    await (0, index_4.createInMeeting)(req, res);
                }
                // POST /meetings/{meetingId}/postMeeting - 创建会后总结
                else if (pathSegments[2] === 'postMeeting') {
                    req.params = { meetingId: pathSegments[1] };
                    await (0, index_5.createPostMeeting)(req, res);
                }
                // POST /meetings/{meetingId}/questions - 添加问题
                else if (pathSegments[2] === 'questions') {
                    req.params = { meetingId: pathSegments[1] };
                    await (0, index_3.addQuestion)(req, res);
                }
                // POST /meetings/{meetingId}/notes - 添加笔记
                else if (pathSegments[2] === 'notes') {
                    req.params = { meetingId: pathSegments[1] };
                    await (0, index_4.addNote)(req, res);
                }
                // POST /meetings/{meetingId}/feedbacks - 添加反馈
                else if (pathSegments[2] === 'feedbacks') {
                    req.params = { meetingId: pathSegments[1] };
                    await (0, index_5.addFeedback)(req, res);
                }
                else {
                    res.status(404).json({ success: false, error: '会议子接口不存在' });
                }
            }
            else {
                res.status(404).json({ success: false, error: '会议接口不存在' });
            }
            break;
        case 'PATCH':
            if (pathSegments.length === 2) {
                // PATCH /meetings/{meetingId} - 更新会议
                req.params = { meetingId: pathSegments[1] };
                await (0, index_2.updateMeeting)(req, res);
            }
            else if (pathSegments.length === 3) {
                // PATCH /meetings/{meetingId}/objective - 更新目标
                if (pathSegments[2] === 'objective') {
                    req.params = { meetingId: pathSegments[1] };
                    await (0, index_3.updateObjective)(req, res);
                }
                // PATCH /meetings/{meetingId}/summary - 更新总结
                else if (pathSegments[2] === 'summary') {
                    req.params = { meetingId: pathSegments[1] };
                    await (0, index_5.updateSummary)(req, res);
                }
                else {
                    res.status(404).json({ success: false, error: '会议子接口不存在' });
                }
            }
            else {
                res.status(404).json({ success: false, error: '会议接口不存在' });
            }
            break;
        case 'DELETE':
            if (pathSegments.length === 2) {
                // DELETE /meetings/{meetingId} - 删除会议
                req.params = { meetingId: pathSegments[1] };
                await (0, index_2.deleteMeeting)(req, res);
            }
            else {
                res.status(404).json({ success: false, error: '会议接口不存在' });
            }
            break;
        default:
            res.status(405).json({ success: false, error: '方法不允许' });
    }
}
//# sourceMappingURL=restApi.js.map