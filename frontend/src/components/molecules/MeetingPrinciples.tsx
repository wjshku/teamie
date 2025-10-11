import React from "react";

const principles = [
  { key: "A", text: "提前分享议程" },
  { key: "C", text: "明确会议目标" },
  { key: "T", text: "管理讨论时间" },
  { key: "I", text: "包容性参与" },
  { key: "O", text: "记录会议结果" },
  { key: "N", text: "分配后续步骤" },
];

const MeetingPrinciples: React.FC = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
        <h4 className="text-lg font-semibold text-gray-900">
          会议指引 - ACTION 原则
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {principles.map((p) => (
          <div key={p.key} className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{p.key}</span>
            </div>
            <span className="text-gray-700">{p.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingPrinciples;
