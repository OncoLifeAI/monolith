import React from 'react';
import { Navigation } from '@oncolife/ui-components';
import { Outlet } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Layout: React.FC = () => {
  const { profile } = useUser();
  
  return (
    <div style={{ display: 'flex' }}>
      <Navigation userType="patient" profile={profile} />
      <div style={{ flex: 1, minHeight: '100vh', background: '#f9fafb' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;