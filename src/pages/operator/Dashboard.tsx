import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store';
import { Equipment, Booking, EquipmentStatus, BookingStatus } from '../../types';
import { 
  QrCode, ClipboardList, ListTodo, Calendar, 
  ArrowUpRight, ArrowDownRight, AlertTriangle, 
  CheckCircle2, Wrench, X, Phone, MapPin, Play, Sparkles, GripVertical
} from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Reorder } from 'motion/react';


interface Movement {
  id: string;
  booking_id?: string;
  time: string;
  type: 'outbound' | 'inbound' | 'maintenance';
  machineId: string;
  machineName: string;
  category: string;
  customerName: string;
  siteAddress: string;
  status: 'pending' | 'active' | 'completed' | 'exception';
  deliveryWindow: string;
  deliveryNeeded: boolean;
  notes?: string;
}

export default function OperatorDashboard() {
  useDocumentTitle("Operator Console");
  const navigate = useNavigate();
  const { equipment, bookings, updateEquipmentStatus, updateBookingStatus } = useStore();

  // Filter & Selected Movement state
  const [filterSlot, setFilterSlot] = useState<'all' | 'morning' | 'afternoon' | 'attention'>('all');
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [activeMovement, setActiveMovement] = useState<Movement | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync state for opening/closing transitions
  useEffect(() => {
    if (selectedMovement) {
      setActiveMovement(selectedMovement);
      const frame = requestAnimationFrame(() => {
        setIsDrawerOpen(true);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsDrawerOpen(false);
      const timer = setTimeout(() => {
        setActiveMovement(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedMovement]);

  // Dismiss dialog modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMovement(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // State-based movements list seeded with realistic dispatch data for active ordering
  const [movements, setMovements] = useState<Movement[]>([]);

  useEffect(() => {
    setMovements(prev => {
      // If the list is already initialized, preserve the user-arranged order
      // and slot choices. Simply update the status based on central booking updates.
      if (prev && prev.length > 0) {
        return prev.map(m => {
          const matchedBooking = bookings.find(b => b.booking_id === m.booking_id);
          if (matchedBooking) {
            let status = m.status;
            if (matchedBooking.status === 'active' || matchedBooking.status === 'completed') {
              status = 'completed';
            }
            return {
              ...m,
              status
            };
          }
          return m;
        });
      }

      // Seeding realistic, route-arrangable London dispatch locations
      const list: Movement[] = [];
      const seeds: Movement[] = [
        {
          id: 'mov-1',
          booking_id: 'bk-1001',
          time: '08:00',
          type: 'outbound',
          machineId: 'EXC-001',
          machineName: 'Kubota 1.5t Excavator',
          category: 'Excavators',
          customerName: 'J. Murphy & Sons',
          siteAddress: 'Battersea Power Station Site, London, SW11 8BZ',
          status: 'pending',
          deliveryWindow: 'Morning Assignment (08:00 - 12:00)',
          deliveryNeeded: true,
          notes: 'Check safety certs on gate entry.'
        },
        {
          id: 'mov-2',
          booking_id: 'bk-1002',
          time: '09:00',
          type: 'outbound',
          machineId: 'DMP-003',
          machineName: 'Thwaites 3t Dumper',
          category: 'Dumpers',
          customerName: 'Balfour Beatty Civils',
          siteAddress: 'A42 Junction 14 Site Compound, Leicestershire, LE65 2AS',
          status: 'pending',
          deliveryWindow: 'Morning Assignment (08:00 - 12:00)',
          deliveryNeeded: true,
          notes: 'Needs beacons checked.'
        },
        {
          id: 'mov-3',
          booking_id: 'bk-1003',
          time: '10:30',
          type: 'outbound',
          machineId: 'CMP-002',
          machineName: 'Bomag 120 Roller',
          category: 'Compaction',
          customerName: 'Kier Highway Works',
          siteAddress: 'M25 Junction 10 Roadworks, Surrey, GU23 6PN',
          status: 'pending',
          deliveryWindow: 'Morning Assignment (08:00 - 12:00)',
          deliveryNeeded: true,
          notes: 'Confirm tie-down straps are secure.'
        },
        {
          id: 'mov-4',
          booking_id: 'bk-1004',
          time: '13:30',
          type: 'outbound',
          machineId: 'EXC-002',
          machineName: 'Yanmar 3.5t Excavator',
          category: 'Excavators',
          customerName: 'Taylor Wimpey Homes',
          siteAddress: 'Oakwood Grange Development, Croydon, CR3 0EL',
          status: 'pending',
          deliveryWindow: 'Afternoon Assignment (12:00 - 19:00)',
          deliveryNeeded: true,
          notes: 'Request contact on arrival.'
        },
        {
          id: 'mov-5',
          booking_id: 'bk-1005',
          time: '15:00',
          type: 'outbound',
          machineId: 'DMP-001',
          machineName: 'Thwaites 1t High-Tip Dumper',
          category: 'Dumpers',
          customerName: 'Redrow Homes Site',
          siteAddress: 'Kings Chase Estate Office, Banstead, KT20 5AD',
          status: 'pending',
          deliveryWindow: 'Afternoon Assignment (12:00 - 19:00)',
          deliveryNeeded: true,
          notes: 'Must be delivered to Site Gate B.'
        }
      ];

      list.push(...seeds);

      // Merge dynamic user-generated bookings on today's start date
      const todayStr = new Date().toISOString().split('T')[0];
      bookings.forEach(b => {
        if (seeds.some(s => s.booking_id === b.booking_id)) return;
        const mach = equipment.find(e => e.machine_id === b.machine_id);
        const isStartToday = b.start_date === todayStr;
        
        if (isStartToday) {
          list.push({
            id: b.booking_id + '-out',
            booking_id: b.booking_id,
            time: b.delivery_window.includes('Morning') ? '09:00' : '14:00',
            type: 'outbound',
            machineId: b.machine_id,
            machineName: mach ? mach.name : 'Mini Excavator',
            category: mach ? mach.category : 'Excavators',
            customerName: b.hirer_name,
            siteAddress: b.site_address,
            status: b.status === 'active' || b.status === 'completed' ? 'completed' : 'pending',
            deliveryWindow: b.delivery_window,
            deliveryNeeded: b.deliveryNeeded,
            notes: mach ? mach.notes : ''
          });
        }
      });

      return list;
    });
  }, [bookings, equipment]);

  // Order sorting functions
  const moveMovementById = (id: string, direction: 'up' | 'down') => {
    setMovements(prev => {
      const index = prev.findIndex(m => m.id === id);
      if (index === -1) return prev;
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < next.length) {
        const temp = next[index];
        next[index] = next[targetIndex];
        next[targetIndex] = temp;
      }
      return next;
    });
  };

  const toggleMovementSlot = (id: string) => {
    setMovements(prev => prev.map(m => {
      if (m.id === id) {
        const isAM = m.deliveryWindow.includes('Morning');
        return {
          ...m,
          deliveryWindow: isAM ? 'Afternoon Assignment (12:00 - 19:00)' : 'Morning Assignment (08:00 - 12:00)'
        };
      }
      return m;
    }));
  };

  // Filtered movements based on the selected slot filter
  const filteredMovements = useMemo(() => {
    let list = [...movements];
    
    if (filterSlot === 'morning') {
      list = list.filter(m => m.deliveryWindow.includes('Morning'));
    } else if (filterSlot === 'afternoon') {
      list = list.filter(m => m.deliveryWindow.includes('Afternoon'));
    } else if (filterSlot === 'attention') {
      list = list.filter(m => m.status === 'exception' || m.type === 'maintenance');
    }
    
    // Sort "Needs attention" items to the top by default
    list.sort((a, b) => {
      const aNeeds = a.status === 'exception' || a.type === 'maintenance';
      const bNeeds = b.status === 'exception' || b.type === 'maintenance';
      if (aNeeds && !bNeeds) return -1;
      if (!aNeeds && bNeeds) return 1;
      return 0;
    });
    
    return list;
  }, [movements, filterSlot]);

  // Compute operational KPIs for simplified summary
  const filterCounts = useMemo(() => {
    return {
      all: movements.length,
      morning: movements.filter(m => m.deliveryWindow.includes('Morning')).length,
      afternoon: movements.filter(m => m.deliveryWindow.includes('Afternoon')).length,
      attention: movements.filter(m => m.status === 'exception' || m.type === 'maintenance').length
    };
  }, [movements]);

  // Availability statistics for capacity
  const getAvailabilityStats = (cat: string) => {
    const total = equipment.filter(e => e.category === cat).length;
    if (total === 0) return { pct: 100, count: 0, total: 0 };
    const available = equipment.filter(e => e.category === cat && e.availability_status === 'available').length;
    return {
      pct: Math.round((available / total) * 100),
      count: available,
      total
    };
  };

  const renderStatus = (mov: Movement) => {
    let text = '';
    let colorClass = '';
    let icon = null;
    
    if (mov.status === 'completed') {
      text = '✓ Completed';
      colorClass = 'bg-slate-100 text-slate-655 border-slate-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5" />;
    } else if (mov.status === 'exception') {
      text = '⚠️ Needs a decision';
      colorClass = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      icon = <AlertTriangle className="w-3.5 h-3.5" />;
    } else if (mov.type === 'maintenance') {
      text = '🔧 In for repair';
      colorClass = 'bg-orange-50 text-orange-700 border-orange-200';
      icon = <Wrench className="w-3.5 h-3.5" />;
    } else {
      if (mov.type === 'outbound') {
        if (mov.deliveryNeeded) {
          text = 'Out for delivery';
          colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
          icon = <ArrowUpRight className="w-3.5 h-3.5" />;
        } else {
          text = 'Depot Collection (Ready)';
          colorClass = 'bg-teal-50 text-teal-700 border-teal-200';
          icon = <CheckCircle2 className="w-3.5 h-3.5" />;
        }
      } else {
        if (mov.deliveryNeeded) {
          text = 'Inbound Collection';
          colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          icon = <ArrowDownRight className="w-3.5 h-3.5" />;
        } else {
          text = 'Customer Return';
          colorClass = 'bg-slate-50 text-slate-750 border-slate-200';
          icon = <ArrowDownRight className="w-3.5 h-3.5" />;
        }
      }
    }
    
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded border ${colorClass}`}>
        {icon}
        {text}
      </span>
    );
  };



  // Handle Quick Dispatch / Return Transition
  const handleAction = async (mov: Movement, action: 'dispatch' | 'return' | 'maintenance') => {
    if (action === 'dispatch') {
      await updateEquipmentStatus(mov.machineId, 'hired');
      if (mov.booking_id) {
        updateBookingStatus(mov.booking_id, 'active');
      }
    } else if (action === 'return') {
      await updateEquipmentStatus(mov.machineId, 'available');
      if (mov.booking_id) {
        updateBookingStatus(mov.booking_id, 'completed');
      }
    } else if (action === 'maintenance') {
      await updateEquipmentStatus(mov.machineId, 'maintenance');
    }

    // Refresh selected movement state
    setSelectedMovement(null);
  };

  return (
    <div className="space-y-6 pb-48 pt-2 animate-in fade-in duration-300">
      
      {/* Friendly Header Summary */}
      <div className="space-y-1 pl-2">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Today's deliveries</h1>
        <p className="text-sm font-bold text-slate-655">
          {movements.length} deliveries today · {filterCounts.attention === 0 ? 'All looking good' : `${filterCounts.attention} need your attention`}
        </p>
      </div>

      {/* Capacity Horizon Accordion */}
      <details className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm group [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex justify-between items-center font-black text-xs text-slate-500 uppercase tracking-wider cursor-pointer list-none select-none">
          <span>How full are we?</span>
          <span className="text-[10px] text-indigo-650 font-black group-open:hidden">Show details</span>
          <span className="text-[10px] text-indigo-650 font-black hidden group-open:inline">Hide details</span>
        </summary>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs mt-3">
          {['Excavators', 'Dumpers', 'Compaction', 'Access'].map(cat => {
            const stats = getAvailabilityStats(cat);
            const isLow = stats.pct < 30;

            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between font-bold text-[11px] text-slate-700">
                  <span className="truncate">{cat}</span>
                  <span className={isLow ? 'text-red-500' : 'text-slate-500'}>
                    {stats.pct}% ({stats.count}/{stats.total}) {isLow && '⚠️'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-indigo-600'}`}
                    style={{ width: `${stats.pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </details>

      {/* Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
        {[
          { key: 'all', label: 'All' },
          { key: 'morning', label: 'Morning' },
          { key: 'afternoon', label: 'Afternoon' },
          { key: 'attention', label: 'Needs attention' }
        ].map(filter => {
          const count = filterCounts[filter.key as keyof typeof filterCounts];
          const isActive = filterSlot === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => setFilterSlot(filter.key as any)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 border uppercase tracking-wider focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none ${
                isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              {filter.label} <span className={`text-[10px] ml-1 px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Today's Deliveries List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pl-2 border-l-4 border-indigo-600">Today's deliveries</h3>
          <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded font-black uppercase tracking-wider">Drag to reorder</span>
        </div>

        {filteredMovements.length === 0 ? (
          <div className="text-slate-400 text-xs font-bold py-6 text-center uppercase tracking-wide">No deliveries found</div>
        ) : (
          <Reorder.Group axis="y" values={filteredMovements} onReorder={setMovements} className="space-y-3 list-none m-0 p-0">
            {filteredMovements.map((mov, index) => {
              const isAM = mov.deliveryWindow.includes('Morning');
              
              return (
                <Reorder.Item 
                  key={mov.id} 
                  value={mov}
                  onClick={() => setSelectedMovement(mov)}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 gap-3 transition-colors hover:border-slate-350 hover:bg-slate-100 cursor-pointer relative"
                  whileDrag={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                >
                  {/* Drag handle */}
                  <div 
                    className="flex items-center text-slate-400 hover:text-slate-655 cursor-grab active:cursor-grabbing p-2"
                    onClick={(e) => e.stopPropagation()} // stop modal trigger when dragging
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {renderStatus(mov)}
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-200/60 px-1.5 py-0.2 rounded border border-slate-300 uppercase tracking-wide">
                        {isAM ? '☀️ Morning' : '🌤️ Afternoon'}
                      </span>
                    </div>
                    {/* Plain Language name as primary label */}
                    <h4 className="text-sm font-black text-slate-900 leading-snug">{mov.machineName}</h4>
                    <p className="text-xs font-bold text-slate-600 mt-1 leading-normal">Site: {mov.siteAddress}</p>
                    <p className="text-[11px] text-slate-500">Client: {mov.customerName}</p>
                  </div>

                  {/* Reorder & Swap actions */}
                  <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => toggleMovementSlot(mov.id)}
                      className="px-2.5 py-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-55 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer min-h-[44px]"
                      title={isAM ? 'Move to Afternoon' : 'Move to Morning'}
                    >
                      {isAM ? 'Move to PM' : 'Move to AM'}
                    </button>

                    {/* Standalone Up/Down Arrow reorder targets */}
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => moveMovementById(mov.id, 'up')}
                        disabled={index === 0}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all cursor-pointer"
                        title="Move Up"
                        aria-label="Move Up"
                      >
                        ▲
                      </button>
                      <button 
                        onClick={() => moveMovementById(mov.id, 'down')}
                        disabled={index === filteredMovements.length - 1}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all cursor-pointer"
                        title="Move Down"
                        aria-label="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>

      {/* Unified Primary CTA Footer (Fixed bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto space-y-3">
          <button 
            onClick={() => alert("Today's delivery run started! Dispatch lists sent to drivers.")}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 text-sm tracking-wide uppercase transition-all"
          >
            Start today's run
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/operator/scan')}
              className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all uppercase tracking-wide"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-500" /> Quick Scan
            </button>
            <Link 
              to="/operator/fleet" 
              className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all uppercase tracking-wide text-center"
            >
              <ClipboardList className="w-3.5 h-3.5 text-indigo-500" /> Live Fleet
            </Link>
            <Link 
              to="/operator/hires" 
              className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all uppercase tracking-wide text-center"
            >
              <ListTodo className="w-3.5 h-3.5 text-orange-500" /> Active Hires
            </Link>
          </div>
        </div>
      </div>


      {activeMovement && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title"
          onClick={() => setSelectedMovement(null)}
          className={`fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 ${
            isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-[85%] max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto transition-transform duration-300 border-l border-slate-200 ${
              isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                <div>
                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                    {activeMovement.type}
                  </span>
                  <h3 id="modal-title" className="text-base font-extrabold text-slate-900 mt-1">{activeMovement.machineName}</h3>
                </div>
                <button 
                  onClick={() => setSelectedMovement(null)}
                  aria-label="Close details dialog"
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200/50 rounded-xl p-3">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Asset ID</span>
                    <span className="font-mono font-bold text-slate-800">{activeMovement.machineId}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Category</span>
                    <span className="font-bold text-slate-800">{activeMovement.category}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Planned Time</span>
                    <span className="font-bold text-slate-800">{activeMovement.time} ({activeMovement.deliveryWindow} Slot)</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Transport Method</span>
                    <span className="font-bold text-slate-800">{activeMovement.deliveryNeeded ? '🚛 Depot Delivery' : '🚶 Customer Collection'}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Hirer Contact</span>
                      <span className="font-bold text-slate-800">{activeMovement.customerName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase">Site / Delivery Address</span>
                      <span className="font-bold text-slate-800 leading-normal">{activeMovement.siteAddress}</span>
                    </div>
                  </div>
                </div>

                {activeMovement.notes && (
                  <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 text-amber-800">
                    <span className="block text-[8px] font-black uppercase text-amber-600 mb-0.5">Special Dispatch Notes</span>
                    <p className="leading-normal font-medium">{activeMovement.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <a 
                href={`tel:0800123456`}
                aria-label="Call hirer support on 0 8 0 0. 1 2 3. 4 5 6"
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-center focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none"
              >
                <Phone className="w-4 h-4" /> Contact Hirer / Driver
              </a>

              {activeMovement.status !== 'completed' && (
                <>
                  {activeMovement.type === 'outbound' && (
                    <button
                      onClick={() => handleAction(activeMovement, 'dispatch')}
                      className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> {activeMovement.deliveryNeeded ? "Send out for delivery" : "Hand over to customer"}
                    </button>
                  )}
                  {activeMovement.type === 'inbound' && (
                    <button
                      onClick={() => handleAction(activeMovement, 'return')}
                      className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> {activeMovement.deliveryNeeded ? "Collect from customer" : "Accept returned machine"}
                    </button>
                  )}
                </>
              )}

              {activeMovement.type !== 'maintenance' && activeMovement.status !== 'completed' && (
                <button
                  onClick={() => handleAction(activeMovement, 'maintenance')}
                  className="w-full bg-orange-50 text-orange-700 font-bold py-2.5 rounded-xl hover:bg-orange-100 transition-colors border border-orange-200"
                >
                  Move Asset to Inspection / Maint.
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
