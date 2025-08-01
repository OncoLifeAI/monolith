import React, { useState } from 'react';
import styled from 'styled-components';
import { MessageCircle, LibraryBig, Notebook, Grid3X3, LogOut, ChevronRight, ChevronLeft, LayoutDashboard, ShieldUser, Users } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { SESSION_START_KEY } from '../SessionTimeoutManager';
import { useUser } from '../../contexts/UserContext';
import { useUserType } from '../../contexts/UserTypeContext';
// import { useLogout } from '../../restful/login';

const Sidebar = styled.nav<{ isExpanded: boolean }>`
  height: 100vh;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.04);
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  width: ${props => (props.isExpanded ? '16rem' : '6rem')};
  min-width: 0;
`;

const Header = styled.div<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  height: 4rem;
  padding: 0 1rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  justify-content: ${props => (props.isExpanded ? 'flex-start' : 'center')};
`;

const Logo = styled.img`
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  object-fit: cover;
  flex-shrink: 0;
`;

const LogoText = styled.span`
  font-size: 1.3rem;
  font-weight: 600;
  color: #2563eb;
  margin-left: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.3s;
`;

const ExpandToggleButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  border-radius: 0.5rem;
  margin-left: auto;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #f3f4f6;
  }
`;

const UserProfileContainer = styled.div<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  justify-content: ${props => (props.isExpanded ? 'flex-start' : 'center')};
  transition: background 0.2s;
  &:hover {
    background: #f3f4f6;
  }
`;

const AvatarInitials = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const UserInfo = styled.div`
  margin-left: 0.75rem;
  transition: all 0.3s;
`;

const UserHello = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const UserName = styled.p`
  font-weight: 500;
  color: #1f2937;
  margin: 0;
`;

const MenuSection = styled.div`
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
`;

const MenuTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1rem 1rem;
`;

const MenuList = styled.div<{ isExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: ${props => (props.isExpanded ? 'stretch' : 'center')};
`;

const MenuButton = styled.button<{ isExpanded: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  justify-content: ${props => (props.isExpanded ? 'flex-start' : 'center')};
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #f3f4f6;
  }
`;

const MenuIconWrapper = styled.span`
  color: #4b5563;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  ${MenuButton}:hover & {
    color: #2563eb;
  }
`;

const MenuLabel = styled.span`
  margin-left: 0.75rem;
  color: #374151;
  font-weight: 500;
  font-size: 1.1rem;
  transition: color 0.2s;
  ${MenuButton}:hover & {
    color: #2563eb;
  }
`;

const LogoutSection = styled.div<{ isExpanded: boolean }>`
  padding: 1.5rem 0;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
  display: flex;
  justify-content: ${props => (props.isExpanded ? 'flex-start' : 'center')};
`;

const LogoutButton = styled(MenuButton)`
  &:hover {
    background: #fef2f2;
  }
`;

const LogoutLabel = styled.span`
  margin-left: 0.75rem;
  color: #ef4444;
  font-weight: 500;
  transition: color 0.2s;
  ${LogoutButton}:hover & {
    color: #dc2626;
  }
`;

const ToggleContainer = styled.div<{ isExpanded: boolean }>`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: ${props => (props.isExpanded ? 'flex-start' : 'center')};
  align-items: center;
  gap: 0.5rem;
`;

const ToggleLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SwitchLabel = styled.span<{ isActive: boolean }>`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.isActive ? '#2563eb' : '#6b7280'};
  transition: color 0.2s;
`;

const ToggleSwitch = styled.div<{ isOn: boolean }>`
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background-color: ${props => props.isOn ? '#2563eb' : '#d1d5db'};
  border-radius: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${props => props.isOn ? '#1d4ed8' : '#9ca3af'};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0.125rem;
    left: ${props => props.isOn ? '1.625rem' : '0.125rem'};
    width: 1.25rem;
    height: 1.25rem;
    background-color: white;
    border-radius: 50%;
    transition: left 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface UserProfileProps {
  isExpanded: boolean;
  onClick?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isExpanded, onClick }) => {
  const { profile, isLoading } = useUser();
  let displayName = 'User';
  let initials = 'U';
  if (profile) {
    displayName = profile.first_name + (profile.last_name ? ' ' + profile.last_name : '');
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    initials = (first + last).toUpperCase() || 'U';
  }
  return (
    <UserProfileContainer isExpanded={isExpanded} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <AvatarInitials>{initials}</AvatarInitials>
      {isExpanded && (
        <UserInfo>
          <UserHello>Hello</UserHello>
          <UserName>{isLoading ? 'Loading...' : displayName}</UserName>
        </UserInfo>
      )}
    </UserProfileContainer>
  );
};

interface MenuItemProps {
  item: MenuItem;
  onClick: (href: string) => void;
  isExpanded: boolean;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ item, onClick, isExpanded }) => (
  <MenuButton onClick={() => onClick(item.href)} isExpanded={isExpanded} title={!isExpanded ? item.label : ''}>
    <MenuIconWrapper>{item.icon}</MenuIconWrapper>
    {isExpanded && <MenuLabel>{item.label}</MenuLabel>}
  </MenuButton>
);

interface LogoutButtonProps {
  onClick: () => void;
  isExpanded: boolean;
}

const LogoutButtonComponent: React.FC<LogoutButtonProps> = ({ onClick, isExpanded }) => (
  <LogoutButton onClick={onClick} isExpanded={isExpanded} title={!isExpanded ? 'Log out' : ''}>
    <MenuIconWrapper as={LogOut} size={20} style={{ color: '#ef4444' }} />
    {isExpanded && <LogoutLabel>Log out</LogoutLabel>}
  </LogoutButton>
);

// Extract menu content to a function for reuse
const SidebarContent: React.FC<{
  isExpanded: boolean;
  onMenuClick: (href: string) => void;
  onLogout: () => void;
  onToggleExpand: () => void;
  onProfileClick: () => void;
}> = ({ isExpanded, onMenuClick, onLogout, onToggleExpand, onProfileClick }) => {
  const { isDoctor, setUserType } = useUserType();
  const menuItems: MenuItem[] =  isDoctor ? [
    { id: '1', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { id: '2', label: 'Patients', icon: <ShieldUser size={20} />, href: '/patients' },
    { id: '3', label: 'Staff', icon: <Users size={20} />, href: '/staff' },
  ] : [
    { id: '1', label: 'Chat', icon: <MessageCircle size={20} />, href: '/chat' },
    { id: '2', label: 'Summaries', icon: <LibraryBig size={20} />, href: '/summaries' },
    { id: '3', label: 'Notes', icon: <Notebook size={20} />, href: '/notes' },
    { id: '4', label: 'Education', icon: <Grid3X3 size={20} />, href: '/education' },
  ];
  return (
    <>
      <Header isExpanded={isExpanded}>
        <Logo 
          src={logo}
          alt="Company Logo"
        />
        {isExpanded && <LogoText>Oncolife AI</LogoText>}
        <ExpandToggleButton onClick={onToggleExpand} aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}>
          {isExpanded ? (
            <ChevronLeft size={20} style={{ color: '#4b5563' }} />
          ) : (
            <ChevronRight size={20} style={{ color: '#4b5563' }} />
          )}
        </ExpandToggleButton>
      </Header>
      <UserProfile 
        isExpanded={isExpanded}
        onClick={onProfileClick}
      />
      <ToggleContainer isExpanded={isExpanded}>
        {isExpanded && <ToggleLabel>View:</ToggleLabel>}
        <SwitchContainer>
          {isExpanded && <SwitchLabel isActive={!isDoctor}>Patient</SwitchLabel>}
          <ToggleSwitch 
            isOn={isDoctor}
            onClick={() => setUserType(isDoctor ? 'patient' : 'doctor')}
          />
          {isExpanded && <SwitchLabel isActive={isDoctor}>Doctor</SwitchLabel>}
        </SwitchContainer>
      </ToggleContainer>
      <MenuSection>
        {isExpanded && <MenuTitle>MENU</MenuTitle>}
        <MenuList isExpanded={isExpanded}>
          {menuItems.map((item) => (
            <MenuItemComponent 
              key={item.id} 
              item={item} 
              onClick={onMenuClick}
              isExpanded={isExpanded}
            />
          ))}
        </MenuList>
      </MenuSection>
      <LogoutSection isExpanded={isExpanded}>
        <LogoutButtonComponent onClick={onLogout} isExpanded={isExpanded} />
      </LogoutSection>
    </>
  );
};

const SidebarMenu: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleMenuItemClick = (href: string) => {
    navigate(href);
  };

  const handleLogout = () => {
    // useLogout();
    localStorage.removeItem('authToken');
    sessionStorage.removeItem(SESSION_START_KEY);
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <>
      {/* Sidebar for desktop */}
      <div className="d-none d-md-flex" style={{ height: '100vh' }}>
        <Sidebar isExpanded={isExpanded}>
          <SidebarContent
            isExpanded={isExpanded}
            onMenuClick={handleMenuItemClick}
            onLogout={handleLogout}
            onToggleExpand={() => setIsExpanded((prev) => !prev)}
            onProfileClick={handleProfileClick}
          />
        </Sidebar>
      </div>
    </>
  );
};

export default SidebarMenu;