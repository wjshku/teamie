import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Upload, AlertCircle, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useGuestImport } from "../../hooks/useGuestImport";
import { importMeetingCapsule } from "../../services/api/meetingCapsule";
import { Alert, AlertDescription } from "../ui/alert";

interface ImportCapsuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: (newGuestId?: string) => void;
  onImportStart?: (title: string) => void;
  onImportEnd?: () => void;
}

const ImportCapsuleModal: React.FC<ImportCapsuleModalProps> = ({
  open,
  onOpenChange,
  onImportSuccess,
  onImportStart,
  onImportEnd,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { canImport, getRemainingImports, addGuestImport, maxImports } = useGuestImport();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (importing) return; // Prevent multiple submissions
    
    if (!title.trim() || !content.trim()) {
      setError(t("importCapsule.emptyFieldsError"));
      return;
    }

    // Check if guest can import
    if (!isAuthenticated && !canImport()) {
      setError(t("importCapsule.guestLimitReached", { max: maxImports }));
      return;
    }

    // Set importing state immediately to prevent duplicate calls
    setImporting(true);

    // Save values before clearing
    const importTitle = title.trim();
    const importContent = content.trim();

    // Immediately close the modal and clear form
    setTitle("");
    setContent("");
    setError(null);
    onOpenChange(false);

    // Start import in background - notify parent with title
    if (onImportStart) onImportStart(importTitle);

    // Process import asynchronously in background
    (async () => {
      try {
        if (isAuthenticated) {
          // Authenticated user - import to server
          const response = await importMeetingCapsule({
            title: importTitle,
            content: importContent,
          });

          if (response.success) {
            if (onImportSuccess) onImportSuccess();
          } else {
            // Log error but don't show modal (user already closed it)
            console.error("Failed to import capsule:", response.error);
          }
        } else {
          // Guest user - save locally
          try {
            const guest = await addGuestImport(importTitle, importContent);
            if (onImportSuccess) onImportSuccess(guest.id);
          } catch (err: any) {
            // Log error but don't show modal (user already closed it)
            console.error("Failed to import guest capsule:", err.message);
          }
        }
      } catch (err) {
        // Log error but don't show modal (user already closed it)
        console.error("Failed to import capsule:", err);
      } finally {
        setImporting(false);
        if (onImportEnd) onImportEnd();
      }
    })();
  };

  const handleClose = () => {
    if (importing) return; // Prevent closing while importing
    setTitle("");
    setContent("");
    setError(null);
    setImporting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            <DialogTitle className="text-xl sm:text-2xl">{t("importCapsule.title")}</DialogTitle>
          </div>
          <DialogDescription className="text-left text-sm">
            {t("importCapsule.description")}
          </DialogDescription>
          {!isAuthenticated && (
            <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                {t("importCapsule.guestMode", {
                  remaining: getRemainingImports(),
                  max: maxImports
                })}
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("importCapsule.meetingTitle")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("importCapsule.meetingTitlePlaceholder")}
              disabled={importing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("importCapsule.transcript")}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("importCapsule.transcriptPlaceholder")}
              disabled={importing}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || !title.trim() || !content.trim()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white w-full sm:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            {importing ? t("importCapsule.importing") : t("importCapsule.import")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCapsuleModal;
