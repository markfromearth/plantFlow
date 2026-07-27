import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { QrCode, X, Search, Focus, Play, Square } from 'lucide-react';
import { Booking } from '../../types';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function OperatorScan() {
  useDocumentTitle("Scan Equipment Tag");
  const navigate = useNavigate();
  const { bookings, equipment, startHire, endHire } = useStore();
  const [scanning, setScanning] = useState(false);
  const [scannedId, setScannedId] = useState('');
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const isDesktop = React.useMemo(() => {
    return !/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  }, []);

  React.useEffect(() => {
    let cleanupTimer: NodeJS.Timeout | null = null;
    let activeStream: MediaStream | null = null;
    
    if (isDesktop && !scannedBooking) {
      const initCamera = async () => {
        try {
          setError(null);
          setScanning(true);
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          activeStream = mediaStream;
          setStream(mediaStream);
          setUseWebcam(true);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          
          cleanupTimer = setTimeout(() => {
            if (activeStream) {
              activeStream.getTracks().forEach(track => track.stop());
            }
            setUseWebcam(false);
            setScanning(false);
            const target = bookings.find(b => b.status === 'confirmed') || bookings.find(b => b.status === 'active');
            if (target) {
              setScannedBooking(target);
            } else {
              alert("Booking not found or no active hires to scan.");
            }
          }, 10000);
        } catch (err: any) {
          console.warn("Webcam access failed:", err);
          setUseWebcam(false);
          setScanning(false);
        }
      };
      initCamera();
    }
    
    return () => {
      if (cleanupTimer) clearTimeout(cleanupTimer);
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isDesktop, scannedBooking, bookings]);

  // Mock scan function: handles manual ID testing or automatic find
  const handleScan = (id: string = '') => {
    setError(null);
    setScanning(true);
    setTimeout(() => {
      let target: Booking | undefined;
      
      if (id) {
        target = bookings.find(b => b.booking_id === id);
      } else {
        // Fallback simulate to grab highest priority actionable
        target = bookings.find(b => b.status === 'confirmed') || bookings.find(b => b.status === 'active');
      }

      setScanning(false);
      
      if (target) {
        setScannedBooking(target);
      } else {
        alert("Booking not found or no active hires to scan.");
      }
    }, 1000);
  };

  const executeAction = async () => {
    if (!scannedBooking) return;
    
    setError(null);
    setScanning(true);
    
    try {
      // Simulate POST request to Booking Status API
      const response = await fetch('/api/booking_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: scannedBooking.booking_id,
          action: scannedBooking.status === 'confirmed' ? 'start_hire' : 'end_hire'
        })
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("text/html") !== -1) {
        // Prototype environment: Route caught by SPA fallback.
        // We'll simulate a 30% failure rate to demonstrate the API error fallback UI.
        if (Math.random() < 0.3) {
           throw new Error("503 Service Unavailable (Simulated API Timeout)");
        }
      } else if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      if (scannedBooking.status === 'confirmed') {
        startHire(scannedBooking.booking_id);
      } else if (scannedBooking.status === 'active') {
        endHire(scannedBooking.booking_id);
      }
      navigate('/operator');
    } catch (e: any) {
      console.error('[API_ERROR] Failed to update booking:', e.message || e);
      setError(e.message || 'An unexpected error occurred while communicating with the server.');
    } finally {
      setScanning(false);
    }
  };

  const getEqName = (machine_id: string) => {
    return equipment.find(e => e.machine_id === machine_id)?.name || 'Unknown';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col pt-10 px-4 pb-[100px] animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center text-white mb-10 px-2 lg:max-w-lg lg:mx-auto lg:w-full">
        <h1 className="text-xl font-bold">Scan Equipment Tag</h1>
        <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full active:scale-95 transition-transform text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center lg:max-w-lg lg:mx-auto lg:w-full">
        {!scannedBooking ? (
          <>
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-8 overflow-hidden rounded-3xl bg-black border border-white/10">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${useWebcam ? 'block' : 'hidden'}`}
              />
              
              {!useWebcam && (
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                  <Focus className="w-16 h-16 opacity-50" />
                </div>
              )}
              
              {/* Simulated Scanner Viewfinder Overlay */}
              <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-3xl pointer-events-none"></div>
              
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl pointer-events-none"></div>

              {scanning && (
                <div className="absolute inset-x-0 h-1 bg-emerald-500 shadow-[0_0_15px_3px_rgba(16,185,129,0.7)] animate-[scan_1.5s_ease-in-out_infinite] pointer-events-none"></div>
              )}
            </div>
            
            <p className="text-white/80 text-center font-medium mb-6">
              Point camera at the QR code on the equipment or enter it manually below.
            </p>

            <div className="w-full flex gap-2 mb-8">
              <input 
                type="text"
                placeholder="Enter Booking ID (e.g. B-1011)"
                className="flex-1 bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-white/40"
                value={scannedId}
                onChange={e => setScannedId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan(scannedId)}
              />
              <button 
                onClick={() => handleScan(scannedId)}
                className="bg-emerald-500 text-white px-6 font-bold rounded-xl active:scale-95 transition-transform"
              >
                Scan
              </button>
            </div>

            <div className="relative w-full max-w-sm">
              <button 
                onClick={() => handleScan()}
                disabled={scanning}
                className="w-full bg-white/10 border border-white/20 text-white py-4 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-white/20 relative z-20"
              >
                {scanning ? <Search className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                {scanning ? 'Scanning...' : 'Simulate Camera Scan'}
              </button>
              
              {/* Hint */}
              <div className="absolute top-16 -right-4 text-emerald-300 pointer-events-none hidden sm:flex flex-col items-end z-10" style={{ fontFamily: '"Caveat", cursive', fontSize: '1.4rem', lineHeight: '1.1' }}>
                <svg width="60" height="60" viewBox="0 0 100 100" className="absolute -top-12 right-12 text-emerald-300 overflow-visible transform rotate-12">
                  <path d="M40,90 Q50,40 20,20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M15,45 L20,20 L45,25" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="-rotate-6 pt-2 pr-6 text-right w-48">
                  <p>Tap here to test</p>
                  <p>without a camera</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full bg-white rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8">
            <h2 className="text-sm font-black tracking-widest text-slate-400 uppercase mb-4 text-center">Job Scanned</h2>
            
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5 relative z-10" />
                <div>
                  <p className="text-sm font-bold text-red-800">Connection Failed</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}
            
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-500 mb-1">Equipment</p>
              <p className="font-bold text-lg text-slate-900 leading-tight">{getEqName(scannedBooking.machine_id)}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Customer</p>
                  <p className="font-bold text-slate-900">{scannedBooking.hirer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Transport</p>
                  <p className={`font-bold ${scannedBooking.deliveryNeeded ? 'text-indigo-650' : 'text-emerald-700'}`}>
                    {scannedBooking.deliveryNeeded ? "🚛 Depot Delivery" : "🚶 Customer Collection"}
                  </p>
                </div>
              </div>
            </div>

            {scannedBooking.status === 'confirmed' ? (
              <button 
                onClick={executeAction}
                className="w-full bg-emerald-500 text-white font-extrabold text-lg py-5 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Play className="w-6 h-6 fill-white" /> {scannedBooking.deliveryNeeded ? "Send out for delivery" : "Hand over to customer"}
              </button>
            ) : scannedBooking.status === 'active' ? (
              <button 
                onClick={executeAction}
                className="w-full bg-slate-900 text-white font-extrabold text-lg py-5 rounded-2xl shadow-lg shadow-slate-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Square className="w-6 h-6 fill-white" /> {scannedBooking.deliveryNeeded ? "Collect from customer" : "Accept returned machine"}
              </button>
            ) : (
              <div className="text-center py-4">
                <p className="text-red-500 font-bold mb-2">Invalid Status</p>
                <p className="text-slate-500 text-sm">This booking is marked as {scannedBooking.status}. No scanner actions available.</p>
              </div>
            )}

            <button 
              onClick={() => { setScannedBooking(null); setScannedId(''); }}
              className="w-full mt-4 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl active:scale-95 transition-transform"
            >
              Cancel & Scan Another
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}} />
    </div>
  );
}
