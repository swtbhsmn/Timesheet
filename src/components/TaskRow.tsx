import { useState } from 'react';
import { Trash2, X, Plus, ChevronDown, Sparkles } from 'lucide-react';
import { Task, PREDEFINED_TASK_TYPES } from '../types';

interface Props {
  task: Task;
  defaultHours: string;
  onChange: (task: Task) => void;
  onRemove: () => void;
  isOnly: boolean;
}

export default function TaskRow({ task, defaultHours, onChange, onRemove, isOnly }: Props) {
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [generatingNotes, setGeneratingNotes] = useState(false);

  const toggleTaskType = (type: string) => {
    const updated = task.taskTypes.includes(type)
      ? task.taskTypes.filter(t => t !== type)
      : [...task.taskTypes, type];
    onChange({ ...task, taskTypes: updated });
  };

  const addCustomTask = () => {
    if (customTaskInput.trim() && !task.taskTypes.includes(customTaskInput.trim())) {
      onChange({ ...task, taskTypes: [...task.taskTypes, customTaskInput.trim()] });
      setCustomTaskInput('');
    }
  };

  const removeTaskType = (type: string) => {
    onChange({ ...task, taskTypes: task.taskTypes.filter(t => t !== type) });
  };

  const handleFieldChange = (field: keyof Omit<Task, 'taskTypes'>, value: string) => {
    onChange({ ...task, [field]: value });
  };

  const generateNotes = async () => {
    if (!task.tickets.trim() || task.taskTypes.length === 0) {
      return;
    }

    setGeneratingNotes(true);
    try {
      const prompt = `Generate a concise one-line note for a timesheet entry. Task types: ${task.taskTypes.join(', ')}. Ticket/Reference: ${task.tickets}. Make it professional and brief.`;

      const response = await fetch('http://192.168.31.228:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral:latest', // You can make this configurable later
          prompt: prompt,
          stream: false,
          max_tokens: 100,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();
      const generatedNote = data.response?.trim() || 'Generated note unavailable';

      // Update the notes field with the generated content
      onChange({ ...task, notes: JSON.parse(generatedNote) });
    } catch (error) {
      console.error('Failed to generate notes:', error);
      // Could add error handling UI here
    } finally {
      setGeneratingNotes(false);
    }
  };

  return (
    <div className="grid gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-5 relative">
          <div className="relative">
            <button
              onClick={() => setShowTaskDropdown(!showTaskDropdown)}
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-slate-900 bg-white transition text-left flex items-center justify-between"
            >
              <span className="truncate text-slate-500 text-xs">
                {task.taskTypes.length === 0 ? 'Select task type(s)' : `${task.taskTypes.length} selected`}
              </span>
              <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
            </button>

            {showTaskDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
                <div className="p-2">
                  {PREDEFINED_TASK_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.taskTypes.includes(type)}
                        onChange={() => toggleTaskType(type)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                      />
                      <span className="text-sm text-slate-700">{type}</span>
                    </label>
                  ))}

                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={customTaskInput}
                        onChange={e => setCustomTaskInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            addCustomTask();
                          }
                        }}
                        placeholder="Custom type..."
                        className="flex-1 px-2 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-slate-400"
                      />
                      <button
                        onClick={addCustomTask}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {task.taskTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {task.taskTypes.map(type => (
                <div
                  key={type}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                >
                  {type}
                  <button
                    onClick={() => removeTaskType(type)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <input
            type="number"
            value={task.hours}
            onChange={e => handleFieldChange('hours', e.target.value)}
            placeholder={`${defaultHours}h`}
            min="0.25"
            max="24"
            step="0.25"
            className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-slate-400 text-slate-900 bg-white transition"
          />
        </div>

        <div className="sm:col-span-5">
          <input
            type="text"
            value={task.tickets}
            onChange={e => handleFieldChange('tickets', e.target.value)}
            placeholder="Ticket # or reference link"
            className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-slate-400 text-slate-900 bg-white transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-5">
          <div className="relative">
            <textarea
              value={task.notes}
              onChange={e => handleFieldChange('notes', e.target.value)}
              placeholder="Notes"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-slate-400 text-slate-900 bg-white transition resize-none"
            />
            <button
              onClick={generateNotes}
              disabled={generatingNotes || !task.tickets.trim() || task.taskTypes.length === 0}
              className="absolute top-1 right-1 p-1.5 text-slate-400 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
              title="Generate note with AI"
            >
              <Sparkles size={14} className={generatingNotes ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        <div className="sm:col-span-5">
          <textarea
            value={task.clientComment}
            onChange={e => handleFieldChange('clientComment', e.target.value)}
            placeholder="Client comment"
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-slate-400 text-slate-900 bg-white transition resize-none"
          />
        </div>
        <div className="sm:col-span-2 flex items-start justify-end pt-1">
          {!isOnly && (
            <button
              onClick={onRemove}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Remove task"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
