import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Calendar, HardHat, Phone } from 'lucide-react';

export default function CustomerBookingSuccess() {
  const location = useLocation();
  const state = location.state as any;

  if (!state || !state.booking) {
    return <Navigate to="/customer" replace />;
  }

  const { booking, equipment } = state;

  return (
    <div className="max-w-2xl mx-auto mt-10 md:mt-20">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-emerald-500 p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 relative">
            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Booking Requested!</h1>
          <p className="text-emerald-50 text-lg">We've received your request for the {equipment.name}</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Booking Summary</h3>
              <span className="text-xs font-mono bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-bold">
                ID: {booking.booking_id || 'PENDING'}
              </span>
            </div>
            <div className="flex gap-4 items-center mt-2">
              <div className="w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200">
                <img src={equipment.image_url} alt={equipment.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{equipment.name}</p>
                <div className="flex flex-col text-sm mt-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(booking.start_date).toLocaleDateString()} &mdash; {new Date(booking.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                    <HardHat className="w-4 h-4" />
                    <span>Delivery: {booking.delivery_window || 'Anytime'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-slate-900">What happens next?</h3>
            <div className="flex flex-col gap-4 text-left max-w-md mx-auto">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">1</div>
                <p className="text-slate-600 mt-1">Our team is reviewing your request to confirm equipment availability.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">2</div>
                <p className="text-slate-600 mt-1">We will call you on <strong>{booking.hirer_phone}</strong> to confirm and arrange payment.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
            <Link 
              to="/customer/qr" 
              state={{ booking, equipment, action: 'start' }} 
              className="flex-1 text-center py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Start Hire QR
            </Link>
            <Link 
              to="/customer/qr" 
              state={{ booking, equipment, action: 'end' }} 
              className="flex-1 text-center py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              End Hire QR
            </Link>
          </div>
          <div className="pb-6">
             <Link 
              to={`/operator`} 
              className="w-full inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md group"
            >
              View Live Job (Operator View) <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          <div className="text-center">
            <Link 
              to="/customer" 
              className="text-slate-500 hover:text-slate-900 font-medium transition-colors"
            >
              Back to Equipment List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
