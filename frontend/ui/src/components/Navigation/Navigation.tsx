import React, { useState } from 'react';
import styled from 'styled-components';
import { MessageCircle, FileText, StickyNote, Grid3X3, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';

const Sidebar = styled.nav<{ isExpanded: boolean }>`
  height: 100vh;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.04);
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  width: ${props => (props.isExpanded ? '20rem' : '6rem')};
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
  font-size: 1.25rem;
  font-weight: 600;
  color: #2563eb;
  margin-left: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.3s;
`;

const ToggleButton = styled.button`
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
`;

const Avatar = styled.img`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  object-fit: cover;
  flex-shrink: 0;
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

const MenuIcon = styled.span`
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

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface UserProfileProps {
  name: string;
  avatar: string;
  isExpanded: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ name, avatar, isExpanded }) => (
  <UserProfileContainer isExpanded={isExpanded}>
    <Avatar src={avatar} alt={name} />
    {isExpanded && (
      <UserInfo>
        <UserHello>Hello</UserHello>
        <UserName>{name}</UserName>
      </UserInfo>
    )}
  </UserProfileContainer>
);

interface MenuItemProps {
  item: MenuItem;
  onClick: (href: string) => void;
  isExpanded: boolean;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ item, onClick, isExpanded }) => (
  <MenuButton onClick={() => onClick(item.href)} isExpanded={isExpanded} title={!isExpanded ? item.label : ''}>
    <MenuIcon>{item.icon}</MenuIcon>
    {isExpanded && <MenuLabel>{item.label}</MenuLabel>}
  </MenuButton>
);

interface LogoutButtonProps {
  onClick: () => void;
  isExpanded: boolean;
}

const LogoutButtonComponent: React.FC<LogoutButtonProps> = ({ onClick, isExpanded }) => (
  <LogoutButton onClick={onClick} isExpanded={isExpanded} title={!isExpanded ? 'Log out' : ''}>
    <MenuIcon as={LogOut} size={20} style={{ color: '#ef4444' }} />
    {isExpanded && <LogoutLabel>Log out</LogoutLabel>}
  </LogoutButton>
);

const SidebarMenu: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    { id: '1', label: 'Chat', icon: <MessageCircle size={20} />, href: '/chat' },
    { id: '2', label: 'Summaries', icon: <FileText size={20} />, href: '/summaries' },
    { id: '3', label: 'Notes', icon: <StickyNote size={20} />, href: '/notes' },
    { id: '4', label: 'Lorem Ipsum', icon: <Grid3X3 size={20} />, href: '/lorem' },
  ];

  const toggleExpanded = (): void => {
    setIsExpanded(!isExpanded);
  };

  const handleMenuItemClick = (href: string): void => {
    navigate(href);
  };

  const handleLogout = (): void => {
    console.log('Logging out...');
  };

  return (
    <>
      <Sidebar isExpanded={isExpanded}>
        <Header isExpanded={isExpanded}>
          <Logo 
            src={logo}
            alt="Company Logo"
          />
          {isExpanded && <LogoText>Oncolife AI</LogoText>}
          <ToggleButton onClick={toggleExpanded} aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}>
            {isExpanded ? (
              <ChevronLeft size={20} style={{ color: '#4b5563' }} />
            ) : (
              <ChevronRight size={20} style={{ color: '#4b5563' }} />
            )}
          </ToggleButton>
        </Header>
        <UserProfile 
          name="Floyd Miles" 
          avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
          isExpanded={isExpanded}
        />
        <MenuSection>
          {isExpanded && <MenuTitle>MENU</MenuTitle>}
          <MenuList isExpanded={isExpanded}>
            {menuItems.map((item) => (
              <MenuItemComponent 
                key={item.id} 
                item={item} 
                onClick={handleMenuItemClick}
                isExpanded={isExpanded}
              />
            ))}
          </MenuList>
        </MenuSection>
        <LogoutSection isExpanded={isExpanded}>
          <LogoutButtonComponent onClick={handleLogout} isExpanded={isExpanded} />
        </LogoutSection>
      </Sidebar>
    </>
  );
};

export default SidebarMenu;