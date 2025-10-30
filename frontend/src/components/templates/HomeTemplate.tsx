import React from "react";
import TopNavBar from "../organisms/TopNavBar";
import QuickJoinSection from "../organisms/QuickJoinSection";
import RecentMeetings from "../organisms/RecentMeetings";
import LandingPage from "../pages/LandingPage";
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
      {isAuthenticated ? (
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 w-full overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-8">
            <QuickJoinSection onNavigateToCreate={onNavigateToCreate} />
            <RecentMeetings
              recentMeetings={recentMeetings}
              onViewMeeting={onViewMeeting}
            />
          </div>
        </main>
      ) : (
        <LandingPage onNavigateToCreate={onNavigateToCreate} />
      )}
    </div>
  );
};

export default HomeTemplate;
