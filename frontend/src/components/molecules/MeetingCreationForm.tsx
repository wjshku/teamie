import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../atoms/InputField";
import { Button } from "../atoms/Button";
import { useMeetings } from "../../hooks/useMeetings";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useGuestImport } from "../../hooks/useGuestImport";
import { getMeetingCapsules } from "../../services/api/meetingCapsule";
import { MeetingCapsule } from "../../types/api";
import { Sparkles, X, Upload, Loader2 } from "lucide-react";
import ImportCapsuleModal from "./ImportCapsuleModal";
import CapsuleDetailModal from "./CapsuleDetailModal";

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
  const { isAuthenticated, loginUser, user } = useAuth();
  const { guestImports, syncGuestImportsToServer } = useGuestImport();
  const [title, setTitle] = useState("");
  const [capsules, setCapsules] = useState<MeetingCapsule[]>([]);
  const [selectedCapsuleIds, setSelectedCapsuleIds] = useState<string[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importingGuest, setImportingGuest] = useState(false);
  const [importingGuestTitle, setImportingGuestTitle] = useState<string | null>(null);
  const [importingGuestId, setImportingGuestId] = useState<string | null>(null); // Track the expected guest ID
  const [previewGuestId, setPreviewGuestId] = useState<string | null>(null);
  const [previewServerId, setPreviewServerId] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState<{ id: string; time: number } | null>(null);
  const mappedGuestIdsRef = useRef<Set<string>>(new Set()); // Track which guest IDs have been mapped

  const handleCapsuleClick = (capsuleId: string, isGuest: boolean) => {
    const now = Date.now();
    if (lastClickTime && lastClickTime.id === capsuleId && now - lastClickTime.time < 300) {
      // Double click detected - show preview and revert the toggle from first click
      if (isGuest) {
        setPreviewGuestId(capsuleId);
      } else {
        setPreviewServerId(capsuleId);
      }
      // Revert the toggle from the first click
      setSelectedCapsuleIds((prev) =>
        prev.includes(capsuleId)
          ? prev.filter((id) => id !== capsuleId)
          : [...prev, capsuleId]
      );
      setLastClickTime(null);
    } else {
      // Single click - toggle selection
      toggleCapsuleSelection(capsuleId);
      setLastClickTime({ id: capsuleId, time: now });
      // Clear after delay to allow for double-click detection
      setTimeout(() => {
        setLastClickTime((prev) => prev?.id === capsuleId ? null : prev);
      }, 300);
    }
  };

  const CAPSULES_CACHE_KEY = 'meeting_capsules_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const getCachedCapsules = (): MeetingCapsule[] | null => {
    if (!isAuthenticated || !user?.id) return null;
    
    try {
      const cached = localStorage.getItem(`${CAPSULES_CACHE_KEY}_${user.id}`);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - timestamp < CACHE_DURATION) {
        return data;
      }
      
      // Cache expired, remove it
      localStorage.removeItem(`${CAPSULES_CACHE_KEY}_${user.id}`);
      return null;
    } catch (error) {
      console.error('Failed to read cached capsules:', error);
      return null;
    }
  };

  const setCachedCapsules = (data: MeetingCapsule[]) => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      localStorage.setItem(`${CAPSULES_CACHE_KEY}_${user.id}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to cache capsules:', error);
    }
  };

  const fetchCapsules = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await getMeetingCapsules();
      if (response.success) {
        setCapsules(response.data.capsules);
        setCachedCapsules(response.data.capsules);
      }
    } catch (error) {
      console.error("Failed to fetch capsules:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setCapsules([]);
      return;
    }

    // Load from cache first for instant display
    const cachedCapsules = getCachedCapsules();
    if (cachedCapsules) {
      setCapsules(cachedCapsules);
      // Silently refresh in background
      fetchCapsules();
    } else {
      // No cache, fetch from server (no loading indicator since page is loading)
      fetchCapsules();
    }
  }, [isAuthenticated, user?.id]);

  // Auto-map selected guest capsule IDs to server capsule IDs after login and sync
  // Only map once per guest ID to avoid duplicates
  useEffect(() => {
    if (!isAuthenticated || capsules.length === 0) return;
    
    // Check if any selected IDs are guest IDs that need to be mapped
    const guestIdsToMap = selectedCapsuleIds.filter(id => 
      id.startsWith('guest_') && !mappedGuestIdsRef.current.has(id)
    );
    if (guestIdsToMap.length === 0) return;
    
    // Try to map guest IDs to server capsule IDs
    const mappedIds = [...selectedCapsuleIds];
    let hasChanges = false;
    
    for (let i = 0; i < mappedIds.length; i++) {
      const id = mappedIds[i];
      if (id.startsWith('guest_') && !mappedGuestIdsRef.current.has(id)) {
        // Find the corresponding guest import
        const guestImport = guestImports.find(gi => gi.id === id);
        if (guestImport && guestImport.isSynced) {
          // Find the synced capsule by matching title or guestImportedAt metadata
          const syncedCapsule = capsules.find(c => 
            c.title === guestImport.title || 
            (c.metadata as any)?.guestImportedAt === guestImport.createdAt
          );
          if (syncedCapsule) {
            // Check if this server capsule ID is already in the list (avoid duplicates)
            if (!mappedIds.includes(syncedCapsule.capsuleId)) {
              mappedIds[i] = syncedCapsule.capsuleId;
              mappedGuestIdsRef.current.add(id); // Mark as mapped
              hasChanges = true;
            } else {
              // Server capsule already exists, remove the guest ID to avoid duplicate
              mappedIds.splice(i, 1);
              mappedGuestIdsRef.current.add(id); // Mark as mapped
              hasChanges = true;
              i--; // Adjust index after removal
            }
          }
        }
      }
    }
    
    if (hasChanges) {
      // Filter out any IDs that don't exist in capsules (keep valid server capsule IDs)
      const validMappedIds = mappedIds.filter(id => 
        capsules.some(c => c.capsuleId === id) || 
        guestImports.some(gi => gi.id === id && !gi.isSynced)
      );
      setSelectedCapsuleIds(validMappedIds);
    }
  }, [isAuthenticated, capsules.length, guestImports.length]); // Only depend on lengths to avoid frequent re-runs

  // Clear importing state when guest import appears in guestImports
  useEffect(() => {
    if (importingGuest) {
      // If we have an expected guest ID, check for that first (most reliable)
      if (importingGuestId) {
        const foundById = guestImports.find(gi => gi.id === importingGuestId);
        if (foundById) {
          setTimeout(() => {
            setImportingGuest(false);
            setImportingGuestTitle(null);
            setImportingGuestId(null);
          }, 100);
          return;
        }
      }
      
      // Fallback: check if any guest import matches the importing title (loose match)
      if (importingGuestTitle) {
        const matchingImport = guestImports.find(
          gi => {
            const importingTitleLower = importingGuestTitle.toLowerCase().trim();
            const giTitleLower = gi.title.toLowerCase().trim();
            return giTitleLower === importingTitleLower || 
                   giTitleLower.includes(importingTitleLower) ||
                   importingTitleLower.includes(giTitleLower);
          }
        );
        if (matchingImport) {
          setTimeout(() => {
            setImportingGuest(false);
            setImportingGuestTitle(null);
            setImportingGuestId(null);
          }, 100);
        }
      }
    }
  }, [guestImports, importingGuest, importingGuestTitle, importingGuestId]);

  const handleImportSuccess = async (newGuestId?: string) => {
    // Refresh capsules list for authenticated users
    if (isAuthenticated) {
      await fetchCapsules();
    }
    
    // Store the guest ID for reliable matching
    if (newGuestId) {
      setImportingGuestId(newGuestId);
      // Select the new guest import immediately
      setSelectedCapsuleIds((prev) =>
        prev.includes(newGuestId) ? prev : [...prev, newGuestId]
      );
    }
  };

  const handleImportStart = (title: string) => {
    setImportingGuest(true);
    setImportingGuestTitle(title);
  };

  const previewGuest = previewGuestId
    ? guestImports.find((g) => g.id === previewGuestId) || null
    : null;

  const previewServer = previewServerId
    ? capsules.find((c) => c.capsuleId === previewServerId) || null
    : null;

  // Convert GuestImport or use server capsule for the modal
  const previewCapsule: MeetingCapsule | null = previewGuest
    ? {
        capsuleId: previewGuest.id,
        title: previewGuest.title,
        summary: previewGuest.summary || previewGuest.content,
        keyPoints: previewGuest.keyPoints || [],
        createdAt: previewGuest.createdAt,
        userId: "",
        metadata: {},
      }
    : previewServer || null;

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

        // If there are selected guest imports that are not synced, wait for them to sync first
        const selectedGuestImports = guestImports.filter(gi => 
          selectedCapsuleIds.includes(gi.id) && !gi.isSynced
        );

        let finalSelectedIds = [...selectedCapsuleIds];

        if (selectedGuestImports.length > 0) {
          // Trigger sync manually and wait for completion
          await syncGuestImportsToServer();
          
          // Wait a bit for state to update and API calls to complete
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Refresh capsules list after sync
          await fetchCapsules();
          
          // Wait a bit more for capsules to be updated
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // The useEffect should have already mapped guest IDs to server IDs,
          // but let's do it again here as a fallback
          finalSelectedIds = selectedCapsuleIds.map(id => {
            if (id.startsWith('guest_')) {
              const guestImport = guestImports.find(g => g.id === id);
              if (guestImport && guestImport.isSynced) {
                const syncedCapsule = capsules.find(c => 
                  c.title === guestImport.title || 
                  (c.metadata as any)?.guestImportedAt === guestImport.createdAt
                );
                return syncedCapsule?.capsuleId || id;
              }
            }
            return id;
          }).filter(id => 
            // Only keep IDs that are actually server capsules now
            capsules.some(c => c.capsuleId === id)
          );
        } else {
          // Already synced or no guest imports, but check if any guest IDs need mapping
          finalSelectedIds = selectedCapsuleIds.map(id => {
            if (id.startsWith('guest_')) {
              const guestImport = guestImports.find(g => g.id === id);
              if (guestImport && guestImport.isSynced) {
                const syncedCapsule = capsules.find(c => 
                  c.title === guestImport.title || 
                  (c.metadata as any)?.guestImportedAt === guestImport.createdAt
                );
                return syncedCapsule?.capsuleId || id;
              }
            }
            return id;
          }).filter(id => 
            // Only keep IDs that are actually server capsules
            capsules.some(c => c.capsuleId === id)
          );
        }

        // Final filter: only server capsule IDs
        const serverCapsuleIds = finalSelectedIds.filter(id =>
          capsules.some(capsule => capsule.capsuleId === id)
        );

        const result = await createNewMeeting({
          title: title.trim(),
          contextCapsuleIds: serverCapsuleIds.length > 0 ? serverCapsuleIds : undefined,
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

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-900">
            {t("meetingCreationForm.contextLabel")}
          </label>
          <p className="text-xs text-gray-500 mt-1">
            {t("meetingCreationForm.contextDesc")}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {/* Import Capsule Button */}
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

          {/* Capsules List */}
          {(capsules.length > 0 || guestImports.length > 0 || importingGuest) && (
            <div className="space-y-3">
              {/* Guest Import Loading */}
              {importingGuest && importingGuestTitle && (
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-900 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="max-w-[200px] truncate">{importingGuestTitle}</span>
                  </div>
                </div>
              )}
              {/* All Capsules - Unified display */}
              {(capsules.length > 0 || guestImports.filter(gi => !isAuthenticated || !gi.isSynced).length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {/* Server Capsules */}
                  {capsules.map((capsule) => (
                    <button
                      key={capsule.capsuleId}
                      type="button"
                      onClick={() => handleCapsuleClick(capsule.capsuleId, false)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                        selectedCapsuleIds.includes(capsule.capsuleId)
                          ? "bg-yellow-100 border-yellow-300 text-yellow-900"
                          : "bg-white border-gray-200 text-gray-700 hover:border-yellow-200 hover:bg-yellow-50"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="max-w-[200px] truncate">{capsule.title}</span>
                      {selectedCapsuleIds.includes(capsule.capsuleId) && (
                        <X className="w-3 h-3" />
                      )}
                    </button>
                  ))}
                  
                  {/* Guest Capsules - Only show unsynced ones when authenticated */}
                  {guestImports.filter(gi => !isAuthenticated || !gi.isSynced).map((guestImport) => (
                    <button
                      key={guestImport.id}
                      type="button"
                      onClick={() => handleCapsuleClick(guestImport.id, true)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                        selectedCapsuleIds.includes(guestImport.id)
                          ? "bg-yellow-100 border-yellow-300 text-yellow-900"
                          : "bg-white border-gray-200 text-gray-700 hover:border-yellow-200 hover:bg-yellow-50"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="max-w-[200px] truncate">{guestImport.title}</span>
                      {selectedCapsuleIds.includes(guestImport.id) && (
                        <X className="w-3 h-3" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedCapsuleIds.length > 0 && (
            <p className="text-xs text-gray-600">
              {selectedCapsuleIds.length} {selectedCapsuleIds.length === 1 ? 'capsule' : 'capsules'} selected
            </p>
          )}
        </div>
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

      {/* Import Capsule Modal */}
      <ImportCapsuleModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImportSuccess={handleImportSuccess}
        onImportStart={handleImportStart}
        onImportEnd={() => {
          // Don't clear importing state here - let useEffect handle it when guestImports updates
          // This ensures the capsule appears before clearing the loading state
        }}
      />

      {/* Capsule Preview */}
      <CapsuleDetailModal
        capsule={previewCapsule}
        open={!!previewCapsule}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewGuestId(null);
            setPreviewServerId(null);
          }
        }}
      />
    </form>
  );
};

export default MeetingCreationForm;