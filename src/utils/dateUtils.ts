export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateDisplay(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getDayLabel(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getWorkingDays(startDate: string, endDate: string): string[] {
  const days: string[] = [];
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(toISODate(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function getTodayISO(): string {
  return toISODate(new Date());
}

export function getMonthStartISO(): string {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
}

export function getMonthEndISO(): string {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
}
