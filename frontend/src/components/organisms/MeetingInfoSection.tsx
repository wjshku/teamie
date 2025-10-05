import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../atoms/Button';
import { useMeetinginfo } from '../../hooks/useMeetinginfo';

interface MeetingInfoSectionProps {
  meetingId: string;
  className?: string;
}

const MeetingInfoSection: React.FC<MeetingInfoSectionProps> = ({
  meetingId,
  className = '',
}) => {
  const { currentMeeting, updateMeetingData, deleteMeetingData, generateInviteLinkData } = useMeetinginfo(meetingId);
  const navigate = useNavigate();
  const [votingLink, setVotingLink] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editedTime, setEditedTime] = useState('');
  const [savingLink, setSavingLink] = useState(false);
  const [savingTime, setSavingTime] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  React.useEffect(() => {
    if (currentMeeting) {
      setVotingLink(currentMeeting.votelink || '');
      setEditedTime(currentMeeting.time || '');
    }
  }, [currentMeeting]);

  const handleEditLink = () => {
    setIsEditingLink(true);
  };

  const handleSaveLink = async () => {
    if (currentMeeting && votingLink !== currentMeeting.votelink) {
      setSavingLink(true);
      await updateMeetingData({ votelink: votingLink });
      setSavingLink(false);
    }
    setIsEditingLink(false);
  };

  const handleCancelEdit = () => {
    setIsEditingLink(false);
  };

  const handleEditTime = () => {
    setIsEditingTime(true);
    setEditedTime(currentMeeting?.time || '');
  };

  const handleSaveTime = async () => {
    if (currentMeeting && editedTime !== currentMeeting.time) {
      setSavingTime(true);
      await updateMeetingData({ time: editedTime });
      setSavingTime(false);
    }
    setIsEditingTime(false);
  };

  const handleCancelTimeEdit = () => {
    setEditedTime(currentMeeting?.time || '');
    setIsEditingTime(false);
  };

  const handleDeleteMeeting = async () => {
    if (!currentMeeting) return;
    setDeleting(true);
    await deleteMeetingData();
    setDeleting(false);
    navigate('/');
  };

  const handleGenerateInviteLink = async () => {
    if (!currentMeeting) return;
    setGeneratingLink(true);
    try {
      const result = await generateInviteLinkData();
      if (result.success && result.data) {
        // 组合完整URL
        const fullUrl = `${window.location.origin}${result.data.invite_link}`;
        setInviteLink(fullUrl);
        setShowInviteLink(true);
      }
    } catch (error) {
      console.error('生成邀请链接失败:', error);
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    // 可以添加一个toast提示
  };

  const handleCloseInviteLink = () => {
    setShowInviteLink(false);
    setInviteLink('');
  };

  if (!currentMeeting) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600">会议数据加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 会议基本信息 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{currentMeeting.title}</h1>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentMeeting.status === '进行中' 
                ? 'bg-orange-100 text-orange-800' 
                : currentMeeting.status === '已结束'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {currentMeeting.status}
            </span>
            <Button
              onClick={handleDeleteMeeting}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800"
              disabled={deleting}
            >
              {deleting ? '删除中...' : '删除会议'}
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-medium">会议时间</span>
            </div>
            {!isEditingTime && (
              <Button
                onClick={handleEditTime}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                编辑
              </Button>
            )}
          </div>
          
          {isEditingTime ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedTime}
                onChange={(e) => setEditedTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入会议时间"
                disabled={savingTime}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveTime}
                  variant="primary"
                  size="sm"
                  disabled={savingTime}
                >
                  {savingTime ? '保存中...' : '保存'}
                </Button>
                <Button
                  onClick={handleCancelTimeEdit}
                  variant="ghost"
                  size="sm"
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-lg text-gray-900 font-medium">
              {currentMeeting.time}
            </div>
          )}
        </div>

        {/* 投票链接 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">投票链接</h4>
            {!isEditingLink && (
              <Button
                onClick={handleEditLink}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                编辑
              </Button>
            )}
          </div>
          
          {isEditingLink ? (
            <div className="space-y-3">
              <input
                type="url"
                value={votingLink}
                onChange={(e) => setVotingLink(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入投票链接"
                disabled={savingLink}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveLink}
                  variant="primary"
                  size="sm"
                  disabled={savingLink}
                >
                  {savingLink ? '保存中...' : '保存'}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="ghost"
                  size="sm"
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <a 
                href={currentMeeting.votelink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline flex-1"
              >
                {currentMeeting.votelink}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 会议指引卡片 - 黄色 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">会议指引 - ACTION 原则</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-gray-700">提前分享议程</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="text-gray-700">明确会议目标</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <span className="text-gray-700">管理讨论时间</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">I</span>
            </div>
            <span className="text-gray-700">包容性参与</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">O</span>
            </div>
            <span className="text-gray-700">记录会议结果</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <span className="text-gray-700">分配后续步骤</span>
          </div>
        </div>
      </div>

      {/* 邀请链接卡片 - 蓝色 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-900">邀请链接</h4>
          <Button
            onClick={handleGenerateInviteLink}
            variant="primary"
            size="sm"
            disabled={generatingLink}
          >
            {generatingLink ? '生成中...' : '生成邀请链接'}
          </Button>
        </div>
        
        {showInviteLink && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded text-sm bg-gray-50"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCopyInviteLink}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800"
                >
                  复制
                </Button>
                <Button
                  onClick={handleCloseInviteLink}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  关闭
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              分享此链接邀请其他人加入会议
            </p>
          </div>
        )}
      </div>

      {/* 参与者卡片 - 绿色 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">参与者</h4>
        <div className="flex flex-wrap gap-2">
          {currentMeeting.participants.map((participant, index) => (
            <span
              key={participant.id || index}
              className="px-3 py-1 text-gray-700 bg-gray-200 rounded-md"
            >
              {participant.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeetingInfoSection;
