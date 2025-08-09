import React from 'react';
import { Navigation } from '@oncolife/ui-components';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => (
  <div style={{ display: 'flex' }}>
    <Navigation userType="doctor" />
    <div style={{ flex: 1, minHeight: '100vh', background: '#f9fafb' }}>
      <Outlet />
    </div>
  </div>
);

export default Layout;