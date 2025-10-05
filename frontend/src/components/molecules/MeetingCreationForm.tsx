import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../atoms/InputField';
import Button from '../atoms/Button';
import { useMeetings } from '../../hooks/useMeetings';

interface MeetingCreationFormProps {
  onSubmit: (data: { title: string }) => void;
  className?: string;
}

const MeetingCreationForm: React.FC<MeetingCreationFormProps> = ({ onSubmit, className = '' }) => {
  const navigate = useNavigate();
  const { createNewMeeting, loading } = useMeetings();
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        const result = await createNewMeeting({
          title: title.trim(),
        });
        
        if (result.success && result.meeting) {
          // 调用父组件的回调
          onSubmit({ title: title.trim() });
          
          // 重定向到新创建的会议页面
          navigate(`/meeting/${result.meeting.meetingid}`);
        }
      } catch (error) {
        console.error('创建会议失败:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900">会议标题</label>
        <InputField
          type="text"
          placeholder="请输入会议标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex justify-start">
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          className="px-8"
          disabled={loading}
        >
          {loading ? '创建中...' : '创建会议'}
        </Button>
      </div>
    </form>
  );
};

export default MeetingCreationForm;
