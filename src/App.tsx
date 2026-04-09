import { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { AppConfig, DayEntry, Task } from './types';
import { getWorkingDays, getMonthStartISO, getMonthEndISO } from './utils/dateUtils';
import { exportToCSV } from './utils/csvExport';
import ConfigPanel from './components/ConfigPanel';
import DayRow from './components/DayRow';
import SummaryBar from './components/SummaryBar';
import ChatPanel from './components/ChatPanel';

function createTask(): Task {
  return { id: crypto.randomUUID(), taskTypes: [], hours: '', tickets: '', notes: '', clientComment: '' };
}

export default function App() {
  const [config, setConfig] = useState<AppConfig>({
    employeeName: '',
    startDate: getMonthStartISO(),
    endDate: getMonthEndISO(),
    defaultHours: '8',
  });

  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    const days = getWorkingDays(config.startDate, config.endDate);
    const newEntries: DayEntry[] = days.map(date => ({
      date,
      dayType: 'working',
      tasks: [createTask()],
    }));
    setEntries(newEntries);
    setGenerated(true);
  };

  const updateEntry = (index: number, entry: DayEntry) => {
    setEntries(prev => {
      const next = [...prev];
      next[index] = entry;
      return next;
    });
  };

  const handleExport = () => {
    exportToCSV(entries, config.employeeName, config.defaultHours);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <FileSpreadsheet size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Timesheet Generator</h1>
            <p className="text-xs text-slate-500 leading-tight">Create and export your weekly timesheets to CSV</p>
          </div>
        </div>
      </header>

      <main className="max mx-auto px-4 sm:px-6 py-6 grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)] xl:items-start">
        {/* Left scrollable column */}
        <div className="flex flex-col gap-5">
          <ConfigPanel
            config={config}
            onChange={setConfig}
            onGenerate={handleGenerate}
            hasEntries={generated && entries.length > 0}
          />

          {generated && entries.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500 text-sm">No working days found in the selected range.</p>
            </div>
          )}

          {generated && entries.length > 0 && (
            <>
              <SummaryBar
                entries={entries}
                defaultHours={config.defaultHours}
                onExport={handleExport}
                employeeName={config.employeeName}
              />

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Schedule — {entries.length} working day{entries.length !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mark days as Holiday or Leave as needed, then add your tasks
                  </p>
                </div>
                {entries.map((entry, idx) => (
                  <DayRow
                    key={entry.date}
                    entry={entry}
                    defaultHours={config.defaultHours}
                    onChange={e => updateEntry(idx, e)}
                  />
                ))}
              </div>

              <SummaryBar
                entries={entries}
                defaultHours={config.defaultHours}
                onExport={handleExport}
                employeeName={config.employeeName}
              />
            </>
          )}

          {!generated && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet size={28} className="text-slate-400" />
              </div>
              <h3 className="text-slate-700 font-semibold mb-1">No schedule generated yet</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Fill in your name and date range above, then click "Generate Schedule" to see your working days and start entering tasks.
              </p>
            </div>
          )}
        </div>

        {/* Right sticky column — locks below the header while left scrolls */}
        <div className="sticky top-[73px] h-[calc(100vh-73px)] hidden xl:flex flex-col">
          <ChatPanel />
        </div>
      </main>
    </div>
  );
}