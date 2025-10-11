import React from "react";
import { Button } from "../atoms/Button";

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
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-gray-900">邀请链接</h4>
        <Button
          onClick={onGenerateLink}
          variant="default"
          size="sm"
          disabled={generatingLink}
        >
          {generatingLink ? "生成中..." : "生成邀请链接"}
        </Button>
      </div>

      {showInviteLink && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
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
                className="text-blue-600 hover:text-blue-800"
              >
                复制
              </Button>
              <Button
                onClick={onCloseLink}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                关闭
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">分享此链接邀请其他人加入会议</p>
        </div>
      )}
    </div>
  );
};

export default MeetingInvitation;
