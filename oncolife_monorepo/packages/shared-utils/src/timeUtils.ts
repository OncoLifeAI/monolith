import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const convertToLocalTimezone = (date: string | Date, userTimezone?: string) => {
  const tz = userTimezone || dayjs.tz.guess();
  return dayjs(date).tz(tz);
};

export const formatDateTime = (date: string | Date, format: string = 'MMM DD, YYYY h:mm A') => {
  return convertToLocalTimezone(date).format(format);
};

export const getRelativeTime = (date: string | Date) => {
  const now = dayjs();
  const targetDate = dayjs(date);
  const diffMinutes = now.diff(targetDate, 'minute');
  const diffHours = now.diff(targetDate, 'hour');
  const diffDays = now.diff(targetDate, 'day');
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDateTime(date, 'MMM DD, YYYY');
};