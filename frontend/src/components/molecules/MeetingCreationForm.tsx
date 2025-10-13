import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../atoms/InputField";
import { Button } from "../atoms/Button";
import { useMeetings } from "../../hooks/useMeetings";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

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