import React from "react";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Participant {
  id?: string | number;
  name: string;
}

interface ParticipantsListProps {
  participants: Participant[];
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <User className="w-6 h-6 text-gray-700 flex-shrink-0" />
        <h4 className="text-lg font-semibold text-gray-900 flex-shrink-0">
          {t("participantsList.title")}
        </h4>
      </div>

      {/* Content */}
      {participants.length > 0 ? (
        <div className="flex flex-wrap gap-2 ml-8">
          {participants.map((participant, index) => (
            <span
              key={participant.id || index}
              className="px-3 py-1 text-gray-700 bg-gray-200 rounded-md"
            >
              {participant.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600 ml-8">{t("participantsList.empty")}</p>
      )}
    </div>
  );
};

export default ParticipantsList;
