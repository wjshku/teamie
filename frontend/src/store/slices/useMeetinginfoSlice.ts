// ==================== Meeting Info Slice ====================
// 单个会议详情状态管理

import { create } from 'zustand';
import { Meeting } from '../../types/api';

interface MeetingInfoSliceState {
  currentMeeting: Meeting | null;
  loading: boolean;
  error: string | null;

  setCurrentMeeting: (meeting: Meeting | null) => void;
  updateCurrentMeeting: (updates: Partial<Meeting>) => void;
  clearCurrentMeeting: () => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useMeetinginfoSlice = create<MeetingInfoSliceState>((set) => ({
  currentMeeting: null,
  loading: false,
  error: null,

  setCurrentMeeting: (meeting) => {
    set({ currentMeeting: meeting });
  },

  updateCurrentMeeting: (updates) => {
    set((state) => ({
      currentMeeting: state.currentMeeting
        ? { ...state.currentMeeting, ...updates }
        : state.currentMeeting,
    }));
  },

  clearCurrentMeeting: () => {
    set({ currentMeeting: null });
  },

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


