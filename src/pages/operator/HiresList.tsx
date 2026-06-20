import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { ChevronRight, Search, Calendar, Package, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Booking } from '../../types';

export default function HiresList() {
  const navigate = useNavigate();
  const { bookings, equipment } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getEqName = (id: string) => equipment.find(e => e.machine_id === id)?.name || 'Unknown Item';

  const filtered = bookings
    .filter(b => b.status !== 'completed' && b.status !== 'cancelled')
    .filter(b => filter === 'all' || b.status === filter)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  const getJobDate = (b: Booking) => b.status === 'active' ? new Date(b.end_date) : new Date(b.start_date);
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  const getGroup = (b: Booking) => {
    const d = getJobDate(b);
    if (isSameDay(d, today)) return 'Today';
    if (isSameDay(d, tomorrow)) return 'Tomorrow';
    
    d.setHours(0,0,0,0);
    const tm = new Date(tomorrow);
    tm.setHours(0,0,0,0);
    
    if (d.getTime() > tm.getTime()) return 'Later';
    return 'Today'; // Past jobs get clumped into Today to deal with them
  };

  const grouped = {
    Today: filtered.filter(b => getGroup(b) === 'Today'),
    Tomorrow: filtered.filter(b => getGroup(b) === 'Tomorrow'),
    Later: filtered.filter(b => getGroup(b) === 'Later'),
  };

  const renderJobCategory = (title: string, jobs: Booking[]) => {
    if (jobs.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-3 px-2 flex items-center gap-2">
          {title}
        </h2>
        <div className="space-y-3">
          {jobs.map(b => (
            <div 
              key={b.booking_id} 
              onClick={() => navigate(`/operator/hires/${b.booking_id}`)}
              className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${b.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {b.status === 'active' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-slate-900 truncate text-lg">{getEqName(b.machine_id)}</p>
                  {b.status === 'pending' && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase rounded flex-shrink-0">Pending</span>}
                  {b.status === 'active' && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded flex-shrink-0">Active</span>}
                  {b.status === 'confirmed' && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded flex-shrink-0">Ready</span>}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">{b.hirer_name}</p>
                    <p className="text-slate-400 text-xs mt-0.5 border-t border-slate-100 pt-1 border-dashed">
                      {b.status === 'active' ? 'Collection' : 'Delivery'}: {b.delivery_window || 'Anytime'}
                    </p>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-6 mt-4">
        <div className="bg-slate-200 animate-pulse h-12 rounded-xl mb-6"></div>
        <div className="space-y-4">
          {[1, 2].map(section => (
            <div key={`section-${section}`}>
               <div className="w-24 h-4 bg-slate-200 animate-pulse rounded mb-3 ml-2"></div>
               <div className="space-y-3">
                 {[1, 2].map(card => (
                   <div key={`card-${card}`} className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-sm border border-slate-100">
                     <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse shrink-0"></div>
                     <div className="flex-1 space-y-2">
                       <div className="w-3/4 h-5 bg-slate-200 animate-pulse rounded"></div>
                       <div className="w-1/2 h-4 bg-slate-200 animate-pulse rounded"></div>
                       <div className="w-full h-3 bg-slate-200 animate-pulse rounded mt-2"></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="bg-white rounded-xl p-1.5 flex shadow-sm border border-slate-200">
        <button 
          onClick={() => setFilter('all')}
          className={`flex-1 py-2.5 text-sm font-bold tracking-wide rounded-lg transition-colors ${filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          ALL
        </button>
        <button 
          onClick={() => setFilter('pending')}
          className={`flex-1 py-2.5 text-sm font-bold tracking-wide rounded-lg transition-colors ${filter === 'pending' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          PENDING
        </button>
        <button 
          onClick={() => setFilter('active')}
          className={`flex-1 py-2.5 text-sm font-bold tracking-wide rounded-lg transition-colors ${filter === 'active' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          ACTIVE
        </button>
      </div>

      <div className="space-y-2 mt-4 relative">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-medium bg-slate-50 rounded-2xl border border-slate-100">
            <Package className="w-8 h-8 mx-auto mb-3 text-slate-300" />
            No jobs found
          </div>
        ) : (
          <>
            {renderJobCategory('Today', grouped.Today)}
            {renderJobCategory('Tomorrow', grouped.Tomorrow)}
            {renderJobCategory('Later', grouped.Later)}
          </>
        )}
        
        {/* Hint */}
        {filtered.length > 0 && (
          <div className="absolute top-32 -right-4 text-slate-800 pointer-events-none hidden sm:flex flex-col items-end z-10" style={{ fontFamily: '"Caveat", cursive', fontSize: '1.4rem', lineHeight: '1.1' }}>
            <svg width="60" height="60" viewBox="0 0 100 100" className="absolute -top-12 right-20 text-slate-800 overflow-visible">
              <path d="M90,80 Q50,60 10,20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M10,45 L10,20 L35,20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="-rotate-6 pt-2 pr-12 w-48 text-right">
              <p>Tap a job to view</p>
              <p>or dispatch!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
