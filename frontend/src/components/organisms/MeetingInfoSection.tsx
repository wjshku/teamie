import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMeetinginfo } from "../../hooks/useMeetinginfo";
import { useTranslation } from "react-i18next";
import { getMeetingCapsule, getMeetingCapsules } from "../../services/api/meetingCapsule";
import { MeetingCapsule } from "../../types/api";
import { Sparkles, History, Upload, Link as LinkIcon, X } from "lucide-react";
import MeetingManagement from "../molecules/MeetingManagement";
import MeetingScheduler from "../molecules/MeetingScheduler";
import MeetingPrinciples from "../molecules/MeetingPrinciples";
import MeetingInvitation from "../molecules/MeetingInvitation";
import ParticipantsList from "../molecules/ParticipantsList";
import CapsuleDetailModal from "../molecules/CapsuleDetailModal";
import ImportCapsuleModal from "../molecules/ImportCapsuleModal";
import { Button } from "../atoms/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

interface CapsuleListItem {
  capsuleId: string;
  title: string;
}

interface MeetingInfoSectionProps {
  meetingId: string;
  className?: string;
}

const MeetingInfoSection: React.FC<MeetingInfoSectionProps> = ({
  meetingId,
  className = "",
}) => {
  const { t } = useTranslation();
  const {
    currentMeeting,
    updateMeetingData,
    deleteMeetingData,
    generateInviteLinkData,
  } = useMeetinginfo(meetingId);
  const navigate = useNavigate();

  const [inviteLink, setInviteLink] = useState("");
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [contextCapsules, setContextCapsules] = useState<CapsuleListItem[]>([]);
  const [previewCapsuleId, setPreviewCapsuleId] = useState<string | null>(null);
  const [previewCapsule, setPreviewCapsule] = useState<MeetingCapsule | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [linkCapsuleModalOpen, setLinkCapsuleModalOpen] = useState(false);
  const [allCapsules, setAllCapsules] = useState<CapsuleListItem[]>([]);
  const [linkingCapsule, setLinkingCapsule] = useState(false);

  // Cache for capsule list (lightweight, only id and title)
  const CAPSULE_LIST_CACHE_KEY = 'meeting_capsules_list_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const getCachedCapsuleList = (): MeetingCapsule[] | null => {
    try {
      const cached = localStorage.getItem(CAPSULE_LIST_CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      if (now - timestamp < CACHE_DURATION) {
        return data;
      }
      
      localStorage.removeItem(CAPSULE_LIST_CACHE_KEY);
      return null;
    } catch (error) {
      return null;
    }
  };

  const setCachedCapsuleList = (capsules: MeetingCapsule[]) => {
    try {
      localStorage.setItem(CAPSULE_LIST_CACHE_KEY, JSON.stringify({
        data: capsules,
        timestamp: Date.now(),
      }));
    } catch (error) {
      // Ignore cache errors
    }
  };

  // Fetch only capsule list (id and title) for quick display
  useEffect(() => {
    const fetchCapsuleList = async () => {
      if (!currentMeeting?.contextCapsuleIds || currentMeeting.contextCapsuleIds.length === 0) {
        setContextCapsules([]);
        return;
      }

      // Try to get capsule list from cache first
      const cachedList = getCachedCapsuleList();
      if (cachedList) {
        // Extract matching capsules from cache
        const matchingCapsules = currentMeeting.contextCapsuleIds
          .map((id) => {
            const cached = cachedList.find((c) => c.capsuleId === id);
            return cached ? { capsuleId: cached.capsuleId, title: cached.title } : null;
          })
          .filter((item): item is CapsuleListItem => item !== null);
        
        if (matchingCapsules.length > 0) {
          setContextCapsules(matchingCapsules);
        }
      }

      // Fetch all capsules list from server (only once, lightweight)
      try {
        const response = await getMeetingCapsules();
        if (response.success) {
          // Cache the full list
          setCachedCapsuleList(response.data.capsules);
          
          // Extract matching capsules for display
          const matchingCapsules = currentMeeting.contextCapsuleIds
            .map((id) => {
              const capsule = response.data.capsules.find((c) => c.capsuleId === id);
              return capsule ? { capsuleId: capsule.capsuleId, title: capsule.title } : null;
            })
            .filter((item): item is CapsuleListItem => item !== null);
          
          setContextCapsules(matchingCapsules);
        }
      } catch (error) {
        console.error("Failed to fetch capsule list:", error);
      }
    };

    fetchCapsuleList();
  }, [currentMeeting?.contextCapsuleIds]);

  // Load full capsule details only when preview is needed
  useEffect(() => {
    const loadPreviewCapsule = async () => {
      if (!previewCapsuleId) {
        setPreviewCapsule(null);
        return;
      }

      // Check cache first
      const cachedList = getCachedCapsuleList();
      if (cachedList) {
        const cached = cachedList.find((c) => c.capsuleId === previewCapsuleId);
        if (cached) {
          setPreviewCapsule(cached);
          return;
        }
      }

      // Fetch full details if not in cache
      try {
        const response = await getMeetingCapsule(previewCapsuleId);
        if (response.success && response.data) {
          setPreviewCapsule(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch capsule details:", error);
      }
    };

    loadPreviewCapsule();
  }, [previewCapsuleId]);

  // Load all capsules when link modal opens
  useEffect(() => {
    if (linkCapsuleModalOpen) {
      loadAllCapsules();
    }
  }, [linkCapsuleModalOpen]);

  const handleCapsuleClick = (capsuleId: string) => {
    setPreviewCapsuleId(capsuleId);
  };

  const handleImportSuccess = async () => {
    // Refresh capsule list cache
    try {
      const response = await getMeetingCapsules();
      if (response.success) {
        setCachedCapsuleList(response.data.capsules);
        
        // Update displayed capsules if meeting has contextCapsuleIds
        if (currentMeeting?.contextCapsuleIds && currentMeeting.contextCapsuleIds.length > 0) {
          const matchingCapsules = currentMeeting.contextCapsuleIds
            .map((id) => {
              const capsule = response.data.capsules.find((c) => c.capsuleId === id);
              return capsule ? { capsuleId: capsule.capsuleId, title: capsule.title } : null;
            })
            .filter((item): item is CapsuleListItem => item !== null);
          
          setContextCapsules(matchingCapsules);
        }
      }
    } catch (error) {
      console.error("Failed to refresh capsule list:", error);
    }
  };

  const loadAllCapsules = async () => {
    try {
      const cachedList = getCachedCapsuleList();
      if (cachedList) {
        const capsuleList = cachedList.map((c) => ({
          capsuleId: c.capsuleId,
          title: c.title,
        }));
        setAllCapsules(capsuleList);
      }

      const response = await getMeetingCapsules();
      if (response.success) {
        setCachedCapsuleList(response.data.capsules);
        const capsuleList = response.data.capsules.map((c) => ({
          capsuleId: c.capsuleId,
          title: c.title,
        }));
        setAllCapsules(capsuleList);
      }
    } catch (error) {
      console.error("Failed to load capsules:", error);
    }
  };

  const handleLinkCapsule = async (capsuleId: string) => {
    if (!currentMeeting) return;

    setLinkingCapsule(true);
    try {
      const currentIds = currentMeeting.contextCapsuleIds || [];
      if (currentIds.includes(capsuleId)) {
        // Already linked
        return;
      }

      const updatedIds = [...currentIds, capsuleId];
      const result = await updateMeetingData({ contextCapsuleIds: updatedIds });
      
      if (result.success) {
        // Refresh capsule list
        const cachedList = getCachedCapsuleList();
        if (cachedList) {
          const matchingCapsules = updatedIds
            .map((id) => {
              const capsule = cachedList.find((c) => c.capsuleId === id);
              return capsule ? { capsuleId: capsule.capsuleId, title: capsule.title } : null;
            })
            .filter((item): item is CapsuleListItem => item !== null);
          setContextCapsules(matchingCapsules);
        }
        setLinkCapsuleModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to link capsule:", error);
    } finally {
      setLinkingCapsule(false);
    }
  };

  const handleUnlinkCapsule = async (capsuleId: string) => {
    if (!currentMeeting) return;

    try {
      const currentIds = currentMeeting.contextCapsuleIds || [];
      const updatedIds = currentIds.filter((id) => id !== capsuleId);
      
      const result = await updateMeetingData({ contextCapsuleIds: updatedIds });
      
      if (result.success) {
        // Refresh capsule list
        const cachedList = getCachedCapsuleList();
        if (cachedList) {
          const matchingCapsules = updatedIds
            .map((id) => {
              const capsule = cachedList.find((c) => c.capsuleId === id);
              return capsule ? { capsuleId: capsule.capsuleId, title: capsule.title } : null;
            })
            .filter((item): item is CapsuleListItem => item !== null);
          setContextCapsules(matchingCapsules);
        }
      }
    } catch (error) {
      console.error("Failed to unlink capsule:", error);
    }
  };

  const handleSaveTime = async (newTime: string) => {
    if (currentMeeting && newTime !== currentMeeting.time) {
      await updateMeetingData({ time: newTime });
    }
  };

  const handleSaveLink = async (newLink: string) => {
    if (currentMeeting && newLink !== currentMeeting.votelink) {
      await updateMeetingData({ votelink: newLink });
    }
  };

  const handleDeleteMeeting = async () => {
    if (!currentMeeting) return;
    await deleteMeetingData();
    navigate("/");
  };

  const handleGenerateInviteLink = async () => {
    if (!currentMeeting) return;
    setGeneratingLink(true);
    try {
      const result = await generateInviteLinkData();
      if (result.success && result.data) {
        setInviteLink(`${window.location.origin}${result.data.invite_link}`);
        setShowInviteLink(true);
      }
    } catch (error) {
      console.error("生成邀请链接失败:", error);
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyInviteLink = () => navigator.clipboard.writeText(inviteLink);
  const handleCloseInviteLink = () => {
    setShowInviteLink(false);
    setInviteLink("");
  };

  if (!currentMeeting) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      <MeetingManagement
        title={currentMeeting.title}
        deleting={false}
        onDelete={handleDeleteMeeting}
      />

      <MeetingScheduler
        time={currentMeeting.time}
        votelink={currentMeeting.votelink}
        onSaveTime={handleSaveTime}
        onSaveLink={handleSaveLink}
      />

      <MeetingPrinciples />

      <MeetingInvitation
        inviteLink={inviteLink}
        showInviteLink={showInviteLink}
        generatingLink={generatingLink}
        onGenerateLink={handleGenerateInviteLink}
        onCopyLink={handleCopyInviteLink}
        onCloseLink={handleCloseInviteLink}
      />

      <ParticipantsList participants={currentMeeting.participants} />

      {/* Context Capsules Section - Always visible */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="w-6 h-6 text-gray-700 flex-shrink-0" />
          <h4 className="text-lg font-semibold text-gray-900 flex-shrink-0">
            {t("meetingCreationForm.contextLabel")}
          </h4>
        </div>
        <div className="ml-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImportModalOpen(true)}
              className="w-fit inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {t("importCapsule.title")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLinkCapsuleModalOpen(true)}
              className="w-fit inline-flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              {t("meetingCreationForm.linkCapsule")}
            </Button>
          </div>
          {contextCapsules.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {contextCapsules.map((capsule) => (
                <button
                  key={capsule.capsuleId}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCapsuleClick(capsule.capsuleId);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-900 hover:border-yellow-300 hover:bg-yellow-100 transition-all text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="max-w-[200px] truncate">{capsule.title}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlinkCapsule(capsule.capsuleId);
                    }}
                    className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
                    aria-label="Unlink capsule"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t("meetingCreationForm.noCapsules")}</p>
          )}
        </div>
      </div>

      {/* Capsule Preview Modal */}
      <CapsuleDetailModal
        capsule={previewCapsule}
        open={!!previewCapsule}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewCapsuleId(null);
          }
        }}
      />

      {/* Import Capsule Modal */}
      <ImportCapsuleModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImportSuccess={handleImportSuccess}
      />

      {/* Link Capsule Modal */}
      <Dialog open={linkCapsuleModalOpen} onOpenChange={setLinkCapsuleModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>{t("meetingCreationForm.linkCapsule")}</DialogTitle>
            <DialogDescription>
              {t("meetingCreationForm.linkCapsuleDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {allCapsules.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allCapsules.map((capsule) => {
                  const isLinked = currentMeeting?.contextCapsuleIds?.includes(capsule.capsuleId);
                  return (
                    <button
                      key={capsule.capsuleId}
                      type="button"
                      onClick={() => !isLinked && handleLinkCapsule(capsule.capsuleId)}
                      disabled={isLinked || linkingCapsule}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                        isLinked
                          ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-white border-gray-200 text-gray-700 hover:border-yellow-200 hover:bg-yellow-50 cursor-pointer"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="max-w-[200px] truncate">{capsule.title}</span>
                      {isLinked && (
                        <span className="text-xs text-gray-500">({t("common.linked")})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t("meetingCreationForm.noCapsules")}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingInfoSection;
