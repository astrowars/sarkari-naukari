import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Users, Bell, LogOut, Plus, Edit, Trash2, 
  Save, X, CheckCircle2, AlertTriangle, Search, Eye, Play, Shield, Settings, Key, Lock,
  Globe, List, PenTool, ExternalLink, ArrowUp, ArrowDown
} from 'lucide-react';
import { Job, JobStatus, Qualification, Category, Gender, CompetitionLevel, UserProfile, SiteConfig, QuickLink } from '../types';
import { STREAMS, STATES } from '../constants';
import { checkEligibility, getJobCategory } from '../services/jobService';

interface AdminPanelProps {
  jobs: Job[];
  onUpdateJobs: (jobs: Job[]) => void;
  siteConfig: SiteConfig;
  onUpdateConfig: (config: SiteConfig) => void;
}

type AdminView = 'dashboard' | 'jobs' | 'editor' | 'users' | 'alerts' | 'settings';

const AdminPanel: React.FC<AdminPanelProps> = ({ jobs, onUpdateJobs, siteConfig, onUpdateConfig }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  
  // Dynamic Credentials State
  const [adminCreds, setAdminCreds] = useState(() => {
    try {
      const saved = localStorage.getItem('sarkar_admin_creds');
      return saved ? JSON.parse(saved) : { email: 'admin@sarkari.com', password: 'admin123' };
    } catch (e) {
      return { email: 'admin@sarkari.com', password: 'admin123' };
    }
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Site Editor State
  const [editingConfig, setEditingConfig] = useState<SiteConfig>(siteConfig);
  const [linkEditor, setLinkEditor] = useState<{ type: 'results' | 'admitCards' | 'latestJobs', item: Partial<QuickLink> | null }>({ type: 'results', item: null });

  // Job Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<Job>>({});
  
  // Eligibility Tester State
  const [showTester, setShowTester] = useState(false);
  const [testProfile, setTestProfile] = useState<UserProfile>({
    age: '',
    qualification: Qualification.GRADUATE,
    stream: 'Any',
    category: Category.GENERAL,
    gender: Gender.MALE,
    statePreference: 'All India'
  });
  const [testResult, setTestResult] = useState<{isEligible: boolean; reason: string} | null>(null);

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === JobStatus.ACTIVE).length,
    drafts: jobs.filter(j => j.status === JobStatus.DRAFT).length,
    alertsSent: 1240
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === adminCreds.email && password === adminCreds.password) {
      setIsAuthenticated(true);
      document.body.style.overflow = 'auto';
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.current !== adminCreds.password) {
      setPasswordStatus({ type: 'error', msg: 'Current password is incorrect.' });
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    const newCreds = { ...adminCreds, password: passwordForm.new };
    setAdminCreds(newCreds);
    localStorage.setItem('sarkar_admin_creds', JSON.stringify(newCreds));
    setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' });
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleSaveJob = () => {
    if (!editingJob.job_name || !editingJob.deadline) {
      alert("Job Name and Deadline are required");
      return;
    }
    const newJob = { ...editingJob, id: editingJob.id || Date.now().toString(), required_streams: editingJob.required_streams || ['Any'] } as Job;
    const updatedJobs = editingJob.id ? jobs.map(j => j.id === newJob.id ? newJob : j) : [newJob, ...jobs];
    onUpdateJobs(updatedJobs);
    setIsEditing(false);
    setEditingJob({});
  };

  const handleSaveLink = () => {
    if (!linkEditor.item?.text) return;
    const listType = linkEditor.type;
    const newItem = { ...linkEditor.item, id: linkEditor.item.id || Date.now().toString(), url: linkEditor.item.url || '#' } as QuickLink;
    const currentList = editingConfig.lists[listType];
    const newList = linkEditor.item.id ? currentList.map(i => i.id === newItem.id ? newItem : i) : [newItem, ...currentList];
    const newConfig = { ...editingConfig, lists: { ...editingConfig.lists, [listType]: newList } };
    setEditingConfig(newConfig);
    setLinkEditor({ ...linkEditor, item: null });
  };

  const deleteLink = (type: keyof SiteConfig['lists'], id: string) => {
    const newList = editingConfig.lists[type].filter(i => i.id !== id);
    setEditingConfig({ ...editingConfig, lists: { ...editingConfig.lists, [type]: newList } });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-800">SarkarAdmin Panel</h1>
            <p className="text-slate-500 text-sm">Restricted Access Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg bg-slate-50 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg bg-slate-50 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800">Access Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 border-b border-slate-800"><h2 className="font-black text-xl">Sarkar<span className="text-blue-500">Admin</span></h2></div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'jobs', icon: FileText, label: 'Jobs Manager' },
            { id: 'editor', icon: Globe, label: 'Site Editor' },
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'alerts', icon: Bell, label: 'Alerts' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(view => (
            <button key={view.id} onClick={() => setCurrentView(view.id as AdminView)} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${currentView === view.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <view.icon size={20} /> {view.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {currentView === 'dashboard' && (
          <div className="animate-in fade-in">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><p className="text-slate-500 text-xs font-bold uppercase">Total Jobs</p><p className="text-3xl font-black text-slate-800 mt-2">{stats.total}</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><p className="text-emerald-500 text-xs font-bold uppercase">Active</p><p className="text-3xl font-black text-emerald-600 mt-2">{stats.active}</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><p className="text-amber-500 text-xs font-bold uppercase">Drafts</p><p className="text-3xl font-black text-amber-600 mt-2">{stats.drafts}</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><p className="text-blue-500 text-xs font-bold uppercase">Alerts Sent</p><p className="text-3xl font-black text-blue-600 mt-2">{stats.alertsSent}</p></div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4">Quick Links</h3>
              <div className="flex gap-4"><button onClick={() => setCurrentView('jobs')} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium">Post Job</button><button onClick={() => setCurrentView('editor')} className="border px-4 py-2 rounded-lg font-medium">Edit Website</button></div>
            </div>
          </div>
        )}

        {currentView === 'editor' && (
          <div className="animate-in fade-in max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Site Content Editor</h1>
              <button onClick={() => onUpdateConfig(editingConfig)} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg active:scale-95 transition-all">
                <Save size={18} /> Publish Changes
              </button>
            </div>

            <div className="space-y-8">
              {/* HERO SECTION EDITOR */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs mb-6 flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" /> Hero Section Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Title Prefix</label>
                      <input type="text" className="w-full p-2.5 border rounded-lg" value={editingConfig.hero.titlePrefix} onChange={e => setEditingConfig({...editingConfig, hero: {...editingConfig.hero, titlePrefix: e.target.value}})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Gradient Part</label>
                      <input type="text" className="w-full p-2.5 border rounded-lg" value={editingConfig.hero.titleGradient} onChange={e => setEditingConfig({...editingConfig, hero: {...editingConfig.hero, titleGradient: e.target.value}})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Title Suffix</label>
                      <input type="text" className="w-full p-2.5 border rounded-lg" value={editingConfig.hero.titleSuffix} onChange={e => setEditingConfig({...editingConfig, hero: {...editingConfig.hero, titleSuffix: e.target.value}})} />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Description Text</label>
                      <textarea className="w-full p-2.5 border rounded-lg h-32" value={editingConfig.hero.description} onChange={e => setEditingConfig({...editingConfig, hero: {...editingConfig.hero, description: e.target.value}})} />
                    </div>
                    <div className="flex gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-700">
                        <input type="checkbox" className="w-4 h-4" checked={editingConfig.hero.showFlag} onChange={e => setEditingConfig({...editingConfig, hero: {...editingConfig.hero, showFlag: e.target.checked}})} /> Show Indian Flag
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-700">
                        <input type="checkbox" className="w-4 h-4" checked={editingConfig.hero.showLoginPill} onChange={e => setEditingConfig({...editingConfig, hero: {...editingConfig.hero, showLoginPill: e.target.checked}})} /> Show Login Pill
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK LINKS EDITOR */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['results', 'admitCards', 'latestJobs'] as const).map(type => (
                  <div key={type} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                      <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">{type.replace(/([A-Z])/g, ' $1')}</h3>
                      <button onClick={() => setLinkEditor({ type, item: {} })} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"><Plus size={16}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                      {editingConfig.lists[type].map((link, idx) => (
                        <div key={link.id} className="group p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[13px] font-bold text-slate-700 leading-tight flex-1">{link.text}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setLinkEditor({ type, item: link })} className="p-1 text-slate-400 hover:text-blue-500"><Edit size={14}/></button>
                              <button onClick={() => deleteLink(type, link.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* PROMOTIONAL BANNER EDITOR */}
              <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <h3 className="font-black uppercase tracking-wider text-xs mb-6 text-slate-400 flex items-center gap-2 relative z-10">
                  <PenTool size={16} /> Promotional Banner Manager
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                   <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Banner Badge Text</label>
                        <input type="text" className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" value={editingConfig.banner.badgeText} onChange={e => setEditingConfig({...editingConfig, banner: {...editingConfig.banner, badgeText: e.target.value}})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Main Title</label>
                        <input type="text" className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" value={editingConfig.banner.title} onChange={e => setEditingConfig({...editingConfig, banner: {...editingConfig.banner, title: e.target.value}})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Highlighted Text</label>
                        <input type="text" className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" value={editingConfig.banner.highlight} onChange={e => setEditingConfig({...editingConfig, banner: {...editingConfig.banner, highlight: e.target.value}})} />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Banner Description</label>
                        <textarea className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white h-24" value={editingConfig.banner.description} onChange={e => setEditingConfig({...editingConfig, banner: {...editingConfig.banner, description: e.target.value}})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Button Text</label>
                        <input type="text" className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white" value={editingConfig.banner.buttonText} onChange={e => setEditingConfig({...editingConfig, banner: {...editingConfig.banner, buttonText: e.target.value}})} />
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* MODAL LINK EDITOR */}
            {linkEditor.item && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Edit Link - {linkEditor.type}</h4>
                    <button onClick={() => setLinkEditor({ ...linkEditor, item: null })}><X size={20}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Display Text</label>
                      <input type="text" className="w-full p-3 border rounded-xl" value={linkEditor.item.text || ''} onChange={e => setLinkEditor({...linkEditor, item: {...linkEditor.item!, text: e.target.value}})} placeholder="Link Label" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Target URL</label>
                      <input type="text" className="w-full p-3 border rounded-xl" value={linkEditor.item.url || ''} onChange={e => setLinkEditor({...linkEditor, item: {...linkEditor.item!, url: e.target.value}})} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="p-6 pt-0 flex gap-3">
                    <button onClick={() => setLinkEditor({ ...linkEditor, item: null })} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancel</button>
                    <button onClick={handleSaveLink} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all">Save Link</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* JOBS, SETTINGS views preserved and functional */}
        {currentView === 'jobs' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Jobs Management</h1>
              {!isEditing && <button onClick={() => { setIsEditing(true); setEditingJob({}); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18} /> Add Job</button>}
            </div>
            {isEditing ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto">
                <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center"><h3 className="font-bold">{editingJob.id ? 'Edit Job' : 'New Job'}</h3><button onClick={() => setIsEditing(false)}><X size={20} /></button></div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <input placeholder="Job Title" className="w-full p-3 border rounded-lg" value={editingJob.job_name || ''} onChange={e => setEditingJob({...editingJob, job_name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <select className="p-3 border rounded-lg" value={editingJob.status || JobStatus.DRAFT} onChange={e => setEditingJob({...editingJob, status: e.target.value as JobStatus})}>
                        <option value={JobStatus.DRAFT}>Draft</option><option value={JobStatus.ACTIVE}>Active</option><option value={JobStatus.CLOSED}>Closed</option>
                      </select>
                      <input type="date" className="p-3 border rounded-lg" value={editingJob.deadline || ''} onChange={e => setEditingJob({...editingJob, deadline: e.target.value})} />
                    </div>
                    <input placeholder="Apply Link" className="w-full p-3 border rounded-lg" value={editingJob.apply_link || ''} onChange={e => setEditingJob({...editingJob, apply_link: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" placeholder="Min Age" className="w-full p-3 border rounded-lg" value={editingJob.min_age || ''} onChange={e => setEditingJob({...editingJob, min_age: Number(e.target.value)})} />
                      <input type="number" placeholder="Max Age" className="w-full p-3 border rounded-lg" value={editingJob.max_age || ''} onChange={e => setEditingJob({...editingJob, max_age: Number(e.target.value)})} />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 border-t flex justify-end gap-3"><button onClick={() => setIsEditing(false)} className="px-4 py-2 font-bold">Cancel</button><button onClick={handleSaveJob} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg">Save Job</button></div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b"><tr><th className="p-4 text-xs font-black">Job Name</th><th className="p-4 text-xs font-black">Status</th><th className="p-4 text-xs font-black text-right">Actions</th></tr></thead>
                  <tbody className="divide-y">{jobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{job.job_name}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${job.status === JobStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{job.status}</span></td>
                      <td className="p-4 text-right flex justify-end gap-2"><button onClick={() => { setEditingJob(job); setIsEditing(true); }} className="p-2"><Edit size={16} /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {currentView === 'settings' && (
          <div className="animate-in fade-in max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Account Settings</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordStatus && <div className={`p-4 rounded-xl text-sm font-bold ${passwordStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{passwordStatus.msg}</div>}
                <input type="password" placeholder="Current Password" required className="w-full p-3 border rounded-xl" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} />
                <input type="password" placeholder="New Password" required className="w-full p-3 border rounded-xl" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} />
                <input type="password" placeholder="Confirm New Password" required className="w-full p-3 border rounded-xl" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} />
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl">Update Password</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;