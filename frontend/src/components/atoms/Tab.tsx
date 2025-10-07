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
  const touchStartXRef = React.useRef<number | null>(null);
  const touchStartYRef = React.useRef<number | null>(null);

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const touch = e.changedTouches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const touch = e.changedTouches[0];
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    if (startX == null || startY == null) return;

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
      if (deltaX < 0 && activeIndex < tabs.length - 1) {
        onChange(activeIndex + 1);
      } else if (deltaX > 0 && activeIndex > 0) {
        onChange(activeIndex - 1);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <div className={`tab-container ${className}`}>
      {/* Desktop: full header; Mobile: hide header and show current tab only */}
      <div className="tab-header hidden md:flex">
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
      <div className="md:hidden">
        <div className="tab-current">
          {tabs[activeIndex]?.label}
        </div>
      </div>
      <div className="tab-content" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
};

export default Tab;
