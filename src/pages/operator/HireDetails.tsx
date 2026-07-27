import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Phone, ArrowLeft, CheckCircle2, XCircle, Truck, Play, Square } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function OperatorHireDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bookings, equipment, updateBookingStatus, startHire, endHire } = useStore();

  const booking = bookings.find(b => b.booking_id === id);
  useDocumentTitle(booking ? `Hire ${booking.booking_id} Details` : "Hire Details");
  
  if (!booking) return <div className="p-4 text-center">Not found</div>;

  const item = equipment.find(e => e.machine_id === booking.machine_id);
  if (!item) return null;

  return (
    <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 font-bold px-2 py-2 w-full text-left"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1 block">Equipment</span>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{item.name}</h1>
            <p className="text-slate-500 font-mono text-sm mt-1">Ref: {item.machine_id}</p>
          </div>
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1 block">Customer</span>
            <p className="text-lg font-bold text-slate-900">{booking.hirer_name}</p>
          </div>
          
          <a href={`tel:${booking.hirer_phone}`} className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-50 text-indigo-700 rounded-xl font-bold active:scale-95 transition-transform">
            <Phone className="w-5 h-5" /> Call {booking.hirer_phone}
          </a>
        </div>

        <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">Dates</span>
            <span className="text-sm font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
              {new Date(booking.start_date).toLocaleDateString('en-GB')}  &mdash; {new Date(booking.end_date).toLocaleDateString('en-GB')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">Total Valid</span>
            <span className="text-lg font-extrabold text-slate-900">£{booking.totalCost}</span>
          </div>
          {booking.deliveryNeeded && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 text-orange-800">
              <Truck className="w-6 h-6 shrink-0 text-orange-500" />
              <div>
                <p className="font-bold text-sm">Delivery Required</p>
                <p className="text-sm mt-1">{booking.site_address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 relative">
        {booking.status === 'pending' && (
          <>
            <button 
              onClick={() => { updateBookingStatus(booking.booking_id, 'confirmed'); navigate(-1); }}
              className="w-full bg-slate-900 text-white font-extrabold text-lg py-5 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-6 h-6" /> Confirm Booking
            </button>
            <button 
              onClick={() => { updateBookingStatus(booking.booking_id, 'cancelled'); navigate(-1); }}
              className="w-full bg-white text-red-600 border border-red-200 font-bold text-base py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" /> Reject Booking
            </button>
          </>
        )}

        {booking.status === 'confirmed' && (
          <button 
            onClick={() => { startHire(booking.booking_id); navigate(-1); }}
            className="w-full bg-emerald-500 text-white font-extrabold text-lg py-5 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6 fill-white" /> Start Hire
          </button>
        )}

        {booking.status === 'active' && (
          <button 
            onClick={() => { endHire(booking.booking_id); navigate(-1); }}
            className="w-full bg-slate-900 text-white font-extrabold text-lg py-5 rounded-2xl shadow-lg shadow-slate-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Square className="w-6 h-6 fill-white" /> Complete & Return
          </button>
        )}
        
        {/* Hint */}
        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <div className="absolute top-1/2 left-full ml-4 -translate-y-1/2 text-slate-800 pointer-events-none hidden sm:flex flex-col items-start z-10" style={{ fontFamily: '"Caveat", cursive', fontSize: '1.4rem', lineHeight: '1.1' }}>
            <svg width="60" height="60" viewBox="0 0 100 100" className="absolute top-12 -left-10 text-slate-800 overflow-visible transform -scale-x-100 rotate-12">
              <path d="M40,90 Q50,40 20,20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M15,45 L20,20 L45,25" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="rotate-6 pt-4 pl-4 w-48 text-left">
              <p>Update hire</p>
              <p>status here!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
