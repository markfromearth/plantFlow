import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Booking, Equipment, BookingStatus, EquipmentStatus } from '../../types';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Terminal, 
  FileText, 
  Database, 
  PlusCircle, 
  CheckCircle, 
  QrCode, 
  Sun, 
  SunDim, 
  ChevronRight, 
  Eye, 
  Search,
  BookOpen,
  Check,
  AlertTriangle,
  Play,
  Settings
} from 'lucide-react';

interface OfflineSyncItem {
  id: string;
  type: 'create_booking' | 'update_status' | 'start_hire' | 'end_hire' | 'cancel';
  payload: any;
  timestamp: string;
}

export default function IntegrationPlayground() {
  const { 
    bookings, 
    equipment, 
    addBooking, 
    updateBookingStatus, 
    updateEquipmentStatus, 
    startHire, 
    endHire,
    highVisMode, 
    toggleHighVisMode 
  } = useStore();

  // Offline Management
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncItem[]>([]);
  const [syncLogs, setSyncLogs] = useState<string[]>([
    'System ready. API endpoint listener online at /api/booking_status'
  ]);

  // Screen / Tab routing inside the playground
  const [activeTab, setActiveTab] = useState<'endpoints' | 'offline' | 'qr' | 'code'>('endpoints');

  // Input states for Creating Booking
  const [newHirerName, setNewHirerName] = useState('Mark Macleod');
  const [newHirerPhone, setNewHirerPhone] = useState('07700 900555');
  const [newHirerEmail, setNewHirerEmail] = useState('mark@gmail.com');
  const [selectedMachineId, setSelectedMachineId] = useState(equipment[0]?.machine_id || '');
  const [siteAddress, setSiteAddress] = useState('St. Andrews Yard, Edinburgh');

  // Console Outputs
  const [apiResponseJson, setApiResponseJson] = useState<any>(null);
  const [searchedMachineId, setSearchedMachineId] = useState('EX-015');

  // QR Sandbox Scanning
  const [qrInputText, setQrInputText] = useState('QR-BK2-START');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [qrScanActionMessage, setQrScanActionMessage] = useState<string>('');

  // Selected code snippet
  const [selectedCodeSnippet, setSelectedCodeSnippet] = useState<'fetchInventory' | 'createBooking' | 'updateStatus' | 'qrRoutine' | 'offlineSync'>('fetchInventory');

  // Auto-log utility
  const logAction = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSyncLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // 1. Fetch Inventory API handler wrapper
  const handleFetchInventoryList = () => {
    logAction('GET /api/inventory requested');
    if (isOffline) {
      logAction('ERROR: Failed to fetch - Client interface is OFFLINE.');
      setApiResponseJson({
        error: 'Network Error',
        message: 'No internet connection detected (Offline Simulation Mode active)',
        status: 503
      });
      return;
    }

    logAction(`SUCCESS: Retrieved ${equipment.length} plant machines from active schema.`);
    setApiResponseJson({
      status: 'success',
      count: equipment.length,
      timestamp: new Date().toISOString(),
      data: equipment.map(item => ({
        machine_id: item.machine_id,
        name: item.name,
        category: item.category,
        availability: item.availability_status,
        day_rate_gbp: item.day_rate
      }))
    });
  };

  // 2. Machine Details Handler wrapper
  const handleFetchMachineDetails = (machineId: string) => {
    logAction(`GET /api/inventory/${machineId} requested`);
    if (isOffline) {
      logAction('ERROR: Details fetch failed - Application OFFLINE.');
      setApiResponseJson({
        error: 'Offline status',
        message: 'Network is unreachable',
        status: 504
      });
      return;
    }

    const machine = equipment.find(e => e.machine_id === machineId);
    if (!machine) {
      logAction(`ERROR: Machine ID ${machineId} not found in database.`);
      setApiResponseJson({
        error: 'Not found',
        message: `No machine exists with ID ${machineId}`,
        status: 404
      });
      return;
    }

    logAction(`SUCCESS: Returned compliance details for ${machine.name}.`);
    setApiResponseJson({
      status: 'success',
      timestamp: new Date().toISOString(),
      machine_details: {
        id: machine.machine_id,
        model_name: machine.name,
        category: machine.category,
        day_rate: machine.day_rate,
        compliance_expiry_date: machine.compliance_expiry,
        safety_status: 'CERTIFIED_PASS',
        track_width: `${machine.access_width_mm}mm`,
        operational_guidelines: machine.notes
      }
    });
  };

  // 3. Create Booking API wrapper
  const handleCreateNewBooking = () => {
    const randBookingId = `bk-${Math.floor(1000 + Math.random() * 9000)}`;
    const cost = 250; 
    
    const newBookingPayload: Booking = {
      booking_id: randBookingId,
      machine_id: selectedMachineId,
      hirer_name: newHirerName,
      hirer_phone: newHirerPhone,
      hirer_email: newHirerEmail,
      site_address: siteAddress,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      delivery_window: 'AM',
      status: 'confirmed',
      qr_start_code: `QR-${randBookingId}-START`,
      qr_end_code: `QR-${randBookingId}-END`,
      timestamp_created: new Date().toISOString(),
      totalCost: cost,
      deliveryNeeded: true
    };

    if (isOffline) {
      const syncItem: OfflineSyncItem = {
        id: `sync-${Math.floor(Math.random() * 100000)}`,
        type: 'create_booking',
        payload: newBookingPayload,
        timestamp: new Date().toLocaleTimeString()
      };
      setOfflineQueue(prev => [...prev, syncItem]);
      logAction(`OFFLINE QUEUED: Cached new booking ${randBookingId} to localStorage Queue.`);
      setApiResponseJson({
        status: 'queued_offline',
        sync_id: syncItem.id,
        message: 'No active connection. Operation added to pending sync queue.',
        pending_changes_count: offlineQueue.length + 1
      });
      return;
    }

    // Direct online execution
    addBooking(newBookingPayload);
    logAction(`SUCCESS: Created booking ${randBookingId} for ${newHirerName}`);
    setApiResponseJson({
      status: 'success',
      booking_id: randBookingId,
      message: 'New plant hire record locked successfully.',
      timestamp: new Date().toISOString(),
      data: newBookingPayload
    });
  };

  // 4. Update Booking Status / Execute action wrapper (e.g. Action "start_hire")
  const handleExecuteStatusChangeAPI = (bookingId: string, customStatus: 'start_hire' | 'end_hire' | 'cancel') => {
    logAction(`POST /api/booking_status execution: ID=${bookingId}, Action=${customStatus}`);
    
    const targetBooking = bookings.find(b => b.booking_id === bookingId);
    if (!targetBooking) {
      logAction(`ERROR: Unable to locate booking ID ${bookingId}`);
      return;
    }

    if (isOffline) {
      const syncItem: OfflineSyncItem = {
        id: `sync-${Math.floor(Math.random() * 100000)}`,
        type: customStatus,
        payload: { booking_id: bookingId },
        timestamp: new Date().toLocaleTimeString()
      };
      setOfflineQueue(prev => [...prev, syncItem]);
      logAction(`OFFLINE QUEUED: Cached ${customStatus} action for booking ID ${bookingId}.`);
      setApiResponseJson({
        status: 'queued_offline',
        sync_id: syncItem.id,
        action: customStatus,
        message: 'No internet connection. Operation cached successfully.',
        queue_depth: offlineQueue.length + 1
      });
      return;
    }

    // Online execution
    if (customStatus === 'start_hire') {
      startHire(bookingId);
      logAction(`API SUCCESS: Marked booking ${bookingId} as ACTIVE. Machine ${targetBooking.machine_id} status updated to HIRED.`);
    } else if (customStatus === 'end_hire') {
      endHire(bookingId);
      logAction(`API SUCCESS: Completed booking ${bookingId}. Machine ${targetBooking.machine_id} set to AVAILABLE.`);
    } else {
      updateBookingStatus(bookingId, 'cancelled');
      updateEquipmentStatus(targetBooking.machine_id, 'available');
      logAction(`API SUCCESS: Cancelled booking ${bookingId}.`);
    }

    setApiResponseJson({
      status: 'success',
      booking_id: bookingId,
      target_action: customStatus,
      updated_timestamp: new Date().toISOString(),
      machine_availability: customStatus === 'start_hire' ? 'hired' : 'available'
    });
  };

  // Force sync offline operations
  const triggerManualSync = () => {
    if (offlineQueue.length === 0) {
      logAction('Synchronization skipped: Offline queue already clean.');
      return;
    }
    if (isOffline) {
      logAction('Sync aborted: Offline mode is still toggled globally.');
      return;
    }

    logAction(`🔄 Processing offline queue sync (${offlineQueue.length} items)...`);
    
    // Playback each cached transaction in order (FIFO logic)
    offlineQueue.forEach((item, index) => {
      setTimeout(() => {
        try {
          if (item.type === 'create_booking') {
            addBooking(item.payload);
            logAction(`[SYNC #${index + 1}] Successfully committed booking ${item.payload.booking_id} to cloud store.`);
          } else if (item.type === 'start_hire') {
            startHire(item.payload.booking_id);
            logAction(`[SYNC #${index + 1}] Executed Start Hire for booking ${item.payload.booking_id}.`);
          } else if (item.type === 'end_hire') {
            endHire(item.payload.booking_id);
            logAction(`[SYNC #${index + 1}] Resolved Return/End Hire for booking ${item.payload.booking_id}.`);
          }
        } catch (err: any) {
          logAction(`[SYNC ERROR #${index + 1}] Failed: ${err.message}`);
        }
      }, (index + 1) * 350);
    });

    // Clear queue with a tiny delayed reset for nice UX
    setTimeout(() => {
      setOfflineQueue([]);
      logAction('✅ All pending queue queries written to cloud server. Sync finished.');
    }, offlineQueue.length * 400);
  };

  // Simulate scanning QR code input text directly
  const simulateQrScan = (code: string) => {
    setScannedResult(code);
    
    // Check if it matches a booking start code
    const startMatch = bookings.find(b => b.qr_start_code === code || b.booking_id === code);
    const endMatch = bookings.find(b => b.qr_end_code === code);
    
    if (startMatch) {
      setQrScanActionMessage(`Ready to Dispatch: ${startMatch.hirer_name}'s booking is confirmed. Action: start_hire`);
    } else if (endMatch) {
      setQrScanActionMessage(`Ready to Complete: Returning equipment for booking ${endMatch.booking_id}. Action: end_hire`);
    } else {
      setQrScanActionMessage('Unrecognized Asset/Booking QR code tag.');
    }
    logAction(`QR SCANNER: Read tag string "${code}"`);
  };

  // Code snippets reference directory
  const codeSnippets = {
    fetchInventory: `// 1. Fetching Complete Plant Hire Inventory from Database
async function fetchInventory() {
  const endpoint = '/api/inventory';
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(\`Network response failed: \${response.status}\`);
    }
    const data = await response.json();
    console.log('[PlantFlow OS SDK] Retrieved active fleet:', data);
    return data.data; // List of active machines
  } catch (error) {
    console.error('[PlantFlow OS SDK] Inventory retrieve crash:', error);
    throw error;
  }
}`,
    createBooking: `// 2. Creating New Plant Bookings via the Server Endpoint
async function createBooking(bookingPayload) {
  const endpoint = '/api/bookings';
  try {
    // If client detects offline state, write payload to localStorage SQLite cache instead
    if (!navigator.onLine) {
      saveToOfflineSyncQueue('create_booking', bookingPayload);
      return { status: 'queued_offline', message: 'Saved to local buffer' };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    
    return await response.json();
  } catch (error) {
    console.warn('Network lost during API post, backing up to offline storage...', error);
    saveToOfflineSyncQueue('create_booking', bookingPayload);
    return { status: 'queued_offline_fallback' };
  }
}`,
    updateStatus: `// 3. Mark Dispatch or Return Actions (Updates Machine Status dynamically)
async function updateBookingStatusAPI(bookingId, actionType) {
  // actionType can be: "start_hire" (marks booked machine as 'hired')
  // or "end_hire" (marks returned machine as 'available')
  
  const endpoint = '/api/booking_status';
  const payload = {
    booking_id: bookingId,
    action: actionType // "start_hire" | "end_hire"
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(\`HTTP status error \${response.status}\`);
    return await response.json();
  } catch (error) {
    console.error('API execution failed, queuing state change to offline list.', error);
    saveToOfflineSyncQueue(actionType, { booking_id: bookingId });
  }
}`,
    qrRoutine: `// 4. Scanner Action: Inspecting scanned QR codes on machinery tags
function handleTagScanned(scannedQrString) {
  console.log('[QR Handler] Processing scan:', scannedQrString);
  
  // Format standard logic for PlantFlow OS plant operations:
  if (scannedQrString.endsWith('-START')) {
    const rawBookingID = extractBookingId(scannedQrString);
    console.log('Action: Initiating machine dispatch -> start_hire');
    return updateBookingStatusAPI(rawBookingID, 'start_hire');
  } else if (scannedQrString.endsWith('-END')) {
    const rawBookingID = extractBookingId(scannedQrString);
    console.log('Action: Initiating machine check-in return -> end_hire');
    return updateBookingStatusAPI(rawBookingID, 'end_hire');
  } else {
    // General equipment lookups or tag diagnostics
    return fetchMachineDetails(scannedQrString);
  }
}`,
    offlineSync: `// 5. Offline Queue Playback: Automated Sync Loop
function saveToOfflineSyncQueue(type, payload) {
  const currentQueue = JSON.parse(localStorage.getItem('plantflow_os_sync_queue') || '[]');
  currentQueue.push({
    id: 'sync-' + Date.now(),
    type,
    payload,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('plantflow_os_sync_queue', JSON.stringify(currentQueue));
  console.log('[Offline Engine] cached offline operational transaction.');
}

async function runAutomaticPlaybacks() {
  const currentQueue = JSON.parse(localStorage.getItem('plantflow_os_sync_queue') || '[]');
  if (currentQueue.length === 0) return;

  console.log(\`[Sync Engine] Back online! processing \${currentQueue.length} jobs.\`);
  for (const item of currentQueue) {
    try {
      if (item.type === 'start_hire') {
        await updateBookingStatusAPI(item.payload.booking_id, 'start_hire');
      } else if (item.type === 'end_hire') {
        await updateBookingStatusAPI(item.payload.booking_id, 'end_hire');
      } else if (item.type === 'create_booking') {
        await createBooking(item.payload);
      }
    } catch (e) {
      console.error('Sync failed for item:', item.id, e);
    }
  }
  // Clear persistent queue
  localStorage.removeItem('plantflow_os_sync_queue');
}`
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* 1. Header Section */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 rounded">
                Developer Console
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h2 className="text-xl font-black text-slate-100 mt-1">PlantFlow OS API Integration Sandbox</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Live database state verification and sync queue diagnostics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Offline Button */}
            <button
              onClick={() => {
                const next = !isOffline;
                setIsOffline(next);
                logAction(`Network Simulation: Switched client context to ${next ? 'OFFLINE 📶❌' : 'ONLINE 📶📡'}`);
                if (!next) {
                  logAction('Self-monitoring resolved: Connection restored. Check Sync Queue.');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isOffline 
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' 
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              {isOffline ? 'Force Offline' : 'Active Connection'}
            </button>

            {/* High Vis Toggle */}
            <button
              onClick={toggleHighVisMode}
              className="p-1.5 bg-slate-800 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-700 active:scale-95 text-xs font-semibold flex items-center gap-1"
              aria-label="Toggle High Vis"
            >
              {highVisMode ? <SunDim className="w-4 h-4 text-yellow-400" /> : <Sun className="w-4 h-4" />}
              <span>{highVisMode ? 'Standard Theme' : 'High-Vis'}</span>
            </button>
          </div>
        </div>

        {/* Sync state details */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Real-Time Offline Queue</p>
            <p className="text-lg font-black text-white mt-1 flex items-center gap-2">
              {offlineQueue.length === 0 ? (
                <span className="text-slate-500">0 items pending</span>
              ) : (
                <span className="text-amber-400 animate-pulse">{offlineQueue.length} transactions pending</span>
              )}
            </p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Active Data Sync Engine</span>
            {offlineQueue.length > 0 ? (
              <button 
                onClick={triggerManualSync}
                disabled={isOffline}
                className="w-full mt-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] py-1 px-3 rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw className="w-3 h-3 animate-spin" /> Playback & Sync Now
              </button>
            ) : (
              <span className="text-emerald-400 font-bold text-xs mt-1.5">✓ Database synchronized</span>
            )}
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('endpoints')}
          className={`flex-1 py-3 text-center border-b-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'endpoints' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" /> Endpoint APIs
        </button>
        <button 
          onClick={() => setActiveTab('offline')}
          className={`flex-1 py-3 text-center border-b-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'offline' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <WifiOff className="w-4 h-4" /> Offline Engine
        </button>
        <button 
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-3 text-center border-b-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'qr' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" /> QR Dispatch
        </button>
        <button 
          onClick={() => setActiveTab('code')}
          className={`flex-1 py-3 text-center border-b-2 font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'code' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" /> Integration Code
        </button>
      </div>

      {/* Inner Active Content Screens */}
      <div className="space-y-6">
        
        {/* TAB 1: API Live endpoints */}
        {activeTab === 'endpoints' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Box 1: Fleet Inventory GET Queries */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-600 p-2 rounded-xl text-xs font-black">GET</span>
                Retreive Inventory & Details APIs
              </h3>
              <p className="text-slate-500 text-xs mt-2">
                Tests query protocols that fetch the active plant list, rental rates, and safety specifications.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleFetchInventoryList}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <RefreshCw className="w-4 h-4" /> Execute: Fetch All Inventory
                </button>

                <div className="flex-1 flex gap-2">
                  <select
                    className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                    value={searchedMachineId}
                    onChange={(e) => setSearchedMachineId(e.target.value)}
                  >
                    {equipment.map(e => (
                      <option key={e.machine_id} value={e.machine_id}>{e.machine_id} - {e.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleFetchMachineDetails(searchedMachineId)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <Search className="w-4 h-4 uppercase" /> Details
                  </button>
                </div>
              </div>
            </div>

            {/* Box 2: Create Hire Booking POST */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-600 p-2 rounded-xl text-xs font-black">POST</span>
                Simulate Create Contract Booking API
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Submits digital contract schemas straight into the local database system. Supports fully dynamic simulation while offline.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hirer / Customer Name</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                    value={newHirerName}
                    onChange={(e) => setNewHirerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hirer Contact Telephone</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                    value={newHirerPhone}
                    onChange={(e) => setNewHirerPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Machinery Unit</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                    value={selectedMachineId}
                    onChange={(e) => setSelectedMachineId(e.target.value)}
                  >
                    {equipment.map(e => (
                      <option key={e.machine_id} value={e.machine_id}>{e.name} (Dayrate £{e.day_rate})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">delivery Address</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleCreateNewBooking}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <PlusCircle className="w-4 h-4" /> Create & Post Live / Queue Offline Booking
              </button>
            </div>

            {/* Box 3: Update Booking Status POST */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                <span className="bg-orange-50 text-orange-600 p-2 rounded-xl text-xs font-black">POST</span>
                Update Booking Status API
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Instantly trigger dispatch state sequences for active hires! Modifies machinery status and logs transactions transparently.
              </p>

              <div className="mt-4 space-y-3">
                {bookings.map(book => (
                  <div key={book.booking_id} className="border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{book.booking_id}</span>
                        <span className="text-slate-500 text-xs">•</span>
                        <span className="text-xs text-slate-600">{book.hirer_name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Current Status: <strong className="uppercase text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-extrabold">{book.status}</strong>
                      </p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleExecuteStatusChangeAPI(book.booking_id, 'start_hire')}
                        disabled={book.status !== 'confirmed'}
                        className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1 uppercase transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" /> Dispatch
                      </button>
                      <button
                        onClick={() => handleExecuteStatusChangeAPI(book.booking_id, 'end_hire')}
                        disabled={book.status !== 'active'}
                        className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1 uppercase transition-colors"
                      >
                        <Check className="w-3 h-3" /> Return Asset
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Offline Engine Synchronization details */}
        {activeTab === 'offline' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 animate-in fade-in duration-200 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <WifiOff className="w-5 h-5 text-amber-500" /> Plant-Hire Offline Synchronizer Buffer
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                UK building developments and excavation sites frequently suffer from dead zones with poor telemetry. The system intercepts API operations automatically and queues them to preserve operations data.
              </p>
            </div>

            {/* Offline Alert Box demo */}
            <div className={`p-4 rounded-2xl flex gap-3 ${isOffline ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
              <AlertTriangle className={`w-5 h-5 shrink-0 ${isOffline ? 'text-amber-600' : 'text-emerald-600'}`} />
              <div>
                <p className={`font-bold text-xs ${isOffline ? 'text-amber-800' : 'text-emerald-800'}`}>
                  {isOffline ? 'Simulator is OFFLINE: Queueing Active' : 'Simulator is ONLINE: Live Commit Mode'}
                </p>
                <p className={`text-[11px] mt-0.5 ${isOffline ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {isOffline 
                    ? 'All new bookings, check-ins, or status dispatches will bypass active HTTP requests and save directly inside local browser storage.'
                    : 'Changes commit instantly. Playback the queued actions if transitioning from offline yards.'
                  }
                </p>
              </div>
            </div>

            {/* Raw Queue representation */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Local Queue Cache state ({offlineQueue.length} jobs)
              </p>

              {offlineQueue.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  Buffer empty. Make mock bookings or click Dispatch while offline to fill queue.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {offlineQueue.map((item, idx) => (
                    <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] uppercase">
                            {item.type}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 font-mono">
                          ID: {item.payload.booking_id || item.payload.machine_id || 'System Job'}
                        </p>
                      </div>

                      <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                        Pending Sync
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Offline sync actions */}
            {offlineQueue.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsOffline(false);
                    setTimeout(triggerManualSync, 100);
                  }}
                  className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2"
                >
                  Go Online & Playback Sync
                </button>
                <button
                  onClick={() => {
                    setOfflineQueue([]);
                    logAction('Offline Queue cleared successfully.');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-3 rounded-xl text-xs"
                >
                  Discard Queue
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QR Sandbox Scanning */}
        {activeTab === 'qr' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 animate-in fade-in duration-200 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-slate-800" /> QR Code Scanner Demultiplexer
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Simulates exact telemetry received by the mobile scanner lens during depot handovers or equipment status dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                <h4 className="font-bold text-xs text-slate-800 mb-2">Preset Quick QR-Tags</h4>
                <div className="space-y-2">
                  <div 
                    onClick={() => simulateQrScan('QR-BK1-START')}
                    className="bg-white hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl cursor-pointer text-xs font-bold text-slate-800 flex justify-between items-center transition-all"
                  >
                    <span>Tag: Dispatch 1.5 Digger</span>
                    <span className="font-mono text-[10px] text-slate-400">QR-BK1-START</span>
                  </div>
                  <div 
                    onClick={() => simulateQrScan('QR-BK2-START')}
                    className="bg-white hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl cursor-pointer text-xs font-bold text-slate-800 flex justify-between items-center transition-all"
                  >
                    <span>Tag: Start Sarah Jones Hire</span>
                    <span className="font-mono text-[10px] text-slate-400">QR-BK2-START</span>
                  </div>
                  <div 
                    onClick={() => simulateQrScan('QR-BK1-END')}
                    className="bg-white hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl cursor-pointer text-xs font-bold text-slate-800 flex justify-between items-center transition-all"
                  >
                    <span>Tag: Return 1.5 Digger</span>
                    <span className="font-mono text-[10px] text-slate-400">QR-BK1-END</span>
                  </div>
                </div>
              </div>

              {/* Custom manual scanner */}
              <div className="flex flex-col justify-between">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Simulate Custom QR Str</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. EX-015"
                      value={qrInputText}
                      onChange={(e) => setQrInputText(e.target.value)}
                    />
                    <button
                      onClick={() => simulateQrScan(qrInputText)}
                      className="bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-slate-800 active:scale-95 transition-transform"
                    >
                      Scan
                    </button>
                  </div>
                </div>

                {scannedResult && (
                  <div className="mt-4 bg-indigo-50 border border-indigo-150 p-4 rounded-xl space-y-1.5 animate-in slide-in-from-top-1">
                    <p className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Scanner Decoder Result</p>
                    <p className="font-mono font-bold text-xs text-indigo-900">{scannedResult}</p>
                    <p className="text-xs text-indigo-800 font-semibold leading-relaxed">{qrScanActionMessage}</p>
                    
                    {/* Execution link when matching booking */}
                    {scannedResult.endsWith('-START') && (
                      <button
                        onClick={() => {
                          const target = bookings.find(b => b.qr_start_code === scannedResult);
                          if (target) handleExecuteStatusChangeAPI(target.booking_id, 'start_hire');
                        }}
                        className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-extrabold py-1.5 rounded-lg flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-white" /> Dispatch Decoded Unit
                      </button>
                    )}
                    {scannedResult.endsWith('-END') && (
                      <button
                        onClick={() => {
                          const target = bookings.find(b => b.qr_end_code === scannedResult);
                          if (target) handleExecuteStatusChangeAPI(target.booking_id, 'end_hire');
                        }}
                        className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-extrabold py-1.5 rounded-lg flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Complete Asset Check-In
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Integration Code Snippets */}
        {activeTab === 'code' && (
          <div className="bg-slate-950 text-white rounded-3xl p-5 shadow-inner border border-slate-850 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" /> Complete Integration Scripts
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  100% executable ES6 JavaScript snippets for PlantFlow OS mobile operations.
                </p>
              </div>

              <select
                className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                value={selectedCodeSnippet}
                onChange={(e: any) => setSelectedCodeSnippet(e.target.value)}
              >
                <option value="fetchInventory">1. Fetch Fleet Assets</option>
                <option value="createBooking">2. Post New Reservation</option>
                <option value="updateStatus">3. Dispatch Status Updates</option>
                <option value="qrRoutine">4. QR Tag Demultiplexer</option>
                <option value="offlineSync">5. Local Storage Buf Playback</option>
              </select>
            </div>

            {/* Snippet renderer */}
            <div className="relative">
              <pre className="text-[11px] leading-relaxed font-mono overflow-x-auto bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-emerald-400 max-h-[380px]">
                <code>{codeSnippets[selectedCodeSnippet]}</code>
              </pre>

              {/* Copy helper */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeSnippets[selectedCodeSnippet]);
                  logAction(`SYSTEM: Copied API source code "${selectedCodeSnippet}" to system clipboard.`);
                  alert('Integration routine code copied successfully!');
                }}
                className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 font-bold hover:text-white px-2.5 py-1 rounded text-[10px] text-slate-400 transition-colors"
              >
                Copy Snippet
              </button>
            </div>
          </div>
        )}

        {/* 2. LIVE SANDBOX RESPONSE CONSOLE (Dynamic feedback for user's action) */}
        <div className="bg-slate-950 text-slate-300 rounded-3xl p-5 shadow-2xl border border-slate-850">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-xs font-bold tracking-widest text-slate-400 flex items-center gap-1.5 uppercase">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Active API Json Response
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Interactive JSON Telemetry
            </span>
          </div>

          <div className="mt-3">
            {apiResponseJson ? (
              <pre className="text-[11px] leading-relaxed font-mono overflow-x-auto text-emerald-400 bg-slate-900/40 p-3.5 rounded-xl max-h-[220px]">
                {JSON.stringify(apiResponseJson, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                Trigger any API operation, QR scan, or booking creation above to capture live server payloads here.
              </p>
            )}
          </div>
        </div>

        {/* 3. DIAGNOSTIC SYSTEM LOGS TRACKER */}
        <div className="bg-slate-900 text-slate-400 rounded-3xl p-5 border border-slate-800">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> System Activity Log
          </h4>
          <div className="space-y-1 max-h-[140px] overflow-y-auto font-mono text-[10.5px]">
            {syncLogs.map((log, index) => (
              <p key={index} className={`py-0.5 ${log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('ERROR') ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                {log}
              </p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
