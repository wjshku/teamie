import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../atoms/InputField";
import { Button } from "../atoms/Button";
import { useMeetings } from "../../hooks/useMeetings";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { getMeetingCapsules } from "../../services/api/meetingCapsule";
import { MeetingCapsule } from "../../types/api";
import { Sparkles, X } from "lucide-react";

interface MeetingCreationFormProps {
  onSubmit: (data: { title: string }) => void;
  className?: string;
}

const MeetingCreationForm: React.FC<MeetingCreationFormProps> = ({
  onSubmit,
  className = "",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createNewMeeting, loading } = useMeetings();
  const { isAuthenticated, loginUser } = useAuth();
  const [title, setTitle] = useState("");
  const [capsules, setCapsules] = useState<MeetingCapsule[]>([]);
  const [selectedCapsuleIds, setSelectedCapsuleIds] = useState<string[]>([]);
  const [capsulesLoading, setCapsulesLoading] = useState(false);

  useEffect(() => {
    const fetchCapsules = async () => {
      if (!isAuthenticated) return;

      setCapsulesLoading(true);
      try {
        const response = await getMeetingCapsules();
        if (response.success) {
          setCapsules(response.data.capsules);
        }
      } catch (error) {
        console.error("Failed to fetch capsules:", error);
      } finally {
        setCapsulesLoading(false);
      }
    };

    fetchCapsules();
  }, [isAuthenticated]);

  const toggleCapsuleSelection = (capsuleId: string) => {
    setSelectedCapsuleIds((prev) =>
      prev.includes(capsuleId)
        ? prev.filter((id) => id !== capsuleId)
        : [...prev, capsuleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        if (!isAuthenticated) {
          const loginRes = await loginUser();
          if (!loginRes.success) {
            return;
          }
        }
        const result = await createNewMeeting({
          title: title.trim(),
          contextCapsuleIds: selectedCapsuleIds.length > 0 ? selectedCapsuleIds : undefined,
        });

        if (result.success && result.meeting) {
          onSubmit({ title: title.trim() });
          navigate(`/meeting/${result.meeting.meetingid}`);
        }
      } catch (error) {
        console.error(t("meetingCreationForm.createFailed"), error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900">
          {t("meetingCreationForm.titleLabel")}
        </label>
        <InputField
          type="text"
          placeholder={t("meetingCreationForm.titlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
        />
      </div>

      {isAuthenticated && capsules.length > 0 && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-900">
              {t("meetingCreationForm.contextLabel")}
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {t("meetingCreationForm.contextDesc")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {capsules.map((capsule) => (
              <button
                key={capsule.capsuleId}
                type="button"
                onClick={() => toggleCapsuleSelection(capsule.capsuleId)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                  selectedCapsuleIds.includes(capsule.capsuleId)
                    ? "bg-purple-100 border-purple-300 text-purple-900"
                    : "bg-white border-gray-200 text-gray-700 hover:border-purple-200 hover:bg-purple-50"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="max-w-[200px] truncate">{capsule.title}</span>
                {selectedCapsuleIds.includes(capsule.capsuleId) && (
                  <X className="w-3 h-3" />
                )}
              </button>
            ))}
          </div>
          {selectedCapsuleIds.length > 0 && (
            <p className="text-xs text-purple-600">
              {selectedCapsuleIds.length} capsule(s) selected
            </p>
          )}
        </div>
      )}

      <div className="flex justify-start">
        <Button
          type="submit"
          variant="default"
          size="lg"
          className="px-8"
          disabled={loading}
        >
          {loading
            ? t("meetingCreationForm.creating")
            : t("meetingCreationForm.createButton")}
        </Button>
      </div>
    </form>
  );
};

export default MeetingCreationForm;