import React, { useState, useEffect, useCallback } from "react";
import { usePreMeeting } from "../../hooks/usePreMeeting";
import { useAuth } from "../../hooks/useAuth";
import { useMeetings } from "../../hooks/useMeetings";
import InputBox from "../molecules/InputBox";
import MessageBox from "../molecules/MessageBox";
import { Target, HelpCircle, Loader2, AlertCircle, Sparkles, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { getMeetingCapsules, generateMeetingSuggestions as generateSuggestionsAPI } from "../../services/api/meetingCapsule";
import { MeetingCapsule } from "../../types/api";

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
  const { getMeetingById } = useMeetings();

  const [contextCapsules, setContextCapsules] = useState<MeetingCapsule[]>([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    objective: string;
    questions: string[];
  } | null>(null);

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

  // 初始化数据和获取上下文胶囊
  useEffect(() => {
    if (meetingId) {
      fetchPreMeeting();
      fetchContextCapsules();
    }
  }, [meetingId, fetchPreMeeting]);

  const fetchContextCapsules = async () => {
    try {
      const meeting = await getMeetingById(meetingId);
      if (meeting && meeting.contextCapsuleIds && meeting.contextCapsuleIds.length > 0) {
        const capsulesResponse = await getMeetingCapsules();
        if (capsulesResponse.success) {
          const relevantCapsules = capsulesResponse.data.capsules.filter((c) =>
            meeting.contextCapsuleIds?.includes(c.capsuleId)
          );
          setContextCapsules(relevantCapsules);
        }
      }
    } catch (error) {
      console.error("Failed to fetch context capsules:", error);
    }
  };

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

  const handleGenerateSuggestions = async () => {
    if (contextCapsules.length === 0) return;

    setGeneratingSuggestions(true);
    try {
      // Call backend API to generate suggestions using OpenAI
      const capsuleIds = contextCapsules.map(c => c.capsuleId);
      const response = await generateSuggestionsAPI(capsuleIds);

      if (response.success) {
        setSuggestions(response.data);
      } else {
        console.error("Failed to generate suggestions:", response.error);
        // Fallback: show error or use basic suggestions
        alert(response.error || "Failed to generate suggestions");
      }
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      alert("Failed to generate suggestions");
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const handleUseSuggestedObjective = async () => {
    if (suggestions?.objective) {
      setObjective(suggestions.objective);
      if (preMeeting) {
        await updateObjectiveData(suggestions.objective);
      } else {
        const created = await createPreMeetingData();
        if (created?.success) {
          await updateObjectiveData(suggestions.objective);
        }
      }
    }
  };

  const handleUseSuggestedQuestion = async (question: string) => {
    const id = user?.id || "";
    const authorName = user?.name || t("preMeetingSection.anonymous");
    const questionData = {
      id,
      author: authorName,
      authorInitial: authorName.charAt(0),
      content: question,
    };
    await addQuestionData(questionData);
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
      {/* AI Suggestions Button */}
      {contextCapsules.length > 0 && !suggestions && (
        <div className="flex justify-center">
          <Button
            onClick={handleGenerateSuggestions}
            disabled={generatingSuggestions}
            variant="outline"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
          >
            {generatingSuggestions ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("preMeetingSection.generating")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t("preMeetingSection.generateSuggestions")}
              </>
            )}
          </Button>
        </div>
      )}

      {/* AI Suggestions Display */}
      {suggestions && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-purple-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Suggestions
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuggestions(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              {t("preMeetingSection.dismissSuggestions")}
            </Button>
          </div>

          {/* Suggested Objective */}
          <div className="bg-white rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                {t("preMeetingSection.suggestedObjective")}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleUseSuggestedObjective}
                className="text-purple-600 hover:text-purple-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {t("preMeetingSection.useSuggestion")}
              </Button>
            </div>
            <p className="text-sm text-gray-600">{suggestions.objective}</p>
          </div>

          {/* Suggested Questions */}
          {suggestions.questions.length > 0 && (
            <div className="bg-white rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {t("preMeetingSection.suggestedQuestions")}
              </p>
              <div className="space-y-2">
                {suggestions.questions.map((question, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-2 p-2 bg-gray-50 rounded"
                  >
                    <p className="text-sm text-gray-600 flex-1">{question}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUseSuggestedQuestion(question)}
                      className="text-purple-600 hover:text-purple-700 flex-shrink-0"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
