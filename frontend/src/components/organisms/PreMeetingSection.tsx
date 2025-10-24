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
  const [hasContextCapsules, setHasContextCapsules] = useState(false);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    objective: string;
    questions: string[];
  } | null>(null);
  const [suggestionsCache, setSuggestionsCache] = useState<Map<string, { objective: string; questions: string [] }>>(new Map());

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
      // Immediately check if meeting has context capsules (synchronous)
      const meeting = getMeetingById(meetingId);
      if (meeting && meeting.contextCapsuleIds && meeting.contextCapsuleIds.length > 0) {
        setHasContextCapsules(true);
        fetchContextCapsules();
      } else {
        setHasContextCapsules(false);
      }
    }
  }, [meetingId, fetchPreMeeting, getMeetingById]);

  const fetchContextCapsules = async () => {
    try {
      const meeting = getMeetingById(meetingId);
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

    // Create cache key from capsule IDs and current objective
    const capsuleIds = contextCapsules.map(c => c.capsuleId).sort().join(',');
    const cacheKey = `${capsuleIds}:${objective || ''}`;

    // Check cache first
    const cached = suggestionsCache.get(cacheKey);
    if (cached) {
      setSuggestions(cached);
      return;
    }

    setGeneratingSuggestions(true);
    try {
      // Call backend API to generate suggestions using OpenAI, including current objective
      const capsuleIdsArray = contextCapsules.map(c => c.capsuleId);
      const response = await generateSuggestionsAPI(capsuleIdsArray, objective || undefined);

      if (response.success) {
        setSuggestions(response.data);
        // Cache the result
        setSuggestionsCache(prev => new Map(prev).set(cacheKey, response.data));
      } else {
        console.error("Failed to generate suggestions:", response.error);
      }
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const handleAcceptObjective = async () => {
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

  const handleAcceptAllQuestions = async () => {
    if (suggestions?.questions) {
      for (const question of suggestions.questions) {
        const questionData = {
          id: 'ai-assistant',
          author: 'AI 助手',
          authorInitial: 'AI',
          content: question,
        };
        await addQuestionData(questionData);
      }
      setSuggestions(null);
    }
  };

  const handleRejectSuggestions = () => {
    setSuggestions(null);
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">
              {t("preMeetingSection.objectiveLabel")}
            </h4>
          </div>
          {hasContextCapsules && (
            <Button
              onClick={handleGenerateSuggestions}
              disabled={generatingSuggestions || contextCapsules.length === 0}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
            >
              {generatingSuggestions ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">{t("preMeetingSection.optimizing")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs">{t("preMeetingSection.optimizePreMeeting")}</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Suggestion for Objective */}
        {suggestions?.objective && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs text-yellow-700 font-medium mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t("preMeetingSection.suggestedObjective")}
                </p>
                <p className="text-sm text-gray-800 leading-relaxed">{suggestions.objective}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAcceptObjective}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {t("preMeetingSection.acceptSuggestion")}
              </Button>
              <Button
                onClick={handleRejectSuggestions}
                size="sm"
                variant="ghost"
                className="text-gray-600"
              >
                {t("preMeetingSection.dismiss")}
              </Button>
            </div>
          </div>
        )}

        <InputBox
          label=""
          value={objective}
          onChange={handleObjectiveChange}
          placeholder={t("preMeetingSection.objectivePlaceholder")}
          rows={4}
          saving={objectiveSaving}
          saved={objectiveSaved}
        />
      </div>

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

        {/* Suggestions for Questions */}
        {suggestions?.questions && suggestions.questions.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-yellow-700 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {t("preMeetingSection.suggestedQuestions")}
              </p>
            </div>
            <div className="space-y-2">
              {suggestions.questions.map((question, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 text-sm text-gray-800 border border-yellow-100"
                >
                  {question}
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAcceptAllQuestions}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {t("preMeetingSection.acceptAllQuestions")}
              </Button>
              <Button
                onClick={handleRejectSuggestions}
                size="sm"
                variant="ghost"
                className="text-gray-600"
              >
                {t("preMeetingSection.dismiss")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreMeetingSection;
