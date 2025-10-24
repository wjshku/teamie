import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import MeetingListItem from "../molecules/MeetingListItem";
import CapsuleListItem from "../molecules/CapsuleListItem";
import CapsuleDetailModal from "../molecules/CapsuleDetailModal";
import ImportCapsuleModal from "../molecules/ImportCapsuleModal";
import { Meeting, MeetingCapsule } from "../../types/api";
import { getMeetingCapsules, deleteMeetingCapsule } from "../../services/api/meetingCapsule";
import { Button } from "../ui/button";
import { History, Sparkles, Loader2, AlertCircle, Upload } from "lucide-react";
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
  const [capsulesFetched, setCapsulesFetched] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<MeetingCapsule | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    // Only fetch if switching to capsules view and haven't fetched yet
    if (viewMode === "capsules" && !capsulesFetched && !capsulesLoading) {
      fetchCapsules();
    }
  }, [viewMode, capsulesFetched, capsulesLoading]);

  const fetchCapsules = async () => {
    setCapsulesLoading(true);
    setCapsulesError(null);
    try {
      const response = await getMeetingCapsules();
      if (response.success) {
        setCapsules(response.data.capsules);
        setCapsulesFetched(true);
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

  const handleViewCapsule = (capsuleId: string) => {
    const capsule = capsules.find(c => c.capsuleId === capsuleId);
    if (capsule) {
      setSelectedCapsule(capsule);
      setModalOpen(true);
    }
  };

  const toggleView = () => {
    setViewMode(viewMode === "meetings" ? "capsules" : "meetings");
  };

  const handleImportSuccess = () => {
    // Refresh capsules list after successful import
    fetchCapsules();
  };

  return (
    <section className={`space-y-8 w-full ${className}`}>
      <div className="card relative w-full overflow-hidden">
        {/* Toggle and Import buttons - responsive positioning */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col sm:flex-row gap-2 z-10">
          {viewMode === "capsules" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t("personalCenter.importCapsule")}</span>
              <span className="sm:hidden">导入</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleView}
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            {viewMode === "meetings" ? (
              <>
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                <span className="hidden sm:inline">{t("personalCenter.switchToCapsules")}</span>
                <span className="sm:hidden">胶囊</span>
              </>
            ) : (
              <>
                <History className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t("personalCenter.switchToHistory")}</span>
                <span className="sm:hidden">历史</span>
              </>
            )}
          </Button>
        </div>

        {/* Header in upper left - with padding to accommodate buttons */}
        <div className="card-header pr-20 sm:pr-32">
          <h2 className="card-title text-lg sm:text-xl">
            {viewMode === "meetings"
              ? t("personalCenter.historyTitle")
              : t("personalCenter.capsulesTitle")}
          </h2>
          <p className="card-description text-xs sm:text-sm">
            {viewMode === "meetings"
              ? t("personalCenter.historyDesc")
              : t("personalCenter.capsulesDesc")}
          </p>
        </div>

        <div className="card-content">
          {/* Meetings View */}
          {viewMode === "meetings" && (
            <div className="grid gap-3 sm:gap-4 w-full">
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
                  <p className="text-sm sm:text-base">{t("personalCenter.noHistory")}</p>
                  <p className="text-xs sm:text-sm mt-2">
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
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
                </div>
              ) : capsulesError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{capsulesError}</AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-3 sm:gap-4 w-full">
                  {capsules.length > 0 ? (
                    capsules.map((capsule) => (
                      <CapsuleListItem
                        key={capsule.capsuleId}
                        capsule={capsule}
                        onView={handleViewCapsule}
                        onDelete={handleDeleteCapsule}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm sm:text-base">{t("personalCenter.noCapsules")}</p>
                      <p className="text-xs sm:text-sm mt-2">
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

      <CapsuleDetailModal
        capsule={selectedCapsule}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      <ImportCapsuleModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImportSuccess={handleImportSuccess}
      />
    </section>
  );
};

export default PersonalCenterSection;
