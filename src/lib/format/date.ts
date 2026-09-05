const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const dateFormatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });
const fullFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatListTimestamp(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const elapsed = now.getTime() - date.getTime();
  if (elapsed < DAY && date.getDate() === now.getDate()) return timeFormatter.format(date);
  if (elapsed < 2 * DAY) return 'Yesterday';
  if (elapsed < 7 * DAY) return weekdayFormatter.format(date);
  if (date.getFullYear() === now.getFullYear()) return dateFormatter.format(date);
  return fullFormatter.format(date);
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : timeFormatter.format(date);
}

export function formatDayDivider(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDelta = Math.round((startOfToday - startOfDate) / DAY);

  if (dayDelta === 0) return 'Today';
  if (dayDelta === 1) return 'Yesterday';
  if (dayDelta < 7) return weekdayFormatter.format(date);
  return fullFormatter.format(date);
}

export function toDayKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'unknown';
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
