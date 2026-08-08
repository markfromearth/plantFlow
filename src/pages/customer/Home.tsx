import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Calendar, ArrowRight, Heart, GitCompare } from 'lucide-react';
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

function getSpecsAndTags(item: any) {
  const category = item.category;
  let bestFor = '';
  let stats: { label: string, value: string }[] = [];
  let outcomes: string[] = [];
  
  if (category === 'Excavators') {
    bestFor = 'Perfect for garden landscaping, extensions, and foundation trenching.';
    outcomes = ['Dig foundations', 'Landscape gardens'];
    if (item.machine_id === 'EX-030') { outcomes = ['Excavate extensions', 'Clear heavy clay']; }
    else if (item.machine_id === 'EX-008') { outcomes = ['Access tight alleys', 'Dig micro trenches']; }
    else if (item.machine_id === 'EX-050') { outcomes = ['Level large sites', 'Dig deep footings']; }
    else if (item.machine_id === 'EX-080') { outcomes = ['Demolish brick walls', 'Bulk soil removal']; }
    else if (item.machine_id === 'EX-019E') { outcomes = ['Indoor excavation', 'Night-shift digging']; }
    
    let digDepth = '2.2m';
    let weight = '1.5t';
    if (item.machine_id === 'EX-030') { digDepth = '3.1m'; weight = '3.0t'; }
    else if (item.machine_id === 'EX-008') { digDepth = '1.7m'; weight = '0.8t'; }
    else if (item.machine_id === 'EX-050') { digDepth = '3.8m'; weight = '5.0t'; }
    else if (item.machine_id === 'EX-080') { digDepth = '4.6m'; weight = '8.0t'; }
    else if (item.machine_id === 'EX-019E') { digDepth = '2.4m'; weight = '1.9t'; }
    
    stats = [
      { label: 'Dig Depth', value: digDepth },
      { label: 'Width', value: `${item.access_width_mm}mm` },
      { label: 'Weight', value: weight }
    ];
  } else if (category === 'Dumpers') {
    bestFor = 'Ideal for transporting heavy muck, aggregate, and site waste.';
    outcomes = ['Tip into high skips', 'Move aggregate'];
    if (item.machine_id === 'DM-300') { outcomes = ['Cross muddy terrain', 'Shift bulk soils']; }
    else if (item.machine_id === 'DM-600') { outcomes = ['Trench backfilling', 'Precision dumping']; }
    else if (item.machine_id === 'DM-900') { outcomes = ['Heavy bulk muck shift', 'Large-scale transport']; }
    else if (item.machine_id === 'DM-050T') { outcomes = ['Pass through side gates', 'Walk-behind haulage']; }
    else if (item.machine_id === 'DM-100T') { outcomes = ['Tracked slope hauling', 'Low ground pressure']; }
    
    let payload = '1.0t';
    let capacity = '0.5m³';
    if (item.machine_id === 'DM-300') { payload = '3.0t'; capacity = '1.6m³'; }
    else if (item.machine_id === 'DM-600') { payload = '6.0t'; capacity = '3.1m³'; }
    else if (item.machine_id === 'DM-900') { payload = '9.0t'; capacity = '4.5m³'; }
    else if (item.machine_id === 'DM-050T') { payload = '500kg'; capacity = '0.2m³'; }
    else if (item.machine_id === 'DM-100T') { payload = '1.0t'; capacity = '0.5m³'; }
    
    stats = [
      { label: 'Payload', value: payload },
      { label: 'Skip Capacity', value: capacity },
      { label: 'Width', value: `${item.access_width_mm}mm` }
    ];
  } else if (category === 'Compaction') {
    bestFor = 'Perfect for sub-base preparation, tarmac driveways, and trench compaction.';
    outcomes = ['Flatten paving base', 'Compact narrow paths'];
    if (item.machine_id === 'RM-010') { outcomes = ['Compact pipe trenches', 'High impact ramming']; }
    else if (item.machine_id === 'CP-050R') { outcomes = ['Grade sub-base layers', 'Reverse terrain compaction']; }
    else if (item.machine_id === 'RL-800') { outcomes = ['Roll driveway tarmac', 'Flatten pathway bases']; }
    else if (item.machine_id === 'RL-1200') { outcomes = ['Pack large car parks', 'Asphalt road repairs']; }
    else if (item.machine_id === 'RL-PED') { outcomes = ['Path edging finish', 'Roll narrow footpaths']; }
    
    let force = '12kN';
    let weight = '59kg';
    if (item.machine_id === 'RM-010') { force = '16kN'; weight = '70kg'; }
    else if (item.machine_id === 'CP-050R') { force = '30kN'; weight = '160kg'; }
    else if (item.machine_id === 'RL-800') { force = '15kN'; weight = '1.2t'; }
    else if (item.machine_id === 'RL-1200') { force = '27kN'; weight = '2.7t'; }
    else if (item.machine_id === 'RL-PED') { force = '10kN'; weight = '450kg'; }
    
    stats = [
      { label: 'Plate Size', value: `${item.access_width_mm}mm` },
      { label: 'Impact Force', value: force },
      { label: 'Weight', value: weight }
    ];
  } else if (category === 'Access') {
    bestFor = 'Ideal for safe working at heights, indoor maintenance, and painting.';
    outcomes = ['Reach ceiling lights', 'Safe indoor height'];
    if (item.machine_id === 'AT-040') { outcomes = ['Exterior house painting', 'Light scaffold access']; }
    else if (item.machine_id === 'SL-260') { outcomes = ['High indoor maintenance', 'Stock warehouse racks']; }
    else if (item.machine_id === 'SL-320') { outcomes = ['Outdoor rough terrain', 'High reach installation']; }
    else if (item.machine_id === 'BL-450') { outcomes = ['Reach over obstacles', 'High branch pruning']; }
    else if (item.machine_id === 'PL-POP') { outcomes = ['Pass inside elevators', 'Low indoor maintenance']; }
    
    let height = '7.8m';
    let capacity = '227kg';
    let indoorOutdoor = 'Indoor Only';
    if (item.machine_id === 'AT-040') { height = '4.0m'; capacity = '275kg'; indoorOutdoor = 'Indoor/Outdoor'; }
    else if (item.machine_id === 'SL-260') { height = '9.8m'; capacity = '250kg'; indoorOutdoor = 'Indoor Only'; }
    else if (item.machine_id === 'SL-320') { height = '11.7m'; capacity = '300kg'; indoorOutdoor = 'Outdoor Only'; }
    else if (item.machine_id === 'BL-450') { height = '15.5m'; capacity = '200kg'; indoorOutdoor = 'Outdoor Only'; }
    else if (item.machine_id === 'PL-POP') { height = '5.0m'; capacity = '240kg'; indoorOutdoor = 'Indoor Only'; }
    
    stats = [
      { label: 'Working Height', value: height },
      { label: 'Platform Capacity', value: capacity },
      { label: 'Indoor/Outdoor', value: indoorOutdoor }
    ];
  } else if (category === 'Groundcare') {
    bestFor = 'Perfect for trenching pipes, removing tree stumps, and turf preparation.';
    outcomes = ['Dig pipe trenches', 'Clean pipe line cuts'];
    if (item.machine_id === 'SG-040') { outcomes = ['Grind tree stumps', 'Clear root systems']; }
    else if (item.machine_id === 'WC-060') { outcomes = ['Chip wood branches', 'Shred garden waste']; }
    else if (item.machine_id === 'PH-020') { outcomes = ['Bore post holes', 'Fencing prep work']; }
    else if (item.machine_id === 'GC-ROT') { outcomes = ['Turn lawn soil', 'Turf preparation']; }
    else if (item.machine_id === 'GC-TC') { outcomes = ['Lift grass turf', 'Clean rolls of lawn']; }
    
    let depth = '600mm';
    let power = 'Petrol';
    if (item.machine_id === 'SG-040') { depth = '300mm'; power = 'Petrol'; }
    else if (item.machine_id === 'WC-060') { depth = '6 Inch'; power = 'Diesel'; }
    else if (item.machine_id === 'PH-020') { depth = 'Auger 200mm'; power = 'Petrol'; }
    else if (item.machine_id === 'GC-ROT') { depth = '200mm'; power = 'Hydraulic'; }
    else if (item.machine_id === 'GC-TC') { depth = '30mm'; power = 'Petrol'; }
    
    stats = [
      { label: 'Depth / Cap', value: depth },
      { label: 'Width', value: `${item.access_width_mm}mm` },
      { label: 'Power Source', value: power }
    ];
  } else if (category === 'Power & Light') {
    bestFor = 'Perfect for providing clean, reliable site power and area lighting.';
    outcomes = ['Run circular saws', 'Power site lighting'];
    if (item.machine_id === 'GN-060') { outcomes = ['Power multiple tools', 'Running small setups']; }
    else if (item.machine_id === 'GN-100S') { outcomes = ['Power heavy offices', 'Silent site electricity']; }
    else if (item.machine_id === 'LT-LED') { outcomes = ['Light night operations', 'Tall mast area light']; }
    else if (item.machine_id === 'TR-33') { outcomes = ['Step-down site power', 'Safe 110V tool supply']; }
    else if (item.machine_id === 'GN-BAT') { outcomes = ['Power indoor setups', 'Emission-free energy']; }
    
    let output = '3.0 kVA';
    let fuel = 'Petrol';
    let runtime = '6.0 hrs';
    if (item.machine_id === 'GN-060') { output = '6.0 kVA'; fuel = 'Petrol'; runtime = '8.5 hrs'; }
    else if (item.machine_id === 'GN-100S') { output = '10.0 kVA'; fuel = 'Diesel'; runtime = '12.0 hrs'; }
    else if (item.machine_id === 'LT-LED') { output = '4x 320W LED'; fuel = 'Diesel'; runtime = '50.0 hrs'; }
    else if (item.machine_id === 'TR-33') { output = '3.3 kVA'; fuel = '110V Electric'; runtime = 'Continuous'; }
    else if (item.machine_id === 'GN-BAT') { output = '2.0 kW'; fuel = 'Lithium-Ion'; runtime = '10.0 hrs'; }
    
    stats = [
      { label: 'Power Output', value: output },
      { label: 'Fuel Type', value: fuel },
      { label: 'Runtime', value: runtime }
    ];
  } else if (category === 'Breaking') {
    bestFor = 'Ideal for heavy concrete demolition, brick cutting, and tile stripping.';
    outcomes = ['Break concrete slabs', 'Shatter thick pathways'];
    if (item.machine_id === 'BR-MED') { outcomes = ['Strip wall plaster', 'Light chipping jobs']; }
    else if (item.machine_id === 'BR-HYD') { outcomes = ['High-power demolition', 'Run hydraulic breakers']; }
    else if (item.machine_id === 'BR-CUT') { outcomes = ['Cut concrete blocks', 'Masonry sawing']; }
    else if (item.machine_id === 'BR-FLP') { outcomes = ['Level uneven concrete', 'Scarify floor surfaces']; }
    else if (item.machine_id === 'BR-SDS') { outcomes = ['Drill concrete walls', 'Core masonry holes']; }
    
    let energy = '62 Joules';
    let weight = '30kg';
    let compatibility = 'Pointed/Flat Chisels';
    if (item.machine_id === 'BR-MED') { energy = '26 Joules'; weight = '11kg'; compatibility = 'SDS-Max Chisels'; }
    else if (item.machine_id === 'BR-HYD') { energy = '85 Joules'; weight = '60kg'; compatibility = 'Hydraulic Gun'; }
    else if (item.machine_id === 'BR-CUT') { energy = '12" Blade'; weight = '9.5kg'; compatibility = 'Diamond Blades'; }
    else if (item.machine_id === 'BR-FLP') { energy = 'TCT Flails'; weight = '55kg'; compatibility = 'Planer Drums'; }
    else if (item.machine_id === 'BR-SDS') { energy = '19 Joules'; weight = '8.5kg'; compatibility = 'SDS-Max Bits'; }
    
    stats = [
      { label: 'Impact Energy', value: energy },
      { label: 'Weight', value: weight },
      { label: 'Compatibility', value: compatibility }
    ];
  } else {
    bestFor = 'Ideal for sanding wooden floors and deep cleaning commercial carpets.';
    outcomes = ['Sand wooden floors', 'Remove floor varnish'];
    if (item.machine_id === 'CC-110') { outcomes = ['Extract carpet dirt', 'Deep clean rugs']; }
    else if (item.machine_id === 'FC-EDG') { outcomes = ['Sand flush to walls', 'Corner floor sanding']; }
    else if (item.machine_id === 'FC-VAC') { outcomes = ['Suction water waste', 'Heavy industrial vacuum']; }
    else if (item.machine_id === 'FC-POL') { outcomes = ['Scrubber tiles/wood', 'High gloss polishing']; }
    else if (item.machine_id === 'FC-STR') { outcomes = ['Peel vinyl tiles', 'Remove carpet adhesive']; }
    
    let width = `${item.access_width_mm}mm`;
    let power = '240V';
    let coverage = '50 m²/hr';
    if (item.machine_id === 'CC-110') { width = '250mm'; power = '240V'; coverage = '35 m²/hr'; }
    else if (item.machine_id === 'FC-EDG') { width = '178mm'; power = '240V'; coverage = '15 m²/hr'; }
    else if (item.machine_id === 'FC-VAC') { width = '400mm'; power = '110V/240V'; coverage = '120 m²/hr'; }
    else if (item.machine_id === 'FC-POL') { width = '400mm'; power = '240V'; coverage = '200 m²/hr'; }
    else if (item.machine_id === 'FC-STR') { width = '350mm'; power = '110V'; coverage = '80 m²/hr'; }
    
    stats = [
      { label: 'Cleaning Width', value: width },
      { label: 'Power', value: power },
      { label: 'Coverage', value: coverage }
    ];
  }
  
  return { bestFor, stats, outcomes };
}

function getAvailabilitySignals(item: any) {
  const isAvailable = item.availability_status === 'available';
  const isHired = item.availability_status === 'hired';
  
  let primary = 'Limited Stock';
  let badgeClass = 'bg-amber-50 text-amber-800 border-amber-250';
  let secondary: string[] = [];

  if (isAvailable) {
    primary = 'Available Today';
    badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    secondary = ['Delivery & Collection'];
    
    // Add specific scarcity/demand signals to key items
    if (['EX-015', 'CP-035', 'DM-050T'].includes(item.machine_id)) {
      secondary.push('Only 2 Left');
    } else if (['RM-010', 'GN-030', 'FS-240'].includes(item.machine_id)) {
      secondary.push('High Demand');
    } else if (['AT-040', 'GC-TC'].includes(item.machine_id)) {
      secondary.push('Weekend Available');
    }
  } else if (isHired) {
    primary = 'Available Tomorrow';
    badgeClass = 'bg-indigo-50 text-indigo-800 border-indigo-250';
    secondary = ['Collection Available'];

    if (['EX-030', 'DM-300', 'SL-190'].includes(item.machine_id)) {
      secondary.push('High Demand');
    } else if (['CP-050R', 'GN-060'].includes(item.machine_id)) {
      secondary.push('Only 1 Left');
    }
  } else {
    // Maintenance status
    primary = 'Limited Stock';
    badgeClass = 'bg-amber-50 text-amber-800 border-amber-250';
    secondary = ['Delivery Only'];
    
    if (['EX-050', 'DM-900'].includes(item.machine_id)) {
      secondary.push('High Demand');
    }
  }

  return { primary, badgeClass, secondary };
}

export default function CustomerHome() {
  useDocumentTitle("Hire Equipment");
  const [searchQuery, setSearchQuery] = useState('');
  const [favourites, setFavourites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);

  const toggleFavourite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavourites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCompareList(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

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
                {categoryEquipment.map((item) => {
                  const isAvailable = item.availability_status === 'available';
                  const isHired = item.availability_status === 'hired';
                  
                  // Availability Badge (Level 1)
                  const availabilityText = isAvailable 
                    ? 'Available Today' 
                    : isHired 
                      ? 'Available Tomorrow' 
                      : 'Limited Stock';
                      
                  const availabilityClass = isAvailable 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : isHired 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-250'
                      : 'bg-amber-50 text-amber-700 border-amber-250';

                  const { bestFor, stats, outcomes } = getSpecsAndTags(item);
                  const { primary, badgeClass, secondary } = getAvailabilitySignals(item);
                  const isFavourite = favourites.includes(item.machine_id);
                  const isCompared = compareList.includes(item.machine_id);

                  return (
                    <Link 
                      key={item.machine_id} 
                      to={`/customer/equipment/${item.machine_id}`}
                      className="flex flex-col bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-all group shadow-sm border border-slate-250 hover:shadow-xl focus-visible:ring-3 focus-visible:ring-indigo-500 p-5 space-y-4"
                    >
                      {/* Top Action Bar (泥だらけの手・雨天でも誤作動を防ぐ48px以上のゆったりしたタップ領域) */}
                      <div className="flex items-center justify-between z-10">
                        {/* 1. Availability (屋外視認性の高い、高コントラストな枠付きバッジ) */}
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${badgeClass}`}>
                          {primary}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => toggleFavourite(item.machine_id, e)}
                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-250 text-slate-700 hover:text-red-600 active:bg-slate-100 transition-colors cursor-pointer"
                            aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                          >
                            <Heart className={`w-5 h-5 ${isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => toggleCompare(item.machine_id, e)}
                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-255 text-slate-700 hover:text-indigo-700 active:bg-slate-100 transition-colors cursor-pointer"
                            aria-label={isCompared ? "Remove from compare" : "Add to compare"}
                          >
                            <GitCompare className={`w-5 h-5 ${isCompared ? 'text-indigo-650' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* 2. Machine Image */}
                      <div className="flex-1 flex flex-col space-y-3">
                        <div className="h-44 w-full bg-slate-50 rounded-xl flex items-center justify-center p-3 overflow-hidden border border-slate-100">
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                               e.currentTarget.onerror = null;
                               e.currentTarget.src = '/images/mini_digger_1781357985087.webp';
                            }}
                          />
                        </div>
                        
                        {/* Machine Name (太陽光下でもクッキリ見える黒太字) */}
                        <h4 className="text-lg font-black text-slate-950 leading-snug group-hover:text-indigo-700 transition-colors">
                          {item.name}
                        </h4>
                      </div>

                      {/* 1. Availability (Appears directly before price) */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${badgeClass}`}>
                            {primary}
                          </span>
                          {secondary.map((signal) => {
                            let style = 'bg-slate-50 text-slate-750 border-slate-200';
                            if (signal === 'Only 2 Left' || signal === 'Only 1 Left') {
                              style = 'bg-amber-50/50 text-slate-750 border-amber-200';
                            } else if (signal === 'High Demand') {
                              style = 'bg-indigo-50/50 text-slate-750 border-indigo-200';
                            } else if (signal.includes('Collection') || signal.includes('Delivery')) {
                              style = 'bg-slate-50 text-slate-650 border-slate-200';
                            } else if (signal === 'Weekend Available') {
                              style = 'bg-teal-50 text-teal-800 border-teal-200';
                            }
                            return (
                              <span key={signal} className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold border ${style}`}>
                                {signal}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Price (1秒以内に確認できる超高コントラスト表示) */}
                      <div className="flex items-baseline justify-between border-t-2 border-slate-100 pt-3">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-indigo-900">£{item.day_rate}</span>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">/ day</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-600 block mt-0.5">
                            + £{item.delivery_rate} delivery • {isAvailable ? 'Same day available' : 'Delivered tomorrow'}
                          </span>
                        </div>
                      </div>

                      {/* 4. Best For */}
                      <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                        {bestFor}
                      </p>

                      {/* 5. Machine Specs (屋外視認性に配慮した強コントラストフォント) */}
                      <div className="grid grid-cols-3 gap-1 py-2 px-1 bg-slate-50 rounded-lg text-center border border-slate-100">
                        {stats.map((stat, idx) => (
                          <div key={idx} className={`space-y-0.5 ${idx < 2 ? 'border-r-2 border-slate-200' : ''}`}>
                            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">
                              {stat.label}
                            </span>
                            <span className="block font-mono text-[11px] font-black text-slate-900">
                              {stat.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* 6. Outcomes (現場の直感性を重視した緑チェックマークのアウトカム表示) */}
                      <div className="flex flex-wrap gap-1.5">
                        {outcomes.map((outcome) => (
                          <span key={outcome} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-950 font-black text-[10px] border border-emerald-250 shadow-sm shrink-0">
                            ✔ {outcome}
                          </span>
                        ))}
                      </div>

                      {/* 7. Primary CTA (Muddy/Wet screenでも確実にとらえられる高さ52pxの極太フルワイドボタン) */}
                      <div className="pt-2">
                        <div className="w-full h-[52px] min-h-[52px] bg-indigo-700 hover:bg-indigo-850 group-hover:bg-indigo-650 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95">
                          <span>Hire Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
