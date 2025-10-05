// ==================== usePreMeeting Hook ====================
// 会前准备相关 Hook - 重构为接口层

import { usePreMeetingSlice } from '../store/slices/usePreMeetingSlice';
import { usePreMeetingActions } from '../store/actions/preMeetingActions';

export const usePreMeeting = (meetingId?: string) => {
  // 获取状态
  const preMeetingSlice = usePreMeetingSlice();
  
  // 获取操作
  const preMeetingActions = usePreMeetingActions(meetingId);

  return {
    // 状态
    preMeeting: preMeetingSlice.preMeeting,
    preMeetingLoading: preMeetingSlice.preMeetingLoading,
    preMeetingError: preMeetingSlice.preMeetingError,
    objectiveSaving: preMeetingSlice.objectiveSaving,
    questionAdding: preMeetingSlice.questionAdding,
    objectiveSaved: preMeetingSlice.objectiveSaved,
    
    // 操作
    fetchPreMeeting: preMeetingActions.fetchPreMeeting,
    createPreMeetingData: preMeetingActions.createPreMeetingData,
    updateObjectiveData: preMeetingActions.updateObjectiveData,
    addQuestionData: preMeetingActions.addQuestionData,
  };
};
