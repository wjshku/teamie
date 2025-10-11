import React from "react";
import { Button } from "../atoms/Button";

interface MeetingManagementProps {
  title: string;
  status: string;
  deleting: boolean;
  onDelete: () => void;
}

const MeetingManagement: React.FC<MeetingManagementProps> = ({
  title,
  status,
  deleting,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === "进行中"
              ? "bg-orange-100 text-orange-800"
              : status === "已结束"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-800"
          disabled={deleting}
        >
          {deleting ? "删除中..." : "删除会议"}
        </Button>
      </div>
    </div>
  );
};

export default MeetingManagement;
