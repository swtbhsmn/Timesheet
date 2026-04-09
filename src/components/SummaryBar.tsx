import { Download, Calendar, Clock, Plane, Star } from 'lucide-react';
import { DayEntry } from '../types';

interface Props {
  entries: DayEntry[];
  defaultHours: string;
  onExport: () => void;
  employeeName: string;
}

export default function SummaryBar({ entries, defaultHours, onExport, employeeName }: Props) {
  const working = entries.filter(e => e.dayType === 'working');
  const holidays = entries.filter(e => e.dayType === 'holiday').length;
  const leaves = entries.filter(e => e.dayType === 'leave').length;

  const totalHours = working.reduce((sum, entry) => {
    if (entry.tasks.length === 0) return sum + parseFloat(defaultHours || '8');
    return sum + entry.tasks.reduce((s, t) => {
      const h = parseFloat(t.hours || defaultHours);
      return s + (isNaN(h) ? 0 : h);
    }, 0);
  }, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center gap-4">
      <div className="flex-1 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <Calendar size={16} className="text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Working Days</p>
            <p className="text-sm font-semibold text-slate-900">{working.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Clock size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Hours</p>
            <p className="text-sm font-semibold text-slate-900">{totalHours.toFixed(totalHours % 1 === 0 ? 0 : 2)}h</p>
          </div>
        </div>
        {holidays > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Star size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Holidays</p>
              <p className="text-sm font-semibold text-slate-900">{holidays}</p>
            </div>
          </div>
        )}
        {leaves > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Plane size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Leave Days</p>
              <p className="text-sm font-semibold text-slate-900">{leaves}</p>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onExport}
        disabled={!employeeName}
        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
      >
        <Download size={16} />
        Export CSV
      </button>
    </div>
  );
}
