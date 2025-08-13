import React from 'react';
import { Navigation, PageContentWrapper } from '@oncolife/ui-components';
import { Outlet } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Layout: React.FC = () => {
  const { profile } = useUser();
  
  return (
  <div style={{ display: 'flex' }}>
    <Navigation userType="patient" />
    <PageContentWrapper style={{ flex: 1, minHeight: '100vh', background: '#f9fafb' }}>
      <Outlet />
    </PageContentWrapper>
  </div>
  );
};

export default Layout;