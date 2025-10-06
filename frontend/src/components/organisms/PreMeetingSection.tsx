import React, { useState, useEffect, useCallback } from 'react';
import { formatDateOnly, formatTime } from '../../utils/helpers';
import Button from '../atoms/Button';
import { usePreMeeting } from '../../hooks/usePreMeeting';
import { useAuth } from '../../hooks/useAuth';

interface PreMeetingSectionProps {
  meetingId: string;
  className?: string;
}

const PreMeetingSection: React.FC<PreMeetingSectionProps> = ({
  meetingId,
  className = '',
}) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [objective, setObjective] = useState('');
  const { user } = useAuth();
  
  const {
    preMeeting,
    preMeetingLoading,
    preMeetingError,
    objectiveSaving,
    questionAdding,
    objectiveSaved,
    fetchPreMeeting,
    createPreMeetingData,
    updateObjectiveData,
    addQuestionData,
  } = usePreMeeting(meetingId);

  // 初始化数据
  useEffect(() => {
    if (meetingId) {
      fetchPreMeeting();
    }
  }, [meetingId, fetchPreMeeting]);

  // 同步objective状态
  useEffect(() => {
    if (preMeeting?.objective) {
      setObjective(preMeeting.objective);
    }
  }, [preMeeting?.objective]);

  // 防抖保存 objective
  const debouncedSaveObjective = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (newObjective: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (preMeeting) {
            await updateObjectiveData(newObjective);
          } else {
            const created = await createPreMeetingData();
            if (created?.success) {
              await updateObjectiveData(newObjective);
            }
          }
        }, 1000); // 1秒后保存
      };
    })(),
    [preMeeting, updateObjectiveData, createPreMeetingData]
  );

  const handleObjectiveChange = (newObjective: string) => {
    setObjective(newObjective);
    debouncedSaveObjective(newObjective);
  };

  const handleAddQuestion = async () => {
    if (newQuestion.trim()) {
      const id = user?.id || '';
      const authorName = user?.name || '匿名用户';
      const questionData = {
        id: id,
        author: authorName,
        authorInitial: authorName.charAt(0),
        content: newQuestion.trim(),
      };
      
      const result = await addQuestionData(questionData);
      if (result?.success) {
        setNewQuestion('');
      }
    }
  };

  // 后续如需支持更新/删除问题，可在 actions 中补充对应方法后再接入

  const questionList = preMeeting?.questions || [];

  if (preMeetingLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">加载中...</p>
        </div>
      </div>
    );
  }

  if (preMeetingError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600">加载失败: {preMeetingError}</p>
          <button 
            onClick={() => fetchPreMeeting()}
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
      {/* 会议目标区域 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">会议目标</h3>
          {objectiveSaving && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>保存中...</span>
            </div>
          )}
          {objectiveSaved && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已保存
            </span>
          )}
        </div>
        <textarea
          value={objective}
          onChange={(e) => handleObjectiveChange(e.target.value)}
          placeholder="讨论Q1产品功能需求和优先级排序"
          rows={4}
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>


      {/* 会前问题区域 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-900">会前问题</h4>
        </div>

        {/* 现有问题列表 */}
        <div className="space-y-4">
          {questionList.map((question) => (
            <div key={question.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                  {question.authorInitial}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 min-w-0">
                    <span className="font-medium text-gray-900">{question.author}</span>
                    <span className="timestamp">
                      <span className="md:hidden">{formatDateOnly(question.timestamp)}</span>
                      <span className="hidden md:inline">{formatTime(question.timestamp)}</span>
                    </span>
                  </div>
                  <div className="text-gray-800">
                    {question.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 添加问题区域 */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-900">添加问题</h5>
          <div className="space-y-3">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="分享您的会前问题和思考..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={questionAdding}
            />
            <div className="flex justify-start">
              <Button
                onClick={handleAddQuestion}
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
                disabled={!newQuestion.trim() || questionAdding}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {questionAdding ? '添加中...' : '提交问题'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreMeetingSection;
