import React, { useState, useEffect, useCallback } from "react";
import Button from "../atoms/Button";
import { formatDateOnly, formatTime } from "../../utils/helpers";
import { usePreMeeting } from "../../hooks/usePreMeeting";
import { useAuth } from "../../hooks/useAuth";
import InputBox from "../molecules/InputBox";
import MessageBox from "../molecules/MessageBox";

interface PreMeetingSectionProps {
  meetingId: string;
  className?: string;
}

const PreMeetingSection: React.FC<PreMeetingSectionProps> = ({
  meetingId,
  className = "",
}) => {
  const [newQuestion, setNewQuestion] = useState("");
  const [objective, setObjective] = useState("");
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
        }, 1000);
      };
    })(),
    [preMeeting, updateObjectiveData, createPreMeetingData],
  );

  const handleObjectiveChange = (newObjective: string) => {
    setObjective(newObjective);
    debouncedSaveObjective(newObjective);
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;

    const id = user?.id || "";
    const authorName = user?.name || "匿名用户";
    const questionData = {
      id,
      author: authorName,
      authorInitial: authorName.charAt(0),
      content: newQuestion.trim(),
    };

    const result = await addQuestionData(questionData);
    if (result?.success) {
      setNewQuestion("");
    }
  };

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

  const questionList = preMeeting?.questions || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 会前目标 */}
      <InputBox
        label="会议目标"
        labelIcon={
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2a7 7 0 00-7 7c0 3.866 3 7 7 7s7-3.134 7-7a7 7 0 00-7-7z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14v4m0 0h-4m4 0h4"
            />
          </svg>
        }
        value={objective}
        onChange={handleObjectiveChange}
        placeholder="讨论Q1产品功能需求和优先级排序"
        rows={4}
        saving={objectiveSaving}
        saved={objectiveSaved}
      />

      {/* 会前问题 */}
      <div className="space-y-4">
        <MessageBox
          label="会前问题"
          labelIcon={
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          messages={questionList}
          newMessage={newQuestion}
          onNewMessageChange={setNewQuestion}
          onSubmitNewMessage={handleAddQuestion}
          submitting={questionAdding}
          placeholder="分享您的会前问题和思考..."
        />
      </div>
    </div>
  );
};

export default PreMeetingSection;
