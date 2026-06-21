import React from 'react';
import { Routes, Route, Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ListTodo, QrCode, ClipboardList, Sun, SunDim, Terminal } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

import OperatorDashboard from '../pages/operator/Dashboard';
import HiresList from '../pages/operator/HiresList';
import OperatorScan from '../pages/operator/Scan';
import OperatorHireDetails from '../pages/operator/HireDetails';
import FleetList from '../pages/operator/FleetList';
import OperatorAddEquipment from '../pages/operator/AddEquipment';
import IntegrationPlayground from '../pages/operator/IntegrationPlayground';
import { useStore } from '../store';

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/operator' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
};

const OperatorLayout = () => {
  const { highVisMode, toggleHighVisMode } = useStore();

  return (
    <div className={`min-h-[100dvh] bg-slate-100 flex flex-col font-sans pb-[72px] transition-all ${highVisMode ? 'theme-high-vis' : ''}`}>
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-20 px-4 py-4 flex justify-between items-center w-full">
        <Link to="/operator" className="text-xl font-bold tracking-tight hover:opacity-90">PlantFlow OS Console</Link>
        <div className="flex items-center gap-2">
          <Link 
            to="/operator/integration" 
            className="px-2.5 py-1 text-[11px] font-bold bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-1"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> API Sandbox
          </Link>
          <button 
            onClick={toggleHighVisMode}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors active:scale-95"
            aria-label="Toggle High Visibility Mode"
          >
            {highVisMode ? <SunDim className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-lg mx-auto p-4 sm:p-6 w-full animate-in fade-in duration-300">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-[72px] pb-[env(safe-area-inset-bottom)] z-40 max-w-lg mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex h-full px-2">
          <NavItem to="/operator" icon={<Home className="w-6 h-6" />} label="Today" />
          <NavItem to="/operator/hires" icon={<ListTodo className="w-6 h-6" />} label="Hires" />
          
          <div className="relative flex justify-center -mt-6 flex-1 h-full">
            <Link 
              to="/operator/scan" 
              className="absolute top-0 w-16 h-16 bg-emerald-500 rounded-full flex justify-center items-center text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
            >
              <QrCode className="w-8 h-8" />
            </Link>
            <span className="absolute bottom-2 text-[10px] font-medium text-slate-500 mt-2">Scan QR</span>
          </div>

          <NavItem to="/operator/fleet" icon={<ClipboardList className="w-6 h-6" />} label="Fleet" />
        </div>
      </nav>
    </div>
  );
};

export default function OperatorRoutes() {
  return (
    <Routes>
      <Route element={<OperatorLayout />}>
        <Route index element={<OperatorDashboard />} />
        <Route path="hires" element={<HiresList />} />
        <Route path="scan" element={<OperatorScan />} />
        <Route path="hires/:id" element={<OperatorHireDetails />} />
        <Route path="fleet" element={<FleetList />} />
        <Route path="fleet/add" element={<OperatorAddEquipment />} />
        <Route path="integration" element={<IntegrationPlayground />} />
      </Route>
    </Routes>
  );
}
