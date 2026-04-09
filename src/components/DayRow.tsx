import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Briefcase, Plane, Star } from 'lucide-react';
import { DayEntry, DayType, Task, LEAVE_TYPES } from '../types';
import { formatDateDisplay, getDayLabel } from '../utils/dateUtils';
import TaskRow from './TaskRow';

interface Props {
  entry: DayEntry;
  defaultHours: string;
  onChange: (entry: DayEntry) => void;
}

function createTask(): Task {
  return { id: crypto.randomUUID(), taskTypes: [], hours: '', tickets: '', notes: '', clientComment: '' };
}

export default function DayRow({ entry, defaultHours, onChange }: Props) {
  const [expanded, setExpanded] = useState(true);

  const setDayType = (dayType: DayType) => {
    const tasks = dayType === 'working' && entry.tasks.length === 0
      ? [createTask()]
      : entry.tasks;
    onChange({ ...entry, dayType, tasks });
  };

  const addTask = () => {
    onChange({ ...entry, tasks: [...entry.tasks, createTask()] });
  };

  const updateTask = (index: number, task: Task) => {
    const tasks = [...entry.tasks];
    tasks[index] = task;
    onChange({ ...entry, tasks });
  };

  const removeTask = (index: number) => {
    const tasks = entry.tasks.filter((_, i) => i !== index);
    onChange({ ...entry, tasks });
  };

  const totalHours = entry.tasks.reduce((sum, t) => {
    const h = parseFloat(t.hours || defaultHours);
    return sum + (isNaN(h) ? 0 : h);
  }, 0);

  const isHoliday = entry.dayType === 'holiday';
  const isLeave = entry.dayType === 'leave';
  const isWorking = entry.dayType === 'working';

  const borderColor = isHoliday
    ? 'border-amber-200'
    : isLeave
    ? 'border-blue-200'
    : 'border-slate-200';

  const headerBg = isHoliday
    ? 'bg-amber-50'
    : isLeave
    ? 'bg-blue-50'
    : 'bg-white';

  return (
    <div className={`rounded-xl border ${borderColor} overflow-visible shadow-sm`}>
      <div className={`${headerBg} px-4 py-3 flex flex-wrap items-center gap-3`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">{formatDateDisplay(entry.date)}</span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {getDayLabel(entry.date)}
            </span>
            {isWorking && entry.tasks.length > 0 && (
              <span className="text-xs text-slate-500">
                {totalHours.toFixed(totalHours % 1 === 0 ? 0 : 2)}h total · {entry.tasks.length} task{entry.tasks.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDayType('working')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isWorking
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-green-400 hover:text-green-600'
            }`}
          >
            <Briefcase size={12} />
            Working
          </button>
          <button
            onClick={() => setDayType('holiday')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isHoliday
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-400 hover:text-amber-600'
            }`}
          >
            <Star size={12} />
            Holiday
          </button>
          <button
            onClick={() => setDayType('leave')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isLeave
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            <Plane size={12} />
            Leave
          </button>
        </div>

        {isWorking && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {isHoliday && (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
          <input
            type="text"
            value={entry.holidayName || ''}
            onChange={e => onChange({ ...entry, holidayName: e.target.value })}
            placeholder="Holiday name (e.g. Christmas Day)"
            className="w-full max-w-sm px-3 py-2 text-sm rounded-lg border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder-slate-400 text-slate-900 transition"
          />
        </div>
      )}

      {isLeave && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
          <select
            value={entry.leaveType || 'Annual Leave'}
            onChange={e => onChange({ ...entry, leaveType: e.target.value })}
            className="w-full max-w-xs px-3 py-2 text-sm rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-slate-900 transition"
          >
            {LEAVE_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {isWorking && expanded && (
        <div className="px-4 py-3 border-t border-slate-100 flex flex-col gap-2">
          <div className="grid grid-cols-12 gap-2 px-1 mb-1 hidden sm:grid">
            <span className="col-span-5 text-xs font-medium text-slate-400 uppercase tracking-wide">Task Type(s)</span>
            <span className="col-span-2 text-xs font-medium text-slate-400 uppercase tracking-wide">Hours</span>
            <span className="col-span-5 text-xs font-medium text-slate-400 uppercase tracking-wide">Ticket / Reference</span>
          </div>
          {entry.tasks.map((task, idx) => (
            <TaskRow
              key={task.id}
              task={task}
              defaultHours={defaultHours}
              onChange={t => updateTask(idx, t)}
              onRemove={() => removeTask(idx)}
              isOnly={entry.tasks.length === 1}
            />
          ))}
          <button
            onClick={addTask}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-dashed border-blue-200 hover:border-blue-400 transition-all self-start mt-1"
          >
            <Plus size={14} />
            Add another task
          </button>
        </div>
      )}
    </div>
  );
}
