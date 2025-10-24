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
import { Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
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

    setImporting(true);
    setError(null);
    setSuccess(false);

    try {
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-6 h-6 text-purple-600" />
            <DialogTitle className="text-2xl">{t("importCapsule.title")}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {t("importCapsule.description")}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{t("importCapsule.importSuccess")}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={importing || success}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || success || !title.trim() || !content.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
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
