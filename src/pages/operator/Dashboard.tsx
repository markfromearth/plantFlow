import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, ClipboardList, ListTodo } from 'lucide-react';

export default function OperatorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 pb-24 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
      
      {/* Scan QR Area */}
      <div className="relative">
        <div 
          onClick={() => navigate('/operator/scan')}
          className="bg-emerald-500 rounded-3xl p-6 shadow-xl shadow-emerald-500/20 text-white flex flex-col items-center justify-center gap-4 cursor-pointer active:scale-95 transition-transform max-w-sm mx-auto relative z-20"
        >
          <QrCode className="w-16 h-16" />
          <h2 className="text-2xl font-black tracking-wide">Scan QR</h2>
        </div>

        {/* Scan QR Hint */}
        <div className="absolute top-full left-4 sm:left-12 mt-6 text-slate-800 z-10" style={{ fontFamily: '"Caveat", cursive', fontSize: '1.5rem', lineHeight: '1.1' }}>
           <svg width="60" height="60" viewBox="0 0 100 100" className="absolute -top-14 left-10 transform -scale-x-100 text-slate-800 overflow-visible">
            <path d="M10,80 Q-10,30 60,10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M40,5 L65,8 L55,30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="rotate-3 ml-16 sm:ml-20 w-48 text-center">
            <p>Scan a machine's tag</p>
            <p>to dispatch or return!</p>
          </div>
        </div>
      </div>

      <div className="h-6 sm:h-12"></div>

      {/* Grid Area */}
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto relative z-20">
        <div 
          onClick={() => navigate('/operator/fleet')}
          className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col items-center justify-center gap-4 cursor-pointer active:scale-95 transition-transform text-slate-900"
        >
          <div className="bg-indigo-50 p-4 rounded-full text-indigo-600">
            <ClipboardList className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold">Machines</h2>
        </div>

        <div 
          onClick={() => navigate('/operator/hires')}
          className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col items-center justify-center gap-4 cursor-pointer active:scale-95 transition-transform text-slate-900"
        >
          <div className="bg-orange-50 p-4 rounded-full text-orange-600">
            <ListTodo className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold">Jobs</h2>
        </div>

        {/* Action Grid Hints */}
        
        {/* Machine hint */}
        <div className="absolute -bottom-24 left-0 text-slate-800 pointer-events-none" style={{ fontFamily: '"Caveat", cursive', fontSize: '1.4rem', lineHeight: '1.1' }}>
          <svg width="40" height="50" viewBox="0 0 100 100" className="absolute -top-12 left-10 text-slate-800 overflow-visible">
            <path d="M20,90 Q30,40 10,10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M0,30 L10,5 L35,15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="-rotate-6 pt-4 w-36 ml-4">
            <p>Check live</p>
            <p>fleet status</p>
          </div>
        </div>

        {/* Jobs hint */}
        <div className="absolute -bottom-28 right-0 text-slate-800 pointer-events-none flex flex-col items-end" style={{ fontFamily: '"Caveat", cursive', fontSize: '1.4rem', lineHeight: '1.1' }}>
          <svg width="60" height="60" viewBox="0 0 100 100" className="absolute -top-14 right-10 text-slate-800 overflow-visible">
            <path d="M80,90 Q90,30 20,20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M40,5 L15,18 L30,40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="rotate-2 pt-6 pr-4 w-40 text-right">
            <p>Manage daily</p>
            <p>movements</p>
          </div>
        </div>

      </div>

    </div>
  );
}
