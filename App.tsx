import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Briefcase, Frown, Bell, Heart, Sparkles, FileText, Landmark, Train, Shield, GraduationCap, MapPin, Zap, CheckCircle2, Clock, ChevronRight, BellRing, Users, ShieldCheck, Trophy, Flame, ExternalLink, Info, ArrowLeft, Menu } from 'lucide-react';
import { MOCK_JOBS, TRANSLATIONS } from './constants';
import { UserProfile, Gender, Job, AlertPreferences, JobStatus, CompetitionLevel, Category, SiteConfig, QuickLink } from './types';
import { checkEligibility, getJobCategory } from './services/jobService';
import FilterForm from './components/FilterForm';
import JobCard from './components/JobCard';
import NotificationModal from './components/NotificationModal';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import JobDetail from './components/JobDetail';

const IndianFlag = () => (
  <div className="inline-flex flex-col w-6 h-4 md:w-8 md:h-5 border border-slate-200 rounded-sm overflow-hidden shrink-0 shadow-sm mx-auto">
    <div className="h-1/3 bg-[#FF9933]"></div>
    <div className="h-1/3 bg-white flex items-center justify-center relative">
      <div className="w-[3px] h-[3px] md:w-[4px] md:h-[4px] rounded-full border border-[#000080] flex items-center justify-center">
        <div className="w-[1px] h-[1px] md:w-[2px] md:h-[2px] rounded-full bg-[#000080]"></div>
      </div>
    </div>
    <div className="h-1/3 bg-[#138808]"></div>
  </div>
);

const DEFAULT_CONFIG: SiteConfig = {
  hero: {
    titlePrefix: "Smart",
    titleGradient: "Eligibility",
    titleSuffix: "Engine",
    description: "Check your eligibility for hundreds of government jobs across India. Enter your details and discover opportunities tailored for you.",
    showFlag: true,
    showLoginPill: true,
    loginPillText: "(No Login Required)"
  },
  lists: {
    results: [
      { id: 'r1', text: "UP Police Computer Operator 2023 Final Result", url: "#" },
      { id: 'r2', text: "RSSB NHM Contractual Various Post Result 2026", url: "#" },
      { id: 'r3', text: "RSSB 4th Class Employee 2024 Revised Result with Cutoff", url: "#" },
      { id: 'r4', text: "Oriental Insurance OICL AO Result 2026", url: "#" },
      { id: 'r5', text: "UPPSC LT Grade Assistant Teacher Result 2026", url: "#" },
      { id: 'r6', text: "MPESB Excise Constable 2025 Result", url: "#" },
      { id: 'r7', text: "SSC Selection Post 13th Result 2026", url: "#" },
      { id: 'r8', text: "RPSC RAS 2023 Final Result", url: "#" },
      { id: 'r9', text: "SBI Clerk 2024 Third Waiting List", url: "#" },
      { id: 'r10', text: "UPPSC Assistant Registrar 2024 Result", url: "#" }
    ],
    admitCards: [
      { id: 'a1', text: "Application Status CEN 07/2025", url: "#" },
      { id: 'a2', text: "UP Police SI / ASI 2023 Typing Test Exam Date", url: "#" },
      { id: 'a3', text: "UPPSC 2024 Interview Letter", url: "#" },
      { id: 'a4', text: "UP Police Home Guard Exam Date, Sample OMR Instruction 2026", url: "#" },
      { id: 'a5', text: "UP Police Constable Sample OMR Sheet Instruction 2026", url: "#" },
      { id: 'a6', text: "Railway Group D CEN 08/2024 Admit Card", url: "#" }
    ],
    latestJobs: [
      { id: 'l1', text: "MPESB Primary Teacher PSTST 2025 Update Qualification", url: "#" },
      { id: 'l2', text: "Haryana HPSC HCS Online Form 2026", url: "#" },
      { id: 'l3', text: "HSSC Stenographer Online Form 2026", url: "#" },
      { id: 'l4', text: "Railway RRB Group D Online Form 2026", url: "#" },
      { id: 'l5', text: "PNB Apprentices Online Form 2026", url: "#" }
    ],
    answerKeys: [
      { id: 'ak1', text: "SSC CGL 2024 Answer Key Out", url: "#" }
    ]
  },
  banner: {
    badgeText: "🚀 Missed the last date? Never again!",
    title: "Get",
    highlight: "Free Alerts",
    description: "Get instant alerts for new vacancies, syllabus updates, and deadline reminders.",
    buttonText: "Get Free Alerts"
  },
  settings: {
    siteName: "Sarkar Ki Naukari",
    primaryColor: "#1e293b",
    accentColor: "#f97316",
    footerText: "© 2024 Smart Govt Job Finder. All rights reserved.",
    telegramLink: "https://t.me/sarkarinaukari",
    whatsappLink: "https://wa.me/sarkarinaukari",
    enableNotifications: true
  }
};

type ViewMode = 'home' | 'job-detail' | 'admin';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [config, setConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem('sarkar_site_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch (e) { return DEFAULT_CONFIG; }
  });

  const [allJobs, setAllJobs] = useState<Job[]>(() => {
    try {
      const savedJobs = localStorage.getItem('sarkar_jobs_db');
      return savedJobs ? JSON.parse(savedJobs) : MOCK_JOBS;
    } catch (e) { return MOCK_JOBS; }
  });

  useEffect(() => {
    const handleNavigation = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setViewMode('admin');
      } else if (hash.startsWith('#job/')) {
        const id = hash.replace('#job/', '');
        setSelectedJobId(id);
        setViewMode('job-detail');
      } else {
        setViewMode('home');
      }
    };

    handleNavigation();
    window.addEventListener('hashchange', handleNavigation);
    return () => window.removeEventListener('hashchange', handleNavigation);
  }, []);

  const handleUpdateJobs = (updatedJobs: Job[]) => {
    setAllJobs(updatedJobs);
    try { localStorage.setItem('sarkar_jobs_db', JSON.stringify(updatedJobs)); } catch (e) {}
  };

  const handleUpdateConfig = (newConfig: SiteConfig) => {
    setConfig(newConfig);
    try { localStorage.setItem('sarkar_site_config', JSON.stringify(newConfig)); } catch (e) {}
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
  const [selectedJobForAlert, setSelectedJobForAlert] = useState<Job | null>(null);
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
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAlerts = (job?: Job) => {
    setSelectedJobForAlert(job || null);
    setIsModalOpen(true);
  };

  const handleSavePreferences = (prefs: AlertPreferences) => {
    setAlertPreferences(prefs);
    try { localStorage.setItem('alertPreferences', JSON.stringify(prefs)); } catch (e) {}
  };

  const handleViewJob = (id: string) => {
    window.location.hash = `#job/${id}`;
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

  const displayedJobs = hasSearched || viewSavedOnly ? eligibleJobs : [];

  const activeDetailedJob = useMemo(() => {
    return allJobs.find(j => j.id === selectedJobId);
  }, [allJobs, selectedJobId]);

  if (viewMode === 'admin') return <AdminPanel jobs={allJobs} onUpdateJobs={handleUpdateJobs} siteConfig={config} onUpdateConfig={handleUpdateConfig} />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900 w-full overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 md:px-8">
        <div className="max-w-6xl mx-auto h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={handleReset}>
            <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Briefcase className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-white border-2 border-white rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-blue-500 fill-white" />
                </div>
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-blue-600 text-[8px] md:text-[10px] uppercase tracking-[0.2em] leading-none">Sarkar Ki Naukari</h1>
              <span className="font-extrabold text-slate-900 text-sm md:text-xl">Smart Job Finder</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex bg-slate-100 p-1 rounded-2xl">
              <button onClick={() => setLang('en')} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-black transition-all ${lang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>ENG</button>
              <button onClick={() => setLang('hi')} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-black transition-all ${lang === 'hi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>हिन्दी</button>
            </div>
            <button onClick={() => setViewSavedOnly(!viewSavedOnly)} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-300 relative active:scale-95 transition-all">
                <Heart size={18} fill={viewSavedOnly ? "#ef4444" : "none"} stroke={viewSavedOnly ? "#ef4444" : "currentColor"} className="md:w-5 md:h-5" />
                {savedJobIds.length > 0 && !viewSavedOnly && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-rose-500 text-white text-[8px] md:text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">{savedJobIds.length}</span>
                )}
            </button>
            <button onClick={() => setIsModalOpen(true)} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {viewMode === 'job-detail' && activeDetailedJob ? (
          <div className="max-w-4xl mx-auto px-4 py-8 md:py-20 animate-in slide-in-from-right duration-500">
             <button 
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black text-[10px] md:text-xs uppercase tracking-widest mb-6 md:mb-8 transition-colors group"
             >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Search
             </button>
             <JobDetail 
                job={activeDetailedJob} 
                userProfile={debouncedUserProfile}
                onSetAlert={handleOpenAlerts}
                isBookmarked={savedJobIds.includes(activeDetailedJob.id)}
                onToggleBookmark={toggleBookmark}
                text={t}
             />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-8 md:py-20">
            {!viewSavedOnly && (
              <>
                {!hasSearched && (
                  <div className="text-center mb-10 md:mb-12 animate-in fade-in duration-700">
                    <div className="flex justify-center items-center gap-2 md:gap-3 mb-6 md:mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white rounded-full border border-slate-200 text-slate-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-sm">
                            <Sparkles size={10} className="text-amber-500 md:w-3 md:h-3" /> Trusted Job Tool
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[#f0fdf4] rounded-full border border-emerald-100 text-emerald-700 text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-sm">
                            <Zap size={10} fill="currentColor" className="text-emerald-500 md:w-3 md:h-3" /> Free Alerts
                        </div>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl lg:text-[80px] font-[900] text-slate-900 mb-6 tracking-tighter leading-[1.1] md:leading-[1] max-w-4xl mx-auto px-2">
                      {config.hero.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{config.hero.titleGradient}</span><br className="hidden sm:block" /> {config.hero.titleSuffix}
                    </h2>
                    
                    {config.hero.showFlag && <div className="mb-8 md:mb-10 flex justify-center"><IndianFlag /></div>}
                    
                    <div className="max-w-2xl mx-auto mb-12 md:mb-16">
                      <p className="text-slate-600 text-sm md:text-xl font-medium leading-relaxed px-4 mb-6 whitespace-pre-line">
                          {config.hero.description}
                      </p>
                      {config.hero.showLoginPill && (
                        <div className="inline-flex px-4 py-1.5 bg-gradient-to-r from-orange-500 to-fuchsia-600 rounded-full text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {config.hero.loginPillText}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mb-12 md:mb-16">
                  <FilterForm profile={userProfile} onChange={handleProfileChange} onSubmit={handleSearch} onReset={handleReset} text={t} errors={formErrors} />
                </div>

                {!hasSearched && (
                  <div className="mb-12 md:mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="flex flex-row overflow-x-auto lg:grid lg:grid-cols-3 gap-4 md:gap-6 pb-4 md:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory">
                      
                      {/* RESULT BOX */}
                      <div className="min-w-[280px] sm:min-w-[320px] lg:min-w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[400px] md:h-[520px] snap-start">
                        <div className="bg-[#6b21a8] p-3 md:p-4 text-center">
                          <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-widest">RESULT</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
                          <ul className="space-y-3">
                            {config.lists.results.map((item) => (
                              <li key={item.id} className="flex items-start gap-2.5 group">
                                <span className="text-slate-900 mt-1 shrink-0 text-[10px]">•</span>
                                <a href={item.url} className="text-[#2563eb] text-xs md:text-sm font-bold leading-snug group-hover:underline">
                                  {item.text}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* ADMIT CARD BOX */}
                      <div className="min-w-[280px] sm:min-w-[320px] lg:min-w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[400px] md:h-[520px] snap-start">
                        <div className="bg-[#2563eb] p-3 md:p-4 text-center">
                          <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-widest">ADMIT CARD</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
                          <ul className="space-y-3">
                            {config.lists.admitCards.map((item) => (
                              <li key={item.id} className="flex items-start gap-2.5 group">
                                <span className="text-slate-900 mt-1 shrink-0 text-[10px]">•</span>
                                <a href={item.url} className="text-[#2563eb] text-xs md:text-sm font-bold leading-snug group-hover:underline">
                                  {item.text}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* LATEST JOBS BOX */}
                      <div className="min-w-[280px] sm:min-w-[320px] lg:min-w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[400px] md:h-[520px] snap-start">
                        <div className="bg-[#b91c1c] p-3 md:p-4 text-center">
                          <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-widest">LATEST JOBS</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
                          <ul className="space-y-3">
                            {config.lists.latestJobs.map((item) => (
                              <li key={item.id} className="flex items-start gap-2.5 group">
                                <span className="text-slate-900 mt-1 shrink-0 text-[10px]">•</span>
                                <a href={item.url} className="text-[#2563eb] text-xs md:text-sm font-bold leading-snug group-hover:underline">
                                  {item.text}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {!hasSearched && (
                  <div className="mb-12 md:mb-16">
                    <div className="bg-[#f0f9ff] border border-blue-100 rounded-[2rem] p-8 md:p-12 text-center shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -ml-16 -mb-16"></div>
                      
                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-50">
                          <BellRing size={14} className="animate-bounce" /> {config.banner.badgeText}
                        </div>
                        <h3 className="text-2xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                          {config.banner.title} <span className="text-blue-600">{config.banner.highlight}</span>
                        </h3>
                        <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto mb-10 font-medium">
                          {config.banner.description}
                        </p>
                        
                        <button 
                          onClick={() => setIsModalOpen(true)}
                          className="bg-slate-900 text-white font-black px-8 md:px-12 py-4 md:py-5 rounded-2xl shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4 mx-auto group/btn"
                        >
                          <span className="text-xs md:text-sm uppercase tracking-widest">{config.banner.buttonText}</span>
                          <Zap size={20} fill="currentColor" className="text-amber-400 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">WhatsApp • Telegram • Email</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {(hasSearched || viewSavedOnly) && (
              <div id="results-section" className="animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <h3 className="text-xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                    {viewSavedOnly ? (
                      <><div className="w-8 h-8 md:w-10 md:h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white"><Heart size={18} fill="white" /></div> {t.yourSaved}</>
                    ) : (
                      <><div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Sparkles size={18} fill="white" /></div> {displayedJobs.length} {t.eligibleJobs}</>
                    )}
                  </h3>
                  {!viewSavedOnly && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                      {['All', 'SSC', 'Banking', 'Railways', 'Defence', 'Teaching', 'State Govt', 'UPSC'].map(cat => (
                        <button key={cat} onClick={() => setSelectedJobCategory(cat)} className={`px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${selectedJobCategory === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {displayedJobs.length > 0 ? (
                    displayedJobs.map(job => (
                      <JobCard key={job.id} job={job} userProfile={userProfile} onSetAlert={handleOpenAlerts} isBookmarked={savedJobIds.includes(job.id)} onToggleBookmark={toggleBookmark} text={t} isActive={selectedJobId === job.id} onViewDetails={() => handleViewJob(job.id)} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16 md:py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                      <Frown size={40} className="mx-auto text-slate-300 mb-4 md:w-12 md:h-12" />
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 px-4">No matching jobs found matching your profile</h3>
                      <button onClick={handleReset} className="mt-4 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm md:text-base">Reset Filters</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer text={t} />
      <NotificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} profile={userProfile} job={selectedJobForAlert} savedPreferences={alertPreferences} onSavePreferences={handleSavePreferences} />
    </div>
  );
}

export default App;