import React from "react";
import { Button } from "../atoms/Button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface JoinStatusCardProps {
  meetingData: any;
  isParticipant: boolean;
  message: string;
  isAuthenticated: boolean;
}

const JoinStatusCard: React.FC<JoinStatusCardProps> = ({
  meetingData,
  isParticipant,
  message,
  isAuthenticated,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cardBg = isParticipant
    ? "bg-green-50 border-green-200"
    : "bg-yellow-50 border-yellow-200";
  const iconColor = isParticipant ? "text-green-600" : "text-yellow-600";
  const titleColor = isParticipant ? "text-green-800" : "text-yellow-800";

  return (
    <div
      className={`p-8 rounded-xl border ${cardBg} max-w-lg w-full mx-auto text-center shadow-lg`}
    >
      <div
        className={`flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-opacity-20 rounded-full ${isParticipant ? "bg-green-100" : "bg-yellow-100"}`}
      >
        {isParticipant ? (
          <svg
            className={`w-8 h-8 ${iconColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className={`w-8 h-8 ${iconColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M6.062 21h11.876c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.33 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        )}
      </div>

      <h2 className={`text-2xl font-semibold mb-4 ${titleColor}`}>
        {isParticipant
          ? t("meetingJoin.successJoinedMeeting")
          : t("meetingJoin.needLogin")}
      </h2>

      <p className="text-lg mb-6">{message}</p>

      <div className="bg-white rounded-lg p-6 mb-6 text-left shadow-inner">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {meetingData.title}
        </h3>
        <p className="text-md text-gray-700 mb-1">
          {t("meetingJoin.meetingTime")}: {meetingData.time || "—"}
        </p>
        {isParticipant && (
          <p className="text-md text-gray-700">
            {t("meetingJoin.status")}: {meetingData.status}
          </p>
        )}
      </div>

      {isParticipant && (
        <p className="text-sm text-gray-500">{t("meetingJoin.redirecting")}</p>
      )}
    </div>
  );
};

export default JoinStatusCard;
