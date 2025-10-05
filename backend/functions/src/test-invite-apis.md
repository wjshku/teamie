# 邀请链接API测试文档

## API 端点

### 1. 生成邀请链接
**POST** `/meetings/{meetingId}/invite-link`

**请求头:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**请求体:**
```json
{}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "invite_link": "/meetings/join?token=abc123xyz",
    "token": "abc123xyz"
  }
}
```

### 2. 通过token加入会议
**GET** `/meetings/join?token=abc123xyz`

**请求头:**
```
Authorization: Bearer <user_token>  // 可选，未登录用户也可以访问
```

**响应:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "meeting": {
      "meetingid": "meeting123",
      "title": "项目讨论会议",
      "status": "scheduled",
      "time": "2024-01-15T14:00:00Z",
      "participants": [
        {
          "id": "user1",
          "name": "张三",
          "avatar": "avatar_url"
        }
      ],
      "votelink": "",
      "createdBy": "user1",
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z"
    },
    "isParticipant": true,
    "message": "已成功加入会议"
  }
}
```

## 测试场景

### 场景1: 正常生成邀请链接
1. 创建会议
2. 以会议创建者身份生成邀请链接
3. 验证返回的链接格式正确

### 场景2: 权限验证
1. 以非会议创建者身份尝试生成邀请链接
2. 验证返回403错误

### 场景3: 通过邀请链接加入会议
1. 使用有效的token访问加入接口
2. 验证已登录用户被自动添加到参与者列表
3. 验证未登录用户收到登录提示


## 数据库结构

### meeting_invites 集合
```json
{
  "id": "invite123",
  "meetingId": "meeting123",
  "token": "abc123xyz",
  "createdAt": "2024-01-10T10:00:00Z",
  "status": "active",
  "usedCount": 0
}
```

## 前端使用说明

后端返回相对路径 `/meetings/join?token=abc123xyz`，前端需要：

1. 获取当前域名
2. 组合完整URL：`${window.location.origin}/meetings/join?token=abc123xyz`
3. 或者使用路由配置生成完整链接

**示例：**
```javascript
const response = await fetch('/api/meetings/meeting123/invite-link');
const data = await response.json();
const fullUrl = `${window.location.origin}${data.invite_link}`;
// 结果: https://yourapp.com/meetings/join?token=abc123xyz
```
