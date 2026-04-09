import { Calendar, User, Clock, RefreshCw } from 'lucide-react';
import { AppConfig } from '../types';

interface Props {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
  onGenerate: () => void;
  hasEntries: boolean;
}

export default function ConfigPanel({ config, onChange, onGenerate, hasEntries }: Props) {
  const update = (field: keyof AppConfig, value: string) =>
    onChange({ ...config, [field]: value });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <Calendar size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Timesheet Configuration</h2>
          <p className="text-sm text-slate-500">Set your details and date range to generate your schedule</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
            <User size={12} />
            Employee Name
          </label>
          <input
            type="text"
            value={config.employeeName}
            onChange={e => update('employeeName', e.target.value)}
            placeholder="Full name"
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar size={12} />
            Start Date
          </label>
          <input
            type="date"
            value={config.startDate}
            onChange={e => update('startDate', e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar size={12} />
            End Date
          </label>
          <input
            type="date"
            value={config.endDate}
            onChange={e => update('endDate', e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
            <Clock size={12} />
            Default Hours / Day
          </label>
          <input
            type="number"
            value={config.defaultHours}
            onChange={e => update('defaultHours', e.target.value)}
            min="1"
            max="24"
            step="0.5"
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={onGenerate}
          disabled={!config.employeeName || !config.startDate || !config.endDate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw size={15} />
          {hasEntries ? 'Regenerate Schedule' : 'Generate Schedule'}
        </button>
        {hasEntries && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
            Regenerating will clear all existing task entries.
          </p>
        )}
      </div>
    </div>
  );
}
