import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { EquipmentStatus } from '../../types';
import { Search, Plus, Filter, ArrowUpDown, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FleetList() {
  const { equipment, bookings, updateEquipmentStatus } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('machine_id');

  useEffect(() => {
    // Simulate data fetching delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Extract unique categories for the category selector
  const categories = Array.from(new Set(equipment.map(e => e.category)));

  // Calculate return dates and next hire dates for a given machine
  const getMachineDates = (machineId: string) => {
    const machineBookings = bookings.filter(
      b => b.machine_id === machineId && b.status !== 'cancelled' && b.status !== 'completed'
    );
    const nowStr = new Date().toISOString().split('T')[0];

    // Current active booking
    const activeBooking = machineBookings.find(
      b => b.status === 'active' || (b.status === 'confirmed' && b.start_date <= nowStr && b.end_date >= nowStr)
    );
    const returnDate = activeBooking ? activeBooking.end_date : null;

    // Upcoming future booking
    const futureBookings = machineBookings
      .filter(b => b.start_date > nowStr)
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
    const nextHireDate = futureBookings.length > 0 ? futureBookings[0].start_date : null;

    return { returnDate, nextHireDate };
  };

  const getStatusCounts = () => {
    return {
      all: equipment.length,
      available: equipment.filter(e => e.availability_status === 'available').length,
      hired: equipment.filter(e => e.availability_status === 'hired').length,
      maintenance: equipment.filter(e => e.availability_status === 'maintenance').length
    };
  };

  const counts = getStatusCounts();

  // Filter Logic
  const filteredEquipment = equipment.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(term) || 
                          item.machine_id.toLowerCase().includes(term) ||
                          item.category.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || item.availability_status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort Logic
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    const datesA = getMachineDates(a.machine_id);
    const datesB = getMachineDates(b.machine_id);

    if (sortBy === 'category') {
      return a.category.localeCompare(b.category);
    }
    if (sortBy === 'status') {
      return a.availability_status.localeCompare(b.availability_status);
    }
    if (sortBy === 'return_date') {
      if (datesA.returnDate && datesB.returnDate) {
        return datesA.returnDate.localeCompare(datesB.returnDate);
      }
      return datesA.returnDate ? -1 : datesB.returnDate ? 1 : 0;
    }
    if (sortBy === 'next_hire') {
      if (datesA.nextHireDate && datesB.nextHireDate) {
        return datesA.nextHireDate.localeCompare(datesB.nextHireDate);
      }
      return datesA.nextHireDate ? -1 : datesB.nextHireDate ? 1 : 0;
    }
    // Default: Sort by machine_id
    return a.machine_id.localeCompare(b.machine_id);
  });

  if (isLoading) {
    return (
      <div className="space-y-4 pb-6">
        <div className="relative">
          <div className="block w-full h-[46px] bg-slate-200 animate-pulse rounded-xl"></div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
              <div className="w-6 h-6 bg-slate-200 animate-pulse rounded mb-2"></div>
              <div className="w-12 h-3 bg-slate-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Search and Action Bar */}
      <div className="flex gap-3 relative">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search fleet catalog..."
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
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
      </div>

      {/* State Filter Pills Row */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`py-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
            statusFilter === 'all' ? 'bg-indigo-600 border-indigo-600 text-white shadow' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <span className="text-lg font-extrabold">{counts.all}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">All</span>
        </button>
        <button
          onClick={() => setStatusFilter('available')}
          className={`py-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
            statusFilter === 'available' ? 'bg-emerald-600 border-emerald-600 text-white shadow' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <span className="text-lg font-extrabold">{counts.available}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">Available</span>
        </button>
        <button
          onClick={() => setStatusFilter('hired')}
          className={`py-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
            statusFilter === 'hired' ? 'bg-indigo-700 border-indigo-700 text-white shadow' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <span className="text-lg font-extrabold">{counts.hired}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">On Hire</span>
        </button>
        <button
          onClick={() => setStatusFilter('maintenance')}
          className={`py-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
            statusFilter === 'maintenance' ? 'bg-orange-600 border-orange-600 text-white shadow' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <span className="text-lg font-extrabold">{counts.maintenance}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">Maint.</span>
        </button>
      </div>

      {/* Advanced Filters: Category and Sort */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-2 gap-3">
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 p-2 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-slate-400" /> Sort Order
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 p-2 outline-none"
          >
            <option value="machine_id">Machine ID</option>
            <option value="category">Category</option>
            <option value="status">Status</option>
            <option value="return_date">Return Date (Soonest)</option>
            <option value="next_hire">Next Date on Hire</option>
          </select>
        </div>
      </div>

      {/* Fleet Catalog Cards List */}
      <div className="space-y-4">
        {sortedEquipment.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 font-medium">No matching equipment in queue</p>
          </div>
        ) : (
          sortedEquipment.map(item => {
            const { returnDate, nextHireDate } = getMachineDates(item.machine_id);

            return (
              <div key={item.machine_id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col">
                <div className="flex">
                  <div className="w-24 h-24 bg-slate-100 shrink-0">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="font-extrabold text-slate-900 leading-tight text-sm">{item.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{item.machine_id}</span>
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      {item.category}
                    </p>

                    {/* Operational Dates Details */}
                    <div className="mt-1 flex flex-col gap-0.5">
                      {item.availability_status === 'hired' && returnDate && (
                        <div className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-500" /> Due Back: {new Date(returnDate).toLocaleDateString('en-GB')}
                        </div>
                      )}
                      {nextHireDate && (
                        <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-500" /> Next Hire: {new Date(nextHireDate).toLocaleDateString('en-GB')}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 font-semibold">
                        Service Limit: {new Date(item.compliance_expiry).toLocaleDateString('en-GB')}
                      </div>
                    </div>

                    <div className="mt-2.5">
                      {item.availability_status === 'available' && <span className="inline-block px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-emerald-100 text-emerald-800 rounded">Available</span>}
                      {item.availability_status === 'hired' && <span className="inline-block px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-indigo-100 text-indigo-800 rounded">On Hire</span>}
                      {item.availability_status === 'maintenance' && <span className="inline-block px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-orange-100 text-orange-800 rounded">Maintenance</span>}
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-2.5 flex justify-end gap-2 border-t border-slate-100">
                  {editingId === item.machine_id ? (
                    <div className="flex items-center gap-2 w-full">
                      <select 
                        className="flex-1 bg-white border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
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
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setEditingId(item.machine_id)}
                      className="px-3 py-1.5 bg-white text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
