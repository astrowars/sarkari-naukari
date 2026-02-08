import React from 'react';
import { UserProfile, Qualification, Category, Gender } from '../types';
import { STATES, STREAMS } from '../constants';
import { User, Calendar, GraduationCap, BookOpen, Users, MapPin, Search, RotateCcw, AlertCircle } from 'lucide-react';

interface FilterFormProps {
  profile: UserProfile;
  onChange: (field: keyof UserProfile, value: any) => void;
  onSubmit: () => void;
  onReset: () => void;
  text: any;
  errors?: Partial<Record<keyof UserProfile, string>>;
}

const FilterForm: React.FC<FilterFormProps> = ({ profile, onChange, onSubmit, onReset, text, errors = {} as Partial<Record<keyof UserProfile, string>> }) => {
  return (
    <div className="bg-white p-5 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-visible">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-3xl"></div>
      
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <User size={18} className="md:size-5" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{text.enterDetails}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        <div className="group">
            <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2">{text.age} <span className="text-red-500 font-bold">*</span></label>
            <div className="relative">
                <div className={`absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.age ? 'text-red-500' : 'text-slate-400 group-focus-within:text-blue-500'}`}>
                    <Calendar size={18} />
                </div>
                <input 
                    type="number" 
                    value={profile.age}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange('age', val === '' ? '' : Number(val));
                    }}
                    placeholder="e.g. 24"
                    required
                    className={`w-full pl-10 md:pl-11 pr-4 py-3 md:py-3.5 bg-slate-50 rounded-xl border outline-none transition-all font-bold text-slate-800 text-sm md:text-base
                        ${errors.age 
                            ? 'border-red-500 ring-2 ring-red-500/10 focus:border-red-500 bg-red-50' 
                            : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'
                        }`}
                />
            </div>
            {errors.age && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-[10px] md:text-xs font-bold">
                    <AlertCircle size={12} /> {errors.age}
                </div>
            )}
        </div>

        <div className="group">
            <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2">{text.qual} <span className="text-red-500 font-bold">*</span></label>
            <div className="relative">
                <div className={`absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.qualification ? 'text-red-500' : 'text-slate-400 group-focus-within:text-blue-500'}`}>
                    <GraduationCap size={18} />
                </div>
                <select 
                    value={profile.qualification}
                    onChange={(e) => onChange('qualification', e.target.value)}
                    className={`w-full pl-10 md:pl-11 pr-10 py-3 md:py-3.5 bg-slate-50 rounded-xl border outline-none transition-all appearance-none font-bold text-slate-800 cursor-pointer text-sm md:text-base
                        ${errors.qualification 
                            ? 'border-red-500 ring-2 ring-red-500/10 focus:border-red-500 bg-red-50' 
                            : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'
                        }`}
                >
                    <option value="">{text.selectQual}</option>
                    {Object.values(Qualification).map((q) => (
                        <option key={q} value={q}>{q}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
            </div>
             {errors.qualification && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-[10px] md:text-xs font-bold">
                    <AlertCircle size={12} /> {errors.qualification}
                </div>
            )}
        </div>

        <div className="group">
            <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2">{text.stream}</label>
            <div className="relative">
                <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <BookOpen size={18} />
                </div>
                <select 
                    value={profile.stream}
                    onChange={(e) => onChange('stream', e.target.value)}
                    className="w-full pl-10 md:pl-11 pr-10 py-3 md:py-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none font-bold text-slate-800 cursor-pointer text-sm md:text-base"
                >
                    <option value="">{text.selectStream}</option>
                    {STREAMS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
            </div>
        </div>

        <div className="group">
            <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2">{text.category} <span className="text-red-500 font-bold">*</span></label>
            <div className="relative">
                <div className={`absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.category ? 'text-red-500' : 'text-slate-400 group-focus-within:text-blue-500'}`}>
                    <Users size={18} />
                </div>
                <select 
                    value={profile.category}
                    onChange={(e) => onChange('category', e.target.value)}
                    className={`w-full pl-10 md:pl-11 pr-10 py-3 md:py-3.5 bg-slate-50 rounded-xl border outline-none transition-all appearance-none font-bold text-slate-800 cursor-pointer text-sm md:text-base
                        ${errors.category 
                            ? 'border-red-500 ring-2 ring-red-500/10 focus:border-red-500 bg-red-50' 
                            : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'
                        }`}
                >
                    <option value="">{text.selectCat}</option>
                    {Object.values(Category).map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
            </div>
             {errors.category && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-[10px] md:text-xs font-bold">
                    <AlertCircle size={12} /> {errors.category}
                </div>
            )}
        </div>

        <div>
            <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2">{text.gender}</label>
            <div className="flex gap-3 md:gap-4">
                {[Gender.MALE, Gender.FEMALE].map((g) => (
                    <label key={g} className={`flex-1 flex items-center justify-center gap-2 cursor-pointer border rounded-xl py-3 md:py-3.5 transition-all ${profile.gender === g ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                        <input 
                            type="radio" 
                            name="gender"
                            checked={profile.gender === g}
                            onChange={() => onChange('gender', g)}
                            className="hidden"
                        />
                        <span className="font-bold text-sm md:text-base">{g === Gender.MALE ? text.male : text.female}</span>
                    </label>
                ))}
            </div>
        </div>

        <div className="group">
            <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2">{text.statePref}</label>
            <div className="relative">
                <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <MapPin size={18} />
                </div>
                <select 
                    value={profile.statePreference}
                    onChange={(e) => onChange('statePreference', e.target.value)}
                    className="w-full pl-10 md:pl-11 pr-10 py-3 md:py-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none font-bold text-slate-800 cursor-pointer text-sm md:text-base"
                >
                    <option value="">{text.anywhere}</option>
                    {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4">
        <button 
            onClick={onReset}
            className="w-full sm:w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-sm md:text-lg py-3.5 md:py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
            <RotateCcw size={18} />
            {text.clearFilters}
        </button>

        <button 
            onClick={onSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm md:text-lg py-3.5 md:py-4 px-6 rounded-2xl transition-all shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
            <Search size={20} strokeWidth={2.5} />
            {text.checkJobs}
        </button>
      </div>
    </div>
  );
};

export default FilterForm;