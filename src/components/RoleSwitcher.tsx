import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HardHat, Users } from 'lucide-react';

export default function RoleSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOperator = location.pathname.startsWith('/operator');

  // Don't show the switcher on the landing page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => navigate(isOperator ? '/customer' : '/operator')}
        className="bg-white p-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 hover:bg-slate-50 transition-colors text-slate-700"
        title={`Switch to ${isOperator ? 'Customer' : 'Operator'} View`}
      >
        {isOperator ? <Users className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
        <span className="hidden sm:inline font-medium">
          {isOperator ? 'Customer View' : 'Operator Console'}
        </span>
      </button>
    </div>
  );
}
