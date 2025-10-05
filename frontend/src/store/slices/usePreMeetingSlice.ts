// ==================== PreMeeting Slice ====================
// 会前准备状态管理切片

import { create } from 'zustand';
import { PreMeeting, Question } from '../../types/api';

interface PreMeetingSliceState {
  // 会前准备数据
  preMeeting: PreMeeting | null;
  preMeetingLoading: boolean;
  preMeetingError: string | null;
  
  // 细粒度 loading 状态
  objectiveSaving: boolean;
  questionAdding: boolean;
  objectiveSaved: boolean;
  
  // 会前准备操作
  setPreMeeting: (preMeeting: PreMeeting | null) => void;
  updateObjective: (meetingId: string, objective: string) => void;
  addQuestion: (meetingId: string, question: Question) => void;
  
  // 状态管理
  setPreMeetingLoading: (loading: boolean) => void;
  setPreMeetingError: (error: string | null) => void;
  setObjectiveSaving: (saving: boolean) => void;
  setQuestionAdding: (adding: boolean) => void;
  setObjectiveSaved: (saved: boolean) => void;
}

export const usePreMeetingSlice = create<PreMeetingSliceState>((set) => ({
  // 会前准备数据
  preMeeting: null,
  preMeetingLoading: false,
  preMeetingError: null,
  
  // 细粒度 loading 状态
  objectiveSaving: false,
  questionAdding: false,
  objectiveSaved: false,

  // 会前准备操作
  setPreMeeting: (preMeeting) => {
    set({ preMeeting });
  },
  updateObjective: (meetingId, objective) => {
    set((state) => {
      return {
        preMeeting: state.preMeeting
          ? { ...state.preMeeting, objective }
          : { meetingid: meetingId, objective, questions: [] },
      };
    });
  },

  addQuestion: (meetingId, question) => {
    set((state) => {
      const updatedPreMeeting = state.preMeeting
        ? { ...state.preMeeting, questions: [...state.preMeeting.questions, question] }
        : { meetingid: meetingId, objective: '', questions: [question] };
      
      return {
        preMeeting: updatedPreMeeting,
      };
    });
  },

  // 状态管理
  setPreMeetingLoading: (loading) => {
    set({ preMeetingLoading: loading });
  },

  setPreMeetingError: (error) => {
    set({ preMeetingError: error });
  },
  
  setObjectiveSaving: (saving) => {
    set({ objectiveSaving: saving });
  },
  
  setQuestionAdding: (adding) => {
    set({ questionAdding: adding });
  },
  
  setObjectiveSaved: (saved) => {
    set({ objectiveSaved: saved });
  },
}));
