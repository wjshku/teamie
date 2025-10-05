import React, { useState } from 'react';
import TextArea from '../atoms/TextArea';
import Button from '../atoms/Button';
import Tag from '../atoms/Tag';

interface NoteEditorProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onTagUser?: (userId: string) => void;
  className?: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  initialContent = '',
  onSave,
  onTagUser,
  className = '',
}) => {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim());
    }
  };

  return (
    <div className={`note-editor ${className}`}>
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="输入会议笔记..."
        rows={6}
        className="note-textarea"
      />
      <div className="note-actions">
        <Button onClick={handleSave} variant="primary" size="sm">
          保存笔记
        </Button>
        {onTagUser && (
          <Tag
            text="@用户"
            clickable
            onClick={() => onTagUser('user-id')}
            className="tag-user"
          />
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
