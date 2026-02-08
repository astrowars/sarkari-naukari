import React from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Info } from 'lucide-react';

export type FilterType = 'All' | 'Low' | 'Medium' | 'HighRisk';

interface SmartFiltersProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  hideVeryHigh: boolean;
  onHideVeryHighChange: (hide: boolean) => void;
  isSmartMode: boolean;
  onToggleSmartMode: () => void;
}

const SmartFilters: React.FC<SmartFiltersProps> = ({
  currentFilter,
  onFilterChange,
  hideVeryHigh,
  onHideVeryHighChange,
  isSmartMode,
  onToggleSmartMode
}) => {
  
  const filters: { id: FilterType; label: string; icon?: React.ReactNode }[] = [
    { id: 'All', label: 'All' },
    { id: 'Low', label: 'Low', icon: <CheckCircle2 size={14} className="text-emerald-600" /> },
    { id: 'Medium', label: 'Medium', icon: <ShieldCheck size={14} className="text-yellow-600" /> },
    { id: 'HighRisk', label: 'High Risk', icon: <AlertTriangle size={14} className="text-orange-600" /> },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
      
      {/* Header & Smart Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          🎯 Smart Filters
        </h3>
        
        <label className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${isSmartMode ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50 border border-slate-100'}`}>
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={isSmartMode} 
              onChange={onToggleSmartMode}
            />
            <div className={`w-10 h-6 bg-slate-300 rounded-full shadow-inner transition-colors ${isSmartMode ? '!bg-indigo-600' : ''}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${isSmartMode ? 'translate-x-4' : ''}`}></div>
          </div>
          <span className={`text-sm font-semibold ${isSmartMode ? 'text-indigo-700' : 'text-slate-600'}`}>
            ⚡ Smart Mode <span className="hidden sm:inline font-normal text-xs opacity-80">– Show only realistic jobs</span>
          </span>
        </label>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        
        {/* Button Group */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              disabled={isSmartMode && f.id === 'HighRisk'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border 
                ${currentFilter === f.id 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
                ${isSmartMode && f.id === 'HighRisk' ? 'opacity-30 cursor-not-allowed' : ''}
                `}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Checkbox */}
        <label className={`flex items-center gap-2 text-sm cursor-pointer select-none ${isSmartMode ? 'opacity-50 pointer-events-none' : ''}`}>
          <input 
            type="checkbox" 
            checked={hideVeryHigh || isSmartMode} // Always checked visually if Smart Mode is ON
            onChange={(e) => onHideVeryHighChange(e.target.checked)}
            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
          />
          <span className="text-slate-700">Hide <span className="font-bold text-red-600">Very High</span> Competition Jobs</span>
        </label>
      </div>

      {/* Competition Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info size={14} className="text-slate-400" />
            <span className="font-semibold text-slate-700">Competition Legend:</span>
          </div>
          <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Low (&lt;30 applicants/seat)</span>
          </div>
          <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span>Medium (30–80)</span>
          </div>
          <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Very High (&gt;150)</span>
          </div>
      </div>
    </div>
  );
};

export default SmartFilters;