import React, { useState, useEffect, useCallback } from "react";
import { usePreMeeting } from "../../hooks/usePreMeeting";
import { useAuth } from "../../hooks/useAuth";
import InputBox from "../molecules/InputBox";
import MessageBox from "../molecules/MessageBox";
import { Target, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

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
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">{t("preMeetingSection.loading")}</p>
        </div>
      </div>
    );
  }

  if (preMeetingError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600">
            {t("preMeetingSection.error")}: {preMeetingError}
          </p>
          <button
            onClick={() => fetchPreMeeting()}
            className="btn btn-primary btn-sm mt-2"
          >
            {t("preMeetingSection.retry")}
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
