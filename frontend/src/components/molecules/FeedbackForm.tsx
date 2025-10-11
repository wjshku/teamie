import React, { useState } from "react";
import TextArea from "../atoms/TextArea";
import { Button } from "../atoms/Button";

interface FeedbackFormProps {
  onSubmit: (feedback: string) => void;
  className?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  className = "",
}) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      onSubmit(feedback.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`feedback-form ${className}`}>
      <TextArea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="请输入会议反馈和总结..."
        rows={8}
        className="feedback-textarea"
      />
      <Button type="submit" variant="default" className="feedback-submit">
        提交反馈
      </Button>
    </form>
  );
};

export default FeedbackForm;
