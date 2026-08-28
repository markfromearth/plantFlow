import React from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

export const quickJobs = [
  { label: 'All', icon: '🌎', query: '' },
  { label: 'Gardening', icon: '🌳', query: 'landscaping' },
  { label: 'Foundations', icon: '🧱', query: 'foundations' },
  { label: 'Driveways', icon: '🚘', query: 'driveways' },
  { label: 'Demolition', icon: '🔨', query: 'breaker' },
  { label: 'Height', icon: '🪜', query: 'access' },
  { label: 'Floor Care', icon: '🪵', query: 'sander' }
];

export default function QuickJobFinder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentQuery = searchParams.get('q') || '';

  const handleTabClick = (query: string) => {
    const isCustomerPage = location.pathname.startsWith('/customer');
    const isCatalogPage = location.pathname === '/customer' || location.pathname === '/customer/';

    if (!isCustomerPage || !isCatalogPage) {
      if (query) {
        navigate(`/customer?q=${encodeURIComponent(query)}`);
      } else {
        navigate('/customer');
      }
    } else {
      setSearchParams(prev => {
        if (query) {
          prev.set('q', query);
        } else {
          prev.delete('q');
        }
        return prev;
      });
    }
  };

  return (
    <div className="flex items-center gap-6 h-full select-none" aria-label="Quick Job Finder">
      {quickJobs.map((job) => {
        const isActive = currentQuery === job.query;
        return (
          <button
            key={job.label}
            onClick={() => handleTabClick(job.query)}
            className={`h-full flex items-center gap-2 border-b-2 px-1 text-sm transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t ${
              isActive
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-200 font-semibold'
            }`}
          >
            <span className="text-base shrink-0 leading-none">{job.icon}</span>
            <span className="whitespace-nowrap">{job.label}</span>
          </button>
        );
      })}
    </div>
  );
}
