import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../atoms/Button";

interface MeetingManagementProps {
  title: string;
  status: string;
  deleting: boolean;
  onDelete: () => void;
}

const MeetingManagement: React.FC<MeetingManagementProps> = ({
  title,
  deleting,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-800"
          disabled={deleting}
        >
          {deleting
            ? t("meetingManagement.deleting")
            : t("meetingManagement.delete")}
        </Button>
      </div>
    </div>
  );
};

export default MeetingManagement;
