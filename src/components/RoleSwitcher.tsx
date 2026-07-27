import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HardHat, Users, Terminal, X, Trash2 } from 'lucide-react';

interface LogMessage {
  type: 'log' | 'warn' | 'error';
  text: string;
  time: string;
}

export default function RoleSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOperator = location.pathname.startsWith('/operator');

  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const addLog = (type: 'log' | 'warn' | 'error', args: any[]) => {
      const text = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      const time = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-99), { type, text, time }]); // Keep last 100 logs
    };

    console.log = (...args: any[]) => {
      originalLog.apply(console, args);
      addLog('log', args);
    };

    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);
      addLog('warn', args);
    };

    console.error = (...args: any[]) => {
      originalError.apply(console, args);
      addLog('error', args);
    };

    // Global uncaught error listener
    const handleGlobalError = (event: ErrorEvent) => {
      addLog('error', [`Uncaught Error: ${event.message} at ${event.filename}:${event.lineno}`]);
    };
    window.addEventListener('error', handleGlobalError);

    // Global promise rejection listener
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addLog('error', [`Unhandled Rejection: ${event.reason}`]);
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (isOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Don't show the switcher on the landing page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {/* Debug Console Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-900 text-white p-3 rounded-full shadow-lg border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 relative focus-visible:ring-3 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 outline-none"
          title="Toggle Debug Console Logs"
          aria-label="Toggle Debug Console Logs"
        >
          <Terminal className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          {logs.filter(l => l.type === 'error').length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center animate-pulse">
              {logs.filter(l => l.type === 'error').length}
            </span>
          )}
        </button>

        {/* Role Switcher Button */}
        <button
          onClick={() => navigate(isOperator ? '/customer' : '/operator')}
          className="bg-white p-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 hover:bg-slate-50 transition-colors text-slate-700 active:scale-95 focus-visible:ring-3 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 outline-none"
          title={`Switch to ${isOperator ? 'Customer' : 'Operator'} View`}
          aria-label={isOperator ? "Switch to Customer View" : "Switch to Operator Console"}
        >
          {isOperator ? <Users className="w-5 h-5 text-indigo-600" aria-hidden="true" /> : <HardHat className="w-5 h-5 text-indigo-600" aria-hidden="true" />}
          <span className="hidden sm:inline font-bold text-sm">
            {isOperator ? 'Customer View' : 'Operator Console'}
          </span>
        </button>
      </div>

      {/* Debug Console Overlay Drawer */}
      {isOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="console-logs-title"
          className="fixed bottom-20 left-4 right-4 max-w-2xl mx-auto bg-slate-950/95 backdrop-blur border border-slate-800 text-slate-100 rounded-2xl shadow-2xl z-50 flex flex-col h-80 overflow-hidden font-mono animate-in slide-in-from-bottom duration-300"
        >
          {/* Header */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" aria-hidden="true" />
              <span id="console-logs-title" className="sr-only">System Console Logs</span>
              <span className="text-xs font-bold text-slate-300 tracking-wider">SYSTEM CONSOLE LOGS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setLogs([])}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none"
                title="Clear Logs"
                aria-label="Clear console logs"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none"
                aria-label="Close console logs"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Console Output */}
          <div className="flex-1 overflow-y-auto p-4 text-[11px] leading-relaxed space-y-2.5">
            {logs.length === 0 ? (
              <div className="text-slate-500 italic text-center pt-8">No warnings or errors logged. System is operating normally.</div>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`flex gap-2 border-b border-slate-900 pb-1.5 ${
                    log.type === 'error' ? 'text-red-400 bg-red-950/10' : 
                    log.type === 'warn' ? 'text-amber-400 bg-amber-950/10' : 
                    'text-emerald-400'
                  }`}
                >
                  <span className="text-slate-600 shrink-0 font-bold">[{log.time}]</span>
                  <span className="break-all whitespace-pre-wrap">{log.text}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </>
  );
}
