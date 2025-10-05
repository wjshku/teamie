# Cloud Functions + Firestore 极简后端架构设计

## **1. 技术选型**

| **类型** | **技术选型** | **说明** |
| --- | --- | --- |
| 运行时 | Cloud Functions (Node.js 18) | 无服务器函数，自动扩缩容 |
| 语言 | TypeScript | 类型安全，与前端保持一致 |
| 数据库 | Firestore | NoSQL 文档数据库，实时同步 |
| 认证 | Firebase Auth | 用户认证和授权管理 |
| 部署 | Firebase CLI | 一键部署到 Google Cloud |
| 开发工具 | Firebase Emulator | 本地开发环境 |

## **2. 极简目录结构**

```
/backend
  /functions
    /src
      index.ts                 # 所有 Cloud Functions 入口
      types.ts                 # 类型定义（复用前端）
      utils.ts                 # 工具函数
      firebase.ts              # Firebase 初始化
    package.json
    tsconfig.json
  firebase.json
  .firebaserc
  firestore.rules
  firestore.indexes.json
  env.example
  README.md
```

## **3. 核心实现**

### **3.1 主入口文件 (functions/src/index.ts)**

包含所有 Cloud Functions：
- 用户管理：`createUser`, `getUser`
- 会议管理：`getMeetings`, `createMeeting`, `getMeeting`, `updateMeeting`, `deleteMeeting`
- 会前准备：`createPreMeeting`, `getPreMeeting`, `updateObjective`, `addQuestion`
- 会中笔记：`createInMeeting`, `getInMeeting`, `addNote`
- 会后总结：`createPostMeeting`, `getPostMeeting`, `updateSummary`, `addFeedback`
- 实时监听器：`onMeetingStatusChange`, `onMeetingCreated`

### **3.2 类型定义 (functions/src/types.ts)**

复用前端的类型定义，确保前后端类型一致性：
- 实体类型：`User`, `Meeting`, `PreMeeting`, `InMeeting`, `PostMeeting`
- API 请求/响应类型
- Cloud Functions 特定类型

### **3.3 工具函数 (functions/src/utils.ts)**

通用工具函数：
- 认证验证：`validateAuthToken`
- 响应处理：`sendErrorResponse`, `sendSuccessResponse`
- 数据验证：`validateRequiredFields`, `sanitizeString`
- 分页处理：`createPaginationParams`, `createPaginationResponse`

### **3.4 Firebase 配置 (functions/src/firebase.ts)**

Firebase 初始化和配置：
- Firestore 和 Auth 实例
- 集合名称常量
- 安全规则配置
- 环境变量验证

## **4. 数据模型设计**

### **4.1 Firestore 集合结构**

```typescript
// 用户集合
users: {
  [userId]: {
    id: string;
    name: string;
    avatar?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
}

// 会议集合
meetings: {
  [meetingId]: {
    meetingid: string;
    title: string;
    status: 'scheduled' | 'in-progress' | 'completed';
    time: string;
    participants: User[];
    votelink: string;
    createdBy: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
}

// 会前准备子集合
meetings/{meetingId}/preMeeting: {
  meetingid: string;
  objective: string;
  questions: Question[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 会中笔记子集合
meetings/{meetingId}/inMeeting: {
  meetingid: string;
  notes: Note[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 会后总结子集合
meetings/{meetingId}/postMeeting: {
  meetingid: string;
  summary: string;
  feedbacks: Feedback[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## **5. API 接口设计**

### **5.1 用户管理 API**

| **方法** | **端点** | **描述** | **认证** |
| --- | --- | --- | --- |
| POST | `/createUser` | 创建用户 | 必需 |
| GET | `/getUser` | 获取用户信息 | 必需 |

### **5.2 会议管理 API**

| **方法** | **端点** | **描述** | **认证** |
| --- | --- | --- | --- |
| GET | `/getMeetings` | 获取会议列表 | 必需 |
| POST | `/createMeeting` | 创建会议 | 必需 |
| GET | `/getMeeting` | 获取会议详情 | 必需 |
| PATCH | `/updateMeeting` | 更新会议信息 | 必需 |
| DELETE | `/deleteMeeting` | 删除会议 | 必需 |

### **5.3 会前准备 API**

| **方法** | **端点** | **描述** | **认证** |
| --- | --- | --- | --- |
| POST | `/createPreMeeting` | 创建会前准备 | 必需 |
| GET | `/getPreMeeting` | 获取会前准备 | 必需 |
| PATCH | `/updateObjective` | 更新目标 | 必需 |
| POST | `/addQuestion` | 添加问题 | 必需 |

### **5.4 会中笔记 API**

| **方法** | **端点** | **描述** | **认证** |
| --- | --- | --- | --- |
| POST | `/createInMeeting` | 创建会中笔记 | 必需 |
| GET | `/getInMeeting` | 获取会中笔记 | 必需 |
| POST | `/addNote` | 添加笔记 | 必需 |

### **5.5 会后总结 API**

| **方法** | **端点** | **描述** | **认证** |
| --- | --- | --- | --- |
| POST | `/createPostMeeting` | 创建会后总结 | 必需 |
| GET | `/getPostMeeting` | 获取会后总结 | 必需 |
| PATCH | `/updateSummary` | 更新总结 | 必需 |
| POST | `/addFeedback` | 添加反馈 | 必需 |

## **6. 安全规则**

### **6.1 Firestore 安全规则**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户集合规则
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 会议集合规则
    match /meetings/{meetingId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.createdBy || 
         request.auth.uid in resource.data.participants);
      
      // 子集合规则...
    }
  }
}
```

## **7. 部署和使用**

### **7.1 本地开发**

```bash
# 安装依赖
cd functions
npm install

# 启动本地模拟器
npm run serve

# 前端连接本地后端
# 在 .env 中设置 VITE_API_BASE_URL=http://localhost:5001/your-project-id/asia-east1
```

### **7.2 生产部署**

```bash
# 构建并部署
npm run deploy

# 查看日志
npm run logs
```

## **8. 优势对比**

| **方面** | **原 Express 方案** | **Cloud Functions 方案** |
| --- | --- | --- |
| **文件数量** | 20+ 个文件 | 3-4 个文件 |
| **部署复杂度** | 需要配置服务器 | 一键部署 |
| **扩展性** | 手动管理 | 自动扩缩容 |
| **维护成本** | 高 | 极低 |
| **开发速度** | 慢 | 极快 |
| **成本** | 固定服务器成本 | 按使用量付费 |

## **9. 前端适配**

前端只需要修改 API 基础 URL：

```typescript
// frontend/src/services/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  'https://asia-east1-your-project-id.cloudfunctions.net';
```

## **10. 开发工作流**

1. **本地开发**：使用 Firebase Emulator
2. **代码构建**：TypeScript 编译
3. **测试验证**：本地模拟器测试
4. **部署发布**：Firebase CLI 一键部署
5. **监控维护**：Firebase Console 监控

## **11. 性能优化**

1. **函数优化**：合理设置内存和超时时间
2. **数据库优化**：创建合适的索引
3. **缓存策略**：利用 Firestore 的本地缓存
4. **批处理**：使用 Firestore 批处理操作

## **12. 监控和日志**

- **实时监控**：Firebase Console
- **日志查看**：`firebase functions:log`
- **性能分析**：Cloud Functions 控制台
- **错误追踪**：Firebase Crashlytics

这个极简架构大大简化了开发复杂度，同时保持了所有功能的完整性，非常适合快速开发和部署。
