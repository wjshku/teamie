# Hooks Documentation

## 概述

这个目录包含了所有自定义React hooks，用于管理应用状态和API调用。所有hooks都遵循React最佳实践，使用useCallback进行性能优化。

## Hooks列表

### 1. 认证相关Hooks

#### useAuth
管理用户认证状态和操作。

**功能：**
- 用户登录
- 用户登出

**使用示例：**
```typescript
import { useAuth } from '@/hooks';

const { user, isAuthenticated, loginUser, logout } = useAuth();
```

### 2. 会议相关Hooks

#### useMeetings
管理基础会议数据和操作。

**功能：**
- 获取会议列表
- 创建会议
- 获取会议详情
- 更新会议
- 删除会议

**使用示例：**
```typescript
import { useMeetings } from '@/hooks';

const { 
  meetings, 
  currentMeeting, 
  loading, 
  error,
  fetchMeetings,
  createNewMeeting,
  fetchMeetingDetails,
  updateMeetingData,
  deleteMeetingData,
  clearError 
} = useMeetings();
```

#### usePreMeeting
管理会前准备数据和操作。

**功能：**
- 获取会前准备信息
- 创建会前准备信息
- 更新会前准备信息
- 添加问题
- 更新问题
- 删除问题

**使用示例：**
```typescript
import { usePreMeeting } from '@/hooks';

const { 
  preMeeting,
  preMeetingLoading,
  preMeetingError,
  fetchPreMeeting,
  createPreMeetingData,
  updatePreMeetingData,
  addQuestionData,
  updateQuestionData,
  deleteQuestionData 
} = usePreMeeting(meetingId);
```

#### useInMeeting
管理会中笔记数据和操作。

**功能：**
- 获取会中笔记信息
- 创建会中笔记信息
- 更新会中笔记信息
- 添加笔记
- 更新笔记
- 删除笔记
- 获取所有笔记

**使用示例：**
```typescript
import { useInMeeting } from '@/hooks';

const { 
  inMeeting,
  inMeetingLoading,
  inMeetingError,
  fetchInMeeting,
  createInMeetingData,
  updateInMeetingData,
  addNoteData,
  updateNoteData,
  deleteNoteData,
  fetchNotes 
} = useInMeeting(meetingId);
```

#### usePostMeeting
管理会后总结数据和操作。

**功能：**
- 获取会后总结信息
- 创建会后总结信息
- 更新会后总结信息
- 添加反馈
- 更新反馈
- 删除反馈

**使用示例：**
```typescript
import { usePostMeeting } from '@/hooks';

const { 
  postMeeting,
  postMeetingLoading,
  postMeetingError,
  fetchPostMeeting,
  createPostMeetingData,
  updatePostMeetingData,
  addFeedbackData,
  updateFeedbackData,
  deleteFeedbackData 
} = usePostMeeting(meetingId);
```

## 最佳实践

### 1. 性能优化
- 所有 hooks 都使用 `useCallback` 进行函数记忆化
- 避免在渲染过程中创建新对象

### 2. 错误处理
- 所有异步操作都有错误处理
- 提供 `clearError` 方法清理错误状态

### 3. 状态管理
- 使用 Zustand 进行状态管理
- 状态自动持久化到 localStorage

### 4. 类型安全
- 所有 hooks 都有完整的 TypeScript 类型定义
- 提供类型安全的 API 接口

## 注意事项

1. **依赖关系**：确保在使用 hooks 前正确导入
2. **生命周期**：hooks 在组件卸载时会自动清理
3. **状态同步**：状态变化会自动触发组件重新渲染
4. **错误边界**：建议在应用顶层添加错误边界处理