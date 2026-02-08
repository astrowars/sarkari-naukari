import React, { useState, useEffect } from 'react';
import { Job, CompetitionLevel, UserProfile, Category } from '../types';
import { getJobCategory, getRelaxedMaxAge } from '../services/jobService';
import { 
  MapPin, 
  ExternalLink, 
  Calendar, 
  Bell, 
  Clock, 
  Heart, 
  Share2, 
  FileText,
  Book,
  Banknote,
  Globe,
  Landmark,
  Train,
  School,
  Shield,
  CheckCircle2,
  Info
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  userProfile: UserProfile;
  onSetAlert: (job: Job) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  text: any;
  isActive?: boolean; 
}

const JobCard: React.FC<JobCardProps> = ({ job, userProfile, onSetAlert, isBookmarked, onToggleBookmark, text, isActive }) => {
  const [showAgeInfo, setShowAgeInfo] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [showSavedConfirm, setShowSavedConfirm] = useState(false);
  const [triggerBounce, setTriggerBounce] = useState(false);

  const jobTag = getJobCategory(job);
  const relaxedMaxAge = getRelaxedMaxAge(job.max_age, userProfile.category as Category);
  
  const getRelaxationBonus = () => {
    if (userProfile.category === Category.OBC) return 3;
    if (userProfile.category === Category.SC || userProfile.category === Category.ST) return 5;
    return 0;
  };
  
  const relaxationBonus = getRelaxationBonus();
  
  const userAge = Number(userProfile.age);
  const eligibleViaRelaxation = !isNaN(userAge) && userAge > job.max_age && userAge <= relaxedMaxAge;
  
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasBookmarked = isBookmarked;
    onToggleBookmark(job.id);
    
    if (!wasBookmarked) {
      setShowSavedConfirm(true);
      setTriggerBounce(true);
      setTimeout(() => {
        setShowSavedConfirm(false);
        setTriggerBounce(false);
      }, 2000);
    }
  };

  const handleShare = async () => {
    const shareText = `Govt Job Alert: ${job.job_name}\nLocation: ${job.state}\nEligibility: ${job.qualification}\nApply by: ${job.deadline}`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({ title: job.job_name, text: shareText, url: shareUrl });
      } catch (err) { console.error(err); }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\nLink: ${shareUrl}`);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      } catch (err) { console.error('Failed to copy', err); }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SSC': return <FileText size={14} />;
      case 'Banking': return <Landmark size={14} />;
      case 'Defence': return <Shield size={14} />;
      case 'Railways': return <Train size={14} />;
      case 'Teaching': return <School size={14} />;
      default: return <Globe size={14} />;
    }
  };

  const getCompetitionStyle = (level: CompetitionLevel) => {
    switch (level) {
      case CompetitionLevel.LOW: 
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case CompetitionLevel.MEDIUM: 
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case CompetitionLevel.HIGH: 
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    }
  };

  const daysLeft = Math.max(0, Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  const compStyle = getCompetitionStyle(job.competition_level);

  return (
    <div 
      data-job-id={job.id}
      className={`group relative flex flex-col h-full rounded-[2.5rem] border p-7 md:p-8 pt-10 md:pt-12 transition-all duration-300 overflow-visible shadow-lg ${
        isActive 
          ? 'scale-[1.03] bg-white shadow-blue-500/20 border-blue-500 z-10 ring-8 ring-blue-500/10' 
          : 'bg-gradient-to-br from-white to-blue-50/30 border-blue-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5'
      }`}
    >
      
      {/* Category Tag with higher contrast */}
      <div className="absolute top-0 left-8 -translate-y-1/2 z-30">
        <div className={`flex items-center gap-2 px-6 py-2.5 rounded-full shadow-lg border-2 border-white text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${isActive ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'}`}>
          {getCategoryIcon(jobTag)}
          {jobTag === 'Other' || jobTag === 'State Govt' ? 'National' : jobTag}
        </div>
      </div>

      {(shareToast || showSavedConfirm) && (
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-14 px-5 py-2 rounded-full z-50 shadow-2xl flex items-center gap-2 font-black text-[11px] uppercase tracking-widest transition-all ${showSavedConfirm ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>
          {showSavedConfirm ? <><CheckCircle2 size={14} /> Job Saved!</> : 'Link Copied!'}
        </div>
      )}

      <div className="flex justify-between items-start gap-4 mb-2">
        <div className="flex-1">
          <h3 className={`text-2xl md:text-3xl font-black leading-tight transition-colors duration-200 ${isActive ? 'text-blue-900' : 'text-blue-700'}`}>
            {job.job_name}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-slate-500 font-bold">
            <MapPin size={18} className={isActive ? 'text-blue-500' : 'text-slate-300'} />
            <span className="text-sm md:text-base">{job.state}</span>
          </div>
        </div>
        
        <button 
          onClick={handleBookmarkClick}
          className={`shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-all rounded-[1.25rem] border-2 relative active:scale-90 ${
            isBookmarked 
              ? 'bg-rose-50 border-rose-500 text-rose-500 shadow-xl shadow-rose-500/20 scale-110' 
              : 'bg-white border-slate-200 text-slate-300 hover:border-rose-300 hover:text-rose-400'
          }`}
          aria-label="Bookmark"
        >
          <Heart 
            size={24} 
            fill={isBookmarked ? "currentColor" : "none"} 
            strokeWidth={2} 
            className="transition-transform" 
          />
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5 mb-8">
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 shadow-sm ${compStyle.bg} ${compStyle.border} ${compStyle.text} text-[11px] font-black uppercase tracking-wide`}>
          <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
          {job.competition_level}
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white/80 text-slate-600 text-[11px] font-black uppercase tracking-wide shadow-sm">
          <Banknote size={14} className="text-slate-400" />
          {job.salary_range}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          className={`p-5 rounded-3xl border relative group/age cursor-help shadow-sm transition-all duration-200 ${
            eligibleViaRelaxation 
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/10' 
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
          onMouseEnter={() => setShowAgeInfo(true)}
          onMouseLeave={() => setShowAgeInfo(false)}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age Limit</p>
            {relaxationBonus > 0 && (
              <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                Relaxed
              </span>
            )}
          </div>
          <p className="font-black text-slate-700 text-lg md:text-xl">
            {job.min_age} - {relaxedMaxAge} <span className="text-sm text-slate-400 font-bold">Yrs</span>
          </p>
          
          {eligibleViaRelaxation && (
            <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 size={10} /> {userProfile.category} Bonus
            </p>
          )}

          {showAgeInfo && (
            <div className="absolute left-0 right-0 -bottom-2 translate-y-full bg-slate-900 text-white p-5 rounded-2xl text-[10px] font-bold z-[50] shadow-2xl border border-slate-700">
               <div className="flex items-center gap-2 mb-3 text-blue-400 border-b border-white/10 pb-2">
                  <span className="uppercase tracking-widest flex items-center gap-2"><Info size={14} /> Age Relaxation</span>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Limit:</span> <span className="text-white">{job.max_age}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{userProfile.category || 'Res.'} Bonus:</span> <span className="text-emerald-400">+{relaxationBonus} Yrs</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between text-sm">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Your Limit:</span> 
                    <span className="text-blue-400">{relaxedMaxAge} Yrs</span>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm hover:border-blue-300 transition-colors">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Qualification</p>
          <p className="font-black text-slate-700 text-lg md:text-xl truncate">
            {job.qualification}
          </p>
        </div>
      </div>

      <div className={`p-4 md:p-5 rounded-3xl border mb-8 flex items-center justify-between shadow-inner transition-colors duration-300 ${isActive ? 'border-blue-200 bg-blue-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-blue-600">
            <Calendar size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Deadline</p>
            <p className="font-black text-slate-900 text-sm md:text-base">
              {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-800 text-[11px] font-black flex items-center gap-2">
          <Clock size={14} className="text-rose-500" />
          {daysLeft} Days Left
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button 
            onClick={() => window.open(job.notification_link || '#', '_blank')}
            className="flex-1 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-xs md:text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-all border border-blue-200/50"
          >
            <FileText size={18} strokeWidth={2.5} /> Notification
          </button>
          <button 
            onClick={() => window.open(job.syllabus_link || '#', '_blank')}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs md:text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-all border border-slate-200/50"
          >
            <Book size={18} strokeWidth={2.5} /> Syllabus
          </button>
        </div>

        <div className="flex gap-2.5 md:gap-3">
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => onSetAlert(job)}
              className="w-14 h-14 bg-amber-50 border-2 border-amber-300 text-amber-600 rounded-[1.5rem] flex items-center justify-center hover:bg-amber-100 transition-all shadow-lg shadow-amber-500/10 active:scale-95 group/bell"
              title="Activate Free Alerts"
            >
              <Bell size={24} strokeWidth={2.5} />
            </button>
            <button 
              onClick={handleShare}
              className="w-14 h-14 bg-white border-2 border-slate-200 text-slate-400 rounded-[1.5rem] flex items-center justify-center hover:bg-slate-50 hover:border-slate-400 hover:text-slate-600 transition-all shadow-sm active:scale-95"
              title="Share Job"
            >
              <Share2 size={20} strokeWidth={2} />
            </button>
          </div>
          
          <a 
            href={job.apply_link} 
            target="_blank" 
            rel="noreferrer" 
            className={`flex-1 h-14 font-black rounded-[1.5rem] flex items-center justify-center gap-3 text-base md:text-lg uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] border-b-4 ${isActive ? 'bg-blue-700 hover:bg-blue-800 text-white border-blue-900/20 shadow-blue-700/30' : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-800/20 shadow-blue-500/25'}`}
          >
            Apply <ExternalLink size={20} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobCard;