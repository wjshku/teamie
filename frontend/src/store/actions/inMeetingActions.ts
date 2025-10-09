// ==================== InMeeting Actions ====================
// 会中笔记相关业务逻辑和异步操作

import { useCallback } from 'react';
import {
  getInMeeting,
  createInMeeting,
  addNote,
} from '../../services/api/inMeetingService';
import { useInMeetingSlice } from '../slices/useInMeetingSlice';
import { InMeeting, Note } from '../../types/api';

export const useInMeetingActions = (meetingId?: string) => {
  const inMeetingSlice = useInMeetingSlice();

  // 获取会中笔记信息（带缓存）
  const fetchInMeeting = useCallback(async (options?: { force?: boolean }) => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };

    const force = options?.force === true;
    const cached = inMeetingSlice.inMeeting;

    // 如果 store 中已有对应会中笔记且不强制刷新，直接返回缓存
    if (!force && cached && (cached as InMeeting).meetingid === meetingId) {
      return { success: true, data: cached };
    }

    try {
      inMeetingSlice.setInMeetingLoading(true);
      inMeetingSlice.setInMeetingError(null);
      const inMeetingData = await getInMeeting(meetingId);
      if (!inMeetingData.success) {
        throw new Error(inMeetingData.error);
      }
      inMeetingSlice.setInMeeting(inMeetingData.data as InMeeting);
      return { success: true, data: inMeetingData };
    } catch (error: any) {
      console.error('获取会中笔记信息失败:', error);
      inMeetingSlice.setInMeetingError(error.message || '获取会中笔记信息失败');
      return { success: false, error: error.message };
    } finally {
      inMeetingSlice.setInMeetingLoading(false);
    }
  }, [meetingId]);

  // 创建会中笔记信息
  const createInMeetingData = useCallback(async () => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    
    try {
      inMeetingSlice.setInMeetingLoading(true);
      inMeetingSlice.setInMeetingError(null);
      const inMeetingData = await createInMeeting(meetingId, {});
      if (!inMeetingData.success) {
        throw new Error(inMeetingData.error);
      }
      inMeetingSlice.setInMeeting(inMeetingData.data as InMeeting);
      return { success: true, data: inMeetingData };
    } catch (error: any) {
      console.error('创建会中笔记信息失败:', error);
      inMeetingSlice.setInMeetingError(error.message || '创建会中笔记信息失败');
      return { success: false, error: error.message };
    } finally {
      inMeetingSlice.setInMeetingLoading(false);
    }
  }, [meetingId]);

  // 添加笔记
  const addNoteData = useCallback(async (noteData: Omit<Note, 'timestamp' | 'meetingid'>) => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    
    try {
      inMeetingSlice.setNoteAdding(true); // 使用专门的 note adding 状态
      inMeetingSlice.setInMeetingError(null);
      const response = await addNote(meetingId, noteData);
      if (!response.success) {
        throw new Error(response.error);
      }
      inMeetingSlice.addNote(meetingId, response.data as Note);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('添加笔记失败:', error);
      inMeetingSlice.setInMeetingError(error.message || '添加笔记失败');
      return { success: false, error: error.message };
    } finally {
      inMeetingSlice.setNoteAdding(false); // 清除 note adding 状态
    }
  }, [meetingId]);

  return {
    fetchInMeeting,
    createInMeetingData,
    addNoteData,
  };
};
