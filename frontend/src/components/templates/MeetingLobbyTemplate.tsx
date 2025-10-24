import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Download, Check, Copy } from "lucide-react";
import TopNavBar from "../organisms/TopNavBar";
import Tab from "../atoms/Tab";
import MeetingInfoSection from "../organisms/MeetingInfoSection";
import PreMeetingSection from "../organisms/PreMeetingSection";
import InMeetingNotesSection from "../organisms/InMeetingNotesSection";
import PostMeetingSummarySection from "../organisms/PostMeetingSummarySection";
import { Button } from "../ui/button";
import { useMeetinginfo } from "../../hooks/useMeetinginfo";
import { usePreMeeting } from "../../hooks/usePreMeeting";
import { useInMeeting } from "../../hooks/useInMeeting";
import { usePostMeeting } from "../../hooks/usePostMeeting";
import { exportMeetingToMarkdown, generateMeetingMarkdown, copyMarkdownToClipboard } from "../../utils/exportMarkdown";

interface MeetingLobbyTemplateProps {
  meetingId: string;
  className?: string;
}

const MeetingLobbyTemplate: React.FC<MeetingLobbyTemplateProps> = ({
  meetingId,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { t } = useTranslation();

  // Get all meeting data from stores
  const { currentMeeting } = useMeetinginfo(meetingId);
  const {
    preMeeting,
    fetchPreMeeting
  } = usePreMeeting(meetingId);
  const {
    inMeeting,
    fetchInMeeting
  } = useInMeeting(meetingId);
  const {
    postMeeting,
    fetchPostMeeting
  } = usePostMeeting(meetingId);

  // Fetch meeting data in background (non-blocking)
  useEffect(() => {
    if (meetingId) {
      // Fetch in background without blocking render
      setTimeout(() => {
        fetchPreMeeting();
        fetchInMeeting();
        fetchPostMeeting();
      }, 0);
    }
  }, [meetingId, fetchPreMeeting, fetchInMeeting, fetchPostMeeting]);

  // Handle export to markdown
  const handleExportMarkdown = () => {
    if (!currentMeeting) {
      alert(t("MeetingLobbyTemplate.exportError") || "No meeting data to export");
      return;
    }

    setIsExporting(true);
    try {
      // Export with data from store
      exportMeetingToMarkdown({
        meeting: currentMeeting,
        preMeeting: preMeeting,
        inMeeting: inMeeting,
        postMeeting: postMeeting,
      });

      // Show success state
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (error) {
      console.error("Export failed:", error);
      alert(t("MeetingLobbyTemplate.exportFailed") || "Failed to export meeting data");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle copy to Notion
  const handleCopyToNotion = async () => {
    if (!currentMeeting) {
      alert(t("MeetingLobbyTemplate.exportError") || "No meeting data to export");
      return;
    }

    setIsCopying(true);
    try {
      // Generate markdown
      const markdown = generateMeetingMarkdown({
        meeting: currentMeeting,
        preMeeting: preMeeting,
        inMeeting: inMeeting,
        postMeeting: postMeeting,
      });

      // Copy to clipboard
      const success = await copyMarkdownToClipboard(markdown);

      if (success) {
        // Show success state
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);

        // Open Notion in a new tab
        window.open('https://notion.so', '_blank');
      } else {
        alert(t("MeetingLobbyTemplate.copyFailed") || "Failed to copy to clipboard");
      }
    } catch (error) {
      console.error("Copy failed:", error);
      alert(t("MeetingLobbyTemplate.copyFailed") || "Failed to copy to clipboard");
    } finally {
      setIsCopying(false);
    }
  };

  const tabs = [
    {
      id: "info",
      label: t("MeetingLobbyTemplate.basicInfo"),
      content: <MeetingInfoSection meetingId={meetingId} />,
    },
    {
      id: "pre",
      label: t("MeetingLobbyTemplate.preMeeting"),
      content: <PreMeetingSection meetingId={meetingId} />,
    },
    {
      id: "notes",
      label: t("MeetingLobbyTemplate.collabNotes"),
      content: <InMeetingNotesSection meetingId={meetingId} />,
    },
    {
      id: "summary",
      label: t("MeetingLobbyTemplate.postSummary"),
      content: <PostMeetingSummarySection meetingId={meetingId} />,
    },
  ];

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <TopNavBar />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="card">
            <div className="mt-4">
              <div className="card-content">
                {/* Export Buttons */}
                <div className="flex justify-end gap-2 mb-4">
                  <Button
                    onClick={handleCopyToNotion}
                    disabled={isCopying || !currentMeeting}
                    variant={copySuccess ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t("MeetingLobbyTemplate.copied") || "Copied!"}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {isCopying
                          ? t("MeetingLobbyTemplate.copying") || "Copying..."
                          : t("MeetingLobbyTemplate.copyToNotion") || "Copy to Notion"}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleExportMarkdown}
                    disabled={isExporting || !currentMeeting}
                    variant={exportSuccess ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                  >
                    {exportSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t("MeetingLobbyTemplate.exported") || "Exported!"}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        {isExporting
                          ? t("MeetingLobbyTemplate.exporting") || "Exporting..."
                          : t("MeetingLobbyTemplate.downloadMarkdown") || "Download Markdown"}
                      </>
                    )}
                  </Button>
                </div>

                <Tab
                  tabs={tabs}
                  activeIndex={activeTab}
                  onChange={setActiveTab}
                  className="meeting-tabs"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MeetingLobbyTemplate;
