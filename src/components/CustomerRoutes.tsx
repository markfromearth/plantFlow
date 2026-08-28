import React from 'react';
import { Routes, Route, Outlet, Link } from 'react-router-dom';
import { HardHat } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import QuickJobFinder from './QuickJobFinder';

import CustomerHome from '../pages/customer/Home';
import CustomerEquipmentDetails from '../pages/customer/EquipmentDetails';
import CustomerBookingSuccess from '../pages/customer/BookingSuccess';
import QrDisplay from '../pages/customer/QrDisplay';

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            <Link to="/customer" className="flex items-center gap-2 focus-visible:ring-3 focus-visible:ring-indigo-500 rounded-lg shrink-0">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <HardHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">PlantFlow OS</span>
            </Link>
          </div>

          {/* Centered Quick Job Finder (Airbnb Style) */}
          <div className="hidden md:flex flex-grow justify-center h-full">
            <QuickJobFinder />
          </div>

          <div className="flex-1 flex justify-end">
            <nav className="flex items-center gap-4" aria-label="Customer Navigation">
              <Link to="/customer" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus-visible:ring-3 focus-visible:ring-indigo-500 px-2 py-1 rounded">Equipment</Link>
              <div className="hidden sm:block">
                <a href="tel:0800123456" aria-label="Call customer support on 0 8 0 0. 1 2 3. 4 5 6" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-md transition-colors focus-visible:ring-3 focus-visible:ring-indigo-500">
                  Call Us: 0800 123 456
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          &copy; {new Date().getFullYear()} PlantFlow OS Equipment Hire. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default function CustomerRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<CustomerHome />} />
        <Route path="equipment/:id" element={<CustomerEquipmentDetails />} />
        <Route path="booking-success" element={<CustomerBookingSuccess />} />
        <Route path="qr" element={<QrDisplay />} />
      </Route>
    </Routes>
  );
}

