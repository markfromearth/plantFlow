import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Calendar } from 'lucide-react';
import { INITIAL_EQUIPMENT } from '../../mockData';

const CATEGORIES = [
  { id: 'Excavators', name: 'Excavators', image: '/images/mini_digger_1781357985087.jpg' },
  { id: 'Dumpers', name: 'Dumpers', image: '/images/hi_tip_dumper_1781358015457.jpg' },
  { id: 'Compaction', name: 'Compaction', image: '/images/wacker_plate_1781358033267.jpg' },
  { id: 'Groundcare', name: 'Groundcare', image: '/images/trencher_1781358047416.jpg' },
  { id: 'Access', name: 'Access', image: '/images/scissor_lift_1781358239898.jpg' },
  { id: 'Power & Light', name: 'Power & Light', image: '/images/generator_3kva_1781358330592.jpg' },
  { id: 'Breaking', name: 'Breaking', image: '/images/breaker_110v_1781358344746.jpg' },
  { id: 'Floor Care', name: 'Floor Care', image: '/images/floor_sander_1781358280768.jpg' }
];

export default function CustomerHome() {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return INITIAL_EQUIPMENT.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery]);

  return (
    <div className="flex flex-col font-sans animate-in fade-in duration-500 max-w-7xl mx-auto w-full pb-16 bg-white overflow-hidden shadow-sm sm:rounded-3xl sm:border sm:border-slate-200">
      
      {/* Hero Header Area */}
      <div className="px-5 pt-8 pb-7 bg-indigo-700 text-white relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="relative z-20 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 leading-tight">What do you need to hire?</h1>
          <p className="text-indigo-100 text-sm sm:text-base font-medium mb-6">Quality tools & machinery for your next job.</p>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search equipment..."
              className="w-full bg-white text-slate-900 rounded-2xl pl-11 pr-4 py-3.5 font-medium shadow-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=400&auto=format&fit=crop';
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
        </div>
      </div>

      {/* Categories Grid - Responsive: 2 cols on mobile, up to 4 on desktop */}
      <div className="w-full px-5 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-slate-800">Browse Categories</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">8 Types</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">
          {CATEGORIES.map((category) => (
            <a 
              key={category.id} 
              href={`#${category.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(category.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative flex flex-col rounded-2xl overflow-hidden aspect-square bg-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=600&auto=format&fit=crop';
                  }}
                />
              </div>
              
              {/* Dark Gradient Overlay for readability */}
              <div className="absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

              {/* Label & Icon */}
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 flex flex-col items-start gap-1">
                <span className="text-white font-bold leading-tight drop-shadow-sm text-sm sm:text-base md:text-lg">
                  {category.name}
                </span>
                <div className="mt-1 bg-white/20 backdrop-blur-sm rounded-full p-1 group-hover:bg-indigo-600 transition-colors duration-300">
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
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
                    className="flex flex-col bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-all group shadow-sm border border-slate-200 hover:shadow-xl"
                  >
                    <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100">
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                           (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=400&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded shadow-md text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Available
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="mb-2 text-lg font-bold text-slate-900 leading-tight">{item.name}</h4>
                      <div className="mb-4 flex-1 space-y-2 text-sm text-slate-600">
                        <p>{item.job_fit}</p>
                        <p className="font-mono inline-block px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                          Width: {item.access_width_mm}mm
                        </p>
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
