# Teamie Backend - Cloud Functions

基于 Firebase Cloud Functions + Firestore 的极简后端架构，为 Teamie 会议管理系统提供 API 服务。

## 🚀 技术栈

- **运行时**: Cloud Functions (Node.js 18)
- **语言**: TypeScript 5
- **数据库**: Firestore (NoSQL)
- **认证**: Firebase Auth
- **部署**: Firebase CLI

## 📁 项目结构

```
/backend
  /functions
    /src
      index.ts          # 所有 Cloud Functions 入口
      types.ts          # 类型定义
      utils.ts          # 工具函数
      firebase.ts       # Firebase 配置
    package.json        # 依赖配置
    tsconfig.json       # TypeScript 配置
  firebase.json         # Firebase 项目配置
  .firebaserc          # Firebase 项目 ID
  firestore.rules      # Firestore 安全规则
  firestore.indexes.json # Firestore 索引配置
  env.example          # 环境变量示例
  README.md            # 项目文档
```

## 🛠️ 快速开始

### 1. 环境准备

```bash
# 安装 Firebase CLI
npm install -g firebase-tools

# 登录 Firebase
firebase login

# 安装项目依赖
cd functions
npm install
```

### 2. 环境配置

```bash
# 复制环境变量文件
cp env.example .env

# 编辑环境变量
# 填入你的 Firebase 项目配置
```

### 3. 本地开发

```bash
# 启动本地模拟器
npm run serve

# 或者分别启动
firebase emulators:start --only functions,firestore
```

### 4. 构建和部署

```bash
# 构建项目
npm run build

# 部署到 Firebase
npm run deploy

# 部署所有资源
npm run deploy:all
```

## 📋 API 接口

### 用户管理

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/createUser` | 创建用户 |
| GET | `/getUser` | 获取用户信息 |

### 会议管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/getMeetings` | 获取会议列表 |
| POST | `/createMeeting` | 创建会议 |
| GET | `/getMeeting` | 获取会议详情 |
| PATCH | `/updateMeeting` | 更新会议 |
| DELETE | `/deleteMeeting` | 删除会议 |

### 会前准备

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/createPreMeeting` | 创建会前准备 |
| GET | `/getPreMeeting` | 获取会前准备 |
| PATCH | `/updateObjective` | 更新目标 |
| POST | `/addQuestion` | 添加问题 |

### 会中笔记

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/createInMeeting` | 创建会中笔记 |
| GET | `/getInMeeting` | 获取会中笔记 |
| POST | `/addNote` | 添加笔记 |

### 会后总结

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/createPostMeeting` | 创建会后总结 |
| GET | `/getPostMeeting` | 获取会后总结 |
| PATCH | `/updateSummary` | 更新总结 |
| POST | `/addFeedback` | 添加反馈 |

## 🔧 开发命令

```bash
# 开发相关
npm run build          # 构建项目
npm run build:watch    # 监听模式构建
npm run serve          # 启动本地模拟器

# 部署相关
npm run deploy         # 部署 Functions
npm run deploy:all     # 部署所有资源

# 调试相关
npm run logs           # 查看日志
npm run logs:follow    # 实时查看日志

# 代码质量
npm run lint           # 代码检查
npm run lint:fix       # 自动修复
npm test               # 运行测试
```

## 🔐 安全规则

项目使用 Firestore 安全规则确保数据安全：

- 用户只能访问自己的数据
- 会议创建者可以管理会议
- 会议参与者可以查看和参与会议
- 所有操作都需要 Firebase Auth 认证

## 📊 数据模型

### 用户 (users)
```typescript
{
  id: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 会议 (meetings)
```typescript
{
  meetingid: string;
  title: string;
  status: string;
  time: string;
  participants: User[];
  votelink: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 会前准备 (preMeeting)
```typescript
{
  meetingid: string;
  objective: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🌐 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `FIREBASE_PROJECT_ID` | Firebase 项目 ID | ✅ |
| `FIREBASE_PRIVATE_KEY` | Firebase 私钥 | ✅ |
| `FIREBASE_CLIENT_EMAIL` | Firebase 客户端邮箱 | ✅ |
| `NODE_ENV` | 环境模式 | ❌ |
| `LOG_LEVEL` | 日志级别 | ❌ |

## 🚀 部署到生产环境

1. **设置 Firebase 项目**
   ```bash
   firebase use your-production-project-id
   ```

2. **配置环境变量**
   ```bash
   firebase functions:config:set app.environment="production"
   ```

3. **部署**
   ```bash
   npm run deploy:all
   ```

## 📈 监控和日志

- **日志查看**: `firebase functions:log`
- **实时监控**: Firebase Console
- **性能监控**: Cloud Functions 控制台

## 🔄 与前端集成

前端需要配置 API 基础 URL：

```typescript
// frontend/.env
VITE_API_BASE_URL=https://asia-east1-your-project-id.cloudfunctions.net
```

## 🐛 故障排除

### 常见问题

1. **认证失败**
   - 检查 Firebase 项目配置
   - 确认环境变量设置正确

2. **权限错误**
   - 检查 Firestore 安全规则
   - 确认用户已正确认证

3. **函数超时**
   - 检查函数执行时间
   - 考虑优化数据库查询

### 调试技巧

```bash
# 查看详细日志
firebase functions:log --only your-function-name

# 本地调试
firebase emulators:start --inspect-functions
```

## 📝 更新日志

- **v1.0.0** - 初始版本，包含完整的会议管理功能

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
