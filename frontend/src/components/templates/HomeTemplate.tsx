import React from "react";
import TopNavBar from "../organisms/TopNavBar";
import QuickJoinSection from "../organisms/QuickJoinSection";
import RecentMeetings from "../organisms/RecentMeetings"; // 新增 import
import Propaganda from "../molecules/Propaganda";
import { Meeting } from "../../types/api";

interface HomeTemplateProps {
  recentMeetings: Meeting[];
  onViewMeeting: (meetingId: string) => void;
  onNavigateToCreate: () => void;
  isAuthenticated: boolean;
  className?: string;
}

const HomeTemplate: React.FC<HomeTemplateProps> = ({
  recentMeetings,
  onViewMeeting,
  onNavigateToCreate,
  isAuthenticated,
  className = "",
}) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <TopNavBar />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <QuickJoinSection onNavigateToCreate={onNavigateToCreate} />
          {!isAuthenticated && <Propaganda />}
          {isAuthenticated && (
            <RecentMeetings
              recentMeetings={recentMeetings}
              onViewMeeting={onViewMeeting}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default HomeTemplate;
