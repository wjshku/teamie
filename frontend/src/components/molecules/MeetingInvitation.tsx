import React from "react";
import { Button } from "../atoms/Button";
import { Link2, Copy } from "lucide-react";
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Link2 className="w-6 h-6 text-gray-700 flex-shrink-0" />
          <h4 className="text-lg font-semibold text-gray-900 flex-shrink-0">
            {t("meetingInvitation.title")}
          </h4>
          {showInviteLink && (
            <>
              <span className="text-gray-600 flex-shrink-0">-</span>
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded text-sm bg-gray-50 min-w-0"
              />
              <Button
                onClick={onCopyLink}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
                {t("meetingInvitation.copy")}
              </Button>
            </>
          )}
        </div>
        <Button
          onClick={showInviteLink ? onCloseLink : onGenerateLink}
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800 flex-shrink-0"
          disabled={generatingLink}
        >
          {showInviteLink
            ? t("meetingInvitation.close")
            : generatingLink
            ? t("meetingInvitation.generating")
            : t("meetingInvitation.generate")}
        </Button>
      </div>
      {showInviteLink && (
        <p className="text-sm text-gray-600 ml-8">{t("meetingInvitation.tip")}</p>
      )}
    </div>
  );
};

export default MeetingInvitation;
