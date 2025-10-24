import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import MeetingListItem from "../molecules/MeetingListItem";
import CapsuleListItem from "../molecules/CapsuleListItem";
import { Meeting, MeetingCapsule } from "../../types/api";
import { getMeetingCapsules, deleteMeetingCapsule } from "../../services/api/meetingCapsule";
import { Button } from "../ui/button";
import { History, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface PersonalCenterSectionProps {
  meetings: Meeting[];
  onViewMeeting: (meetingId: string) => void;
  className?: string;
}

type ViewMode = "meetings" | "capsules";

const PersonalCenterSection: React.FC<PersonalCenterSectionProps> = ({
  meetings,
  onViewMeeting,
  className = "",
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("meetings");
  const [capsules, setCapsules] = useState<MeetingCapsule[]>([]);
  const [capsulesLoading, setCapsulesLoading] = useState(false);
  const [capsulesError, setCapsulesError] = useState<string | null>(null);

  useEffect(() => {
    if (viewMode === "capsules") {
      fetchCapsules();
    }
  }, [viewMode]);

  const fetchCapsules = async () => {
    setCapsulesLoading(true);
    setCapsulesError(null);
    try {
      const response = await getMeetingCapsules();
      if (response.success) {
        setCapsules(response.data.capsules);
      } else {
        setCapsulesError(response.error);
      }
    } catch (error) {
      setCapsulesError("Failed to load capsules");
    } finally {
      setCapsulesLoading(false);
    }
  };

  const handleDeleteCapsule = async (capsuleId: string) => {
    if (!window.confirm("Are you sure you want to delete this capsule?")) {
      return;
    }

    try {
      const response = await deleteMeetingCapsule(capsuleId);
      if (response.success) {
        setCapsules(capsules.filter(c => c.capsuleId !== capsuleId));
      }
    } catch (error) {
      console.error("Failed to delete capsule:", error);
    }
  };

  const toggleView = () => {
    setViewMode(viewMode === "meetings" ? "capsules" : "meetings");
  };

  return (
    <section className={`space-y-8 ${className}`}>
      <div className="card relative">
        {/* Toggle button in top right */}
        <div className="absolute top-6 right-6">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleView}
            className="flex items-center gap-2"
          >
            {viewMode === "meetings" ? (
              <>
                <Sparkles className="w-4 h-4" />
                {t("personalCenter.switchToCapsules")}
              </>
            ) : (
              <>
                <History className="w-4 h-4" />
                {t("personalCenter.switchToHistory")}
              </>
            )}
          </Button>
        </div>

        {/* Header in upper left */}
        <div className="card-header">
          <h2 className="card-title">
            {viewMode === "meetings"
              ? t("personalCenter.historyTitle")
              : t("personalCenter.capsulesTitle")}
          </h2>
          <p className="card-description">
            {viewMode === "meetings"
              ? t("personalCenter.historyDesc")
              : t("personalCenter.capsulesDesc")}
          </p>
        </div>

        <div className="card-content">
          {/* Meetings View */}
          {viewMode === "meetings" && (
            <div className="grid gap-4">
              {meetings.length > 0 ? (
                meetings.map((meeting) => (
                  <MeetingListItem
                    key={meeting.meetingid}
                    meeting={meeting}
                    onView={() => onViewMeeting(meeting.meetingid)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t("personalCenter.noHistory")}</p>
                  <p className="text-sm mt-2">
                    {t("personalCenter.createFirst")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Capsules View */}
          {viewMode === "capsules" && (
            <>
              {capsulesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : capsulesError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{capsulesError}</AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-4">
                  {capsules.length > 0 ? (
                    capsules.map((capsule) => (
                      <CapsuleListItem
                        key={capsule.capsuleId}
                        capsule={capsule}
                        onDelete={handleDeleteCapsule}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>{t("personalCenter.noCapsules")}</p>
                      <p className="text-sm mt-2">
                        {t("personalCenter.generateFirst")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default PersonalCenterSection;
