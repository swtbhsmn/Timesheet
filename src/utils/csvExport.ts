import { DayEntry } from '../types';
import { formatDateDisplay } from './dateUtils';

function escapeField(field: string): string {
  const str = String(field ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV(
  entries: DayEntry[],
  employeeName: string,
  defaultHours: string
): void {
  const headers = [
    'Employee Name',
    'Date',
    'Task Name',
    'Hours',
    'Ticket(s) / Reference Link',
    'Notes',
    'Client Comment',
  ];

  const rows: string[][] = [headers];

  for (const entry of entries) {
    const dateStr = formatDateDisplay(entry.date);

    if (entry.dayType === 'holiday') {
      rows.push([
        employeeName,
        dateStr,
        `Holiday - ${entry.holidayName || 'Public Holiday'}`,
        '0',
        '',
        '',
        '',
      ]);
    } else if (entry.dayType === 'leave') {
      rows.push([
        employeeName,
        dateStr,
        `Leave - ${entry.leaveType || 'Annual Leave'}`,
        '0',
        '',
        '',
        '',
      ]);
    } else {
      if (entry.tasks.length === 0) {
        rows.push([employeeName, dateStr, '', defaultHours, '', '', '']);
      } else {
        for (const task of entry.tasks) {
          rows.push([
            employeeName,
            dateStr,
            task.taskTypes.join(', '),
            task.hours || defaultHours,
            task.tickets,
            task.notes,
            task.clientComment,
          ]);
        }
      }
    }
  }

  const csvContent = rows.map(row => row.map(escapeField).join(',')).join('\r\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = employeeName.replace(/\s+/g, '_') || 'Employee';
  const today = new Date().toISOString().split('T')[0];
  link.download = `timesheet_${safeName}_${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
