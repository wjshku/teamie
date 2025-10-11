import React from "react";
import { Button } from "../atoms/Button";
import { formatDateOnly, formatTime } from "../../utils/helpers";

interface Message {
  id: string;
  author: string;
  authorInitial: string;
  content: string;
  timestamp?: string;
}

interface MessageBoxProps {
  label: string;
  labelIcon?: React.ReactNode;
  messages?: Message[]; // 可显示已有消息列表
  newMessage: string;
  onNewMessageChange: (val: string) => void;
  onSubmitNewMessage: () => void;
  submitting?: boolean;
  placeholder?: string;
  rows?: number;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  label,
  labelIcon,
  messages = [],
  newMessage,
  onNewMessageChange,
  onSubmitNewMessage,
  submitting = false,
  placeholder = "",
  rows = 3,
}) => {
  return (
    <div className="space-y-4">
      {/* Label + Icon */}
      <div className="flex items-center gap-2">
        {labelIcon && <span>{labelIcon}</span>}
        <h4 className="text-lg font-semibold text-gray-900">{label}</h4>
      </div>

      {/* 消息列表 */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                {msg.authorInitial}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">
                    {msg.author}
                  </span>
                  <span className="text-sm text-gray-500 md:hidden">
                    {msg.timestamp ? formatDateOnly(msg.timestamp) : ""}
                  </span>
                  <span className="text-sm text-gray-500 hidden md:inline">
                    {msg.timestamp ? formatTime(msg.timestamp) : ""}
                  </span>
                </div>
                <div className="text-gray-800">{msg.content}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 输入新消息 */}
      <div className="space-y-3">
        <textarea
          value={newMessage}
          onChange={(e) => onNewMessageChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={rows}
          disabled={submitting}
        />
        <div className="flex justify-start">
          <Button
            onClick={onSubmitNewMessage}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
            disabled={!newMessage.trim() || submitting}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            {submitting ? "添加中..." : "提交"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
