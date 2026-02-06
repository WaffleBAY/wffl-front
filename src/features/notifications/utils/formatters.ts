import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Format a date as relative time in Korean (e.g., "2시간 전")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: ko,
  });
}
