import React from "react";

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
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-3">参与者</h4>
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
    </div>
  );
};

export default ParticipantsList;
