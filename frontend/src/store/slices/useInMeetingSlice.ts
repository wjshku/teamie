// ==================== InMeeting Slice ====================
// 会中笔记状态管理切片

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InMeeting, Note } from '../../types/api';

interface InMeetingSliceState {
  // 会中笔记数据
  inMeeting: InMeeting | null;
  inMeetingLoading: boolean;
  inMeetingError: string | null;

  // 细粒度 loading 状态
  noteAdding: boolean;

  // 会中笔记操作
  setInMeeting: (inMeeting: InMeeting | null) => void;
  addNote: (meetingId: string, note: Note) => void;

  // 状态管理
  setInMeetingLoading: (loading: boolean) => void;
  setInMeetingError: (error: string | null) => void;
  setNoteAdding: (adding: boolean) => void;
}

export const useInMeetingSlice = create<InMeetingSliceState>()(
  persist(
    (set) => ({
      // 会中笔记数据
      inMeeting: null,
      inMeetingLoading: false,
      inMeetingError: null,

      // 细粒度 loading 状态
      noteAdding: false,

      // 会中笔记操作
      setInMeeting: (inMeeting) => {
        set({ inMeeting });
      },

      addNote: (meetingId, note) => {
        set((state) => {
          const updatedInMeeting = state.inMeeting
            ? { ...state.inMeeting, notes: [...state.inMeeting.notes, note] }
            : { meetingid: meetingId, notes: [note] };

          return {
            inMeeting: updatedInMeeting,
          };
        });
      },

      // 状态管理
      setInMeetingLoading: (loading) => {
        set({ inMeetingLoading: loading });
      },

      setInMeetingError: (error) => {
        set({ inMeetingError: error });
      },

      setNoteAdding: (adding) => {
        set({ noteAdding: adding });
      },
    }),
    {
      name: 'inmeeting-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        inMeeting: state.inMeeting
      }),
    }
  )
);
