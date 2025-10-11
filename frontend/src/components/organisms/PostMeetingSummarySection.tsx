import React, { useState, useEffect, useCallback } from "react";
import Button from "../atoms/Button";
import { usePostMeeting } from "../../hooks/usePostMeeting";
import { useAuth } from "../../hooks/useAuth";
import InputBox from "../molecules/InputBox";
import MessageBox from "../molecules/MessageBox";

interface PostMeetingSummarySectionProps {
  meetingId: string;
  className?: string;
}

const PostMeetingSummarySection: React.FC<PostMeetingSummarySectionProps> = ({
  meetingId,
  className = "",
}) => {
  const [summary, setSummary] = useState("");
  const [newFeedback, setNewFeedback] = useState("");
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
    if (meetingId) fetchPostMeeting();
  }, [meetingId, fetchPostMeeting]);

  // 同步summary状态
  useEffect(() => {
    if (postMeeting?.summary) {
      setSummary(postMeeting.summary);
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
    [postMeeting, updateSummaryData, createPostMeetingData],
  );

  const handleSummaryChange = (newSummary: string) => {
    setSummary(newSummary);
    debouncedSaveSummary(newSummary);
  };

  const handleAddFeedback = async () => {
    if (newFeedback.trim()) {
      const authorName = user?.name || "匿名用户";
      const feedbackData = {
        id: String(Date.now()),
        author: authorName,
        authorInitial: authorName.charAt(0),
        content: newFeedback.trim(),
      };
      const result = await addFeedbackData(feedbackData);
      if (result?.success) setNewFeedback("");
    }
  };

  const feedbacks = postMeeting?.feedbacks || [];

  if (postMeetingLoading)
    return <div className={`space-y-6 ${className}`}>加载中...</div>;
  if (postMeetingError)
    return (
      <div className={`space-y-6 ${className}`}>
        <p className="text-red-600">加载失败: {postMeetingError}</p>
        <button
          onClick={fetchPostMeeting}
          className="btn btn-primary btn-sm mt-2"
        >
          重试
        </button>
      </div>
    );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 会议总结 */}
      <InputBox
        label="会议总结与后续行动"
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        value={summary}
        onChange={handleSummaryChange}
        placeholder={`请按照以下指引总结会议：
• 总结关键决策和结论
• 明确行动项目和负责人
• 设定完成时间
• 确认下次会议安排`}
        rows={6}
        saving={summarySaving}
        saved={summarySaved}
      />

      {/* 会议反馈 */}
      <MessageBox
        label="会议反馈"
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        }
        messages={feedbacks}
        newMessage={newFeedback}
        onNewMessageChange={setNewFeedback}
        onSubmitNewMessage={handleAddFeedback}
        submitting={feedbackAdding}
        placeholder="分享您的会议反馈和思考..."
      />
    </div>
  );
};

export default PostMeetingSummarySection;
