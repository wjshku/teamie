import React, { useState, useEffect } from "react";
import { useInMeeting } from "../../hooks/useInMeeting";
import { useAuth } from "../../hooks/useAuth";
import MessageBox from "../molecules/MessageBox";
import { useTranslation } from "react-i18next";
import { Edit3, Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";

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
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">{t("InMeetingNote.loading")}</p>
          <div className="space-y-3 w-full">
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (inMeetingError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {t("InMeetingNote.error")}: {inMeetingError}
            </span>
            <Button
              onClick={() => fetchInMeeting()}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              {t("InMeetingNote.retry")}
            </Button>
          </AlertDescription>
        </Alert>
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
