import React, { useEffect, useState } from 'react';
import { Routes, Route, Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ListTodo, QrCode, ClipboardList, Sun, SunDim, Terminal, LogIn, Moon } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import { initAuth, googleSignIn } from '../authService';
import { User } from 'firebase/auth';

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
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors focus-visible:ring-3 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 outline-none rounded ${isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
};

const OperatorLayout = () => {
  const { themeMode, toggleHighVisMode } = useStore();

  return (
    <div className={`min-h-[100dvh] bg-slate-100 flex flex-col font-sans transition-all ${
      themeMode === 'high-vis' ? 'theme-high-vis' : themeMode === 'dark' ? 'theme-dark' : 'theme-light'
    }`}>
      
      {/* Universal Top Header */}
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-20 px-6 py-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-6">
          <Link to="/operator" className="text-xl font-bold tracking-tight hover:opacity-90">PlantFlow OS Console</Link>
          
          {/* Desktop Only Inline Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 ml-6" aria-label="Operator primary navigation">
            <Link to="/operator" className="px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all focus-visible:ring-3 focus-visible:ring-white outline-none">Today</Link>
            <Link to="/operator/hires" className="px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all focus-visible:ring-3 focus-visible:ring-white outline-none">Hires</Link>
            <Link to="/operator/scan" className="px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all flex items-center gap-1.5 focus-visible:ring-3 focus-visible:ring-white outline-none"><QrCode className="w-4 h-4 text-emerald-400" aria-hidden="true" /> Scan QR</Link>
            <Link to="/operator/fleet" className="px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all focus-visible:ring-3 focus-visible:ring-white outline-none">Fleet</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/operator/integration" 
            className="px-2.5 py-1 text-[11px] font-bold bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-1"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> API Sandbox
          </Link>
          <button 
            onClick={toggleHighVisMode}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors active:scale-95 focus-visible:ring-3 focus-visible:ring-white outline-none"
            aria-label={`Switch Theme (Current: ${themeMode})`}
            title={`Switch Theme (Current: ${themeMode === 'high-vis' ? 'High Contrast' : themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'})`}
          >
            {themeMode === 'light' && <Sun className="w-5 h-5" />}
            {themeMode === 'dark' && <Moon className="w-5 h-5" />}
            {themeMode === 'high-vis' && <SunDim className="w-5 h-5" />}
          </button>
        </div>
      </header>
      
      {/* Content wrapper stretches to max-7xl on desktop */}
      <main className="flex-1 w-full max-w-lg md:max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-[100px] md:pb-12 animate-in fade-in duration-300">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Bottom Nav: Only visible on mobile/tablet viewports */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-[72px] pb-[env(safe-area-inset-bottom)] z-40 max-w-lg mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex h-full px-2">
          <NavItem to="/operator" icon={<Home className="w-6 h-6" />} label="Today" />
          <NavItem to="/operator/hires" icon={<ListTodo className="w-6 h-6" />} label="Hires" />
          
          <div className="relative flex justify-center -mt-6 flex-1 h-full">
            <Link 
              to="/operator/scan" 
              aria-label="Scan QR handover code"
              className="absolute top-0 w-16 h-16 bg-emerald-500 rounded-full flex justify-center items-center text-white shadow-lg shadow-emerald-400 focus-visible:ring-3 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 outline-none active:scale-95 transition-transform"
            >
              <QrCode className="w-8 h-8" aria-hidden="true" />
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u) => { setUser(u); setLoading(false); },
      () => { setUser(null); setLoading(false); }
    );
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">PlantFlow OS Console</h1>
          <p className="text-slate-500 mb-8">Sign in to manage your fleet and hires.</p>
          <button 
            onClick={() => googleSignIn()}
            className="w-full bg-indigo-600 text-white font-medium px-4 py-3 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<OperatorLayout />}>
        <Route index element={<OperatorDashboard/>} />
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
