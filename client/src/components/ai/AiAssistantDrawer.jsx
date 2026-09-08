import React, { useState } from 'react';
import api from '../../services/api';
import { Sparkles, Send, X, Bot, User, Loader2, CheckCircle2, AlertCircle, BarChart3, Lightbulb } from 'lucide-react';

/**
 * Clean and format message content, removing raw markdown symbols like '#', '*', and '**'
 * and rendering them as styled React components.
 */
const FormattedAiMessage = ({ content }) => {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {lines.map((rawLine, idx) => {
        // Strip any remaining #, *, or ** symbols
        const cleanLine = rawLine
          .replace(/###\s*/g, '')
          .replace(/##\s*/g, '')
          .replace(/#\s*/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .trim();

        if (!cleanLine) {
          return <div key={idx} className="h-1.5" />;
        }

        // Section Titles
        if (
          cleanLine === 'Weekly Executive Summary' ||
          cleanLine === 'Team Blocker Analysis' ||
          cleanLine === 'Workload & Time Allocation' ||
          cleanLine === 'Team Highlights & Achievements'
        ) {
          return (
            <div
              key={idx}
              className="font-bold text-slate-900 text-sm border-b border-indigo-100/80 pb-1.5 mb-2 mt-1 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{cleanLine}</span>
            </div>
          );
        }

        // Subheaders ending with a colon
        if (
          cleanLine.startsWith('Overview:') ||
          cleanLine.startsWith('Key Achievements:') ||
          cleanLine.startsWith('Current Blockers:') ||
          cleanLine.startsWith('Workload Distribution:') ||
          cleanLine.startsWith('Task Distribution by Project:') ||
          cleanLine.startsWith('Time by Task Type:') ||
          cleanLine.startsWith('Key Issues Flagged:') ||
          cleanLine.startsWith('Other Blockers:')
        ) {
          return (
            <div key={idx} className="font-bold text-indigo-950 text-xs mt-3 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span>{cleanLine}</span>
            </div>
          );
        }

        // Recommendation
        if (cleanLine.startsWith('Recommendation:')) {
          return (
            <div key={idx} className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Recommendation: </span>
                <span>{cleanLine.replace(/^Recommendation:\s*/i, '')}</span>
              </div>
            </div>
          );
        }

        // Tip
        if (cleanLine.startsWith('Tip:')) {
          return (
            <div key={idx} className="mt-3 p-2.5 rounded-xl bg-sky-50/80 border border-sky-200/60 text-sky-900 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Tip: </span>
                <span>{cleanLine.replace(/^Tip:\s*/i, '')}</span>
              </div>
            </div>
          );
        }

        // Bullet items (starting with • or -)
        if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
          const itemText = cleanLine.replace(/^[•\-]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 my-1 pl-1 text-slate-700">
              <span className="text-indigo-500 font-bold leading-none mt-1">•</span>
              <span className="flex-1">{itemText}</span>
            </div>
          );
        }

        // Standard text paragraph
        return (
          <p key={idx} className="text-slate-700">
            {cleanLine}
          </p>
        );
      })}
    </div>
  );
};

export const AiAssistantDrawer = ({ isOpen, onClose, currentWeek, currentYear }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I'm your TeamPulse AI Assistant for Week ${currentWeek || ''}, ${currentYear || ''}. I can answer questions about completed tasks, team blockers, workload breakdown, or individual member progress. What would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [engineInfo, setEngineInfo] = useState({
    engine: 'smart_heuristic',
    modelName: 'TeamPulse AI'
  });

  const quickPrompts = [
    'What did David work on?',
    'Are there blockers for Client A?',
    'Give me an executive summary',
    'Which tasks are at risk of delay?',
    'Show workload and hours distribution',
    'What were the key achievements?'
  ];

  const handleSend = async (userText) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || isLoading) return;

    const newMessages = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: textToSend,
        weekNumber: currentWeek,
        year: currentYear
      });

      if (res.data?.modelName) {
        setEngineInfo({
          engine: res.data.engine,
          modelName: res.data.modelName
        });
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: res.data.reply || 'No response generated.' }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Error connecting to report analytics service. Please verify backend connectivity.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">TeamPulse AI</h3>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/90 text-emerald-400 border border-emerald-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{engineInfo.modelName}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Week {currentWeek}, {currentYear}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/80 flex flex-wrap gap-1.5 text-xs">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 text-[11px] font-medium transition shadow-2xs cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-slate-900 text-white font-medium rounded-br-none shadow-xs'
                      : 'bg-slate-50 text-slate-800 rounded-bl-none border border-slate-200/80 shadow-2xs'
                  }`}
                >
                  {m.sender === 'user' ? (
                    <p className="whitespace-pre-line">{m.text}</p>
                  ) : (
                    <FormattedAiMessage content={m.text} />
                  )}
                </div>
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-600 p-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
                <span>Analyzing reports...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3.5 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about team progress, blockers..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 transition shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantDrawer;
