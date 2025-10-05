// ==================== Mock Data ====================
// 用于开发环境的模拟数据，完全匹配API文档结构

import {
  User,
  Question,
  Note,
  Feedback,
  PreMeeting,
  InMeeting,
  PostMeeting,
  Meeting,
} from '../../types/api';

// ----------------- Mock Users -----------------
export const mockUsers: User[] = [
  { id: '1', name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan' },
  { id: '2', name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi' },
  { id: '3', name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu' },
  { id: '4', name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu' },
];

// ----------------- Mock Questions -----------------
export const mockQuestions: Question[] = [
  {
    id: '1',
    meetingid: '1',
    author: '张三',
    authorInitial: '张',
    content: 'Q1产品的核心功能有哪些？优先级如何排序？',
    timestamp: '2024-01-15T14:00:00Z'
  },
  {
    id: '2',
    meetingid: '1',
    author: '李四',
    authorInitial: '李',
    content: '技术实现上有什么挑战？需要哪些资源支持？',
    timestamp: '2024-01-15T14:15:00Z'
  },
  {
    id: '3',
    meetingid: '1',
    author: '王五',
    authorInitial: '王',
    content: '市场推广策略是什么？预算如何分配？',
    timestamp: '2024-01-15T14:30:00Z'
  }
];

// ----------------- Mock Notes -----------------
export const mockNotes: Note[] = [
  {
    id: '1',
    meetingid: '1',
    author: '张三',
    authorInitial: '张',
    content: '产品功能讨论：确定了核心功能的优先级排序',
    timestamp: '2024-01-15T15:00:00Z'
  },
  {
    id: '2',
    meetingid: '1',
    author: '李四',
    authorInitial: '李',
    content: '技术方案：后端架构采用微服务，前端使用React',
    timestamp: '2024-01-15T15:15:00Z'
  },
  {
    id: '3',
    meetingid: '1',
    author: '王五',
    authorInitial: '王',
    content: '市场策略：分阶段推广，先小范围测试再全面推广',
    timestamp: '2024-01-15T15:30:00Z'
  }
];

// ----------------- Mock Feedback -----------------
export const mockFeedback: Feedback[] = [
  {
    id: '1',
    meetingid: '1',
    author: '张三',
    authorInitial: '张',
    content: '会议很有成效，明确了产品方向',
    timestamp: '2024-01-15T16:00:00Z'
  },
  {
    id: '2',
    meetingid: '1',
    author: '李四',
    authorInitial: '李',
    content: '技术方案可行，建议增加性能测试',
    timestamp: '2024-01-15T16:05:00Z'
  },
  {
    id: '3',
    meetingid: '1',
    author: '王五',
    authorInitial: '王',
    content: '市场策略合理，需要更多数据支持',
    timestamp: '2024-01-15T16:10:00Z'
  }
];

// ----------------- Mock PreMeeting -----------------
export const mockPreMeeting: PreMeeting = {
  meetingid: '1',
  objective: '讨论产品功能规划和技术实现方案',
  questions: mockQuestions
};

// ----------------- Mock InMeeting -----------------
export const mockInMeeting: InMeeting = {
  meetingid: '1',
  notes: mockNotes
};

// ----------------- Mock PostMeeting -----------------
export const mockPostMeeting: PostMeeting = {
  meetingid: '1',
  summary: '本次会议成功确定了产品核心功能优先级，技术架构采用微服务+React方案，市场推广分阶段进行。下一步需要制定详细的技术实施计划和市场推广时间表。',
  feedbacks: mockFeedback
};

// ----------------- Mock Meetings -----------------
export const mockMeetings: Meeting[] = [
  {
    meetingid: '1',
    title: '产品功能规划会议',
    status: '进行中',
    time: '2024-01-15T14:00:00Z',
    participants: [mockUsers[0], mockUsers[1], mockUsers[2]],
    votelink: 'https://vote.teamie.com/meeting/1',
    preMeeting: mockPreMeeting,
    inMeeting: mockInMeeting,
    postMeeting: mockPostMeeting
  },
  {
    meetingid: '2',
    title: '技术架构评审',
    status: '已结束',
    time: '2024-01-14T09:00:00Z',
    participants: [mockUsers[1], mockUsers[2], mockUsers[3]],
    votelink: 'https://vote.teamie.com/meeting/2',
    preMeeting: {
      meetingid: '2',
      objective: '评审技术架构方案',
      questions: [
        {
          id: '4',
          meetingid: '2',
          author: '李四',
          authorInitial: '李',
          content: '微服务架构的复杂度如何控制？',
          timestamp: '2024-01-14T09:00:00Z'
        }
      ]
    }
  },
  {
    meetingid: '3',
    title: '团队站会',
    status: '已结束',
    time: '2024-01-13T09:00:00Z',
    participants: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3]],
    votelink: 'https://vote.teamie.com/meeting/3'
  }
];

// ----------------- Helper Functions -----------------
export const findUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const findMeetingById = (id: string): Meeting | undefined => {
  return mockMeetings.find(meeting => meeting.meetingid === id);
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
