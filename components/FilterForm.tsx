import React, { useState } from 'react';
import { UserProfile, Qualification, Category, Gender } from '../types';
import { STATES, STREAMS } from '../constants';
import { User, Calendar, GraduationCap, BookOpen, Users, MapPin, Search, RotateCcw, AlertCircle, Info, Shield } from 'lucide-react';

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
    <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 relative overflow-visible">
      {/* Accent border at top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-[2rem] md:rounded-t-[2.5rem]"></div>
      
      <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#eff6ff] rounded-full flex items-center justify-center text-blue-600 shadow-sm">
            <User size={20} className="md:w-6 md:h-6" />
        </div>
        <h2 className="text-xl md:text-2xl font-[900] text-slate-900 tracking-tight">{text.enterDetails}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
        
        {/* Age */}
        <div className="group">
            <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{text.age} <span className="text-rose-500 font-bold">*</span></label>
            <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.age ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-blue-500'}`}>
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
                    className={`w-full pl-11 pr-4 py-3 bg-[#f8faff] rounded-xl border outline-none transition-all font-bold text-slate-800 text-sm md:text-base
                        ${errors.age 
                            ? 'border-rose-500 ring-2 ring-rose-500/10 focus:border-rose-500 bg-rose-50' 
                            : 'border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'
                        }`}
                />
            </div>
            {errors.age && (
                <div className="flex items-center gap-1 mt-1 text-rose-600 text-[9px] font-bold">
                    <AlertCircle size={10} /> {errors.age}
                </div>
            )}
        </div>

        {/* Qualification */}
        <div className="group">
            <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{text.qual} <span className="text-rose-500 font-bold">*</span></label>
            <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.qualification ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-blue-500'}`}>
                    <GraduationCap size={18} />
                </div>
                <select 
                    value={profile.qualification}
                    onChange={(e) => onChange('qualification', e.target.value)}
                    className={`w-full pl-11 pr-10 py-3 bg-[#f8faff] rounded-xl border outline-none transition-all appearance-none font-bold text-slate-800 cursor-pointer text-sm md:text-base
                        ${errors.qualification 
                            ? 'border-rose-500 ring-2 ring-rose-500/10 focus:border-rose-500 bg-rose-50' 
                            : 'border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'
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
        </div>

        {/* Category */}
        <div className="group">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">{text.category} <span className="text-rose-500 font-bold">*</span></label>
              <Info size={12} className="text-slate-300" />
            </div>
            
            <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.category ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-blue-500'}`}>
                    <Users size={18} />
                </div>
                <select 
                    value={profile.category}
                    onChange={(e) => onChange('category', e.target.value)}
                    className={`w-full pl-11 pr-10 py-3 bg-[#f8faff] rounded-xl border outline-none transition-all appearance-none font-bold text-slate-800 cursor-pointer text-sm md:text-base
                        ${errors.category 
                            ? 'border-rose-500 ring-2 ring-rose-500/10 focus:border-rose-500 bg-rose-50' 
                            : 'border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'
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
        </div>

        {/* Stream */}
        <div className="group">
            <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{text.stream}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <BookOpen size={18} />
                </div>
                <select 
                    value={profile.stream}
                    onChange={(e) => onChange('stream', e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-[#f8faff] rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none font-bold text-slate-800 cursor-pointer text-sm md:text-base"
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

        {/* Gender Selection */}
        <div className="group">
            <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{text.gender}</label>
            <div className="flex gap-3">
                {[Gender.MALE, Gender.FEMALE].map((g) => (
                    <button 
                        key={g} 
                        type="button"
                        onClick={() => onChange('gender', g)}
                        className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-black text-sm transition-all border-2
                            ${profile.gender === g 
                                ? 'bg-[#f0f7ff] border-blue-500 text-blue-600 shadow-md ring-4 ring-blue-500/5' 
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                            }`}
                    >
                        {g}
                    </button>
                ))}
            </div>
        </div>

        {/* State Preference */}
        <div className="group">
            <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{text.statePref}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <MapPin size={18} />
                </div>
                <select 
                    value={profile.statePreference}
                    onChange={(e) => onChange('statePreference', e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-[#f8faff] rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none font-bold text-slate-800 cursor-pointer text-sm md:text-base"
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

      <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4">
        <button 
            onClick={onReset}
            className="flex-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] font-[900] text-sm md:text-lg py-4 md:py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
            <RotateCcw size={18} strokeWidth={3} className="md:w-5 md:h-5" />
            {text.clearFilters}
        </button>

        <button 
            onClick={onSubmit}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-[900] text-sm md:text-lg py-4 md:py-5 px-6 rounded-2xl transition-all shadow-xl shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
            <Search size={20} strokeWidth={3} className="md:w-5 md:h-5" />
            {text.checkJobs}
        </button>
      </div>
    </div>
  );
};

export default FilterForm;