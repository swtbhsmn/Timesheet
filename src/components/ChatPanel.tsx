import { FormEvent, useEffect, useRef, useState } from 'react';
import { MessageSquare, RefreshCw, Send, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
}

const OLLAMA_BASE = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

// Loading dots component
const LoadingDots = () => {
  const [dots, setDots] = useState('...');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev === '...' ? '.' : prev === '.' ? '..' : '...');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <span className="text-slate-500">{dots}</span>;
};

export default function ChatPanel() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Ask me anything! Select an Ollama model and send your question.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchModels = async () => {
    setError('');
    try {
      const response = await fetch(`${OLLAMA_BASE}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama models request failed: ${response.status}`);
      }
      const {models} = await response.json();
      const data = Array.isArray(models) ? models : [];
      const availableModels = Array.isArray(data)
        ? data.map((item: any) => item.name).filter((name: unknown) => typeof name === 'string')
        : [];

      if (availableModels.length === 0) {
        throw new Error('No models returned from Ollama');
      }

      setModels(availableModels);
      setSelectedModel(prev => prev || availableModels[0]);
    } catch (err) {
      setError(`Unable to load Ollama models. Ensure Ollama is running at ${OLLAMA_BASE}.`);
      setModels([]);
      setSelectedModel('');
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    if (!selectedModel) {
      setError('Please select an Ollama model first.');
      return;
    }

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);
    setError('');

    // Add a temporary loading message
    setMessages(prev => [...prev, { role: 'assistant', text: '...' }]);

    try {
      const response = await fetch(`${OLLAMA_BASE}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: userText,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama completion error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Unable to read response stream');
      }

      let assistantText = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              assistantText += data.response;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'assistant') {
                  newMessages[newMessages.length - 1] = { ...lastMessage, text: assistantText };
                } else {
                  newMessages.push({ role: 'assistant', text: assistantText });
                }
                return newMessages;
              });
            }
            if (data.done) break;
          } catch (parseError) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (err) {
      // Replace the loading message with an error message
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.text === '...') {
          newMessages[newMessages.length - 1] = { 
            role: 'assistant', 
            text: 'Sorry, I encountered an error while processing your request.' 
          };
        }
        return newMessages;
      });
      setError('Unable to send the message to Ollama. Check the model and server availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-full min-h-[480px]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare size={18} /> AI Assistant
          </p>
          <p className="text-xs text-slate-500">Ask questions and get answers from Ollama models.</p>
        </div>
        <button
          type="button"
          onClick={fetchModels}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
        >
          <RefreshCw size={14} /> Refresh models
        </button>
      </div>

      <div className="mt-4">
        <label className="text-[11px] font-semibold uppercase tracking-[.18em] text-slate-500">Model</label>
        <select
          value={selectedModel}
          onChange={e => setSelectedModel(e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          {models.length > 0 ? (
            models.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))
          ) : (
            <option value="">No models found</option>
          )}
        </select>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 flex-1 overflow-y-auto space-y-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-2xl p-3 ${
              message.role === 'user'
                ? 'bg-slate-100 text-slate-900 self-end'
                : 'bg-gray-300 '
            }`}
          >
            <p className="text-[13px] leading-5 whitespace-pre-wrap">
              {message.text === '...' ? <LoadingDots /> : message.text}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[.2em] opacity-70">
              {message.role === 'user' ? 'You' : message.role === 'assistant' ? 'Ollama' : 'System'}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="mt-4 flex gap-2" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Ollama…"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <Send size={14} /> {loading ? 'Sending' : 'Send'}
        </button>
      </form>

      <div className="mt-4 text-xs text-slate-400">
        <Sparkles size={12} className="inline-block mr-1" />
        Ollama must be available on <span className="font-semibold text-slate-700">{OLLAMA_BASE}</span>.
      </div>
    </div>
  );
}
