import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { joinMeetingByToken } from "../../services/api/meetingService";
import FullScreenLoading from "../molecules/FullScreenLoading";
import FullScreenError from "../molecules/FullScreenError";
import { useAuth } from "../../hooks/useAuth";
import TopNavBar from "../organisms/TopNavBar";
import JoinStatusCard from "../organisms/JoinStatusCard";
import { useTranslation } from "react-i18next";

const MeetingJoinPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingData, setMeetingData] = useState<any>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleJoinMeeting = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setError(t("meetingJoin.missingToken"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await joinMeetingByToken(token);

        if (response.success && response.data) {
          setMeetingData(response.data.meeting);
          setIsParticipant(response.data.isParticipant);
          setMessage(response.data.message || "");
        } else {
          setError(t("meetingJoin.joinMeetingFailed"));
        }
      } catch (err: any) {
        setError(err.message || t("meetingJoin.joinMeetingFailed"));
      } finally {
        setLoading(false);
      }
    };

    handleJoinMeeting();
  }, [searchParams, t]);

  return (
    <>
      <TopNavBar />
      {loading && <FullScreenLoading text={t("meetingJoin.joiningMeeting")} />}
      {error && (
        <FullScreenError
          title={t("meetingJoin.joinMeetingFailed")}
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}
      {meetingData && (
        <div className="flex items-start justify-center min-h-screen bg-gray-50 px-4 pt-16">
          <JoinStatusCard
            meetingData={meetingData}
            isParticipant={isParticipant}
            message={message}
            isAuthenticated={isAuthenticated}
          />
        </div>
      )}
    </>
  );
};

export default MeetingJoinPage;
