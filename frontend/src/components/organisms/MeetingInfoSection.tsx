import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMeetinginfo } from "../../hooks/useMeetinginfo";
import MeetingManagement from "../molecules/MeetingManagement";
import MeetingScheduler from "../molecules/MeetingScheduler";
import MeetingPrinciples from "../molecules/MeetingPrinciples";
import MeetingInvitation from "../molecules/MeetingInvitation";
import ParticipantsList from "../molecules/ParticipantsList";

interface MeetingInfoSectionProps {
  meetingId: string;
  className?: string;
}

const MeetingInfoSection: React.FC<MeetingInfoSectionProps> = ({
  meetingId,
  className = "",
}) => {
  const {
    currentMeeting,
    updateMeetingData,
    deleteMeetingData,
    generateInviteLinkData,
  } = useMeetinginfo(meetingId);
  const navigate = useNavigate();

  const [inviteLink, setInviteLink] = useState("");
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  const handleSaveTime = async (newTime: string) => {
    if (currentMeeting && newTime !== currentMeeting.time) {
      await updateMeetingData({ time: newTime });
    }
  };

  const handleSaveLink = async (newLink: string) => {
    if (currentMeeting && newLink !== currentMeeting.votelink) {
      await updateMeetingData({ votelink: newLink });
    }
  };

  const handleDeleteMeeting = async () => {
    if (!currentMeeting) return;
    await deleteMeetingData();
    navigate("/");
  };

  const handleGenerateInviteLink = async () => {
    if (!currentMeeting) return;
    setGeneratingLink(true);
    try {
      const result = await generateInviteLinkData();
      if (result.success && result.data) {
        setInviteLink(`${window.location.origin}${result.data.invite_link}`);
        setShowInviteLink(true);
      }
    } catch (error) {
      console.error("生成邀请链接失败:", error);
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyInviteLink = () => navigator.clipboard.writeText(inviteLink);
  const handleCloseInviteLink = () => {
    setShowInviteLink(false);
    setInviteLink("");
  };

  if (!currentMeeting) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      <MeetingManagement
        title={currentMeeting.title}
        deleting={false}
        onDelete={handleDeleteMeeting}
      />

      <MeetingScheduler
        time={currentMeeting.time}
        votelink={currentMeeting.votelink}
        onSaveTime={handleSaveTime}
        onSaveLink={handleSaveLink}
      />

      <MeetingPrinciples />

      <MeetingInvitation
        inviteLink={inviteLink}
        showInviteLink={showInviteLink}
        generatingLink={generatingLink}
        onGenerateLink={handleGenerateInviteLink}
        onCopyLink={handleCopyInviteLink}
        onCloseLink={handleCloseInviteLink}
      />

      <ParticipantsList participants={currentMeeting.participants} />
    </div>
  );
};

export default MeetingInfoSection;
