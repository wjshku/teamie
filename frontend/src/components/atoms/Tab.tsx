import React from 'react';

interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface TabProps {
  tabs: TabItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  className?: string;
}

const Tab: React.FC<TabProps> = ({ tabs, activeIndex, onChange, className = '' }) => {
  return (
    <div className={`tab-container ${className}`}>
      <div className="tab-header">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className={`tab-button ${index === activeIndex ? 'tab-active' : ''}`}
            onClick={() => onChange(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
};

export default Tab;
