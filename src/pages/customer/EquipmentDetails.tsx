import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { ArrowLeft, Check, Calendar, Truck, ArrowRight } from 'lucide-react';

export default function CustomerEquipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { equipment, addBooking } = useStore();
  
  const item = equipment.find(e => e.machine_id === id);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliveryWindow, setDeliveryWindow] = useState('Anytime');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryNeeded, setDeliveryNeeded] = useState(false);
  const [address, setAddress] = useState('');

  if (!item) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Equipment not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 hover:underline">Return to home</button>
      </div>
    );
  }

  // Calculate mock cost
  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24))) : 0;
  const hireCost = days * item.day_rate;
  const deliveryCost = deliveryNeeded ? item.delivery_rate : 0;
  const collectionCost = deliveryNeeded ? item.delivery_rate : 0;
  const insuranceCost = hireCost * 0.15;
  const subtotal = hireCost + deliveryCost + collectionCost + insuranceCost;
  const vat = subtotal * 0.20;
  const totalCost = subtotal + vat;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !name || !phone) return;

    const newBooking = {
      booking_id: `bk-${Date.now()}`,
      machine_id: item.machine_id,
      hirer_name: name,
      hirer_phone: phone,
      hirer_email: email,
      site_address: deliveryNeeded ? address : 'Collection',
      start_date: startDate,
      end_date: endDate,
      delivery_window: deliveryWindow,
      status: 'pending' as const,
      qr_start_code: `QR-START-${Date.now()}`,
      qr_end_code: `QR-END-${Date.now()}`,
      timestamp_created: new Date().toISOString(),
      totalCost: totalCost,
      deliveryNeeded
    };

    addBooking(newBooking);
    navigate('/booking-success', { state: { booking: newBooking, equipment: item } });
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to equipment
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Col - Details */}
        <div className="space-y-8">
          <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-[4/3] relative">
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-sm text-sm font-black shadow-lg uppercase tracking-widest ${
              item.availability_status === 'available' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {item.availability_status}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold uppercase tracking-wide">{item.category}</span>
              <span className="text-sm font-mono text-slate-400">Ref: {item.machine_id}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{item.name}</h1>
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Specifications</h3>
              <ul className="space-y-3">
                {[
                  `Job Fit: ${item.job_fit}`, 
                  `Access Width: ${item.access_width_mm}mm`, 
                  `Compliance Expires: ${new Date(item.compliance_expiry).toLocaleDateString()}`, 
                  `Notes: ${item.notes}`
                ].map((spec, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Col - Booking Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden sticky top-24 self-start">
          <div className="bg-indigo-900 p-6 text-white text-center">
            <span className="text-indigo-200 text-sm font-medium uppercase tracking-wide">Daily Rate</span>
            <div className="text-4xl font-extrabold mt-1">£{item.day_rate}<span className="text-xl font-normal text-indigo-300">/day</span></div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Select Dates
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Time Preference</label>
                <select 
                  value={deliveryWindow} 
                  onChange={(e) => setDeliveryWindow(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                >
                  <option value="Anytime">Anytime</option>
                  <option value="AM (07:00 - 12:00)">AM (07:00 - 12:00)</option>
                  <option value="PM (12:00 - 17:00)">PM (12:00 - 17:00)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-500" />
                Your Details
              </h4>
              <div className="space-y-3">
                <input 
                  type="text" placeholder="Full Name" required
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="tel" placeholder="Phone" required
                    value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  />
                  <input 
                    type="email" placeholder="Email (optional)"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  />
                </div>
                
                <label className="flex items-center gap-3 py-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={deliveryNeeded}
                      onChange={(e) => setDeliveryNeeded(e.target.checked)}
                    />
                    <div className={`w-5 h-5 rounded border ${deliveryNeeded ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'} transition-colors flex items-center justify-center`}>
                      {deliveryNeeded && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700 select-none">Require delivery to site</span>
                </label>
                
                {deliveryNeeded && (
                  <textarea 
                    placeholder="Delivery Address & Site Instructions" required
                    value={address} onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow h-20 resize-none animate-in fade-in slide-in-from-top-2"
                  />
                )}
              </div>
            </div>

            {days > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Hire ({days} {days === 1 ? 'day' : 'days'})</span>
                  <span>£{hireCost.toFixed(2)}</span>
                </div>
                {deliveryNeeded && (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery</span>
                      <span>£{deliveryCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Collection</span>
                      <span>£{collectionCost.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-slate-600 items-start">
                  <div className="flex flex-col">
                    <span>Damage Waiver Insurance</span>
                    <span className="text-xs text-slate-400">Mandatory (15% of hire)</span>
                  </div>
                  <span>£{insuranceCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-50">
                  <span>Subtotal</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT (20%)</span>
                  <span>£{vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Estimated Total</span>
                  <span>£{totalCost.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={item.availability_status !== 'available'}
              className={`w-full font-bold text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${
                item.availability_status === 'available' 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              Continue to Pricing <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-xs text-slate-500">No payment taken now. We will confirm availability.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
