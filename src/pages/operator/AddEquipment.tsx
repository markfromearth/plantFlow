import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Equipment } from '../../types';
import { ArrowLeft, Save, Camera, Loader2, Upload } from 'lucide-react';
import { useOAuthToken } from '../../hooks/useOAuthToken';

export default function OperatorAddEquipment() {
  const navigate = useNavigate();
  const { addEquipment } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { token, requestToken } = useOAuthToken();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEquipment, setPendingEquipment] = useState<Equipment | null>(null);

  const [formData, setFormData] = useState({
    machine_id: '',
    name: '',
    category: 'Excavators',
    job_fit: '',
    access_width_mm: '',
    day_rate: '',
    delivery_rate: '',
    availability_status: 'available',
    compliance_expiry: '',
image_url: '/images/default.jpg',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Read file as Base64
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Update form data to show the image locally 
      setFormData(prev => ({ ...prev, image_url: base64Data }));

      // Send to AI for analysis
      const res = await fetch('/api/analyze-equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64Data }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to analyze image');
      }

      const data = await res.json();
      
      if (data.confidence >= 0.4) {
        setFormData(prev => ({
          ...prev,
          access_width_mm: data.access_width_mm?.toString() || prev.access_width_mm,
        }));
        setSuccessMsg(`Access width estimated at ${data.access_width_mm}mm. ${data.reasoning || ''}`);
      } else {
        setErrorMsg(`We couldn't confidently identify the access width (${Math.round((data.confidence || 0) * 100)}% confidence). Please manually enter details. ${data.reasoning || ''}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing image');
    } finally {
      setIsLoading(false);
      // reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const writeToSheets = async (accessToken: string, eq: Equipment) => {
    let spreadsheetId = localStorage.getItem('plantflow_os_spreadsheet_id');
    
    if (!spreadsheetId) {
      // Create new spreadsheet
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { title: 'PlantFlow OS Inventory' },
          sheets: [{ properties: { title: 'Inventory' } }]
        })
      });
      
      if (!createRes.ok) {
         throw new Error('Failed to create spreadsheet');
      }
      const createData = await createRes.json();
      spreadsheetId = createData.spreadsheetId;
      localStorage.setItem('plantflow_os_spreadsheet_id', spreadsheetId as string);

      // Add headers
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventory!A1:J1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [
            ['Machine ID', 'Name', 'Category', 'Job Fit', 'Access Width (mm)', 'Day Rate', 'Delivery Rate', 'Status', 'Compliance Expiry', 'Notes']
          ]
        })
      });
    }

    // Append row
    const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventory!A:J:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [
          [
            eq.machine_id,
            eq.name,
            eq.category,
            eq.job_fit,
            eq.access_width_mm || '',
            eq.day_rate || '',
            eq.delivery_rate || '',
            eq.availability_status || '',
            eq.compliance_expiry || '',
            eq.notes || ''
          ]
        ]
      })
    });
    
    if (!appendRes.ok) {
        throw new Error('Failed to append row');
    }
  };

  useEffect(() => {
    if (token && pendingEquipment && isSubmitting) {
       writeToSheets(token, pendingEquipment).then(() => {
          setIsSubmitting(false);
          setPendingEquipment(null);
          addEquipment(pendingEquipment);
          navigate('/operator/fleet');
       }).catch(err => {
          setErrorMsg('Failed to write to Google Sheets: ' + err.message);
          setIsSubmitting(false);
          setPendingEquipment(null);
       });
    }
  }, [token, pendingEquipment, isSubmitting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEquipment: Equipment = {
        ...formData,
        access_width_mm: Number(formData.access_width_mm),
        day_rate: Number(formData.day_rate),
        delivery_rate: Number(formData.delivery_rate),
        availability_status: formData.availability_status as any,
    };

    if (!token) {
        setPendingEquipment(newEquipment);
        setIsSubmitting(true);
        requestToken();
        return;
    }

    // if token already exists
    setIsSubmitting(true);
    writeToSheets(token, newEquipment).then(() => {
        setIsSubmitting(false);
        addEquipment(newEquipment);
        navigate('/operator/fleet');
    }).catch(err => {
        setErrorMsg('Failed to write to Google Sheets: ' + err.message);
        setIsSubmitting(false);
    });
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add Equipment</h1>
      </div>

      {/* AI Scanner Header */}
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="bg-white/20 p-4 rounded-full mx-auto backdrop-blur-sm">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">AI Machine Identifier</h2>
            <p className="text-indigo-100 text-sm">Take a photo and we'll auto-fill the details based on our visual database.</p>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageCapture}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors active:scale-95 flex items-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Photo...</>
            ) : (
              <><Upload className="w-5 h-5" /> Upload Photo</>
            )}
          </button>
          
          {errorMsg && <div className="text-red-200 text-sm bg-red-900/40 px-3 py-2 rounded-lg">{errorMsg}</div>}
          {successMsg && <div className="text-emerald-300 text-sm font-medium bg-emerald-900/40 px-3 py-2 rounded-lg">{successMsg}</div>}
        </div>
        
        {/* Decorative background vectors */}
        <svg className="absolute -bottom-10 -right-10 w-48 h-48 text-indigo-500 opacity-50" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="50"></circle>
        </svg>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4 relative">
        <div className="flex justify-center mb-6">
           <img 
              src={formData.image_url} 
              alt="Equipment preview" 
              className="w-32 h-32 object-cover rounded-2xl shadow-sm border-4 border-white ring-1 ring-slate-100"
           />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Machine ID</label>
          <input 
            required
            type="text" 
            name="machine_id"
            value={formData.machine_id}
            onChange={handleChange}
            placeholder="e.g. EX-099"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
          <input 
            required
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. 1.5 Tonne Digger"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
          <select 
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="Excavators">Excavators</option>
            <option value="Dumpers">Dumpers</option>
            <option value="Compaction">Compaction</option>
            <option value="Groundcare">Groundcare</option>
            <option value="Access">Access</option>
            <option value="Power & Light">Power & Light</option>
            <option value="Breaking">Breaking</option>
            <option value="Floor Care">Floor Care</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Day Rate (£)</label>
            <input 
              required
              type="number" 
              name="day_rate"
              value={formData.day_rate}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Delivery Rate (£)</label>
            <input 
              required
              type="number" 
              name="delivery_rate"
              value={formData.delivery_rate}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Access Width (mm)</label>
          <input 
            required
            type="number" 
            name="access_width_mm"
            value={formData.access_width_mm}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
           <label className="block text-sm font-bold text-slate-700 mb-1">Compliance Expiry</label>
           <input 
             required
             type="date" 
             name="compliance_expiry"
             value={formData.compliance_expiry}
             onChange={handleChange}
             className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
           />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Job Fit (Description)</label>
          <input 
            required
            type="text" 
            name="job_fit"
            value={formData.job_fit}
            onChange={handleChange}
            placeholder="e.g. Driveways, landscaping"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Notes</label>
          <textarea 
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
          />
        </div>

        <div className="relative">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-6 active:scale-95 z-20 relative disabled:opacity-75"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Saving & Exporting...</>
            ) : (
              <><Save className="w-5 h-5" /> Save Equipment</>
            )}
          </button>
          
          {/* Hint */}
          <div className="absolute top-0 -right-4 text-slate-800 pointer-events-none hidden sm:flex flex-col items-end z-10" style={{ fontFamily: '"Caveat", cursive', fontSize: '1.4rem', lineHeight: '1.1' }}>
            <svg width="60" height="60" viewBox="0 0 100 100" className="absolute -top-12 right-12 text-slate-800 overflow-visible transform rotate-12">
              <path d="M40,90 Q50,40 20,20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M15,45 L20,20 L45,25" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="-rotate-6 pt-2 pr-6 text-right w-48">
              <p>Hit save to add</p>
              <p>to inventory!</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
