import React, { useState, useEffect, useCallback } from "react";
import Button from "../atoms/Button";
import { usePostMeeting } from "../../hooks/usePostMeeting";
import { useAuth } from "../../hooks/useAuth";
import InputBox from "../molecules/InputBox";
import MessageBox from "../molecules/MessageBox";
import { useTranslation } from "react-i18next";
import { CheckCircle, MessageCircle } from "lucide-react";

interface PostMeetingSummarySectionProps {
  meetingId: string;
  className?: string;
}

const PostMeetingSummarySection: React.FC<PostMeetingSummarySectionProps> = ({
  meetingId,
  className = "",
}) => {
  const { t } = useTranslation();
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

  useEffect(() => {
    if (meetingId) fetchPostMeeting();
  }, [meetingId, fetchPostMeeting]);

  useEffect(() => {
    if (postMeeting?.summary) setSummary(postMeeting.summary);
  }, [postMeeting?.summary]);

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
            if (created?.success) await updateSummaryData(newSummary);
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
    if (!newFeedback.trim()) return;

    const authorName = user?.name || t("PostMeetingNote.anonymous");
    const feedbackData = {
      id: String(Date.now()),
      author: authorName,
      authorInitial: authorName.charAt(0),
      content: newFeedback.trim(),
    };
    const result = await addFeedbackData(feedbackData);
    if (result?.success) setNewFeedback("");
  };

  const feedbacks = postMeeting?.feedbacks || [];

  if (postMeetingLoading)
    return (
      <div className={`space-y-6 ${className}`}>
        {t("PostMeetingNote.loading")}
      </div>
    );

  if (postMeetingError)
    return (
      <div className={`space-y-6 ${className}`}>
        <p className="text-red-600">
          {t("PostMeetingNote.error")}: {postMeetingError}
        </p>
        <button
          onClick={fetchPostMeeting}
          className="btn btn-primary btn-sm mt-2"
        >
          {t("PostMeetingNote.retry")}
        </button>
      </div>
    );

  return (
    <div className={`space-y-6 ${className}`}>
      <InputBox
        label={t("PostMeetingNote.summaryLabel")}
        labelIcon={<CheckCircle className="w-5 h-5 text-gray-600" />}
        value={summary}
        onChange={handleSummaryChange}
        placeholder={t("PostMeetingNote.summaryPlaceholder")}
        rows={6}
        saving={summarySaving}
        saved={summarySaved}
      />

      <MessageBox
        label={t("PostMeetingNote.feedbackLabel")}
        labelIcon={<MessageCircle className="w-5 h-5 text-gray-600" />}
        messages={feedbacks}
        newMessage={newFeedback}
        onNewMessageChange={setNewFeedback}
        onSubmitNewMessage={handleAddFeedback}
        submitting={feedbackAdding}
        placeholder={t("PostMeetingNote.feedbackPlaceholder")}
      />
    </div>
  );
};

export default PostMeetingSummarySection;
