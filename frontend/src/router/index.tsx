import React from 'react';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import HomePage from '../components/pages/HomePage';
import MeetingCreationPage from '../components/pages/MeetingCreationPage';
import MeetingLobbyPage from '../components/pages/MeetingLobbyPage';
import MeetingJoinPage from '../components/pages/MeetingJoinPage';
import PersonalCenterPage from '../components/pages/PersonalCenterPage';

// 首页包装组件，处理导航逻辑
const HomePageWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleViewMeeting = (id: string) => {
    console.log('查看会议:', id);
    navigate(`/meeting/${id}`);
  };

  const handleNavigateToCreate = () => {
    console.log('导航到创建页面');
    navigate('/create');
  };

  return (
    <HomePage
      onViewMeeting={handleViewMeeting}
      onNavigateToCreate={handleNavigateToCreate}
    />
  );
};

// 会议创建页面包装组件
const MeetingCreationPageWrapper: React.FC = () => {
  return (
    <MeetingCreationPage
      onCreateMeeting={(data) => console.log('创建会议:', data)}
    />
  );
};

// 会议大厅页面包装组件
const MeetingLobbyPageWrapper: React.FC = () => {
  return <MeetingLobbyPage />;
};

// 个人中心页面包装组件
const PersonalCenterPageWrapper: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PersonalCenterPage
      onViewMeeting={(id) => navigate(`/meeting/${id}`)}
    />
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePageWrapper />,
  },
  {
    path: '/create',
    element: <MeetingCreationPageWrapper />,
  },
  {
    path: '/meeting/:id',
    element: <MeetingLobbyPageWrapper />,
  },
  {
    path: '/meetings/join',
    element: <MeetingJoinPage />,
  },
  {
    path: '/personal',
    element: <PersonalCenterPageWrapper />,
  },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
