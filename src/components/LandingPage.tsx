import React from 'react';
import { Link } from 'react-router-dom';
import { HardHat, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <HardHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">PlantFlow OS</h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto">
            Welcome to the PlantFlow OS Sandbox. Please select your role below to enter the appropriate application flow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <Link
            to="/customer"
            className="flex flex-col items-center p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-600 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-slate-100 group-hover:bg-indigo-50 rounded-full flex items-center justify-center mb-4 transition-colors">
              <Users className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Customer Portal</h2>
            <p className="text-sm text-slate-500">
              Browse equipment, view availability, and manage your hired machinery.
            </p>
          </Link>

          <Link
            to="/operator"
            className="flex flex-col items-center p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-slate-100 group-hover:bg-emerald-50 rounded-full flex items-center justify-center mb-4 transition-colors">
              <HardHat className="w-6 h-6 text-slate-600 group-hover:text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Operator Console</h2>
            <p className="text-sm text-slate-500">
              Manage your fleet, process QR handovers, and track live hires.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
