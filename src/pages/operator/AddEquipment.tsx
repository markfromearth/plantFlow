import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Equipment } from '../../types';
import { ArrowLeft, Save, Camera, Loader2, Upload, Trash2, Plus, Sparkles, FolderPlus } from 'lucide-react';
import { useOAuthToken } from '../../hooks/useOAuthToken';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface PendingBatchItem {
  id: string;
  file: File;
  rawPreviewUrl: string;
  compressedBase64: string;
  status: 'pending' | 'uploading' | 'analyzing' | 'completed' | 'error';
  error?: string;
  formData: {
    machine_id: string;
    name: string;
    category: string;
    job_fit: string;
    access_width_mm: string;
    day_rate: string;
    delivery_rate: string;
    availability_status: string;
    compliance_expiry: string;
    image_url: string;
    notes: string;
  };
}

function compressImageClient(base64Str: string, maxWidth = 1024, maxHeight = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      resolve(compressedBase64);
    };
    img.onerror = (err) => reject(err);
  });
}

export default function OperatorAddEquipment() {
  useDocumentTitle("Fleet Intake");
  const navigate = useNavigate();
  const { addEquipment } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
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
    day_rate: '75',
    delivery_rate: '30',
    availability_status: 'available',
    compliance_expiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    image_url: '/images/default.jpg',
    notes: ''
  });

  const [batchItems, setBatchItems] = useState<PendingBatchItem[]>([]);

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
      const reader = new FileReader();
      const rawBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = await compressImageClient(rawBase64);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_OPERATOR_API_KEY || 'my_secret_operator_api_key',
        },
        body: JSON.stringify({ imageBase64: base64Data, filename: file.name }),
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');
      const uploadData = await uploadRes.json();
      setFormData(prev => ({ ...prev, image_url: uploadData.url }));

      const res = await fetch('/api/analyze-equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_OPERATOR_API_KEY || 'my_secret_operator_api_key',
        },
        body: JSON.stringify({ imageBase64: base64Data }),
      });

      if (!res.ok) throw new Error('Failed to analyze image');
      const data = await res.json();
      
      if (data.confidence >= 0.4) {
        setFormData(prev => ({ ...prev, access_width_mm: data.access_width_mm?.toString() || prev.access_width_mm }));
        setSuccessMsg(`Access width estimated at ${data.access_width_mm}mm.`);
      } else {
        setErrorMsg('Confidence low. Manual entry required.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing image');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBatchImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg('');
    setSuccessMsg('');

    const fileList = Array.from(files);
    for (const file of fileList) {
      const itemId = Math.random().toString(36).substring(2, 9);
      const rawPreviewUrl = URL.createObjectURL(file);
      
      const newBatchItem: PendingBatchItem = {
        id: itemId,
        file,
        rawPreviewUrl,
        compressedBase64: '',
        status: 'pending',
        formData: {
          machine_id: 'AUTOGEN-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
          name: file.name.split('.')[0].replace(/[-_]/g, ' '),
          category: 'Excavators',
          job_fit: 'Identified from batch upload.',
          access_width_mm: '',
          day_rate: '75',
          delivery_rate: '30',
          availability_status: 'available',
          compliance_expiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
          image_url: '/images/default.jpg',
          notes: 'Batch ingested item.'
        }
      };

      setBatchItems(prev => [...prev, newBatchItem]);
      processBatchFile(newBatchItem);
    }
    if (batchInputRef.current) batchInputRef.current.value = '';
  };

  const processBatchFile = async (item: PendingBatchItem) => {
    try {
      setBatchItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i));
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(item.file);
      });
      const compressedBase64 = await compressImageClient(base64Data);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_OPERATOR_API_KEY || 'my_secret_operator_api_key' },
        body: JSON.stringify({ imageBase64: compressedBase64, filename: item.file.name }),
      });
      if (!uploadRes.ok) throw new Error('Storage upload failed');
      const uploadData = await uploadRes.json();

      setBatchItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'analyzing', formData: { ...i.formData, image_url: uploadData.url } } : i));

      const aiRes = await fetch('/api/analyze-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_OPERATOR_API_KEY || 'my_secret_operator_api_key' },
        body: JSON.stringify({ imageBase64: compressedBase64 }),
      });

      let name = item.formData.name;
      let category = 'Excavators';
      let accessWidth = '';
      let notes = 'Auto-ingested.';

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        if (aiData.confidence >= 0.4) {
          category = aiData.category || 'Excavators';
          accessWidth = aiData.access_width_mm?.toString() || '';
          notes = aiData.reasoning || '';
          name = accessWidth ? `${category === 'Excavators' ? 'Mini Digger' : category.slice(0, -1)} (${accessWidth}mm)` : name;
        }
      }

      setBatchItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'completed', formData: { ...i.formData, name, category, access_width_mm: accessWidth, notes } } : i));
    } catch (err: any) {
      setBatchItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', error: err.message } : i));
    }
  };

  const handleBatchItemChange = (id: string, name: string, value: string) => {
    setBatchItems(prev => prev.map(item => item.id === id ? { ...item, formData: { ...item.formData, [name]: value } } : item));
  };

  const removeBatchItem = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  const writeToSheets = async (accessToken: string, eq: Equipment) => {
    let spreadsheetId = localStorage.getItem('plantflow_os_spreadsheet_id');
    if (!spreadsheetId) {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: { title: 'PlantFlow OS Inventory' }, sheets: [{ properties: { title: 'Inventory' } }] })
      });
      if (!createRes.ok) throw new Error('Failed to create spreadsheet');
      const createData = await createRes.json();
      spreadsheetId = createData.spreadsheetId;
      localStorage.setItem('plantflow_os_spreadsheet_id', spreadsheetId as string);
    }

    const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventory!A:J:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [[eq.machine_id, eq.name, eq.category, eq.job_fit, eq.access_width_mm, eq.day_rate, eq.delivery_rate, eq.availability_status, eq.compliance_expiry, eq.notes]] })
    });
    if (!appendRes.ok) throw new Error('Failed to append row');
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

  const handleBatchSubmit = async () => {
    const completed = batchItems.filter(item => item.status === 'completed');
    if (completed.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const itemsToSave: Equipment[] = completed.map(item => ({
        machine_id: item.formData.machine_id,
        name: item.formData.name,
        category: item.formData.category,
        job_fit: item.formData.job_fit,
        access_width_mm: Number(item.formData.access_width_mm) || 1000,
        day_rate: Number(item.formData.day_rate) || 75,
        delivery_rate: Number(item.formData.delivery_rate) || 30,
        availability_status: item.formData.availability_status as any,
        compliance_expiry: item.formData.compliance_expiry,
        image_url: item.formData.image_url,
        notes: item.formData.notes
      }));
      if (token) {
        for (const eq of itemsToSave) await writeToSheets(token, eq);
      }
      for (const eq of itemsToSave) await addEquipment(eq);
      setSuccessMsg(`Successfully saved ${itemsToSave.length} items!`);
      setTimeout(() => navigate('/operator/fleet'), 1500);
    } catch (err: any) {
      setErrorMsg('Failed to save batch: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-700 transition-colors focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fleet Intake</h1>
        </div>
        <div role="tablist" aria-label="Fleet Ingest Mode" className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
          <button 
            id="single-tab"
            role="tab"
            aria-selected={activeTab === 'single'}
            aria-controls="single-tab-panel"
            tabIndex={activeTab === 'single' ? 0 : -1}
            onClick={() => setActiveTab('single')} 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'single' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'} focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none`}
          >
            Single Form
          </button>
          <button 
            id="batch-tab"
            role="tab"
            aria-selected={activeTab === 'batch'}
            aria-controls="batch-tab-panel"
            tabIndex={activeTab === 'batch' ? 0 : -1}
            onClick={() => setActiveTab('batch')} 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'batch' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'} focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none`}
          >
            Batch Ingest
          </button>
        </div>
      </div>

      {activeTab === 'single' ? (
        <div id="single-tab-panel" role="tabpanel" aria-labelledby="single-tab" className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="bg-white/20 p-4 rounded-full mx-auto backdrop-blur-sm"><Camera className="w-8 h-8 text-white" /></div>
              <div>
                <h2 className="text-xl font-bold mb-1">AI Machine Identifier</h2>
                <p className="text-indigo-100 text-sm">Take a photo and we'll auto-fill the details.</p>
              </div>
              <input type="file" id="ai-camera-file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageCapture} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} aria-label="Upload photo to auto-fill details" className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors active:scale-95 flex items-center gap-2 focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none">
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Upload className="w-5 h-5" /> Upload Photo</>}
              </button>
              {errorMsg && <div role="alert" className="text-red-200 text-sm bg-red-900/40 px-3 py-2 rounded-lg w-full max-w-sm">{errorMsg}</div>}
              {successMsg && <div role="status" aria-live="polite" className="text-emerald-300 text-sm font-medium bg-emerald-900/40 px-3 py-2 rounded-lg w-full max-w-sm">{successMsg}</div>}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Widescreen Image View & Info */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 min-h-[300px]">
                <img src={formData.image_url} alt="Equipment preview" className="w-48 h-48 object-cover rounded-2xl shadow border-4 border-white" />
                <p className="text-slate-400 text-xs text-center leading-normal max-w-xs font-semibold">
                  Capture a clean visual of the equipment from the camera. The AI vision agent will automatically estimate the machine specifications.
                </p>
              </div>

              {/* Right Column: Ingest Inputs */}
              <div className="space-y-4">
                <div><label htmlFor="equip-machine-id" className="block text-sm font-bold text-slate-700 mb-1">Machine ID</label><input required id="equip-machine-id" type="text" name="machine_id" value={formData.machine_id} onChange={handleChange} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none" /></div>
                <div><label htmlFor="equip-name" className="block text-sm font-bold text-slate-700 mb-1">Name</label><input required id="equip-name" type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none" /></div>
                <div><label htmlFor="equip-category" className="block text-sm font-bold text-slate-700 mb-1">Category</label><select id="equip-category" name="category" value={formData.category} onChange={handleChange} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none"><option value="Excavators">Excavators</option><option value="Dumpers">Dumpers</option><option value="Compaction">Compaction</option><option value="Access">Access</option></select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label htmlFor="equip-day-rate" className="block text-sm font-bold text-slate-700 mb-1">Day Rate (£)</label><input required id="equip-day-rate" type="number" name="day_rate" value={formData.day_rate} onChange={handleChange} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none" /></div>
                  <div><label htmlFor="equip-delivery-rate" className="block text-sm font-bold text-slate-700 mb-1">Delivery Rate (£)</label><input required id="equip-delivery-rate" type="number" name="delivery_rate" value={formData.delivery_rate} onChange={handleChange} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none" /></div>
                </div>
                <div><label htmlFor="equip-access-width" className="block text-sm font-bold text-slate-700 mb-1">Access Width (mm)</label><input required id="equip-access-width" type="number" name="access_width_mm" value={formData.access_width_mm} onChange={handleChange} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none" /></div>
                <div><label htmlFor="equip-compliance" className="block text-sm font-bold text-slate-700 mb-1">Compliance Expiry</label><input required id="equip-compliance" type="date" name="compliance_expiry" value={formData.compliance_expiry} onChange={handleChange} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none" /></div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl mt-6 focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none">{isSubmitting ? 'Saving...' : 'Save Equipment'}</button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div id="batch-tab-panel" role="tabpanel" aria-labelledby="batch-tab" className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white">
            <div className="relative z-10 space-y-4 max-w-md mx-auto">
              <FolderPlus className="w-12 h-12 text-indigo-400 mx-auto" aria-hidden="true" />
              <h2 className="text-xl font-bold">Batch Intake Console</h2>
              <input type="file" id="batch-camera-files" ref={batchInputRef} onChange={handleBatchImageUpload} accept="image/*" multiple className="hidden" />
              <button type="button" onClick={() => batchInputRef.current?.click()} aria-label="Upload multiple photos for batch ingestion" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold focus-visible:ring-3 focus-visible:ring-indigo-500 outline-none">Select Photos</button>
            </div>
          </div>
          {batchItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-bold text-slate-800">Batch Queue ({batchItems.filter(i => i.status === 'completed').length} / {batchItems.length})</h3>
                <button onClick={() => setBatchItems([])} className="text-xs text-slate-400">Clear</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batchItems.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden relative">
                        <img src={item.status === 'completed' ? item.formData.image_url : item.rawPreviewUrl} className="w-full h-full object-cover" alt="" />
                        {item.status !== 'completed' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold">{item.formData.name}</h4>
                        {item.status === 'completed' && <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1"><Sparkles className="w-3 h-3" /> Auto-tagged</div>}
                      </div>
                    </div>
                    {item.status === 'completed' && (
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs pt-3 border-t border-slate-100">
                        <input type="text" value={item.formData.machine_id} onChange={(e) => handleBatchItemChange(item.id, 'machine_id', e.target.value)} className="border p-1 rounded" />
                        <input type="text" value={item.formData.name} onChange={(e) => handleBatchItemChange(item.id, 'name', e.target.value)} className="border p-1 rounded" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={handleBatchSubmit} disabled={isSubmitting} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl">{isSubmitting ? 'Processing...' : 'Ingest All Items'}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
