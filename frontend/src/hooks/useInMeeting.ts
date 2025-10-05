// ==================== useInMeeting Hook ====================
// 会中笔记相关 Hook - 重构为接口层

import { useInMeetingSlice } from '../store/slices/useInMeetingSlice';
import { useInMeetingActions } from '../store/actions/inMeetingActions';

export const useInMeeting = (meetingId?: string) => {
  // 获取状态
  const inMeetingSlice = useInMeetingSlice();
  
  // 获取操作
  const inMeetingActions = useInMeetingActions(meetingId);

  return {
    // 状态
    inMeeting: inMeetingSlice.inMeeting,
    inMeetingLoading: inMeetingSlice.inMeetingLoading,
    inMeetingError: inMeetingSlice.inMeetingError,
    noteAdding: inMeetingSlice.noteAdding,
    
    // 操作
    fetchInMeeting: inMeetingActions.fetchInMeeting,
    createInMeetingData: inMeetingActions.createInMeetingData,
    addNoteData: inMeetingActions.addNoteData,
  };
};
