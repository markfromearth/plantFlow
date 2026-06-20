import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, HardHat } from 'lucide-react';

export default function RoleSwitcher() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm shadow-xl rounded-full p-1.5 flex items-center gap-1 border border-indigo-100">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <Users className="w-4 h-4 text-slate-600" />
        <span className="hidden sm:inline text-slate-700">Customer View</span>
      </button>
      <div className="w-px h-6 bg-slate-200"></div>
      <button
        onClick={() => navigate('/operator')}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <HardHat className="w-4 h-4 text-indigo-600" />
        <span className="hidden sm:inline text-slate-700">Operator Console</span>
      </button>
    </div>
  );
}
