# Teamie Frontend

小组合作软件前端项目，基于 React + TypeScript + Vite 构建。

## 技术栈

- **前端框架**: React 18
- **状态管理**: Zustand
- **路由**: React Router v6
- **样式**: TailwindCSS
- **UI 组件**: shadcn/ui
- **构建工具**: Vite
- **类型检查**: TypeScript 5
- **HTTP 请求**: Axios

## 项目结构

```
src/
├── components/           # 组件目录
│   ├── atoms/           # 原子组件
│   ├── molecules/       # 分子组件
│   ├── organisms/       # 有机体组件
│   ├── templates/       # 模板组件
│   └── pages/           # 页面组件
├── hooks/               # 自定义 Hooks
├── services/            # API 服务
├── store/               # 状态管理
├── utils/               # 工具函数
├── styles/              # 样式文件
└── router/              # 路由配置
```

## 开发指南

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

### 构建生产版本

```bash
npm run build
# 或
pnpm build
```

### 代码检查

```bash
npm run lint
# 或
pnpm lint
```

## 环境变量

复制 `env.example` 文件为 `.env.local` 并配置相应的环境变量：

```bash
cp env.example .env.local
```

## 组件开发规范

### Atomic Design 原则

1. **Atoms（原子）**: 最小 UI 单元，如按钮、输入框
2. **Molecules（分子）**: 由原子组合的功能模块
3. **Organisms（有机体）**: 组合分子的功能区块
4. **Templates（模板）**: 页面骨架
5. **Pages（页面）**: 具体页面，绑定路由和业务数据

### 命名规范

- 组件文件：PascalCase（如 `MeetingListItem.tsx`）
- Hooks：useXxx（如 `useMeetingData.ts`）
- 变量/函数：camelCase（如 `fetchMeetingList`）
- 常量：UPPER_SNAKE_CASE（如 `API_BASE_URL`）

### 样式规范

- 使用 TailwindCSS 原子化样式
- 组件级样式封装在 `@layer components` 中
- 遵循设计系统规范

## API 接口

项目使用 Firebase 作为后端服务，主要接口包括：

- 用户认证：`/api/user/login`
- 会议管理：`/api/meeting/*`
- 认证服务：`/api/auth/*`

详细接口文档请参考技术文档。

## 状态管理

使用 Zustand 进行状态管理：

- `useUserStore`: 用户信息和认证状态
- `useMeetingStore`: 会议数据和状态

## 路由配置

- `/`: 首页
- `/create`: 创建会议
- `/meeting/:id`: 会议大厅
- `/personal`: 个人中心

## 开发注意事项

1. 所有组件都需要 TypeScript 类型定义
2. 使用函数式组件和 Hooks
3. 遵循 React 最佳实践
4. 保持组件的单一职责原则
5. 合理使用状态管理，避免过度使用全局状态

## 部署

构建完成后，将 `dist` 目录部署到静态文件服务器即可。

## 许可证

MIT License
