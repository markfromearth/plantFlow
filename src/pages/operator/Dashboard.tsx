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
  driverId?: string;
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
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

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

  // Tactical Dispatch Drivers Pool
  const driversList = useMemo(() => [
    { id: 'drv-steve', name: 'Steve', vehicle: 'Flatbed Truck 1', maxCapacity: 8000 },
    { id: 'drv-dave', name: 'Dave', vehicle: 'Transit Van 2', maxCapacity: 2000 },
    { id: 'drv-sarah', name: 'Sarah', vehicle: 'Heavy Truck 3', maxCapacity: 12000 }
  ], []);

  const getJobWeight = (machineName: string) => {
    const name = machineName.toLowerCase();
    if (name.includes('excavator')) return 1500;
    if (name.includes('dumper')) return 3000;
    if (name.includes('roller')) return 1200;
    return 1000;
  };

  const getDriverStats = (driverId: string, maxCapacity: number) => {
    const assignedJobs = movements.filter(m => m.driverId === driverId);
    const currentWeight = assignedJobs.reduce((sum, j) => sum + getJobWeight(j.machineName), 0);
    const pct = Math.min(100, Math.round((currentWeight / maxCapacity) * 100));
    return { currentWeight, pct };
  };

  // Assign job to driver
  const assignDriver = (jobId: string, driverId: string | undefined) => {
    setMovements(prev => prev.map(m => {
      if (m.id === jobId) {
        return { ...m, driverId };
      }
      return m;
    }));
    setSelectedJobId(null);
  };

  // Instantly assign the first/top prioritized job in the unassigned pool to a driver
  const assignNextJob = (driverId: string) => {
    const unassigned = movements.filter(m => !m.driverId);
    if (unassigned.length > 0) {
      assignDriver(unassigned[0].id, driverId);
    }
  };

  // Handles up/down reordering in any lane (unassigned or driver-assigned)
  const moveJob = (id: string, direction: 'up' | 'down') => {
    setMovements(prev => {
      const targetJob = prev.find(m => m.id === id);
      if (!targetJob) return prev;
      
      const laneId = targetJob.driverId;
      const laneJobs = prev.filter(m => m.driverId === laneId);
      const index = laneJobs.findIndex(m => m.id === id);
      if (index === -1) return prev;
      
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < laneJobs.length) {
        const reordered = [...laneJobs];
        const temp = reordered[index];
        reordered[index] = reordered[targetIndex];
        reordered[targetIndex] = temp;
        
        let reorderedIdx = 0;
        return prev.map(m => {
          if (m.driverId === laneId) {
            return reordered[reorderedIdx++];
          }
          return m;
        });
      }
      return prev;
    });
  };

  // Drag reordering for swimlanes
  const reorderDriverJobs = (driverId: string, reorderedSublist: Movement[]) => {
    setMovements(prev => {
      const otherJobs = prev.filter(m => m.driverId !== driverId);
      return [...otherJobs, ...reorderedSublist];
    });
  };

  // Filtered unassigned movements for the Left Pane
  const unassignedMovements = useMemo(() => {
    let list = movements.filter(m => !m.driverId);
    
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

  // Compute unassigned pool counts for filter chips
  const filterCounts = useMemo(() => {
    const unassigned = movements.filter(m => !m.driverId);
    return {
      all: unassigned.length,
      morning: unassigned.filter(m => m.deliveryWindow.includes('Morning')).length,
      afternoon: unassigned.filter(m => m.deliveryWindow.includes('Afternoon')).length,
      attention: unassigned.filter(m => m.status === 'exception' || m.type === 'maintenance').length
    };
  }, [movements]);

  // Availability stats for "How full are we?"
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
      text = '⚠️ Needs decision';
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

    setSelectedMovement(null);
  };

  return (
    <div className="h-[calc(100vh-11rem)] flex gap-4 p-2 overflow-hidden animate-in fade-in duration-300">
      
      {/* LEFT PANE: The Unassigned Pool */}
      <div className="w-1/3 flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 space-y-1">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Unassigned Pool</h2>
          <p className="text-xs text-slate-550 font-bold">
            {filterCounts.all} jobs waiting · {filterCounts.attention} need attention
          </p>
        </div>

        {/* Filter Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200/50 flex gap-1.5 overflow-x-auto scrollbar-none select-none">
          {[
            { key: 'all', label: 'All' },
            { key: 'morning', label: 'AM Only' },
            { key: 'afternoon', label: 'PM Only' },
            { key: 'attention', label: 'Attention' }
          ].map(filter => {
            const count = filterCounts[filter.key as keyof typeof filterCounts];
            const isActive = filterSlot === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => setFilterSlot(filter.key as any)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all shrink-0 border uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                {filter.label} <span className="ml-1 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable list of chunky cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {unassignedMovements.length === 0 ? (
            <div className="text-slate-400 text-xs font-black py-12 text-center uppercase tracking-wide">No unassigned jobs</div>
          ) : (
            unassignedMovements.map((mov) => {
              const isDelivery = mov.type === 'outbound';
              const isUrgent = mov.status === 'exception' || mov.type === 'maintenance';
              const isSelected = selectedJobId === mov.id;
              
              // Get postcode/zone from site address
              const addrWords = mov.siteAddress.split(',');
              const postcode = addrWords[addrWords.length - 1]?.trim() || 'Zone 1';

              return (
                <div
                  key={mov.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', mov.id);
                  }}
                  onClick={() => setSelectedJobId(isSelected ? null : mov.id)}
                  className={`flex flex-col justify-between bg-white border rounded-xl p-4 min-h-[140px] shadow-sm hover:border-slate-350 active:scale-[0.99] transition-all cursor-pointer relative ${
                    isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200'
                  } ${isDelivery ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-emerald-500'}`}
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      {/* Bold Gear Type */}
                      <h4 className="text-sm font-black text-slate-900 leading-snug">{mov.machineName}</h4>
                      {/* Postcode/Zone tag */}
                      <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                        {postcode}
                      </span>
                    </div>

                    {/* Bold Customer */}
                    <p className="text-xs font-bold text-slate-800">Client: {mov.customerName}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">Site: {mov.siteAddress}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div className="flex gap-1.5 items-center">
                      {/* Status indicator (icon+word+color) */}
                      {renderStatus(mov)}
                      {isUrgent && (
                        <span className="text-[9px] font-black uppercase text-red-655 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded animate-pulse">
                          Urgent
                        </span>
                      )}
                    </div>

                    <span className="text-[9px] font-bold text-slate-400">
                      {mov.deliveryWindow.includes('Morning') ? '☀️ AM' : '🌤️ PM'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: The Vehicle Pool (Swimlanes) */}
      <div className="w-2/3 flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Vehicle Pool</h2>
            <p className="text-xs text-slate-500 font-bold">Assign jobs to drivers and arrange their delivery flow</p>
          </div>
          {selectedJobId && (
            <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full font-black animate-pulse uppercase tracking-wider">
              Tapping a vehicle swimlane will assign job
            </span>
          )}
        </div>

        {/* Swimlanes Row */}
        <div className="flex-1 flex overflow-x-auto p-4 gap-4 bg-slate-50/50 scrollbar-thin">
          {driversList.map((driver) => {
            const assignedJobs = movements.filter(m => m.driverId === driver.id);
            const { currentWeight, pct } = getDriverStats(driver.id, driver.maxCapacity);
            const isFull = pct >= 90;

            return (
              <div
                key={driver.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const jobId = e.dataTransfer.getData('text/plain');
                  if (jobId) assignDriver(jobId, driver.id);
                }}
                onClick={() => {
                  if (selectedJobId) {
                    assignDriver(selectedJobId, driver.id);
                  }
                }}
                className={`flex flex-col w-72 shrink-0 bg-white border rounded-xl p-3 h-full shadow-sm transition-all select-none ${
                  selectedJobId ? 'hover:border-indigo-400 hover:ring-2 hover:ring-indigo-100 cursor-pointer' : 'border-slate-200'
                }`}
              >
                {/* Vehicle Header */}
                <div className="pb-3 border-b border-slate-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{driver.name}</h4>
                      <p className="text-[10px] text-slate-450 font-bold">{driver.vehicle}</p>
                    </div>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      isFull ? 'bg-red-50 text-red-655' : 'bg-slate-100 text-slate-655'
                    }`}>
                      {pct}% Full
                    </span>
                  </div>

                  {/* Visual Capacity Fill Meter */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full transition-all duration-300 ${isFull ? 'bg-red-500' : 'bg-indigo-600'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>{currentWeight} kg</span>
                      <span>Max: {driver.maxCapacity} kg</span>
                    </div>
                  </div>

                  {/* Assign Next button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      assignNextJob(driver.id);
                    }}
                    disabled={unassignedMovements.length === 0}
                    className="w-full mt-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black border border-slate-200 rounded-lg text-[10px] uppercase tracking-wider transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer min-h-[36px]"
                  >
                    Assign Next Job
                  </button>
                </div>

                {/* Stacks visually in swimlane */}
                <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-[200px]">
                  {assignedJobs.length === 0 ? (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Drag jobs here or tap column to assign</p>
                    </div>
                  ) : (
                    <Reorder.Group axis="y" values={assignedJobs} onReorder={(reordered) => reorderDriverJobs(driver.id, reordered)} className="space-y-2.5 list-none m-0 p-0">
                      {assignedJobs.map((mov, index) => {
                        const isDelivery = mov.type === 'outbound';
                        const addrWords = mov.siteAddress.split(',');
                        const postcode = addrWords[addrWords.length - 1]?.trim() || 'Zone 1';

                        return (
                          <Reorder.Item
                            key={mov.id}
                            value={mov}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMovement(mov);
                            }}
                            className={`flex flex-col justify-between bg-white border border-slate-200 rounded-lg p-3 min-h-[90px] shadow-sm hover:border-slate-350 active:scale-98 transition-all cursor-pointer relative ${
                              isDelivery ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-emerald-500'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div className="min-w-0">
                                <h5 className="text-xs font-black text-slate-900 truncate leading-tight">{mov.machineName}</h5>
                                <p className="text-[10px] text-slate-600 font-bold truncate mt-0.5">{mov.customerName} • {postcode}</p>
                              </div>
                              
                              {/* Unassign button (x) */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  assignDriver(mov.id, undefined);
                                }}
                                className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-655 rounded transition-colors cursor-pointer"
                                title="Unassign job"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 mt-1.5">
                              {renderStatus(mov)}
                              
                              {/* Reorder Arrows directly on card */}
                              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => moveJob(mov.id, 'up')}
                                  disabled={index === 0}
                                  className="w-5 h-5 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[8px] text-slate-600 rounded disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all cursor-pointer"
                                  title="Move Up"
                                >
                                  ▲
                                </button>
                                <button
                                  onClick={() => moveJob(mov.id, 'down')}
                                  disabled={index === assignedJobs.length - 1}
                                  className="w-5 h-5 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[8px] text-slate-600 rounded disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all cursor-pointer"
                                  title="Move Down"
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
              </div>
            );
          })}
        </div>
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
              className="flex-1 bg-white border border-slate-200 hover:bg-slate-55 text-slate-700 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all uppercase tracking-wide text-center"
            >
              <ClipboardList className="w-3.5 h-3.5 text-indigo-500" /> Live Fleet
            </Link>
            <Link 
              to="/operator/hires" 
              className="flex-1 bg-white border border-slate-200 hover:bg-slate-55 text-slate-700 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all uppercase tracking-wide text-center"
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
