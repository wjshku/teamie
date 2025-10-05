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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// 导入所有路由模块
const user_1 = __importDefault(require("./user"));
const meeting_1 = __importDefault(require("./meeting"));
const meetinginfo_1 = __importDefault(require("./meetinginfo"));
const inMeeting_1 = __importDefault(require("./inMeeting"));
const preMeeting_1 = __importDefault(require("./preMeeting"));
const postMeeting_1 = __importDefault(require("./postMeeting"));
// 创建 Express 应用
const app = (0, express_1.default)();
// 中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 注册路由
app.use('/users', user_1.default);
app.use('/meetings', meeting_1.default);
app.use('/meetings', meetinginfo_1.default);
app.use('/meetings', inMeeting_1.default);
app.use('/meetings', preMeeting_1.default);
app.use('/meetings', postMeeting_1.default);
// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 404 处理
app.use('*', (req, res) => {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
});
// 导出 Cloud Function
exports.api = functions.region('asia-east1').https.onRequest(app);
//# sourceMappingURL=index.js.map