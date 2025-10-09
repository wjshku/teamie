// ==================== PreMeeting Actions ====================
// 会前准备相关业务逻辑和异步操作

import { useCallback } from 'react';
import {
  getPreMeeting,
  createPreMeeting,
  updateObjective,
  addQuestion,
} from '../../services/api/preMeetingService';
import { usePreMeetingSlice } from '../slices/usePreMeetingSlice';
import { PreMeeting, Question } from '../../types/api';

export const usePreMeetingActions = (meetingId?: string) => {
  const preMeetingSlice = usePreMeetingSlice();

  // 获取会前准备信息（带缓存）
  const fetchPreMeeting = useCallback(async (options?: { force?: boolean }) => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };

    const force = options?.force === true;
    const cached = preMeetingSlice.preMeeting;

    // 如果 store 中已有对应会前准备且不强制刷新，直接返回缓存
    if (!force && cached && (cached as PreMeeting).meetingid === meetingId) {
      return { success: true, data: cached };
    }

    try {
      preMeetingSlice.setPreMeetingLoading(true);
      preMeetingSlice.setPreMeetingError(null);
      const preMeetingData = await getPreMeeting(meetingId);
      if (!preMeetingData.success) {
        throw new Error(preMeetingData.error);
      }
      preMeetingSlice.setPreMeeting(preMeetingData.data as PreMeeting);
      return { success: true, data: preMeetingData };
    } catch (error: any) {
      console.error('获取会前准备信息失败:', error);
      preMeetingSlice.setPreMeetingError(error.message || '获取会前准备信息失败');
      return { success: false, error: error.message };
    } finally {
      preMeetingSlice.setPreMeetingLoading(false);
    }
  }, [meetingId]);

  // 创建会前准备信息
  const createPreMeetingData = useCallback(async () => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    
    try {
      preMeetingSlice.setPreMeetingLoading(true);
      preMeetingSlice.setPreMeetingError(null);
      const preMeetingData = await createPreMeeting(meetingId, {});
      if (!preMeetingData.success) {
        throw new Error(preMeetingData.error);
      }
      preMeetingSlice.setPreMeeting(preMeetingData.data as PreMeeting);
      return { success: true, data: preMeetingData };
    } catch (error: any) {
      console.error('创建会前准备信息失败:', error);
      preMeetingSlice.setPreMeetingError(error.message || '创建会前准备信息失败');
      return { success: false, error: error.message };
    } finally {
      preMeetingSlice.setPreMeetingLoading(false);
    }
  }, [meetingId]);

  // 更新目标
  const updateObjectiveData = useCallback(async (objective: string) => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    
    try {
      preMeetingSlice.setObjectiveSaving(true); // 使用专门的 objective saving 状态
      preMeetingSlice.setPreMeetingError(null);
      const updatedObjective = await updateObjective(meetingId, objective);
      if (!updatedObjective.success) {
        throw new Error(updatedObjective.error);
      }
      preMeetingSlice.updateObjective(meetingId, updatedObjective.data as string);
      preMeetingSlice.setObjectiveSaved(true); // 标记为已保存
      // 3秒后隐藏已保存状态
      setTimeout(() => preMeetingSlice.setObjectiveSaved(false), 3000);
      return { success: true, data: updatedObjective };
    } catch (error: any) {
      console.error('更新目标失败:', error);
      preMeetingSlice.setPreMeetingError(error.message || '更新目标失败');
      return { success: false, error: error.message };
    } finally {
      preMeetingSlice.setObjectiveSaving(false); // 清除 objective saving 状态
    }
  }, [meetingId]);

  // 添加问题
  const addQuestionData = useCallback(async (questionData: Omit<Question, 'timestamp' | 'meetingid'>) => {
    if (!meetingId) return { success: false, error: '会议ID不存在' };
    
    try {
      preMeetingSlice.setQuestionAdding(true); // 使用专门的 question adding 状态
      preMeetingSlice.setPreMeetingError(null);
      const question = await addQuestion(meetingId, questionData);
      if (!question.success) {
        throw new Error(question.error);
      }
      preMeetingSlice.addQuestion(meetingId, question.data as Question);
      return { success: true, data: question };
    } catch (error: any) {
      console.error('添加问题失败:', error);
      preMeetingSlice.setPreMeetingError(error.message || '添加问题失败');
      return { success: false, error: error.message };
    } finally {
      preMeetingSlice.setQuestionAdding(false); // 清除 question adding 状态
    }
  }, [meetingId]);

  return {
    fetchPreMeeting,
    createPreMeetingData,
    updateObjectiveData,
    addQuestionData,
  };
};
