// ==================== useMeetinginfo Hook ====================
// 单个会议详情 Hook - 基于 meetingId 提供状态与操作

import { useMeetinginfoSlice } from '../store/slices/useMeetinginfoSlice';
import { useMeetingInfoActions } from '../store/actions/meetingInfoActions';

export const useMeetinginfo = (meetingId?: string) => {
  const meetingInfoSlice = useMeetinginfoSlice();
  const meetingInfoActions = useMeetingInfoActions(meetingId);

  return {
    currentMeeting: meetingInfoSlice.currentMeeting,
    loading: meetingInfoSlice.loading,
    error: meetingInfoSlice.error,

    fetchMeetingDetails: meetingInfoActions.fetchMeetingDetails,
    updateMeetingData: meetingInfoActions.updateMeetingData,
    deleteMeetingData: meetingInfoActions.deleteMeetingData,
    generateInviteLinkData: meetingInfoActions.generateInviteLinkData,
  };
};


