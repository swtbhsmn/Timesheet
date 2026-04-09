export type DayType = 'working' | 'holiday' | 'leave';

export const PREDEFINED_TASK_TYPES = ['Analysis', 'Coding', 'Testing', 'Documentation', 'Meeting', 'Code Review', 'Debugging', 'Deployment'] as const;
export type PredefinedTaskType = typeof PREDEFINED_TASK_TYPES[number];

export interface Task {
  id: string;
  taskTypes: (PredefinedTaskType | string)[];
  hours: string;
  tickets: string;
  notes: string;
  clientComment: string;
}

export interface DayEntry {
  date: string;
  dayType: DayType;
  holidayName?: string;
  leaveType?: string;
  tasks: Task[];
}

export interface AppConfig {
  employeeName: string;
  startDate: string;
  endDate: string;
  defaultHours: string;
}

export const LEAVE_TYPES = ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Unpaid Leave', 'Birthday Leave', 'Other'] as const;
