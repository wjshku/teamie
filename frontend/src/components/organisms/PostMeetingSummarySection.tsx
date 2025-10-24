import React, { useState, useEffect, useCallback } from "react";
import { usePostMeeting } from "../../hooks/usePostMeeting";
import { useAuth } from "../../hooks/useAuth";
import InputBox from "../molecules/InputBox";
import MessageBox from "../molecules/MessageBox";
import { useTranslation } from "react-i18next";
import { CheckCircle, MessageCircle, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { generateMeetingCapsule } from "../../services/api/meetingCapsule";

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
  const [capsuleGenerating, setCapsuleGenerating] = useState(false);
  const [capsuleSuccess, setCapsuleSuccess] = useState(false);
  const [capsuleError, setCapsuleError] = useState<string | null>(null);
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

  const handleGenerateCapsule = async () => {
    setCapsuleGenerating(true);
    setCapsuleError(null);
    setCapsuleSuccess(false);

    try {
      const response = await generateMeetingCapsule({ meetingId });

      if (response.success) {
        setCapsuleSuccess(true);
        setTimeout(() => setCapsuleSuccess(false), 3000);
      } else {
        setCapsuleError(response.error || t("MeetingCapsule.generateError"));
      }
    } catch (error) {
      setCapsuleError(t("MeetingCapsule.generateError"));
    } finally {
      setCapsuleGenerating(false);
    }
  };

  const feedbacks = postMeeting?.feedbacks || [];

  if (postMeetingLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">{t("PostMeetingNote.loading")}</p>
          <div className="space-y-3 w-full">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (postMeetingError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {t("PostMeetingNote.error")}: {postMeetingError}
            </span>
            <Button
              onClick={() => fetchPostMeeting()}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              {t("PostMeetingNote.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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

      <div className="flex flex-col gap-3 pt-4 border-t">
        <Button
          onClick={handleGenerateCapsule}
          disabled={capsuleGenerating}
          className="w-full sm:w-auto hover:bg-yellow-50 hover:border-yellow-300"
          variant="outline"
        >
          {capsuleGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-yellow-600" />
              {t("MeetingCapsule.generating")}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2 text-yellow-600" />
              {t("MeetingCapsule.generateButton")}
            </>
          )}
        </Button>

        {capsuleSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {t("MeetingCapsule.generateSuccess")}
            </AlertDescription>
          </Alert>
        )}

        {capsuleError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{capsuleError}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default PostMeetingSummarySection;
