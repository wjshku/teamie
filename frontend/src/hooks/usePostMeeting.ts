// ==================== usePostMeeting Hook ====================
// 会后总结相关 Hook - 重构为接口层

import { usePostMeetingSlice } from '../store/slices/usePostMeetingSlice';
import { usePostMeetingActions } from '../store/actions/postMeetingActions';

export const usePostMeeting = (meetingId?: string) => {
  // 获取状态
  const postMeetingSlice = usePostMeetingSlice();
  
  // 获取操作
  const postMeetingActions = usePostMeetingActions(meetingId);

  return {
    // 状态
    postMeeting: postMeetingSlice.postMeeting,
    postMeetingLoading: postMeetingSlice.postMeetingLoading,
    postMeetingError: postMeetingSlice.postMeetingError,
    summarySaving: postMeetingSlice.summarySaving,
    feedbackAdding: postMeetingSlice.feedbackAdding,
    summarySaved: postMeetingSlice.summarySaved,
    
    // 操作
    fetchPostMeeting: postMeetingActions.fetchPostMeeting,
    createPostMeetingData: postMeetingActions.createPostMeetingData,
    updateSummaryData: postMeetingActions.updateSummaryData,
    addFeedbackData: postMeetingActions.addFeedbackData,
  };
};
