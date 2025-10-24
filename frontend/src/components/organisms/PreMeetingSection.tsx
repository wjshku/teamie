import React, { useState, useEffect, useCallback } from "react";
import { usePreMeeting } from "../../hooks/usePreMeeting";
import { useAuth } from "../../hooks/useAuth";
import InputBox from "../molecules/InputBox";
import MessageBox from "../molecules/MessageBox";
import { Target, HelpCircle, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";

interface PreMeetingSectionProps {
  meetingId: string;
  className?: string;
}

const PreMeetingSection: React.FC<PreMeetingSectionProps> = ({
  meetingId,
  className = "",
}) => {
  const { t } = useTranslation();
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
    const authorName = user?.name || t("preMeetingSection.anonymous");
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
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">{t("preMeetingSection.loading")}</p>
          <div className="space-y-3 w-full max-w-md">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (preMeetingError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {t("preMeetingSection.error")}: {preMeetingError}
            </span>
            <Button
              onClick={() => fetchPreMeeting()}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              {t("preMeetingSection.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const questionList = preMeeting?.questions || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 会前目标 */}
      <InputBox
        label={t("preMeetingSection.objectiveLabel")}
        labelIcon={<Target className="w-5 h-5 text-gray-600" />}
        value={objective}
        onChange={handleObjectiveChange}
        placeholder={t("preMeetingSection.objectivePlaceholder")}
        rows={4}
        saving={objectiveSaving}
        saved={objectiveSaved}
      />

      {/* 会前问题 */}
      <div className="space-y-4">
        <MessageBox
          label={t("preMeetingSection.questionLabel")}
          labelIcon={<HelpCircle className="w-5 h-5 text-gray-600" />}
          messages={questionList}
          newMessage={newQuestion}
          onNewMessageChange={setNewQuestion}
          onSubmitNewMessage={handleAddQuestion}
          submitting={questionAdding}
          placeholder={t("preMeetingSection.questionPlaceholder")}
        />
      </div>
    </div>
  );
};

export default PreMeetingSection;
