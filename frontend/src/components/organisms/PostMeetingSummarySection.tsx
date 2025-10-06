import React, { useState, useEffect, useCallback } from 'react';
import { formatDateOnly, formatTime } from '../../utils/helpers';
import Button from '../atoms/Button';
import { usePostMeeting } from '../../hooks/usePostMeeting';
import { useAuth } from '../../hooks/useAuth';

interface PostMeetingSummarySectionProps {
  meetingId: string;
  className?: string;
}

const PostMeetingSummarySection: React.FC<PostMeetingSummarySectionProps> = ({
  meetingId,
  className = '',
}) => {
  const [summary, setSummary] = useState('');
  const [newFeedback, setNewFeedback] = useState('');
  const { user } = useAuth();
  
  const {
    postMeeting,
    postMeetingLoading,
    postMeetingError,
    summarySaving,
    feedbackAdding,
    summarySaved,
    fetchPostMeeting,
    createPostMeetingData,
    updateSummaryData,
    addFeedbackData,
  } = usePostMeeting(meetingId);

  // 初始化数据
  useEffect(() => {
    if (meetingId) {
      fetchPostMeeting();
    }
  }, [meetingId, fetchPostMeeting]);

  // 同步summary状态
  useEffect(() => {
    if (postMeeting?.summary) {
      setSummary(postMeeting.summary);
    } else {
      setSummary('会议达到预期目标，所有关键决策都已确定。下一步将进行详细的技术设计。');
    }
  }, [postMeeting?.summary]);

  // 防抖保存总结
  const debouncedSaveSummary = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (newSummary: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (postMeeting) {
            await updateSummaryData(newSummary);
          } else {
            const created = await createPostMeetingData();
            if (created?.success) {
              await updateSummaryData(newSummary);
            }
          }
        }, 1000);
      };
    })(),
    [postMeeting, updateSummaryData, createPostMeetingData]
  );

  const handleSummaryChange = (newSummary: string) => {
    setSummary(newSummary);
    debouncedSaveSummary(newSummary);
  };

  const handleAddFeedback = async () => {
    if (newFeedback.trim()) {
      const authorName = user?.name || '匿名用户';
      const feedbackData = {
        id: String(Date.now()),
        author: authorName,
        authorInitial: authorName.charAt(0),
        content: newFeedback.trim(),
      };
      
      const result = await addFeedbackData(feedbackData);
      if (result?.success) {
        setNewFeedback('');
      }
    }
  };

  const feedbacks = postMeeting?.feedbacks || [];

  if (postMeetingLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">加载中...</p>
        </div>
      </div>
    );
  }

  if (postMeetingError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600">加载失败: {postMeetingError}</p>
          <button 
            onClick={() => fetchPostMeeting()}
            className="btn btn-primary btn-sm mt-2"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 会议总结区域 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">会议总结与后续行动</h3>
          {summarySaving && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>保存中...</span>
            </div>
          )}
          {summarySaved && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已保存
            </span>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <textarea
          value={summary}
          onChange={(e) => handleSummaryChange(e.target.value)}
          placeholder="请按照以下指引总结会议：
• 总结关键决策和结论
• 明确行动项目和负责人  
• 设定完成时间
• 确认下次会议安排"
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={6}
        />
        {/* 保存按钮已移除，现在使用自动保存 */}
      </div>

      {/* 反馈板块 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-900">会议反馈</h4>
        </div>

        {/* 现有反馈列表 */}
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                  {feedback.authorInitial}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 min-w-0">
                    <span className="font-medium text-gray-900">{feedback.author}</span>
                    <span className="timestamp">
                      <span className="md:hidden">{formatDateOnly(feedback.timestamp)}</span>
                      <span className="hidden md:inline">{formatTime(feedback.timestamp)}</span>
                    </span>
                  </div>
                  <div className="text-gray-800">
                    {feedback.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 添加反馈区域 */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-900">添加反馈</h5>
          <div className="space-y-3">
            <textarea
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              placeholder="分享您的会议反馈和思考..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={feedbackAdding}
            />
            <div className="flex justify-start">
              <Button
                onClick={handleAddFeedback}
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
                disabled={!newFeedback.trim() || feedbackAdding}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {feedbackAdding ? '添加中...' : '提交反馈'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostMeetingSummarySection;
