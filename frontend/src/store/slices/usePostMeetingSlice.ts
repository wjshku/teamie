// ==================== PostMeeting Slice ====================
// 会后总结状态管理切片

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PostMeeting, Feedback } from '../../types/api';

interface PostMeetingSliceState {
  // 会后总结数据
  postMeeting: PostMeeting | null;
  postMeetingLoading: boolean;
  postMeetingError: string | null;

  // 细粒度 loading 状态
  summarySaving: boolean;
  feedbackAdding: boolean;
  summarySaved: boolean;

  // 会后总结操作
  setPostMeeting: (postMeeting: PostMeeting | null) => void;
  updateSummary: (meetingId: string, summary: string) => void;
  addFeedback: (meetingId: string, feedback: Feedback) => void;

  // 状态管理
  setPostMeetingLoading: (loading: boolean) => void;
  setPostMeetingError: (error: string | null) => void;
  setSummarySaving: (saving: boolean) => void;
  setFeedbackAdding: (adding: boolean) => void;
  setSummarySaved: (saved: boolean) => void;
}

export const usePostMeetingSlice = create<PostMeetingSliceState>()(
  persist(
    (set) => ({
      // 会后总结数据
      postMeeting: null,
      postMeetingLoading: false,
      postMeetingError: null,

      // 细粒度 loading 状态
      summarySaving: false,
      feedbackAdding: false,
      summarySaved: false,

      // 会后总结操作
      setPostMeeting: (postMeeting) => {
        set({ postMeeting });
      },

      updateSummary: (meetingId, summary) => {
        set((state) => {
          return {
            postMeeting: state.postMeeting
              ? { ...state.postMeeting, summary }
              : { meetingid: meetingId, summary, feedbacks: [] },
          };
        });
      },

      addFeedback: (meetingId, feedback) => {
        set((state) => {
          const updatedPostMeeting = state.postMeeting
            ? { ...state.postMeeting, feedbacks: [...state.postMeeting.feedbacks, feedback] }
            : { meetingid: meetingId, summary: '', feedbacks: [feedback] };

          return {
            postMeeting: updatedPostMeeting,
          };
        });
      },

      // 状态管理
      setPostMeetingLoading: (loading) => {
        set({ postMeetingLoading: loading });
      },

      setPostMeetingError: (error) => {
        set({ postMeetingError: error });
      },

      setSummarySaving: (saving) => {
        set({ summarySaving: saving });
      },

      setFeedbackAdding: (adding) => {
        set({ feedbackAdding: adding });
      },

      setSummarySaved: (saved) => {
        set({ summarySaved: saved });
      },
    }),
    {
      name: 'postmeeting-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        postMeeting: state.postMeeting
      }),
    }
  )
);
