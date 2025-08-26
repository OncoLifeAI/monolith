/// <reference types="./types/assets" />
// Login components
export { default as InputPassword } from './components/Login/InputPassword';
export * from './components/Login/InputPassword.styles';

// Login components (for apps to build their own login pages)
export { default as Login } from './pages/Login/Login';
export { default as ForgotPassword } from './pages/Login/ForgotPassword';


// Navigation
export { default as Navigation, PageContentWrapper, MobileNavSpacer, MOBILE_NAV_HEIGHT } from './components/Navigation/Navigation';

// Date Picker
export { default as DatePicker } from './components/DatePicker';
export { DatePickerContainer as OldDatePickerContainer, DateDisplayButton as OldDateDisplayButton } from './components/DatePicker/DatePicker.styles';

// Sleek Date Picker
export { default as SleekDatePicker } from './components/SleekDatePicker';
export {
  Backdrop as SleekBackdrop,
  DatePickerContainer as SleekDatePickerContainer,
  DateDisplayButton as SleekDateDisplayButton,
  DropdownContainer as SleekDropdownContainer,
  DropdownHeader as SleekDropdownHeader,
  YearSelector as SleekYearSelector,
  NavigationButton as SleekNavigationButton,
  MonthGrid as SleekMonthGrid,
  MonthButton as SleekMonthButton,
  YearGrid as SleekYearGrid,
  YearButton as SleekYearButton,
  CloseButton as SleekCloseButton,
} from './components/SleekDatePicker/SleekDatePicker.styles';

// Sleek Day Date Picker
export { default as SleekDayDatePicker } from './components/SleekDayDatePicker';
export {
  Backdrop as DayBackdrop,
  MobileBackdrop as DayMobileBackdrop,
  DatePickerContainer as DayDatePickerContainer,
  DateDisplayButton as DayDateDisplayButton,
  PortalDropdownContainer as DayPortalDropdownContainer,
  DropdownContainer as DayDropdownContainer,
  DropdownHeader as DayDropdownHeader,
  MonthYearSelector as DayMonthYearSelector,
  NavigationButton as DayNavigationButton,
  CalendarGrid as DayCalendarGrid,
  DayButton as DayDayButton,
} from './components/SleekDayDatePicker/SleekDayDatePicker.styles';

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