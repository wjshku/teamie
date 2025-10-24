import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Link2 } from "lucide-react";
import { Button } from "../atoms/Button";
import DateTimePicker from "./DateTimePicker";

interface MeetingSchedulerProps {
  time: string;
  votelink: string;
  onSaveTime: (newTime: string) => Promise<void> | void;
  onSaveLink: (newLink: string) => Promise<void> | void;
}

const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  time,
  votelink,
  onSaveTime,
  onSaveLink,
}) => {
  const { t } = useTranslation();

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editedTime, setEditedTime] = useState(time);
  const [savingTime, setSavingTime] = useState(false);

  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editedLink, setEditedLink] = useState(votelink);
  const [savingLink, setSavingLink] = useState(false);

  // Helper function to ensure URL has proper protocol
  const ensureHttpPrefix = (url: string): string => {
    if (!url) return url;
    const trimmedUrl = url.trim();
    if (trimmedUrl && !trimmedUrl.match(/^https?:\/\//i)) {
      return 'https://' + trimmedUrl;
    }
    return trimmedUrl;
  };

  const handleSaveTime = async () => {
    setSavingTime(true);
    await onSaveTime(editedTime);
    setSavingTime(false);
    setIsEditingTime(false);
  };
  const handleCancelTime = () => {
    setEditedTime(time);
    setIsEditingTime(false);
  };

  const handleSaveLink = async () => {
    setSavingLink(true);
    const linkToSave = ensureHttpPrefix(editedLink);
    setEditedLink(linkToSave); // Update the input to show the corrected URL
    await onSaveLink(linkToSave);
    setSavingLink(false);
    setIsEditingLink(false);
  };

  const handleCancelLink = () => {
    setEditedLink(votelink);
    setIsEditingLink(false);
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !savingLink) {
      e.preventDefault();
      handleSaveLink();
    }
  };

  return (
    <div className="space-y-6">
      {/* 会议时间 */}
      <div className="space-y-3">
        {isEditingTime ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-gray-700" />
                <h4 className="text-lg font-semibold text-gray-900">
                  {t("meetingScheduler.timeLabel")}
                </h4>
              </div>
            </div>
            <div className="space-y-3">
              <DateTimePicker
                value={editedTime}
                onChange={(dateString) => setEditedTime(dateString)}
                disabled={savingTime}
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveTime}
                  variant="default"
                  size="sm"
                  disabled={savingTime}
                >
                  {savingTime ? t("common.saving") : t("common.save")}
                </Button>
                <Button onClick={handleCancelTime} variant="ghost" size="sm">
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-gray-700" />
              <h4 className="text-lg font-semibold text-gray-900">
                {t("meetingScheduler.timeLabel")}
              </h4>
              <span className="text-gray-600 ml-2">-</span>
              <span className="text-lg text-gray-900 font-medium">{time}</span>
            </div>
            <Button
              onClick={() => setIsEditingTime(true)}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              {t("common.edit")}
            </Button>
          </div>
        )}
      </div>

      {/* 投票链接 */}
      <div className="space-y-3">
        {isEditingLink ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-6 h-6 text-gray-700" />
                <h4 className="text-lg font-semibold text-gray-900">
                  {t("meetingScheduler.voteLinkLabel")}
                </h4>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="url"
                value={editedLink}
                onChange={(e) => setEditedLink(e.target.value)}
                onKeyDown={handleLinkKeyDown}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("meetingScheduler.linkPlaceholder") || ""}
                disabled={savingLink}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveLink}
                  variant="default"
                  size="sm"
                  disabled={savingLink}
                >
                  {savingLink ? t("common.saving") : t("common.save")}
                </Button>
                <Button onClick={handleCancelLink} variant="ghost" size="sm">
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-6 h-6 text-gray-700" />
              <h4 className="text-lg font-semibold text-gray-900">
                {t("meetingScheduler.voteLinkLabel")}
              </h4>
              <span className="text-gray-600 ml-2">-</span>
              <a
                href={ensureHttpPrefix(votelink)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                {votelink}
              </a>
            </div>
            <Button
              onClick={() => setIsEditingLink(true)}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              {t("common.edit")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingScheduler;
