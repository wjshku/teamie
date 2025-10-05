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

  // 获取会议列表
  const fetchMeetings = useCallback(async () => {
    try {
      meetingSlice.setLoading(true);
      meetingSlice.clearError();
      const meetingsList = await getMeetings();
      if (!meetingsList.success) {
        throw new Error(meetingsList.error);
      }
      meetingSlice.setMeetings(meetingsList.data as Meeting[]);
      return { success: true, data: meetingsList };
    } catch (error: any) {
      console.error('获取会议列表失败:', error);
      meetingSlice.setError(error.message || '获取会议列表失败');
      return { success: false, error: error.message };
    } finally {
      meetingSlice.setLoading(false);
    }
  }, []);

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