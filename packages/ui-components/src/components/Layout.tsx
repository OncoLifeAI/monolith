import React from 'react';
import SidebarMenu from './Navigation/Navigation';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => (
  <div style={{ display: 'flex' }}>
    <SidebarMenu />
    <div style={{ flex: 1, minHeight: '100vh', background: '#f9fafb' }}>
      <Outlet />
    </div>
  </div>
);

export default Layout; 