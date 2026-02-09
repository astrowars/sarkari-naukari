import React from 'react';
import { Job, UserProfile, Category } from '../types';
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
  BookOpen,
  IndianRupee,
  Info,
  ArrowRight,
  ShieldCheck,
  Award,
  AlertCircle,
  GraduationCap,
  Globe
} from 'lucide-react';

interface JobDetailProps {
  job: Job;
  userProfile: UserProfile;
  onSetAlert: (job: Job) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  text: any;
}

const JobDetail: React.FC<JobDetailProps> = ({ job, userProfile, onSetAlert, isBookmarked, onToggleBookmark, text }) => {
  const jobTag = getJobCategory(job);
  const relaxedMaxAge = getRelaxedMaxAge(job.max_age, userProfile.category as Category);
  const daysLeft = Math.max(0, Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  const handleShare = async () => {
    const shareText = `Govt Job Opportunity: ${job.job_name}\nDeadline: ${job.deadline}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: job.job_name, text: shareText, url: shareUrl });
      } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(`${shareText}\nLink: ${shareUrl}`);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative">
      {/* Header Banner */}
      <div className="relative min-h-[12rem] md:h-64 bg-slate-900 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-blue-500/10 rounded-full blur-[100px] md:blur-[120px]"></div>
         
         <div className="relative h-full flex flex-col justify-center px-6 md:px-12 py-8 md:py-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 rounded-full text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-4 w-fit border border-blue-400/30">
                <Award size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" /> {jobTag} Recruitment
            </div>
            <h1 className="text-2xl md:text-5xl font-black text-white leading-tight max-w-2xl tracking-tight">
                {job.job_name}
            </h1>
            <p className="text-slate-400 text-xs md:text-base font-bold mt-2 uppercase tracking-widest">
                {job.organization}
            </p>
         </div>
      </div>

      <div className="px-6 md:px-12 pb-24 md:pb-12">
         {/* Quick Grid Stats - Adjusted for Mobile Responsive */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 -mt-8 md:-mt-20 relative z-10 mb-8 md:mb-12">
            {[
                { icon: <Calendar className="text-blue-600" size={16} />, label: 'Last Date', val: job.deadline },
                { icon: <IndianRupee className="text-emerald-600" size={16} />, label: 'Salary', val: job.salary_range.split('(')[0] },
                { icon: <GraduationCap className="text-purple-600" size={16} />, label: 'Qual.', val: job.qualification },
                { icon: <MapPin className="text-rose-600" size={16} />, label: 'State', val: job.state },
            ].map((stat, i) => (
                <div key={i} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl border border-slate-100 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1 bg-slate-50 rounded-lg">{stat.icon}</div>
                        <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</span>
                    </div>
                    <p className="font-black text-slate-800 text-xs md:text-sm truncate">{stat.val}</p>
                </div>
            ))}
         </div>

         {/* Content Sections */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Left Main Content */}
            <div className="lg:col-span-2 space-y-10 md:space-y-12">
                <section>
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <div className="w-1 md:w-1.5 h-6 md:h-8 bg-blue-600 rounded-full"></div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Description</h2>
                    </div>
                    <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-medium">
                        {job.shortDescription || "No detailed description provided for this recruitment."}
                    </p>
                    <div className="mt-6 md:mt-8 p-5 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 flex items-start gap-4">
                        <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="font-bold text-slate-800 text-sm md:text-base mb-1">About Organization</p>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                                {job.organization} is a key {job.isCentral ? 'Central' : 'State'} government body managing this recruitment drive. 
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <div className="w-1 md:w-1.5 h-6 md:h-8 bg-emerald-600 rounded-full"></div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Eligibility</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center justify-between p-4 md:p-5 bg-white border border-slate-100 rounded-xl md:rounded-2xl">
                            <span className="font-bold text-slate-500 text-xs md:text-sm">Qualification</span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest">{job.qualification}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 md:p-5 bg-white border border-slate-100 rounded-xl md:rounded-2xl">
                            <span className="font-bold text-slate-500 text-xs md:text-sm">Standard Age</span>
                            <span className="font-black text-slate-800 text-xs md:text-base">{job.min_age} - {job.max_age} Years</span>
                        </div>
                        <div className="flex items-center justify-between p-4 md:p-5 bg-emerald-50 border border-emerald-100 rounded-xl md:rounded-2xl">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-800 text-xs md:text-sm">Your Limit</span>
                                <Info size={12} className="text-emerald-400 md:w-3.5 md:h-3.5" />
                            </div>
                            <span className="font-black text-emerald-700 text-xs md:text-base">{job.min_age} - {relaxedMaxAge} Years</span>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <div className="w-1 md:w-1.5 h-6 md:h-8 bg-orange-600 rounded-full"></div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Application Fee</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                        {[
                            { label: 'General / OBC', price: `₹${job.fees?.general || '0'}` },
                            { label: 'SC / ST / PH', price: `₹${job.fees?.sc_st || '0'}` },
                            { label: 'Female', price: '₹0' },
                        ].map((fee, i) => (
                            <div key={i} className="p-5 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl text-center border border-slate-100">
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{fee.label}</p>
                                <p className="text-lg md:text-xl font-black text-slate-800">{fee.price}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Right Sidebar - Action Column */}
            <div className="space-y-6 md:space-y-8">
                <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 lg:sticky lg:top-24">
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-rose-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                            <Clock size={12} /> {daysLeft} Days Left
                        </div>
                        <button 
                            onClick={() => onToggleBookmark(job.id)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${isBookmarked ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-300'}`}
                        >
                            <Heart size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>
                    </div>

                    <div className="space-y-4 mb-8">
                        <a 
                            href={job.apply_link} 
                            target="_blank" 
                            className="w-full h-12 md:h-14 bg-blue-600 text-white font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-3 text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Apply Now <ExternalLink size={18} />
                        </a>
                        <button 
                            onClick={handleShare}
                            className="w-full h-12 md:h-14 bg-white text-slate-700 border border-slate-200 font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-3 text-xs md:text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Share Job <Share2 size={18} />
                        </button>
                        <button 
                            onClick={() => onSetAlert(job)}
                            className="w-full h-12 md:h-14 bg-amber-50 text-amber-700 border border-amber-100 font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-3 text-xs md:text-sm uppercase tracking-widest hover:bg-amber-100 transition-all"
                        >
                            Set Reminder <Bell size={18} />
                        </button>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-200">
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Links</p>
                        <a href={job.notification_link || '#'} className="flex items-center justify-between p-3.5 md:p-4 bg-white rounded-xl md:rounded-2xl border border-slate-100 hover:border-blue-200 group transition-all">
                            <span className="font-bold text-xs md:text-sm text-slate-700 flex items-center gap-2">
                                <FileText size={16} className="text-slate-400 group-hover:text-blue-500 w-3.5 h-3.5 md:w-4 md:h-4" /> Notification
                            </span>
                            <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a href={job.syllabus_link || '#'} className="flex items-center justify-between p-3.5 md:p-4 bg-white rounded-xl md:rounded-2xl border border-slate-100 hover:border-blue-200 group transition-all">
                            <span className="font-bold text-xs md:text-sm text-slate-700 flex items-center gap-2">
                                <BookOpen size={16} className="text-slate-400 group-hover:text-blue-500 w-3.5 h-3.5 md:w-4 md:h-4" /> Syllabus
                            </span>
                            <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a href={job.official_website || '#'} className="flex items-center justify-between p-3.5 md:p-4 bg-white rounded-xl md:rounded-2xl border border-slate-100 hover:border-blue-200 group transition-all">
                            <span className="font-bold text-xs md:text-sm text-slate-700 flex items-center gap-2">
                                <Globe size={16} className="text-slate-400 group-hover:text-blue-500 w-3.5 h-3.5 md:w-4 md:h-4" /> Official Site
                            </span>
                            <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>

                <div className="p-6 md:p-8 bg-blue-600 rounded-[2rem] md:rounded-[3rem] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <ShieldCheck size={32} className="mb-4 text-blue-200 w-6 h-6 md:w-8 md:h-8" />
                        <h4 className="text-base md:text-lg font-black mb-1 md:mb-2">Verified Listing</h4>
                        <p className="text-blue-100 text-[10px] md:text-xs leading-relaxed font-medium">
                            Verified against latest official notifications.
                        </p>
                    </div>
                </div>
            </div>
         </div>
      </div>
      
      {/* Mobile Sticky Action Bar */}
      <div className="fixed lg:hidden bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex items-center gap-3 z-50">
        <button 
          onClick={() => onToggleBookmark(job.id)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all shrink-0 ${isBookmarked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-400'}`}
        >
            <Heart size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
        <a 
          href={job.apply_link} 
          target="_blank" 
          className="flex-1 h-12 bg-blue-600 text-white font-black rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
        >
          Apply Now <ExternalLink size={16} />
        </a>
      </div>

      {/* Footer Disclaimer */}
      <div className="bg-slate-50 px-6 md:px-12 py-4 md:py-6 flex items-center gap-3">
         <AlertCircle size={14} className="text-slate-400 w-3 h-3 md:w-3.5 md:h-3.5" />
         <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Cross-check details on the official website before applying.
         </p>
      </div>
    </div>
  );
};

export default JobDetail;