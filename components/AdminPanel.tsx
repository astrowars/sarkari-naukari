import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, FileText, Users, Bell, LogOut, Plus, Edit, Trash2, 
  Save, X, CheckCircle2, AlertTriangle, Search, Eye, Shield, Settings, 
  Globe, List, PenTool, ExternalLink, Filter, Copy, Archive, History, 
  CheckCircle, Clock, Smartphone, Mail, Briefcase, Landmark, BookOpen, 
  IndianRupee, Calendar as CalendarIcon, Info, ChevronRight, Menu, 
  Send, Key, Layout
} from 'lucide-react';
import { 
  Job, JobStatus, Qualification, Category, Gender, CompetitionLevel, 
  SiteConfig, QuickLink, AdminRole, AdminUser, AuditLogEntry, AlertType, NotificationChannel
} from '../types';

interface AdminPanelProps {
  jobs: Job[];
  onUpdateJobs: (jobs: Job[]) => void;
  siteConfig: SiteConfig;
  onUpdateConfig: (config: SiteConfig) => void;
}

type AdminView = 'dashboard' | 'jobs' | 'editor' | 'results' | 'notifications' | 'users' | 'settings' | 'audit';

const AdminPanel: React.FC<AdminPanelProps> = ({ jobs, onUpdateJobs, siteConfig, onUpdateConfig }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Authentication & Mock Admin Data
  const [currentUser] = useState<AdminUser>({
    id: 'admin-1',
    name: 'Super Admin',
    email: 'admin@sarkari.com',
    role: AdminRole.SUPER_ADMIN,
    status: 'Active'
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    { id: '1', adminName: 'Super Admin', action: 'Published', affectedItem: 'SSC CGL 2024 Notification', timestamp: Date.now() - 3600000 },
    { id: '2', adminName: 'Editor One', action: 'Updated', affectedItem: 'UP Police Admit Card', timestamp: Date.now() - 86400000 },
  ]);

  // View States
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<Job>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'All'>('All');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.email === 'admin@sarkari.com' && authForm.password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials (Try admin@sarkari.com / admin123)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    window.location.hash = '';
  };

  const addAuditLog = (action: string, item: string) => {
    const newLog: AuditLogEntry = {
      id: Date.now().toString(),
      adminName: currentUser.name,
      action,
      affectedItem: item,
      timestamp: Date.now(),
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const handleSaveJob = () => {
    if (!editingJob.job_name || !editingJob.deadline) {
      alert("Job Name and Deadline are required");
      return;
    }
    const newJob = { 
      ...editingJob, 
      id: editingJob.id || Date.now().toString(),
      status: editingJob.status || JobStatus.DRAFT,
      required_streams: editingJob.required_streams || ['Any'],
      fees: editingJob.fees || { general: '0', obc: '0', sc_st: '0' },
      dates: editingJob.dates || { start: '', end: '', exam: '' },
      seo: editingJob.seo || { metaTitle: '', metaDescription: '', slug: '' }
    } as Job;
    
    const updatedJobs = editingJob.id ? jobs.map(j => j.id === newJob.id ? newJob : j) : [newJob, ...jobs];
    onUpdateJobs(updatedJobs);
    addAuditLog(editingJob.id ? 'Updated Job' : 'Created Job', newJob.job_name);
    setIsJobFormOpen(false);
    setEditingJob({});
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchesSearch = j.job_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           j.organization.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || j.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-10 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-[900] text-slate-900 tracking-tight">Enterprise Admin</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Management Portal v2.5</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Login Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 font-medium" placeholder="admin@sarkari.com" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 font-medium" placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-lg font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
              Secure Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`bg-slate-900 text-white flex-col transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex h-full fixed`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800 shrink-0">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3 shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          {isSidebarOpen && <span className="font-black text-lg tracking-tight">SarkarAdmin</span>}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'jobs', icon: FileText, label: 'Jobs Manager' },
            { id: 'results', icon: CheckCircle, label: 'Results & Links' },
            { id: 'editor', icon: Globe, label: 'Web Customizer' },
            { id: 'notifications', icon: Bell, label: 'Broadcasts' },
            { id: 'users', icon: Users, label: 'Admins' },
            { id: 'settings', icon: Settings, label: 'Settings' },
            { id: 'audit', icon: History, label: 'Audit Logs' },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setCurrentView(item.id as AdminView)}
              className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all group ${currentView === item.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              title={item.label}
            >
              <item.icon size={20} className={currentView === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
              {isSidebarOpen && <span className="text-sm font-bold">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-4 w-full p-3 text-slate-500 hover:text-white transition-colors group">
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Layout size={14} /> System Status: <span className="text-emerald-500">All Systems Normal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-black text-slate-900">{currentUser.name}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUser.role}</span>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-slate-50 overflow-hidden flex items-center justify-center">
               <Users size={20} className="text-slate-400" />
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">
          {/* DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Operational Overview</h2>
                  <p className="text-slate-400 text-sm font-medium">Real-time stats for {new Date().toLocaleDateString()}</p>
                </div>
                <button onClick={() => setCurrentView('jobs')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-900/10 hover:translate-y-[-2px] transition-all active:scale-95">
                  <Plus size={16} /> Add New Entry
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                  { label: 'Active Listings', val: jobs.filter(j => j.status === JobStatus.ACTIVE).length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Expiring Soon', val: jobs.filter(j => j.status === JobStatus.ACTIVE).slice(0, 2).length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { label: 'Added Today', val: 0, icon: Plus, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Pending Review', val: jobs.filter(j => j.status === JobStatus.DRAFT).length, icon: Eye, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{stat.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Recent Activity Stream</h3>
                  <button onClick={() => setCurrentView('audit')} className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1">View Full Logs <ChevronRight size={14} /></button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Item</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {auditLogs.slice(0, 5).map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-700 text-sm">{log.adminName}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${log.action === 'Published' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium">{log.affectedItem}</td>
                          <td className="px-6 py-4 text-xs text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* JOBS MANAGER VIEW */}
          {currentView === 'jobs' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Recruitment Hub</h2>
                  <p className="text-slate-400 text-sm font-medium">Manage and monitor all ongoing government job listings.</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search jobs..." 
                      className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 text-sm font-medium w-full sm:w-64"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button onClick={() => { setEditingJob({}); setIsJobFormOpen(true); }} className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/10 hover:bg-orange-600 transition-all flex items-center gap-2 shrink-0">
                    <Plus size={18} /> New Job
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center gap-3 overflow-x-auto scrollbar-hide">
                  {['All', JobStatus.ACTIVE, JobStatus.DRAFT, JobStatus.CLOSED, JobStatus.EXPIRED].map(status => (
                    <button 
                      key={status} 
                      onClick={() => setStatusFilter(status as any)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Name / Org</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">State</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredJobs.map(job => (
                        <tr key={job.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-black text-slate-800 text-sm leading-tight mb-1">{job.job_name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{job.organization || 'Govt of India'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                               <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {job.qualification}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-500">{job.state}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-400">{job.deadline}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tight ${
                              job.status === JobStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600' : 
                              job.status === JobStatus.DRAFT ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingJob(job); setIsJobFormOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                              <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Copy size={16} /></button>
                              <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ADD/EDIT JOB FORM MODAL */}
          {isJobFormOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingJob.id ? 'Refine Listing' : 'Publish New Recruitment'}</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Please fill all mandatory fields marked with an asterisk (*)</p>
                  </div>
                  <button onClick={() => setIsJobFormOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 scrollbar-hide space-y-12">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                      <h4 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-2 flex items-center gap-2">
                        <Info size={14} className="text-blue-500" /> Basic Identification
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed">Fundamental details about the organization and the job title.</p>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Job Title *</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-slate-700" value={editingJob.job_name || ''} onChange={e => setEditingJob({...editingJob, job_name: e.target.value})} placeholder="e.g. SSC CGL 2024 Tier 1 Exam" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Organization</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-slate-700" value={editingJob.organization || ''} onChange={e => setEditingJob({...editingJob, organization: e.target.value})} placeholder="e.g. Staff Selection Commission" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">State / Location</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/5 focus:border-blue-500 font-bold text-slate-700" value={editingJob.state || ''} onChange={e => setEditingJob({...editingJob, state: e.target.value})} placeholder="e.g. Uttar Pradesh" />
                      </div>
                    </div>
                  </div>

                  {/* Eligibility & Age */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                    <div className="md:col-span-1">
                      <h4 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-2 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" /> Eligibility Params
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed">Define the criteria aspirants must meet to be considered eligible.</p>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Qualification *</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none font-bold text-slate-700" value={editingJob.qualification} onChange={e => setEditingJob({...editingJob, qualification: e.target.value as any})}>
                          {Object.values(Qualification).map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Min Age</label>
                          <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" value={editingJob.min_age || ''} onChange={e => setEditingJob({...editingJob, min_age: Number(e.target.value)})} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Max Age</label>
                          <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" value={editingJob.max_age || ''} onChange={e => setEditingJob({...editingJob, max_age: Number(e.target.value)})} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                    <div className="md:col-span-1">
                      <h4 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-2 flex items-center gap-2">
                        <CalendarIcon size={14} className="text-orange-500" /> Chronology
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed">Crucial milestones and application windows.</p>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Date</label>
                        <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" value={editingJob.dates?.start || ''} onChange={e => setEditingJob({...editingJob, dates: {...editingJob.dates!, start: e.target.value}})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Date *</label>
                        <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" value={editingJob.deadline || ''} onChange={e => setEditingJob({...editingJob, deadline: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Exam Date</label>
                        <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" value={editingJob.dates?.exam || ''} onChange={e => setEditingJob({...editingJob, dates: {...editingJob.dates!, exam: e.target.value}})} />
                      </div>
                    </div>
                  </div>

                  {/* Fees */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                    <div className="md:col-span-1">
                      <h4 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-2 flex items-center gap-2">
                        <IndianRupee size={14} className="text-amber-600" /> Fee Structure
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed">Specify the application costs for various social categories.</p>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">General / EWS</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" placeholder="₹" value={editingJob.fees?.general || ''} onChange={e => setEditingJob({...editingJob, fees: {...editingJob.fees!, general: e.target.value}})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">OBC</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" placeholder="₹" value={editingJob.fees?.obc || ''} onChange={e => setEditingJob({...editingJob, fees: {...editingJob.fees!, obc: e.target.value}})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SC / ST / PH</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" placeholder="₹" value={editingJob.fees?.sc_st || ''} onChange={e => setEditingJob({...editingJob, fees: {...editingJob.fees!, sc_st: e.target.value}})} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <select className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-bold outline-none" value={editingJob.status || JobStatus.DRAFT} onChange={e => setEditingJob({...editingJob, status: e.target.value as any})}>
                      <option value={JobStatus.DRAFT}>Save as Draft</option>
                      <option value={JobStatus.ACTIVE}>Active / Publish</option>
                      <option value={JobStatus.CLOSED}>Closed</option>
                      <option value={JobStatus.EXPIRED}>Expired</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setIsJobFormOpen(false)} className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">Discard</button>
                    <button onClick={handleSaveJob} className="px-10 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95">Commit & Save</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RESULTS VIEW */}
          {currentView === 'results' && (
            <div className="animate-in fade-in duration-300">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Results & Admit Cards</h2>
                  <p className="text-slate-400 text-sm font-medium">Manage the secondary content lists displayed on the homepage.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {(['results', 'admitCards', 'latestJobs'] as const).map(type => (
                   <div key={type} className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[600px] overflow-hidden">
                      <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">{type.replace(/([A-Z])/g, ' $1')}</h3>
                        <button className="p-1.5 bg-slate-900 text-white rounded-lg hover:scale-105 transition-transform"><Plus size={16} /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                         {siteConfig.lists[type].map(link => (
                           <div key={link.id} className="p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all group">
                              <p className="text-xs font-bold text-slate-700 leading-snug mb-2">{link.text}</p>
                              <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-tight">
                                 <span className="flex items-center gap-1"><Clock size={10} /> 12 Jan 2024</span>
                                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-blue-500"><Edit size={14}/></button>
                                    <button className="text-rose-500"><Trash2 size={14}/></button>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS VIEW */}
          {currentView === 'notifications' && (
            <div className="animate-in fade-in duration-300 max-w-4xl">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Campaign Broadcaster</h2>
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                     <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Content to Push</label>
                          <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700">
                             <option>New Job Alert</option>
                             <option>Result Declared</option>
                             <option>Admit Card Out</option>
                             <option>Important Update</option>
                          </select>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Linked Resource</label>
                           <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700">
                              {jobs.map(j => <option key={j.id}>{j.job_name}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Channels</label>
                           <div className="flex gap-3">
                              <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-500 has-[:checked]:text-emerald-700">
                                 <input type="checkbox" className="hidden" /> <Smartphone size={16} /> WhatsApp
                              </label>
                              <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 has-[:checked]:text-blue-700">
                                 <input type="checkbox" className="hidden" /> <Send size={16} /> Telegram
                              </label>
                           </div>
                        </div>
                     </div>
                     <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Message Preview</p>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                          📢 *New SSC Job Alert*
                          {"\n"}
                          {"\n"}SSC CGL 2024 Tier 1 Exam has been published.
                          {"\n"}Last Date: 25 Oct 2024
                          {"\n"}
                          {"\n"}Apply here: https://sarkarinaukari.gov/job/1
                        </div>
                     </div>
                  </div>
                  <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                     <Send size={18} /> Launch Broadcast to 1,240 Users
                  </button>
               </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {currentView === 'settings' && (
            <div className="animate-in fade-in duration-300 max-w-4xl">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">System Configuration</h2>
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Platform Name</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" value={siteConfig.settings.siteName} />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Palette (Navy)</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" value={siteConfig.settings.primaryColor} />
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telegram Join Link</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" value={siteConfig.settings.telegramLink} />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp Community Link</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" value={siteConfig.settings.whatsappLink} />
                     </div>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                     <div>
                        <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Enable Push Notifications</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">Global switch to turn off/on user alerts</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={siteConfig.settings.enableNotifications} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                  </div>
                  <button className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all">
                    Update System Settings
                  </button>
               </div>
            </div>
          )}

          {/* AUDIT LOGS VIEW */}
          {currentView === 'audit' && (
            <div className="animate-in fade-in duration-300">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security Audit History</h2>
                    <p className="text-slate-400 text-sm font-medium">Traceable record of all administrative actions performed on the platform.</p>
                  </div>
                  <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                    <Filter size={16} /> Filter Logs
                  </button>
               </div>
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4 text-[10px] font-mono font-bold text-slate-300">#{log.id.slice(-4)}</td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">{log.adminName.slice(0, 1)}</div>
                                <span className="font-bold text-slate-700 text-xs">{log.adminName}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tight ${
                                log.action === 'Published' || log.action === 'Created Job' ? 'bg-emerald-50 text-emerald-600' : 
                                log.action === 'Updated' || log.action === 'Updated Job' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 font-medium">{log.affectedItem}</td>
                          <td className="px-6 py-4 text-[10px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;