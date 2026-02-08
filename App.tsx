import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Briefcase, Frown, Bell, Heart, Sparkles, FileText, Landmark, Train, Shield, GraduationCap, MapPin, Zap, CheckCircle2, AlertTriangle, Users, Globe, Clock, ChevronRight, LayoutGrid, Smartphone, MessageSquare, Send } from 'lucide-react';
import { MOCK_JOBS, TRANSLATIONS } from './constants';
import { UserProfile, Qualification, Category, Gender, Job, CompetitionLevel, AlertPreferences, JobStatus } from './types';
import { checkEligibility, getJobCategory } from './services/jobService';
import FilterForm from './components/FilterForm';
import JobCard from './components/JobCard';
import NotificationModal from './components/NotificationModal';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.pathname === '/sarkar-admin-secret' || window.location.hash === '#admin') {
        setIsAdminRoute(true);
        document.title = "Admin Panel - Sarkar Ki Naukari";
    } else {
        document.title = "Govt Job Eligibility Checker";
    }
  }, []);

  // Intersection Observer for Automatic Scroll Highlight - Optimized
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0% -30% 0%',
      threshold: 0.5,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const jobId = entry.target.getAttribute('data-job-id');
          if (jobId) setActiveJobId(jobId);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const updateObservers = () => {
      const cards = document.querySelectorAll('[data-job-id]');
      cards.forEach((card) => observer.observe(card));
    };

    updateObservers();
    
    // Targeted observer instead of full body mutation
    const resultsSection = document.getElementById('results-section');
    const mutationObserver = new MutationObserver(updateObservers);
    if (resultsSection) mutationObserver.observe(resultsSection, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

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
    localStorage.setItem('sarkar_jobs_db', JSON.stringify(updatedJobs));
  };

  if (isAdminRoute) {
      return <AdminPanel jobs={allJobs} onUpdateJobs={handleUpdateJobs} />;
  }
  
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = TRANSLATIONS[lang];

  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: '',
    qualification: '',
    stream: '', 
    category: '',
    gender: Gender.MALE,
    statePreference: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});
  const [selectedJobCategory, setSelectedJobCategory] = useState<string>('All');
  const [debouncedUserProfile, setDebouncedUserProfile] = useState<UserProfile>(userProfile);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (userProfile.age && userProfile.qualification && userProfile.category) {
        setIsSearching(true);
    }
    const handler = setTimeout(() => {
      setDebouncedUserProfile(userProfile);
      setIsSearching(false);
    }, 300); // Faster debounce
    return () => clearTimeout(handler);
  }, [userProfile]);

  const [hasSearched, setHasSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
        const saved = localStorage.getItem('savedJobs');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });
  const [viewSavedOnly, setViewSavedOnly] = useState(false);

  const [alertPreferences, setAlertPreferences] = useState<AlertPreferences | undefined>(() => {
    try {
        const saved = localStorage.getItem('alertPreferences');
        return saved ? JSON.parse(saved) : undefined;
    } catch (e) {
        return undefined;
    }
  });

  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  const toggleBookmark = (id: string) => {
    setSavedJobIds(prev => 
      prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]
    );
  };

  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
        setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
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
    }, 50);
  };

  const handleReset = () => {
    setUserProfile({ age: '', qualification: '', stream: '', category: '', gender: Gender.MALE, statePreference: '' });
    setFormErrors({});
    setHasSearched(false);
    setViewSavedOnly(false);
    setSelectedJobCategory('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAlerts = (job?: Job) => {
    setSelectedJob(job || null);
    setIsModalOpen(true);
  };

  const handleSavePreferences = (prefs: AlertPreferences) => {
    setAlertPreferences(prefs);
    localStorage.setItem('alertPreferences', JSON.stringify(prefs));
  };

  const eligibleJobs = useMemo(() => {
    const activeJobs = allJobs.filter(j => j.status === JobStatus.ACTIVE);
    if (viewSavedOnly) return activeJobs.filter(job => savedJobIds.includes(job.id));
    if (hasSearched) {
        let jobs = activeJobs.filter(job => checkEligibility(job, debouncedUserProfile).isEligible);
        if (selectedJobCategory !== 'All') jobs = jobs.filter(job => getJobCategory(job) === selectedJobCategory);
        return jobs;
    }
    return [];
  }, [allJobs, debouncedUserProfile, viewSavedOnly, savedJobIds, selectedJobCategory, hasSearched]);

  const latestJobs = useMemo(() => {
      return allJobs.filter(j => j.status === JobStatus.ACTIVE).slice(0, 4);
  }, [allJobs]);

  const displayedJobs = hasSearched || viewSavedOnly ? eligibleJobs : [];

  const JOB_CATEGORIES = [
    { id: 'All', label: 'All', icon: <Briefcase size={16} /> },
    { id: 'SSC', label: 'SSC', icon: <FileText size={16} /> },
    { id: 'Banking', label: 'Banking', icon: <Landmark size={16} /> },
    { id: 'Railways', label: 'Railways', icon: <Train size={16} /> },
    { id: 'Defence', label: 'Defence', icon: <Shield size={16} /> },
    { id: 'Teaching', label: 'Teaching', icon: <GraduationCap size={16} /> },
    { id: 'State Govt', label: 'State Govt', icon: <MapPin size={16} /> }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900">
      {/* Mesh Gradient Background Blobs - Static */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      </div>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-blue-100 shadow-[0_2px_15px_-3px_rgba(37,99,235,0.07)]">
        <div className="max-w-6xl mx-auto px-4 h-16 md:h-24 flex items-center justify-between gap-4">
            <div 
              className="flex items-center gap-3 md:gap-4 cursor-pointer group shrink-0 active:scale-95 transition-all" 
              onClick={handleReset}
              role="button"
            >
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transition-transform">
                      <Briefcase size={22} fill="currentColor" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                    <CheckCircle2 size={10} className="text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h1 className="font-black text-blue-700 text-[10px] md:text-xs leading-none tracking-[0.2em] uppercase">Sarkar Ki Naukari</h1>
                  <span className="font-black text-slate-900 text-sm md:text-2xl leading-none tracking-tight">Smart Job Finder</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-5">
                <div className="flex bg-slate-100/80 p-1 md:p-1.5 rounded-2xl border border-slate-200/50">
                    <button 
                      onClick={() => setLang('en')} 
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-black transition-all ${lang === 'en' ? 'bg-white text-blue-700 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      ENG
                    </button>
                    <button 
                      onClick={() => setLang('hi')} 
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-black transition-all ${lang === 'hi' ? 'bg-white text-blue-700 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      हिन्दी
                    </button>
                </div>
                
                <button 
                  onClick={() => setViewSavedOnly(!viewSavedOnly)} 
                  className={`group w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border-2 transition-all relative active:scale-90 ${viewSavedOnly ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-lg shadow-rose-500/10' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600'}`}
                >
                  <Heart size={24} fill={viewSavedOnly ? "currentColor" : "none"} strokeWidth={2} />
                  {savedJobIds.length > 0 && !viewSavedOnly && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {savedJobIds.length}
                    </span>
                  )}
                </button>
                
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 active:scale-90 transition-all shadow-xl shadow-slate-900/10"
                >
                  <Bell size={24} />
                </button>
            </div>
        </div>
      </header>

      <main className="flex-grow relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-28">
            {!viewSavedOnly && (
                <>
                    {!hasSearched && (
                        <div className="text-center mb-16 md:mb-24">
                            <div className="flex flex-wrap justify-center items-center gap-3 mb-10">
                                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-blue-200/50 bg-blue-50/50 backdrop-blur-sm shadow-sm relative overflow-hidden group">
                                    <Sparkles size={16} className="text-amber-500 relative z-10" />
                                    <span className="text-blue-800 text-[11px] font-black uppercase tracking-[0.15em] relative z-10">#1 trusted job finder</span>
                                </div>
                                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-emerald-200/50 bg-emerald-50/50 backdrop-blur-sm shadow-sm relative overflow-hidden">
                                    <Zap size={16} className="text-emerald-500 relative z-10 fill-emerald-500" />
                                    <span className="text-emerald-800 text-[11px] font-black uppercase tracking-[0.15em] relative z-10">Free Alert System Active</span>
                                </div>
                            </div>
                            
                            <h2 className="text-6xl md:text-9xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.85] max-w-5xl mx-auto">
                                Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Eligibility</span> Engine
                            </h2>
                            
                            <p className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto mb-16 font-medium leading-relaxed px-4 opacity-90">
                                Stop searching, start qualifying. Discover 500+ government vacancies tailored specifically to your profile.
                            </p>
                        </div>
                    )}
                    
                    <div className="mb-24 relative z-20">
                        <FilterForm profile={userProfile} onChange={handleProfileChange} onSubmit={handleSearch} onReset={handleReset} text={t} errors={formErrors} />
                    </div>

                    {!viewSavedOnly && (
                      <div className="mb-24">
                        <div className="relative group overflow-hidden rounded-[3rem] p-8 md:p-14 bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-900 text-white shadow-2xl shadow-indigo-500/30">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform duration-1000"></div>
                          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
                          
                          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="text-center lg:text-left lg:max-w-xl">
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest mb-6">
                                <Zap size={14} className="fill-amber-300" /> Free Alert System
                              </div>
                              <h3 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">
                                Never Miss a <span className="text-amber-400 italic">Deadline</span> Again.
                              </h3>
                              <p className="text-lg md:text-xl text-blue-100 mb-10 font-medium opacity-90">
                                Get instant notifications on WhatsApp and Telegram. Join 50,000+ serious aspirants receiving daily job updates.
                              </p>
                              
                              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                  <MessageSquare size={20} className="text-green-400" />
                                  <span className="font-bold text-sm">WhatsApp Alerts</span>
                                </div>
                                <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                  <Send size={20} className="text-sky-400" />
                                  <span className="font-bold text-sm">Telegram Group</span>
                                </div>
                                <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                  <Clock size={20} className="text-amber-400" />
                                  <span className="font-bold text-sm">Reminders</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="shrink-0 relative">
                                <button 
                                  onClick={() => setIsModalOpen(true)}
                                  className="relative group/btn w-48 h-48 md:w-64 md:h-64 rounded-full bg-white text-blue-800 flex flex-col items-center justify-center gap-4 shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
                                >
                                  <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover/btn:rotate-12 transition-transform">
                                    <Bell size={36} md:size={48} fill="currentColor" />
                                  </div>
                                  <div className="text-center">
                                    <span className="block font-black text-xl md:text-2xl uppercase tracking-tighter">Activate Now</span>
                                    <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase">It's 100% Free</span>
                                  </div>
                                </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!hasSearched && (
                        <div className="mb-12">
                             <div className="flex items-center justify-between mb-12">
                               <h3 className="text-2xl md:text-4xl font-black text-slate-900 flex items-center gap-5">
                                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                    <Zap size={24} fill="white" />
                                  </div>
                                  Newest Job Updates
                               </h3>
                               <button onClick={handleSearch} className="hidden md:flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest hover:gap-4 transition-all group">
                                 Check Full Eligibility <ChevronRight size={18} />
                               </button>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                       <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
                          <div className="flex space-x-3 min-w-max">
                              {JOB_CATEGORIES.map(cat => (
                                <button key={cat.id} onClick={() => setSelectedJobCategory(cat.id)} className={`flex items-center gap-2 px-7 py-4 rounded-2xl text-sm font-black border transition-all ${selectedJobCategory === cat.id ? 'bg-blue-600 text-white border-blue-600 shadow-2xl scale-105' : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'}`}>
                                    {cat.label}
                                </button>
                              ))}
                          </div>
                       </div>
                     )}

                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                         <h3 className="text-3xl md:text-5xl font-black text-slate-900 flex items-center gap-5">
                            {viewSavedOnly ? (
                                <><div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white"><Heart size={24} fill="white" /></div> {t.yourSaved}</>
                            ) : (
                                <><div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white"><Sparkles size={24} fill="white" /></div> {displayedJobs.length} {t.eligibleJobs}</>
                            )}
                        </h3>
                        {isSearching && (
                          <div className="flex items-center gap-3 px-5 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 font-black text-xs uppercase tracking-widest">
                            <Clock className="size-4" /> Optimizing Results...
                          </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                            <div className="col-span-full text-center py-28 bg-white/50 backdrop-blur-sm rounded-[4rem] border-2 border-dashed border-slate-200/80 px-8 shadow-xl shadow-slate-200/20">
                                <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-slate-300">
                                  <Frown size={56} />
                                </div>
                                <h3 className="text-4xl font-black text-slate-900 mb-4">No Matches Found</h3>
                                <p className="text-xl text-slate-500 mb-12 max-w-sm mx-auto leading-relaxed">Don't lose hope. New vacancies are listed every morning at 10 AM.</p>
                                <button onClick={handleReset} className="bg-slate-900 text-white font-black px-14 py-5 rounded-[2rem] hover:bg-blue-600 transition-all text-lg shadow-2xl shadow-slate-900/20 flex items-center gap-3 mx-auto">
                                  Try New Filters <RotateCcw size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </main>

      <Footer text={t} />

      <NotificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} profile={userProfile} job={selectedJob} savedPreferences={alertPreferences} onSavePreferences={handleSavePreferences} />
    </div>
  );
}

const RotateCcw = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);

export default App;