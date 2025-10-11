import React, { useState, useEffect } from "react";
import { useInMeeting } from "../../hooks/useInMeeting";
import { useAuth } from "../../hooks/useAuth";
import MessageBox from "../molecules/MessageBox";

interface InMeetingNotesSectionProps {
  meetingId: string;
  className?: string;
}

const InMeetingNotesSection: React.FC<InMeetingNotesSectionProps> = ({
  meetingId,
  className = "",
}) => {
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
    if (meetingId) {
      fetchInMeeting();
    }
  }, [meetingId, fetchInMeeting]);

  const handleAddNote = async () => {
    if (newNote.trim()) {
      const authorName = user?.name || "匿名用户";
      const noteData = {
        id: String(Date.now()),
        author: authorName,
        authorInitial: authorName.charAt(0),
        content: newNote.trim(),
      };

      const result = await addNoteData(noteData);
      if (result?.success) {
        setNewNote("");
      }
    }
  };

  const existingNotes = inMeeting?.notes || [];

  if (inMeetingLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">加载中...</p>
        </div>
      </div>
    );
  }

  if (inMeetingError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600">加载失败: {inMeetingError}</p>
          <button
            onClick={() => fetchInMeeting()}
            className="btn btn-primary btn-sm mt-2"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <MessageBox
      label="会议笔记"
      labelIcon={
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
          />
        </svg>
      }
      messages={existingNotes}
      newMessage={newNote}
      onNewMessageChange={setNewNote}
      onSubmitNewMessage={handleAddNote}
      submitting={noteAdding}
      placeholder="输入您的会议笔记..."
    />
  );
};

export default InMeetingNotesSection;
