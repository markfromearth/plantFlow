import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Calendar } from 'lucide-react';
import { INITIAL_EQUIPMENT } from '../../mockData';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const CATEGORIES = [
  { 
    id: 'Excavators', 
    name: 'Excavators', 
    label: '1.5t – 8t Excavators',
    attribute: 'Tonnage: 1.5t - 8.0t',
    subSizes: 'Micro / 1.5t / 3t / 5t / 8t',
    image: '/images/mini_digger_1781357985087.webp' 
  },
  { 
    id: 'Dumpers', 
    name: 'Dumpers', 
    label: '1t – 9t Site Dumpers',
    attribute: 'Payload: 1.0t - 9.0t',
    subSizes: '500kg / 1t / 3t / 6t / 9t',
    image: '/images/hi_tip_dumper_1781358015457.webp' 
  },
  { 
    id: 'Compaction', 
    name: 'Compaction', 
    label: 'Vibrating Plates & Rollers',
    attribute: 'Width: 350mm - 1200mm',
    subSizes: '350mm / 500mm / 800mm / 1200mm',
    image: '/images/wacker_plate_1781358033267.webp' 
  },
  { 
    id: 'Groundcare', 
    name: 'Groundcare', 
    label: 'Trenchers & Landscaping',
    attribute: 'Reach: Up to 600mm depth',
    subSizes: 'Trencher / Grinder / Rotavator',
    image: '/images/trencher_1781358047416.webp' 
  },
  { 
    id: 'Access', 
    name: 'Access', 
    label: 'Scissor Lifts & Towers',
    attribute: 'Working Height: 4m - 14m',
    subSizes: 'Scissor / Boom / Tower / Pop-Up',
    image: '/images/scissor_lift_1781358239898.webp' 
  },
  { 
    id: 'Power & Light', 
    name: 'Power & Light', 
    label: '3kVA – 10kVA Generators',
    attribute: 'Rating: 3kVA - 10kVA',
    subSizes: '3kVA / 6kVA / 10kVA Silenced',
    image: '/images/generator_3kva_1781358330592.webp' 
  },
  { 
    id: 'Breaking', 
    name: 'Breaking', 
    label: 'Heavy Breakers & Saws',
    attribute: 'Power: 110V site electric',
    subSizes: 'Medium / Heavy / Hydraulic / Saw',
    image: '/images/breaker_110v_1781358344746.webp' 
  },
  { 
    id: 'Floor Care', 
    name: 'Floor Care', 
    label: 'Floor Sanders & Cleaners',
    attribute: 'Power: 240V / 110V clean-care',
    subSizes: 'Sander / Edger / Carpet Cleaner / Vac',
    image: '/images/floor_sander_1781358280768.webp' 
  }
];

function getConfidenceSignal(name: string): string {
  const signalMap: Record<string, string> = {
    // Excavators
    '1.5 Tonne Mini Digger': 'Fits through 1m garden gate',
    '3 Tonne Digger': 'Most hired for foundations & extensions',
    'Micro Digger (750mm)': 'Fits through standard 760mm doorway',
    '5 Tonne Tracked Excavator': 'Zero tail swing for tight wall clearance',
    '8 Tonne Tracked Excavator': 'Heavy clearing & bulk site excavation',
    'Electric Mini Digger 1.9T': 'Zero-emission indoor safe operation',
    // Dumpers
    '1 Tonne Hi-Tip Dumper': 'High tip fits standard builders skips',
    '3 Tonne Front Tip Dumper': '4WD terrain utility for heavy muck shift',
    '6 Tonne Swivel Skip Dumper': 'Swivels 180° for precision trench backfill',
    '9 Tonne Front Tip Dumper': 'Bulk site muck shift specialist',
    'Tracked Micro Dumper 500kg': 'Fits through narrow 750mm garden gate',
    'Tracked Dumper 1 Tonne': 'Low ground pressure, mud safe tracks',
    // Compaction
    'Wacker Plate (350mm)': 'Fits narrow patio brickwork prep',
    'Trench Rammer': 'Most hired for deep trench pipe base compaction',
    'Forward/Reverge Plate (500mm)': 'Ideal for deep sub-base compaction',
    'Twin Drum Ride-On Roller 800mm': 'Ideal for tarmac driveways & pathways',
    'Twin Drum Ride-On Roller 1200mm': 'Road repairs & carpark grading',
    'Single Drum Pedestrian Roller': 'Excellent path compaction edge finish',
    // Groundcare
    'Trencher Walk-Behind': 'Fast clean cable and water pipe cuts',
    'Stump Grinder': 'Removes heavy stumps below soil level',
    'Wood Chipper 6 Inch': 'Tows behind standard 50mm ball vehicle hitch',
    'Pogt Hole Borer Petrol': 'Dual-operator high safety clutch protection',
    'Rotavator Heavy Duty': 'Fast soil turn for turfing prep',
    'Turf Cutter': 'Lifts lawn turf clean in neat rolls',
    // Access
    'Scissor Lift 19ft': 'Non-marking tyres for clean indoor floors',
    'Alloy Tower Scaffold 4m': 'Lightweight, clicks without tools',
    'Scissor Lift 26ft (Electric)': 'High-bay indoor warehouse access',
    'Scissor Lift 32ft (Diesel)': '4WD rough terrain outriggers included',
    'Articulating Boom Lift 45ft': 'Up-and-over outreach design',
    'Pop-Up Push Around Lift': 'Fits in standard passenger elevator',
    // Power & Light
    'Generator 3kVA': 'Runs circular saws & site lights',
    'Generator 6kVA': 'Runs multiple heavy site power tools',
    'Generator 10kVA Silenced': 'Ultra-quiet canopy for residential areas',
    'Portable Lighting Tower (LED)': 'Auto-mast extends to 5m height',
    '110V Transformer 3.3kVA': 'Required step-down for 110V site tools',
    'Portable Battery Generator 2kW': 'Silent clean battery indoor power',
    // Breaking
    'Breaker Heavy Duty 110V': 'Shatters concrete slabs up to 100mm',
    'Medium Duty Breaker 110V': 'Ideal for tile removal & plaster render',
    'Hydraulic Breaker Power Pack': 'High power independent engine gun',
    'Petrol Cut-Off Saw 12"': 'Clean brick & masonry cutting',
    'Concrete Floor Planer': 'Scarifies and levels uneven concrete',
    'SDS Max Combi Hammer 110V': 'Heavy brick drilling & light chipping',
    // Floor Care
    'Floor Sander 240V': 'Includes dust bag collection hood',
    'Carpet Cleaner': 'Deep fabric upholstery suction spray',
    'Floor Edging Sander': 'Gets flush against skirting boards',
    'Industrial Vacuum Cleaner': 'Wet/dry dual-capacity motor',
    'Floor Polisher / Scrubber': 'Brings tiles & wood to high shine',
    'Tile Stripper': 'Peels carpet tiles and vinyl clean'
  };

  return signalMap[name] || 'Excellent site reliability, checked & cleaned';
}

export default function CustomerHome() {
  useDocumentTitle("Hire Equipment");
  const [searchQuery, setSearchQuery] = useState('');

  const quickJobs = useMemo(() => [
    { label: '🌳 Garden Clearing', query: 'landscaping' },
    { label: '🧱 Dig Foundations', query: 'foundations' },
    { label: '🚘 Level Driveway', query: 'driveways' },
    { label: '🔨 Break Concrete', query: 'breaker' },
    { label: '🪜 Reach High', query: 'access' },
    { label: '🪵 Floor Sanding', query: 'sander' }
  ], []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return INITIAL_EQUIPMENT.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query) ||
      (item.job_fit && item.job_fit.toLowerCase().includes(query))
    ).slice(0, 5);
  }, [searchQuery]);

  return (
    <div className="flex flex-col font-sans animate-in fade-in duration-500 max-w-7xl mx-auto w-full pb-16 bg-white overflow-hidden shadow-sm sm:rounded-3xl sm:border sm:border-slate-200">
      
      {/* Hero Header Area */}
      <div className="px-5 pt-8 pb-7 bg-indigo-700 text-white relative">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/three_tonne_digger_1781358002768.webp')] bg-cover bg-center"></div>
        <div className="relative z-20 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 leading-tight">What do you need to hire?</h1>
          <p className="text-indigo-100 text-sm sm:text-base font-medium mb-6">Quality tools & machinery for your next job.</p>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <label htmlFor="search-equipment-input" className="sr-only">Search equipment</label>
            <input
              id="search-equipment-input"
              type="text"
              placeholder="Search equipment..."
              className="w-full bg-white text-slate-900 rounded-2xl pl-11 pr-4 py-3.5 font-medium shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchQuery('');
                }
              }}
            />
            
            {/* Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {searchResults.map(item => (
                      <li key={item.machine_id}>
                        <Link 
                          to={`/customer/equipment/${item.machine_id}`} 
                          className="flex items-center gap-4 p-3 hover:bg-slate-50 transition-colors"
                          onClick={() => setSearchQuery('')}
                        >
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-12 h-12 rounded bg-slate-100 object-cover" 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/mini_digger_1781357985087.webp';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-slate-900 font-bold text-sm truncate">{item.name}</h4>
                            <p className="text-slate-500 text-xs truncate">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-indigo-600 font-black text-sm">£{item.day_rate}</div>
                            <div className="text-slate-400 text-[10px] uppercase font-bold">/ day</div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-slate-500 text-sm font-medium">
                    No equipment found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Pick Chips (B2B Task-fit Optimization) */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center">
            <span className="text-[10px] font-black text-indigo-250 uppercase tracking-widest shrink-0">Quick Job Finder:</span>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 select-none">
              {quickJobs.map(job => {
                const isActive = searchQuery === job.query;
                return (
                  <button
                    key={job.label}
                    onClick={() => setSearchQuery(job.query)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 border ${
                      isActive 
                        ? 'bg-white text-indigo-700 border-white shadow-sm'
                        : 'bg-indigo-800 border-indigo-650 hover:border-indigo-400 text-white'
                    }`}
                  >
                    {job.label}
                  </button>
                );
              })}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1.5 rounded-full text-xs font-extrabold bg-red-650/20 text-red-200 border border-red-500/30 hover:bg-red-650/40 hover:text-white transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  Clear ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid - Denser, High-Contrast & Fast to Scan */}
      <div className="w-full px-5 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight border-l-4 border-indigo-600 pl-2">Categories</h2>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">8 Types</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CATEGORIES.map((category) => (
            <a 
              key={category.id} 
              href={`#${category.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(category.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById(category.id)?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group relative flex flex-col rounded-2xl overflow-hidden aspect-square bg-slate-100 border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all duration-300 cursor-pointer select-none focus-visible:ring-3 focus-visible:ring-indigo-500"
            >
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/mini_digger_1781357985087.webp';
                  }}
                />
              </div>
              
              {/* Subtle ambient shadow overlay */}
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-colors duration-300"></div>

              {/* Theme-compliant floating label pill (matches reference mockup exactly and scales across light/dark modes) */}
              <div className="absolute bottom-3 left-3 right-3 category-pill backdrop-blur-[2px] rounded-xl px-3 py-3 flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:translate-y-[-1px] z-20">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight truncate">
                  {category.name}
                </span>
                <ChevronRight className="w-4 h-4 shrink-0 ml-1 opacity-80" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Equipment Products per Category */}
      <div className="w-full px-5 py-4 max-w-7xl mx-auto space-y-12">
        {CATEGORIES.map(category => {
          const categoryEquipment = INITIAL_EQUIPMENT.filter(item => item.category === category.id).slice(0, 6);
          if (categoryEquipment.length === 0) return null;

          return (
            <div key={category.id} id={category.id} className="scroll-mt-6">
              <h3 className="text-2xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-2 flex justify-between items-end">
                {category.name}
                <Link to={`/customer`} className="text-indigo-600 text-sm font-bold hover:underline mb-1 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryEquipment.map((item) => (
                  <Link 
                    key={item.machine_id} 
                    to={`/customer/equipment/${item.machine_id}`}
                    className="flex flex-col bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-all group shadow-sm border border-slate-200 hover:shadow-xl m3-card focus-visible:ring-3 focus-visible:ring-indigo-500"
                  >
                    <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100">
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                           e.currentTarget.onerror = null;
                           e.currentTarget.src = '/images/mini_digger_1781357985087.webp';
                        }}
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded shadow-md text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Available
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="mb-2 text-lg font-bold text-slate-900 leading-tight">{item.name}</h4>
                      <div className="mb-4 flex-1 space-y-2 text-sm text-slate-600 flex flex-col items-start">
                        <p className="line-clamp-2">{item.job_fit}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="font-mono inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                            Width: {item.access_width_mm}mm
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 shrink-0">
                            🛡️ {getConfidenceSignal(item.name)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] font-black tracking-wider uppercase block mb-1 text-slate-400">Daily Rate</span>
                          <p className="text-2xl font-black text-indigo-700">
                            £{item.day_rate}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl transition-colors bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-md">
                          <Calendar className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
