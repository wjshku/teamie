import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';

// 导入所有路由模块
import userRouter from './user';
import meetingRouter from './meeting';
import meetingInfoRouter from './meetinginfo';
import inMeetingRouter from './inMeeting';
import preMeetingRouter from './preMeeting';
import postMeetingRouter from './postMeeting';
import meetingCapsuleRouter from './meetingCapsule';

// 创建 Express 应用
const app = express();

// 中间件
app.use(cors({
  origin: [
    'http://localhost:5173',  // 前端开发服务器
    'http://localhost:3000',  // 备用端口
    'https://spiffy-tulumba-616f2c.netlify.app', // 生产域名
    'https://*.netlify.app',
    'https://teamie.work',  // 生产域名（如果有）
    'http://teamie.work',
    'https://www.teamie.work',  // 生产域名（如果有）
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 注册路由
app.use('/users', userRouter);
app.use('/meetings', meetingRouter);
app.use('/meetings', meetingInfoRouter);
app.use('/meetings', inMeetingRouter);
app.use('/meetings', preMeetingRouter);
app.use('/meetings', postMeetingRouter);
app.use('/meetingCapsules', meetingCapsuleRouter);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// 导出 Cloud Function
export const api = functions.region('asia-east1').https.onRequest(app);
