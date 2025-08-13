/// <reference types="./types/assets" />
// Login components
export { default as InputPassword } from './components/Login/InputPassword';
export * from './components/Login/InputPassword.styles';

// Login components (for apps to build their own login pages)
export { default as Login } from './pages/Login/Login';


// Navigation
export { default as Navigation, PageContentWrapper, MobileNavSpacer, MOBILE_NAV_HEIGHT } from './components/Navigation/Navigation';

// Date Picker
export { default as DatePicker } from './components/DatePicker';
export * from './components/DatePicker/DatePicker.styles';

// Session Management
export { default as SessionTimeoutManager, SESSION_START_KEY } from './components/SessionTimeout/SessionTimeoutManager';
export { default as SessionTimeoutModal } from './components/SessionTimeout/SessionTimeoutModal';



// Styles
export * from './styles/GlobalStyles';
export * from './styles/theme';

// Styled Components
export { 
  Container, 
  Header, 
  Title, 
  Content, 
  PageHeader, 
  PageTitle,
  Card,
  Subtitle,
  Logo,
  Background,
  WrapperStyle
} from './styles/GlobalStyles';