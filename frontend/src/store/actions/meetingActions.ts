// ==================== Meeting Actions ====================
// 会议相关业务逻辑和异步操作

import { useCallback } from 'react';
import { 
  getMeetings, 
  createMeeting,
} from '../../services/api/meetingService';
import { createPreMeeting } from '../../services/api/preMeetingService';
import { createInMeeting } from '../../services/api/inMeetingService';
import { createPostMeeting } from '../../services/api/postMeetingService';
import { useMeetingSlice } from '../slices/useMeetingSlice';
import { Meeting, CreateMeetingRequest } from '../../types/api';

export const useMeetingActions = () => {
  const meetingSlice = useMeetingSlice();

  // 获取会议列表（带缓存和stale-while-revalidate）
  const fetchMeetings = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force === true;
    const now = Date.now();
    const STALE_TIME = 5 * 60 * 1000; // 5 minutes - data is considered fresh
    const timeSinceLastFetch = now - meetingSlice.lastFetchTime;

    // If data is fresh and not forcing refresh, return cached data immediately
    if (!force && meetingSlice.meetings.length > 0 && timeSinceLastFetch < STALE_TIME) {
      return { success: true, data: meetingSlice.meetings, cached: true };
    }

    // If we have stale data, return it immediately and fetch in background
    const hasStaleData = !force && meetingSlice.meetings.length > 0;

    if (hasStaleData) {
      // Return stale data immediately (non-blocking)
      setTimeout(async () => {
        try {
          const meetingsList = await getMeetings();
          if (meetingsList.success) {
            meetingSlice.setMeetings(meetingsList.data as Meeting[]);
            meetingSlice.setLastFetchTime(Date.now());
          }
        } catch (error) {
          console.warn('Background refresh failed:', error);
          // Don't show error for background refresh
        }
      }, 0);

      return { success: true, data: meetingSlice.meetings, stale: true };
    }

    // No data or force refresh - fetch synchronously
    try {
      meetingSlice.setLoading(true);
      meetingSlice.clearError();
      const meetingsList = await getMeetings();
      if (!meetingsList.success) {
        throw new Error(meetingsList.error);
      }
      meetingSlice.setMeetings(meetingsList.data as Meeting[]);
      meetingSlice.setLastFetchTime(Date.now());
      return { success: true, data: meetingsList };
    } catch (error: any) {
      console.error('获取会议列表失败:', error);
      meetingSlice.setError(error.message || '获取会议列表失败');

      // If we have old cached data, return it even on error
      if (meetingSlice.meetings.length > 0) {
        return { success: true, data: meetingSlice.meetings, error: error.message, fallback: true };
      }

      return { success: false, error: error.message };
    } finally {
      meetingSlice.setLoading(false);
    }
  }, [meetingSlice.meetings, meetingSlice.lastFetchTime]);

  // 创建会议及其所有子文档
  const createNewMeeting = useCallback(async (data: {
    title: string;
  }) => {
    try {
      meetingSlice.setLoading(true);
      meetingSlice.clearError();
      
      // 转换数据格式以匹配新的API
      const newMeetingData: CreateMeetingRequest = {
        title: data.title,
      };
      
      // 1. 创建主会议
      const response = await createMeeting(newMeetingData);
      if (!response.success) {
        throw new Error(response.error);
      }
      const newMeeting = response.data as Meeting;
      
      // 2. 并行创建所有子文档
      const [preMeetingResult, inMeetingResult, postMeetingResult] = await Promise.allSettled([
        createPreMeeting(newMeeting.meetingid, {}),
        createInMeeting(newMeeting.meetingid, {}),
        createPostMeeting(newMeeting.meetingid, {})
      ]);

      // 3. 检查子文档创建结果（即使失败也不影响主流程）
      const errors = [];
      if (preMeetingResult.status === 'rejected') {
        console.warn('创建会前准备失败:', preMeetingResult.reason);
        errors.push('会前准备创建失败');
      }
      if (inMeetingResult.status === 'rejected') {
        console.warn('创建会中笔记失败:', inMeetingResult.reason);
        errors.push('会中笔记创建失败');
      }
      if (postMeetingResult.status === 'rejected') {
        console.warn('创建会后总结失败:', postMeetingResult.reason);
        errors.push('会后总结创建失败');
      }

      // 4. 添加会议到状态管理
      meetingSlice.addMeeting(newMeeting);
      meetingSlice.setLastFetchTime(Date.now()); // Update cache timestamp

      // 5. 返回结果
      if (errors.length > 0) {
        console.warn('会议创建成功，但部分子文档创建失败:', errors);
        return { 
          success: true, 
          meeting: newMeeting, 
          warnings: errors 
        };
      }
      
      return { success: true, meeting: newMeeting };
    } catch (error: any) {
      console.error('创建会议失败:', error);
      meetingSlice.setError(error.message || '创建会议失败');
      return { success: false, error: error.message };
    } finally {
      meetingSlice.setLoading(false);
    }
  }, []);


  return {
    fetchMeetings,
    createNewMeeting,
  };
};