# API Services Documentation

## 概述

这个目录包含了与后端API完全匹配的服务层实现。所有API接口都基于数据接口文档设计，支持mock数据和真实API调用。

## 目录结构

```
src/services/api/
├── index.ts              # 统一导出
├── userService.ts        # 用户相关API
├── meetingService.ts     # 会议相关API
├── preMeetingService.ts  # 会前准备API
├── inMeetingService.ts   # 会中笔记API
├── postMeetingService.ts # 会后总结API
├── mockData.ts          # 所有mock数据
└── README.md            # 本文档
```

## 环境配置

### Mock数据模式
在开发环境中，默认使用mock数据。可以通过环境变量控制：

```bash
# .env.local
VITE_USE_MOCK_DATA=true  # 使用mock数据
VITE_USE_MOCK_DATA=false # 使用真实API
```

### API基础URL
```bash
VITE_API_BASE_URL=/api  # API基础路径
```

## API服务说明

### 1. 用户服务 (userService.ts)

- `getUsers()` - 获取所有用户列表
- `createUser(userData)` - 创建新用户
- `getUserById(userId)` - 根据ID获取用户信息
- `updateUser(userId, userData)` - 更新用户信息
- `deleteUser(userId)` - 删除用户

### 2. 会议服务 (meetingService.ts)

- `getMeetings()` - 获取所有会议列表
- `createMeeting(meetingData)` - 创建新会议
- `getMeetingById(meetingId)` - 根据ID获取会议详情
- `updateMeeting(meetingId, meetingData)` - 更新会议信息
- `deleteMeeting(meetingId)` - 删除会议
- `updateMeetingStatus(meetingId, status)` - 更新会议状态

### 3. 会前准备服务 (preMeetingService.ts)

- `getPreMeeting(meetingId)` - 获取会前准备信息
- `createPreMeeting(meetingId, preMeetingData)` - 创建会前准备信息
- `updatePreMeeting(meetingId, preMeetingData)` - 更新会前准备信息
- `addQuestion(meetingId, questionData)` - 添加问题
- `updateQuestion(meetingId, questionId, questionData)` - 更新问题
- `deleteQuestion(meetingId, questionId)` - 删除问题

### 4. 会中笔记服务 (inMeetingService.ts)

- `getInMeeting(meetingId)` - 获取会中笔记信息
- `createInMeeting(meetingId, inMeetingData)` - 创建会中笔记信息
- `addNote(meetingId, noteData)` - 添加笔记
- `updateNote(meetingId, noteId, noteData)` - 更新笔记
- `deleteNote(meetingId, noteId)` - 删除笔记
- `getNotes(meetingId)` - 获取所有笔记

### 5. 会后总结服务 (postMeetingService.ts)

- `getPostMeeting(meetingId)` - 获取会后总结信息
- `createPostMeeting(meetingId, postMeetingData)` - 创建会后总结信息
- `updatePostMeeting(meetingId, postMeetingData)` - 更新会后总结信息
- `addFeedback(meetingId, feedbackData)` - 添加反馈
- `updateFeedback(meetingId, feedbackId, feedbackData)` - 更新反馈
- `deleteFeedback(meetingId, feedbackId)` - 删除反馈
- `getFeedbacks(meetingId)` - 获取所有反馈

## 类型定义

所有类型定义都在 `src/types/api.ts` 中，包括：

- `User` - 用户类型
- `Meeting` - 会议类型
- `PreMeeting` - 会前准备类型
- `InMeeting` - 会中笔记类型
- `PostMeeting` - 会后总结类型
- `Question` - 问题类型
- `Note` - 笔记类型
- `Feedback` - 反馈类型

## 使用示例

```typescript
import { getMeetings, createMeeting, getPreMeeting } from '@/services/api';

// 获取会议列表
const meetings = await getMeetings();

// 创建新会议
const newMeeting = await createMeeting({
  title: '新会议',
  time: '2024-01-15T14:00:00Z',
  participants: [],
  votelink: 'https://vote.teamie.com/meeting/123'
});

// 获取会前准备信息
const preMeeting = await getPreMeeting('meeting-id');
```

## 向后兼容

为了保持向后兼容，原有的 `meetingService.ts` 和 `userService.ts` 文件仍然存在，但内部已经重构为使用新的API服务。这样可以确保现有组件无需修改即可继续工作。

## 错误处理

所有API函数都包含完整的错误处理，包括：

- 网络错误
- 认证错误
- 数据验证错误
- 服务器错误

错误会通过console.error记录，并向上抛出供调用方处理。

## Mock数据

Mock数据完全匹配API文档的结构，包含：

- 3个示例用户
- 3个示例会议（包含完整的嵌套数据）
- 示例问题、笔记、反馈数据
- 辅助函数用于生成ID和时间戳

## 开发建议

1. **优先使用新的API服务**：新功能应该直接使用 `src/services/api/` 中的服务
2. **逐步迁移**：可以逐步将现有组件迁移到新的API服务
3. **类型安全**：始终使用TypeScript类型定义
4. **错误处理**：在组件中正确处理API错误
5. **测试**：为API服务编写单元测试
