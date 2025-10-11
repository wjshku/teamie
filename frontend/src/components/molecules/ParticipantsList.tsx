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
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-5 h-5 text-green-600" />
        <h4 className="text-lg font-semibold text-gray-900">
          {t("participantsList.title")}
        </h4>
      </div>

      {participants.length > 0 ? (
        <div className="flex flex-wrap gap-2">
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
        <p className="text-sm text-gray-600">{t("participantsList.empty")}</p>
      )}
    </div>
  );
};

export default ParticipantsList;
