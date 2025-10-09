// ==================== Meeting Slice ====================
// 基础会议状态管理切片

import { create } from 'zustand';
import { Meeting } from '../../types/api';

interface MeetingSliceState {
  // 基础会议数据
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
  
  // 基础会议操作
  setMeetings: (meetings: Meeting[]) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeetingInList: (meetingId: string, updates: Partial<Meeting>) => void;
  removeMeeting: (meetingId: string) => void;
  
  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useMeetingSlice = create<MeetingSliceState>((set) => ({
  // 基础会议数据
  meetings: [],
  loading: false,
  error: null,

  // 基础会议操作
  setMeetings: (meetings) => {
    set({ meetings });
  },

  addMeeting: (meeting) => {
    set((state) => ({
      meetings: [meeting, ...state.meetings],
    }));
  },

  updateMeetingInList: (meetingId, updates) => {
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.meetingid === meetingId ? { ...m, ...updates } : m
      ),
    }));
  },

  removeMeeting: (meetingId) => {
    set((state) => ({
      meetings: state.meetings.filter((m) => m.meetingid !== meetingId),
    }));
  },

  // 状态管理
  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
