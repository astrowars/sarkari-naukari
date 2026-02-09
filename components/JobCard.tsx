import React, { useState } from 'react';
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
  CheckCircle2,
  Info,
  BookOpen,
  Shield,
  ShieldCheck,
  Landmark,
  Train,
  GraduationCap,
  Briefcase,
  Eye
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  userProfile: UserProfile;
  onSetAlert: (job: Job) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  text: any;
  isActive?: boolean;
  onViewDetails: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, userProfile, onSetAlert, isBookmarked, onToggleBookmark, text, isActive = false, onViewDetails }) => {
  const [shareToast, setShareToast] = useState(false);
  const [showSavedConfirm, setShowSavedConfirm] = useState(false);
  const [showAgeDetail, setShowAgeDetail] = useState(false);

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
      setTimeout(() => setShowSavedConfirm(false), 2000);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Govt Job Alert: ${job.job_name}\nLocation: ${job.state}\nEligibility: ${job.qualification}\nApply by: ${job.deadline}`;
    const shareUrl = `${window.location.origin}/#job/${job.id}`;

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

  const getCompetitionStyle = (level: CompetitionLevel) => {
    switch (level) {
      case CompetitionLevel.LOW: 
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' };
      case CompetitionLevel.MEDIUM: 
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' };
      case CompetitionLevel.HIGH: 
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SSC': return <ShieldCheck size={12} />;
      case 'Banking': return <Landmark size={12} />;
      case 'Railways': return <Train size={12} />;
      case 'Defence': return <Shield size={12} />;
      case 'Teaching': return <GraduationCap size={12} />;
      case 'State Govt': return <MapPin size={12} />;
      default: return <Briefcase size={12} />;
    }
  };

  const daysLeft = Math.max(0, Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  const compStyle = getCompetitionStyle(job.competition_level);

  const displayCategory = jobTag.toUpperCase() === 'OTHER' || jobTag.toUpperCase() === 'STATE GOVT' ? 'NATIONAL' : jobTag.toUpperCase();

  return (
    <div 
      onClick={onViewDetails}
      className={`group relative flex flex-col bg-white rounded-[2.5rem] p-6 md:p-8 transition-all duration-500 border cursor-pointer
        ${isActive 
          ? 'border-blue-500 shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] ring-2 ring-blue-500/10 scale-[1.02]' 
          : 'border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)] hover:scale-[1.01]'
        }`}
    >
      {/* Top Category Badge */}
      <div className="absolute top-0 left-10 -translate-y-1/2 z-10">
        <div className={`flex items-center gap-2 px-6 py-1.5 rounded-full text-white shadow-lg border border-white text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'bg-blue-700' : 'bg-blue-600'}`}>
          {getCategoryIcon(jobTag)}
          {displayCategory}
        </div>
      </div>

      {(shareToast || showSavedConfirm) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full z-[100] shadow-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-wider bg-slate-900 text-white">
          {showSavedConfirm ? <><CheckCircle2 size={12} className="text-emerald-400" /> Saved</> : 'Link Copied'}
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className={`text-xl md:text-2xl font-black leading-tight transition-colors group-hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-blue-900'}`}>
            {job.job_name}
          </h3>
          <div className="flex items-center gap-1.5 mt-2 text-slate-400">
            <MapPin size={16} />
            <span className="text-sm font-bold">{job.state}</span>
          </div>
        </div>
        
        <button 
          onClick={handleBookmarkClick}
          className={`shrink-0 w-10 h-10 flex items-center justify-center transition-all rounded-full border shadow-sm active:scale-90 ${
            isBookmarked 
              ? 'bg-rose-50 border-rose-200 text-rose-500' 
              : 'bg-white border-slate-100 text-slate-200'
          }`}
        >
          <Heart size={20} fill={isBookmarked ? "currentColor" : "none"} strokeWidth={2.5} />
        </button>
      </div>

      {/* Status Tags */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className={`px-4 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-colors ${compStyle.bg} ${compStyle.border} ${compStyle.text}`}>
          ● {job.competition_level}
        </div>
        <div className="px-4 py-1 rounded-lg border border-slate-100 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
          {job.salary_range}
        </div>
      </div>

      {/* Main Grid: Age and Qualification */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            eligibleViaRelaxation 
              ? 'bg-emerald-50/50 border-emerald-100' 
              : 'bg-[#f8faff] border-blue-50'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setShowAgeDetail(!showAgeDetail);
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age Limit</p>
              <Info size={10} className={`transition-colors ${showAgeDetail ? 'text-blue-500' : 'text-slate-300'}`} />
            </div>
            {eligibleViaRelaxation && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black rounded uppercase">Relaxed</span>
            )}
          </div>
          <p className="font-black text-slate-800 text-base md:text-lg">
            {job.min_age} - {relaxedMaxAge} <span className="text-xs text-slate-400">Yrs</span>
          </p>

          {showAgeDetail && (
            <div className="absolute bottom-full left-0 mb-4 w-60 p-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] leading-relaxed shadow-2xl z-50 border border-blue-500/30">
              <div className="font-black mb-3 uppercase tracking-wider text-blue-400 border-b border-slate-700 pb-2">Age Details</div>
              <div className="space-y-1">
                <p>Standard Max: {job.max_age}</p>
                <p className="text-emerald-400">Relaxation: +{relaxationBonus} Yrs</p>
                <p className="pt-2 border-t border-slate-700 font-bold">Total Max: {relaxedMaxAge}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl border border-blue-50 bg-[#f8faff]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Qualification</p>
          <p className="font-black text-slate-800 text-base md:text-lg">
            {job.qualification}
          </p>
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-auto flex gap-3 pt-4 border-t border-slate-50">
        <button 
          onClick={(e) => { e.stopPropagation(); onSetAlert(job); }}
          className="w-12 h-12 shrink-0 bg-white border border-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:text-blue-600 hover:border-blue-100 transition-all"
        >
          <Bell size={20} />
        </button>
        <button 
          onClick={handleShare}
          className="w-12 h-12 shrink-0 bg-white border border-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:text-blue-600 hover:border-blue-100 transition-all"
        >
          <Share2 size={20} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
          className="flex-1 bg-slate-900 text-white font-black rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-blue-600 transition-all"
        >
          <Eye size={16} /> View Details
        </button>
      </div>
    </div>
  );
};

export default JobCard;