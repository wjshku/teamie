import React from "react";
import { Button } from "../atoms/Button";
import { Link2, Copy, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MeetingInvitationProps {
  inviteLink: string;
  showInviteLink: boolean;
  generatingLink: boolean;
  onGenerateLink: () => void;
  onCopyLink: () => void;
  onCloseLink: () => void;
}

const MeetingInvitation: React.FC<MeetingInvitationProps> = ({
  inviteLink,
  showInviteLink,
  generatingLink,
  onGenerateLink,
  onCopyLink,
  onCloseLink,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-gray-900">
          {t("meetingInvitation.title")}
        </h4>
        <Button
          onClick={onGenerateLink}
          variant="default"
          size="sm"
          disabled={generatingLink}
        >
          {generatingLink
            ? t("meetingInvitation.generating")
            : t("meetingInvitation.generate")}
        </Button>
      </div>

      {showInviteLink && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg">
            <Link2 className="w-5 h-5 text-blue-500" />
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded text-sm bg-gray-50"
            />
            <div className="flex gap-2">
              <Button
                onClick={onCopyLink}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Copy className="w-4 h-4" />
                {t("meetingInvitation.copy")}
              </Button>
              <Button
                onClick={onCloseLink}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                {t("meetingInvitation.close")}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">{t("meetingInvitation.tip")}</p>
        </div>
      )}
    </div>
  );
};

export default MeetingInvitation;
