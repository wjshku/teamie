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
import { Upload, Loader2, AlertCircle, CheckCircle, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useGuestImport } from "../../hooks/useGuestImport";
import { importMeetingCapsule } from "../../services/api/meetingCapsule";
import { Alert, AlertDescription } from "../ui/alert";

interface ImportCapsuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

const ImportCapsuleModal: React.FC<ImportCapsuleModalProps> = ({
  open,
  onOpenChange,
  onImportSuccess,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { canImport, getRemainingImports, addGuestImport, maxImports } = useGuestImport();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImport = async () => {
    if (!title.trim() || !content.trim()) {
      setError(t("importCapsule.emptyFieldsError"));
      return;
    }

    // Check if guest can import
    if (!isAuthenticated && !canImport()) {
      setError(t("importCapsule.guestLimitReached", { max: maxImports }));
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(false);

    try {
      if (isAuthenticated) {
        // Authenticated user - import to server
        const response = await importMeetingCapsule({
          title: title.trim(),
          content: content.trim(),
        });

        if (response.success) {
          setSuccess(true);
          setTimeout(() => {
            // Reset form
            setTitle("");
            setContent("");
            setSuccess(false);
            onOpenChange(false);
            // Trigger refresh
            if (onImportSuccess) {
              onImportSuccess();
            }
          }, 1500);
        } else {
          setError(response.error || t("importCapsule.importError"));
        }
      } else {
        // Guest user - save locally
        try {
          addGuestImport(title.trim(), content.trim());
          setSuccess(true);
          setTimeout(() => {
            // Reset form
            setTitle("");
            setContent("");
            setSuccess(false);
            onOpenChange(false);
            // Trigger refresh
            if (onImportSuccess) {
              onImportSuccess();
            }
          }, 1500);
        } catch (err: any) {
          setError(err.message || t("importCapsule.importError"));
        }
      }
    } catch (err) {
      setError(t("importCapsule.importError"));
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (!importing) {
      setTitle("");
      setContent("");
      setError(null);
      setSuccess(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            <DialogTitle className="text-xl sm:text-2xl">{t("importCapsule.title")}</DialogTitle>
          </div>
          <DialogDescription className="text-left text-sm space-y-2">
            <p>{t("importCapsule.description")}</p>
            {!isAuthenticated && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <User className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-700">
                  {t("importCapsule.guestMode", {
                    remaining: getRemainingImports(),
                    max: maxImports
                  })}
                </p>
              </div>
            )}
          </DialogDescription>
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
              disabled={importing || success}
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
              disabled={importing || success}
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

          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm">{t("importCapsule.importSuccess")}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={importing || success}
            className="w-full sm:w-auto"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || success || !title.trim() || !content.trim()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white w-full sm:w-auto"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("importCapsule.importing")}
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {t("importCapsule.imported")}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {t("importCapsule.import")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCapsuleModal;
