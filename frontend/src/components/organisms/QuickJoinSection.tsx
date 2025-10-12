import React from "react";
import QuickJoinForm from "../molecules/QuickJoinForm";

interface QuickJoinSectionProps {
  onNavigateToCreate: () => void;
  className?: string;
}

const QuickJoinSection: React.FC<QuickJoinSectionProps> = ({
  onNavigateToCreate,
  className = "",
}) => {
  return (
    <section className={`space-y-8 ${className}`}>
      <QuickJoinForm onNavigateToCreate={onNavigateToCreate} />
    </section>
  );
};

export default QuickJoinSection;
