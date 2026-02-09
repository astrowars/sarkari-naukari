import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Briefcase, Frown, Bell, Heart, Sparkles, FileText, Landmark, Train, Shield, GraduationCap, MapPin, Zap, CheckCircle2, Clock, ChevronRight, BellRing, Users, ShieldCheck } from 'lucide-react';
import { MOCK_JOBS, TRANSLATIONS } from './constants';
import { UserProfile, Gender, Job, AlertPreferences, JobStatus, CompetitionLevel } from './types';
import { checkEligibility, getJobCategory } from './services/jobService';
import FilterForm from './components/FilterForm';
import JobCard from './components/JobCard';
import NotificationModal from './components/NotificationModal';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import SmartFilters, { FilterType } from './components/SmartFilters';

const TricolourBadge = () => (
  <div className="inline-flex flex-col w-10 h-6 border border-slate-200 rounded-sm overflow-hidden shrink-0 shadow-md">
    <div className="h-1/3 bg-[#FF9933]"></div>
    <div className="h-1/3 bg-white flex items-center justify-center relative">
      <div className="w-[6px] h-[6px] rounded-full border border-[#000080] flex items-center justify-center">
        <div className="w-[3px] h-[3px] rounded-full bg-[#000080]"></div>
      </div>
    </div>
    <div className="h-1/3 bg-[#138808]"></div>
  </div>
);

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Smart Filtering States
  const [smartFilterType, setSmartFilterType] = useState<FilterType>('All');
  const [hideVeryHigh, setHideVeryHigh] = useState(false);
  const [isSmartMode, setIsSmartMode] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/sarkar-admin-secret' || hash === '#admin') {
      setIsAdminRoute(true);
      document.title = "Admin Panel - Sarkar Ki Naukari";
    } else {
      document.title = "Sarkar Ki Naukari - Smart Job Finder";
    }
  }, []);

  useEffect(() => {
    if (isAdminRoute) return;
    const observerOptions = { root: null, rootMargin: '-30% 0% -30% 0%', threshold: 0.2 };
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const jobId = entry.target.getAttribute('data-job-id');
          if (jobId) setActiveJobId(jobId);
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll('[data-job-id]');
      cards.forEach((card) => observer.observe(card));
    }, 1000);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [isAdminRoute]);

  const [allJobs, setAllJobs] = useState<Job[]>(() => {
    try {
      const savedJobs = localStorage.getItem('sarkar_jobs_db');
      return savedJobs ? JSON.parse(savedJobs) : MOCK_JOBS;
    } catch (e) {
      return MOCK_JOBS;
    }
  });

  const handleUpdateJobs = (updatedJobs: Job[]) => {
    setAllJobs(updatedJobs);
    try { localStorage.setItem('sarkar_jobs_db', JSON.stringify(updatedJobs)); } catch (e) {}
  };

  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = TRANSLATIONS[lang];

  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: '', qualification: '', stream: '', category: '', gender: Gender.MALE, statePreference: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});
  const [selectedJobCategory, setSelectedJobCategory] = useState<string>('All');
  const [debouncedUserProfile, setDebouncedUserProfile] = useState<UserProfile>(userProfile);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (userProfile.age && userProfile.qualification && userProfile.category) setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedUserProfile(userProfile);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(handler);
  }, [userProfile]);

  const [hasSearched, setHasSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('savedJobs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [viewSavedOnly, setViewSavedOnly] = useState(false);

  const [alertPreferences, setAlertPreferences] = useState<AlertPreferences | undefined>(() => {
    try {
      const saved = localStorage.getItem('alertPreferences');
      return saved ? JSON.parse(saved) : undefined;
    } catch (e) { return undefined; }
  });

  useEffect(() => {
    try { localStorage.setItem('savedJobs', JSON.stringify(savedJobIds)); } catch (e) {}
  }, [savedJobIds]);

  const toggleBookmark = useCallback((id: string) => {
    setSavedJobIds(prev => prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]);
  }, []);

  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof UserProfile, string>> = {};
    let isValid = true;
    if (userProfile.age === '') { errors.age = "Age is required"; isValid = false; }
    if (userProfile.qualification === '') { errors.qualification = "Qualification is required"; isValid = false; }
    if (userProfile.category === '') { errors.category = "Category is required"; isValid = false; }
    setFormErrors(errors);
    return isValid;
  };

  const handleSearch = () => {
    if (!validateForm()) return;
    setHasSearched(true);
    setViewSavedOnly(false);
    setDebouncedUserProfile(userProfile);
    setTimeout(() => {
      const resultsEl = document.getElementById('results-section');
      if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleReset = () => {
    setUserProfile({ age: '', qualification: '', stream: '', category: '', gender: Gender.MALE, statePreference: '' });
    setFormErrors({}); setHasSearched(false); setViewSavedOnly(false); setSelectedJobCategory('All');
    setSmartFilterType('All'); setHideVeryHigh(false); setIsSmartMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAlerts = (job?: Job) => {
    setSelectedJob(job || null);
    setIsModalOpen(true);
  };

  const handleSavePreferences = (prefs: AlertPreferences) => {
    setAlertPreferences(prefs);
    try { localStorage.setItem('alertPreferences', JSON.stringify(prefs)); } catch (e) {}
  };

  const eligibleJobs = useMemo(() => {
    const activeJobs = allJobs.filter(j => j.status === JobStatus.ACTIVE);
    if (viewSavedOnly) return activeJobs.filter(job => savedJobIds.includes(job.id));
    
    if (hasSearched) {
      let jobs = activeJobs.filter(job => checkEligibility(job, debouncedUserProfile).isEligible);
      
      // Category Filter (SSC, Banking, etc)
      if (selectedJobCategory !== 'All') {
        jobs = jobs.filter(job => getJobCategory(job) === selectedJobCategory);
      }
      
      // Smart Competition Filters
      if (isSmartMode) {
        // Smart Mode hides high risk automatically
        jobs = jobs.filter(job => job.competition_level !== CompetitionLevel.HIGH);
      } else {
        if (hideVeryHigh) {
          jobs = jobs.filter(job => job.competition_level !== CompetitionLevel.HIGH);
        }
        if (smartFilterType !== 'All') {
          const typeMap: Record<string, CompetitionLevel> = {
            'Low': CompetitionLevel.LOW,
            'Medium': CompetitionLevel.MEDIUM,
            'HighRisk': CompetitionLevel.HIGH
          };
          jobs = jobs.filter(job => job.competition_level === typeMap[smartFilterType]);
        }
      }

      return jobs;
    }
    return [];
  }, [allJobs, debouncedUserProfile, viewSavedOnly, savedJobIds, selectedJobCategory, hasSearched, smartFilterType, hideVeryHigh, isSmartMode]);

  const latestJobs = useMemo(() => allJobs.filter(j => j.status === JobStatus.ACTIVE).slice(0, 4), [allJobs]);

  const displayedJobs = hasSearched || viewSavedOnly ? eligibleJobs : [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'All': return <Sparkles size={14} />;
      case 'SSC': return <ShieldCheck size={14} />;
      case 'Banking': return <Landmark size={14} />;
      case 'Railways': return <Train size={14} />;
      case 'Defence': return <Shield size={14} />;
      case 'Teaching': return <GraduationCap size={14} />;
      case 'State Govt': return <MapPin size={14} />;
      default: return <Briefcase size={14} />;
    }
  };

  if (isAdminRoute) {
    return <AdminPanel jobs={allJobs} onUpdateJobs={handleUpdateJobs} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900 w-full overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm px-4">
        <div className="max-w-6xl mx-auto h-16 md:h-24 flex items-center justify-between">
            <div 
              className="flex items-center gap-3 md:gap-4 cursor-pointer group active:scale-95 transition-all" 
              onClick={handleReset}
              role="button"
            >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <Briefcase className="w-5 h-5 md:w-8 md:h-8" fill="currentColor" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-indigo-100 border-2 border-white rounded-full flex items-center justify-center text-indigo-600">
                    <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-white fill-indigo-500" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h1 className="font-bold text-blue-600 text-[10px] md:text-xs leading-none tracking-[0.15em] uppercase">Sarkar Ki Naukari</h1>
                  <span className="font-extrabold text-slate-900 text-sm md:text-xl leading-tight">Smart Job Finder</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
                <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-100">
                    <button 
                      onClick={() => setLang('en')} 
                      className={`px-3 py-1.5 md:px-5 md:py-2 rounded-xl text-[10px] md:text-xs font-black transition-all ${lang === 'en' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                    >
                      ENG
                    </button>
                    <button 
                      onClick={() => setLang('hi')} 
                      className={`px-3 py-1.5 md:px-5 md:py-2 rounded-xl text-[10px] md:text-xs font-black transition-all ${lang === 'hi' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                    >
                      हिन्दी
                    </button>
                </div>
                
                <button 
                  onClick={() => setViewSavedOnly(!viewSavedOnly)} 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border transition-all relative active:scale-90 ${viewSavedOnly ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}
                >
                  <Heart className="w-5 h-5 md:w-6 md:h-6" fill={viewSavedOnly ? "currentColor" : "none"} />
                  {savedJobIds.length > 0 && !viewSavedOnly && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {savedJobIds.length}
                    </span>
                  )}
                </button>
                
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-2xl md:rounded-3xl bg-slate-950 text-white flex items-center justify-center active:scale-90 transition-all shadow-xl shadow-slate-950/10"
                >
                  <Bell className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>
        </div>
      </header>

      <main className="flex-grow relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
            {!viewSavedOnly && (
                <>
                    {!hasSearched && (
                        <div className="text-center mb-10 md:mb-16">
                            <div className="flex flex-wrap justify-center items-center gap-2 mb-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50/50 text-blue-800 text-[10px] font-black uppercase tracking-widest">
                                    <Sparkles size={12} className="text-amber-500" /> Trusted Job Tool
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-800 text-[10px] font-black uppercase tracking-widest">
                                    <Zap size={12} className="text-emerald-500 fill-emerald-500" /> Free Alerts
                                </div>
                            </div>
                            
                            <h2 className="text-4xl md:text-7xl font-black text-slate-900 mb-4 tracking-tighter leading-[1.1] max-w-4xl mx-auto">
                                Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Eligibility</span> Engine
                            </h2>

                            <div className="flex justify-center mb-8">
                                <TricolourBadge />
                            </div>

                            <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 font-medium leading-relaxed px-4">
                                Check your eligibility for <span className="text-blue-600 font-bold">hundreds</span> of government jobs across <span className="text-indigo-600 font-bold">India</span>. 
                                Enter your details and discover opportunities tailored for you. 
                                <span className="ml-2 inline-block px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 shadow-sm">
                                    (no login required)
                                </span>
                            </p>
                        </div>
                    )}
                    
                    <div className="mb-12 relative z-20">
                        <FilterForm profile={userProfile} onChange={handleProfileChange} onSubmit={handleSearch} onReset={handleReset} text={t} errors={formErrors} />
                    </div>

                    {!hasSearched && (
                        <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                             {/* Redesigned Get Free Alerts CTA Section */}
                             <div className="relative group p-1 mb-16">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                <div className="relative bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-12 overflow-hidden shadow-2xl shadow-slate-200/50">
                                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                                    <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
                                    
                                    <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                                        <div className="flex-1 text-center lg:text-left">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">
                                                <BellRing size={14} className="animate-bounce" /> {t.missedDate}
                                            </div>
                                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                                                {t.getFreeAlerts.split(' ')[0]} <span className="text-blue-600">{t.getFreeAlerts.split(' ').slice(1).join(' ')}</span>
                                            </h3>
                                            <p className="text-slate-500 text-base md:text-lg font-medium max-w-xl mb-8 leading-relaxed">
                                                {t.getAlertsDesc}
                                            </p>
                                            
                                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs font-bold text-slate-400">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
                                                    <ShieldCheck size={14} className="text-emerald-500" /> 100% Free & Secure
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
                                                    <Users size={14} className="text-blue-500" /> Join 12,000+ Aspirants
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="shrink-0 w-full lg:w-auto">
                                            <button 
                                                onClick={() => setIsModalOpen(true)}
                                                className="w-full lg:w-auto group/btn relative bg-slate-950 text-white font-black px-12 py-5 rounded-2xl overflow-hidden shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                                <span className="relative z-10 text-sm uppercase tracking-widest">{t.getFreeAlerts}</span>
                                                <Zap size={20} fill="currentColor" className="relative z-10 text-amber-400" />
                                            </button>
                                            <p className="text-[10px] text-center mt-4 text-slate-400 font-bold uppercase tracking-tighter">
                                                WhatsApp • Telegram • Email
                                            </p>
                                        </div>
                                    </div>
                                </div>
                             </div>

                             <div className="flex items-center justify-between mb-8">
                               <h3 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
                                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                                    <Zap size={20} fill="white" />
                                  </div>
                                  Newest Job Updates
                               </h3>
                               <button onClick={handleSearch} className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-all">
                                 Check Full Eligibility <ChevronRight size={16} />
                               </button>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {latestJobs.map(job => (
                                     <JobCard 
                                        key={job.id} 
                                        job={job} 
                                        userProfile={userProfile} 
                                        onSetAlert={handleOpenAlerts} 
                                        isBookmarked={savedJobIds.includes(job.id)} 
                                        onToggleBookmark={toggleBookmark} 
                                        text={t}
                                        isActive={activeJobId === job.id}
                                      />
                                 ))}
                             </div>
                        </div>
                    )}
                </>
            )}

            {(hasSearched || viewSavedOnly) && (
                <div id="results-section">
                     {!viewSavedOnly && (
                       <>
                         <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                            <div className="flex space-x-2 min-w-max">
                                {['All', 'SSC', 'Banking', 'Railways', 'Defence', 'Teaching', 'State Govt', 'UPSC'].map(cat => (
                                  <button 
                                    key={cat} 
                                    onClick={() => setSelectedJobCategory(cat)} 
                                    className={`px-5 py-2.5 rounded-xl text-[11px] font-black border transition-all flex items-center gap-2 ${selectedJobCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200'}`}
                                  >
                                      {getCategoryIcon(cat)}
                                      {cat}
                                  </button>
                                ))}
                            </div>
                         </div>
                         <SmartFilters 
                            currentFilter={smartFilterType} 
                            onFilterChange={setSmartFilterType} 
                            hideVeryHigh={hideVeryHigh} 
                            onHideVeryHighChange={setHideVeryHigh} 
                            isSmartMode={isSmartMode} 
                            onToggleSmartMode={() => setIsSmartMode(!isSmartMode)}
                         />
                       </>
                     )}

                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                         <h3 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                            {viewSavedOnly ? (
                                <><div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white"><Heart size={20} fill="white" /></div> {t.yourSaved}</>
                            ) : (
                                <><div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Sparkles size={20} fill="white" /></div> {displayedJobs.length} {t.eligibleJobs}</>
                            )}
                        </h3>
                        {isSearching && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 font-black text-[10px] uppercase tracking-widest">
                            <Clock size={12} className="animate-spin" /> Syncing...
                          </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {displayedJobs.length > 0 ? (
                            displayedJobs.map(job => (
                                <JobCard 
                                  key={job.id} 
                                  job={job} 
                                  userProfile={userProfile} 
                                  onSetAlert={handleOpenAlerts} 
                                  isBookmarked={savedJobIds.includes(job.id)} 
                                  onToggleBookmark={toggleBookmark} 
                                  text={t}
                                  isActive={activeJobId === job.id}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] px-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                                  <Frown size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">No Matches Found</h3>
                                <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">Try loosening your smart filters or checking back tomorrow at 10 AM.</p>
                                <button onClick={handleReset} className="bg-slate-900 text-white font-black px-8 py-3.5 rounded-xl hover:bg-blue-600 transition-all text-xs uppercase tracking-widest">
                                  Reset All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* Floating Action Button for Alerts (Mobile Only) */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-4 border-white"
        >
          <BellRing size={24} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </div>

      <Footer text={t} />

      <NotificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} profile={userProfile} job={selectedJob} savedPreferences={alertPreferences} onSavePreferences={handleSavePreferences} />
    </div>
  );
}

export default App;