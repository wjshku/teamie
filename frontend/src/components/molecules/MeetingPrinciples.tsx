import React from "react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const MeetingPrinciples: React.FC = () => {
  const { t } = useTranslation();

  const principles = [
    { key: "A", text: t("meetingPrinciples.shareAgenda") },
    { key: "C", text: t("meetingPrinciples.clearGoal") },
    { key: "T", text: t("meetingPrinciples.timeManagement") },
    { key: "I", text: t("meetingPrinciples.inclusiveParticipation") },
    { key: "O", text: t("meetingPrinciples.recordOutcome") },
    { key: "N", text: t("meetingPrinciples.assignNextSteps") },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertCircle className="w-6 h-6 text-gray-700 flex-shrink-0" />
        <h4 className="text-lg font-semibold text-gray-900 flex-shrink-0">
          {t("meetingPrinciples.title")}
        </h4>
      </div>

      {/* Content Card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 ml-8">
        <div className="grid grid-cols-2 gap-3">
          {principles.map((p) => (
            <div key={p.key} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{p.key}</span>
              </div>
              <span className="text-gray-700">{p.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeetingPrinciples;
