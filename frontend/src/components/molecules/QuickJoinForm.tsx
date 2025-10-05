import React from 'react';

interface QuickJoinFormProps {
  onNavigateToCreate: () => void;
  className?: string;
}

const QuickJoinForm: React.FC<QuickJoinFormProps> = ({
  onNavigateToCreate,
  className = '',
}) => {
  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h2 className="card-title">快速开始</h2>
        <p className="card-description">立即创建一个新的会议，邀请团队成员参与讨论</p>
      </div>
      <div className="card-content">
        <div className="text-center py-6">
          <button 
            onClick={onNavigateToCreate}
            className="btn btn-primary btn-lg px-8 py-3 text-base font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            立即创建会议
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickJoinForm;