import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { EquipmentStatus } from '../../types';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FleetList() {
  const { equipment, updateEquipmentStatus } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate data fetching delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getStatusCounts = () => {
    return {
      available: equipment.filter(e => e.availability_status === 'available').length,
      hired: equipment.filter(e => e.availability_status === 'hired').length,
      maintenance: equipment.filter(e => e.availability_status === 'maintenance').length
    };
  };

  const counts = getStatusCounts();

  const filteredEquipment = equipment.filter(item => {
    const term = searchTerm.toLowerCase();
    return item.name.toLowerCase().includes(term) || 
           item.machine_id.toLowerCase().includes(term) ||
           item.availability_status.toLowerCase().includes(term);
  });

  if (isLoading) {
    return (
      <div className="space-y-4 pb-6">
        <div className="relative">
          <div className="block w-full h-[46px] bg-slate-200 animate-pulse rounded-xl"></div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
              <div className="w-8 h-8 bg-slate-200 animate-pulse rounded mb-2"></div>
              <div className="w-16 h-3 bg-slate-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
              <div className="flex">
                <div className="w-28 h-28 bg-slate-200 animate-pulse shrink-0"></div>
                <div className="p-4 flex-1 flex flex-col justify-center">
                  <div className="w-3/4 h-5 bg-slate-200 animate-pulse rounded mb-2"></div>
                  <div className="w-1/2 h-4 bg-slate-200 animate-pulse rounded mb-4"></div>
                  <div className="w-16 h-5 bg-slate-200 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex gap-3 relative">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, ID or status..."
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => navigate('/operator/fleet/add')}
          className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center shrink-0 active:scale-95"
          aria-label="Add Equipment"
        >
          <Plus className="w-5 h-5" />
        </button>
        
        {/* Hint */}
        <div className="absolute top-1/2 left-full ml-4 -translate-y-1/2 text-slate-800 pointer-events-none hidden md:flex flex-col items-start z-10 w-40" style={{ fontFamily: '"Caveat", cursive', fontSize: '1.4rem', lineHeight: '1.1' }}>
          <svg width="40" height="40" viewBox="0 0 100 100" className="absolute top-1 -left-10 text-slate-800 overflow-visible">
            <path d="M90,50 Q60,20 10,50" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M30,30 L10,50 L30,70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="rotate-3 pl-2 w-full">
            <p>Add new</p>
            <p>machines here!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <p className="text-2xl font-extrabold text-slate-900">{counts.available}</p>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Available</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center border-b-4 border-b-indigo-500">
          <p className="text-2xl font-extrabold text-slate-900">{counts.hired}</p>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">On Hire</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center border-b-4 border-b-orange-500">
          <p className="text-2xl font-extrabold text-slate-900">{counts.maintenance}</p>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Maint.</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEquipment.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500 font-medium">No matching equipment found</p>
          </div>
        ) : (
          filteredEquipment.map(item => (
          <div key={item.machine_id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
            <div className="flex">
              <div className="w-28 h-28 bg-slate-100 shrink-0">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900 leading-tight">{item.name}</h3>
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{item.machine_id}</span>
                </div>
                <div className="mt-2 text-sm text-slate-500 mb-2">
                  <p>Next Service: {new Date(item.compliance_expiry).toLocaleDateString()}</p>
                </div>
                <div className="mt-auto">
                  {item.availability_status === 'available' && <span className="inline-block px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase bg-emerald-100 text-emerald-800 rounded-md">Available</span>}
                  {item.availability_status === 'hired' && <span className="inline-block px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase bg-indigo-100 text-indigo-800 rounded-md">On Hire</span>}
                  {item.availability_status === 'maintenance' && <span className="inline-block px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase bg-orange-100 text-orange-800 rounded-md">Maintenance</span>}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 flex justify-end gap-2 border-t border-slate-100">
              {editingId === item.machine_id ? (
                <div className="flex items-center gap-2 w-full">
                  <select 
                    className="flex-1 bg-white border border-slate-200 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={item.availability_status}
                    onChange={(e) => {
                      updateEquipmentStatus(item.machine_id, e.target.value as EquipmentStatus);
                      setEditingId(null);
                    }}
                  >
                    <option value="available">Available</option>
                    <option value="hired">On Hire</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <button 
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setEditingId(item.machine_id)}
                  className="px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm"
                >
                  Update Status
                </button>
              )}
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
