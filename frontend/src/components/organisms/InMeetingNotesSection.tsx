import React, { useState, useEffect } from "react";
import { useInMeeting } from "../../hooks/useInMeeting";
import { useAuth } from "../../hooks/useAuth";
import MessageBox from "../molecules/MessageBox";
import { useTranslation } from "react-i18next";
import { Edit3 } from "lucide-react";

interface InMeetingNotesSectionProps {
  meetingId: string;
  className?: string;
}

const InMeetingNotesSection: React.FC<InMeetingNotesSectionProps> = ({
  meetingId,
  className = "",
}) => {
  const { t } = useTranslation();
  const [newNote, setNewNote] = useState("");
  const { user } = useAuth();

  const {
    inMeeting,
    inMeetingLoading,
    inMeetingError,
    noteAdding,
    fetchInMeeting,
    addNoteData,
  } = useInMeeting(meetingId);

  // 初始化数据
  useEffect(() => {
    if (meetingId) fetchInMeeting();
  }, [meetingId, fetchInMeeting]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    const authorName = user?.name || t("InMeetingNote.anonymous");
    const noteData = {
      id: String(Date.now()),
      author: authorName,
      authorInitial: authorName.charAt(0),
      content: newNote.trim(),
    };

    const result = await addNoteData(noteData);
    if (result?.success) setNewNote("");
  };

  const existingNotes = inMeeting?.notes || [];

  if (inMeetingLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">{t("InMeetingNote.loading")}</p>
        </div>
      </div>
    );
  }

  if (inMeetingError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600">
            {t("InMeetingNote.error")}: {inMeetingError}
          </p>
          <button
            onClick={() => fetchInMeeting()}
            className="btn btn-primary btn-sm mt-2"
          >
            {t("InMeetingNote.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <MessageBox
      label={t("InMeetingNote.label")}
      labelIcon={<Edit3 className="w-5 h-5 text-gray-600" />}
      messages={existingNotes}
      newMessage={newNote}
      onNewMessageChange={setNewNote}
      onSubmitNewMessage={handleAddNote}
      submitting={noteAdding}
      placeholder={t("InMeetingNote.placeholder")}
    />
  );
};

export default InMeetingNotesSection;
