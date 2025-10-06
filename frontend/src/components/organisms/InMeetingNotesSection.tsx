import React, { useState, useEffect } from 'react';
import { formatDateOnly, formatTime } from '../../utils/helpers';
import Button from '../atoms/Button';
import { useInMeeting } from '../../hooks/useInMeeting';
import { useAuth } from '../../hooks/useAuth';

interface InMeetingNotesSectionProps {
  meetingId: string;
  className?: string;
}

const InMeetingNotesSection: React.FC<InMeetingNotesSectionProps> = ({
  meetingId,
  className = '',
}) => {
  const [newNote, setNewNote] = useState('');
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
      const authorName = user?.name || '匿名用户';
      const noteData = {
        id: String(Date.now()),
        author: authorName,
        authorInitial: authorName.charAt(0),
        content: newNote.trim(),
      };
      
      const result = await addNoteData(noteData);
      if (result?.success) {
        setNewNote('');
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
    <div className={`space-y-6 ${className}`}>
      {/* 现有笔记列表 */}
      <div className="space-y-4">
        {existingNotes.map((note) => (
          <div key={note.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                {note.authorInitial}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 min-w-0">
                  <span className="font-medium text-gray-900">{note.author}</span>
                  <span className="timestamp">
                    <span className="md:hidden">{formatDateOnly(note.timestamp)}</span>
                    <span className="hidden md:inline">{formatTime(note.timestamp)}</span>
                  </span>
                </div>
                <div className="text-gray-800 whitespace-pre-line">
                  {note.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 添加笔记区域 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">添加笔记</h4>
        <div className="space-y-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="输入您的会议笔记..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            disabled={noteAdding}
          />
          <div className="flex justify-start">
            <Button
              onClick={handleAddNote}
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
              disabled={!newNote.trim() || noteAdding}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {noteAdding ? '添加中...' : '添加笔记'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InMeetingNotesSection;
