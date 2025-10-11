import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../atoms/Button";

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
    await onSaveLink(editedLink);
    setSavingLink(false);
    setIsEditingLink(false);
  };
  const handleCancelLink = () => {
    setEditedLink(votelink);
    setIsEditingLink(false);
  };

  return (
    <div className="space-y-3">
      {/* 会议时间 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-lg font-medium">
              {t("meetingScheduler.timeLabel")}
            </span>
          </div>
          {!isEditingTime && (
            <Button
              onClick={() => setIsEditingTime(true)}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              {t("common.edit")}
            </Button>
          )}
        </div>

        {isEditingTime ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editedTime}
              onChange={(e) => setEditedTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("meetingScheduler.timePlaceholder") || ""}
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
        ) : (
          <div className="text-lg text-gray-900 font-medium">{time}</div>
        )}
      </div>

      {/* 投票链接 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            {t("meetingScheduler.voteLinkLabel")}
          </h4>
          {!isEditingLink && (
            <Button
              onClick={() => setIsEditingLink(true)}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              {t("common.edit")}
            </Button>
          )}
        </div>

        {isEditingLink ? (
          <div className="space-y-3">
            <input
              type="url"
              value={editedLink}
              onChange={(e) => setEditedLink(e.target.value)}
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
        ) : (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <svg
              className="w-5 h-5 text-gray-500"
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
            <a
              href={votelink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline flex-1"
            >
              {votelink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingScheduler;
