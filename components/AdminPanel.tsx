import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Users, Bell, LogOut, Plus, Edit, Trash2, 
  Save, X, CheckCircle2, AlertTriangle, Search, Eye, Play, Shield
} from 'lucide-react';
import { Job, JobStatus, Qualification, Category, Gender, CompetitionLevel, UserProfile } from '../types';
import { STREAMS, STATES } from '../constants';
import { checkEligibility, getRelaxedMaxAge } from '../services/jobService';

interface AdminPanelProps {
  jobs: Job[];
  onUpdateJobs: (jobs: Job[]) => void;
}

type AdminView = 'dashboard' | 'jobs' | 'users' | 'alerts';

const AdminPanel: React.FC<AdminPanelProps> = ({ jobs, onUpdateJobs }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  
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

  // Stats
  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === JobStatus.ACTIVE).length,
    drafts: jobs.filter(j => j.status === JobStatus.DRAFT).length,
    alertsSent: 1240
  };

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // HARDCODED MOCK CREDENTIALS
    if (email === 'admin@sarkari.com' && password === 'admin123') {
      setIsAuthenticated(true);
      // Prevent body scroll locking issues from other components
      document.body.style.overflow = 'auto';
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  // Job CRUD
  const handleSaveJob = () => {
    if (!editingJob.job_name || !editingJob.deadline) {
      alert("Job Name and Deadline are required");
      return;
    }

    const newJob = {
      ...editingJob,
      id: editingJob.id || Date.now().toString(),
      required_streams: editingJob.required_streams || ['Any']
    } as Job;

    let updatedJobs;
    if (editingJob.id) {
      updatedJobs = jobs.map(j => j.id === newJob.id ? newJob : j);
    } else {
      updatedJobs = [newJob, ...jobs];
    }

    onUpdateJobs(updatedJobs);
    setIsEditing(false);
    setEditingJob({});
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      onUpdateJobs(jobs.filter(j => j.id !== id));
    }
  };

  const runEligibilityTest = () => {
    if (!editingJob.job_name) return;
    // Construct a temporary job object from the form state
    const tempJob = { ...editingJob, required_streams: editingJob.required_streams || ['Any'] } as Job;
    const result = checkEligibility(tempJob, testProfile);
    setTestResult(result);
  };

  // --- LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-800">SarkarAdmin Panel</h1>
            <p className="text-slate-500 text-sm">Restricted Access Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <input 
                type="email" 
                className="w-full p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <input 
                type="password" 
                className="w-full p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <h2 className="font-black text-xl tracking-tight">Sarkar<span className="text-blue-500">Admin</span></h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
             onClick={() => setCurrentView('jobs')}
             className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${currentView === 'jobs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <FileText size={20} /> Jobs Manager
          </button>
          <button 
             onClick={() => setCurrentView('users')}
             className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${currentView === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users size={20} /> Users
          </button>
          <button 
             onClick={() => setCurrentView('alerts')}
             className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${currentView === 'alerts' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Bell size={20} /> Alerts
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
             <h2 className="font-black text-slate-900">SarkarAdmin</h2>
             <button onClick={handleLogout}><LogOut size={20} /></button>
        </div>

        {/* --- VIEW: DASHBOARD --- */}
        {currentView === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-slate-500 text-xs font-bold uppercase">Total Jobs</p>
                <p className="text-3xl font-black text-slate-800 mt-2">{stats.total}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-emerald-500 text-xs font-bold uppercase">Active</p>
                <p className="text-3xl font-black text-emerald-600 mt-2">{stats.active}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-amber-500 text-xs font-bold uppercase">Drafts</p>
                <p className="text-3xl font-black text-amber-600 mt-2">{stats.drafts}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-blue-500 text-xs font-bold uppercase">Alerts Sent</p>
                <p className="text-3xl font-black text-blue-600 mt-2">{stats.alertsSent}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
              <div className="flex gap-4">
                <button onClick={() => { setCurrentView('jobs'); setIsEditing(true); setEditingJob({}); }} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800">
                  <Plus size={16} /> Post New Job
                </button>
                <button onClick={() => setCurrentView('alerts')} className="flex items-center gap-2 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50">
                  <Bell size={16} /> Send Alert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: JOBS MANAGER --- */}
        {currentView === 'jobs' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Jobs Management</h1>
              {!isEditing && (
                <button 
                  onClick={() => { setIsEditing(true); setEditingJob({}); }} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700"
                >
                  <Plus size={18} /> Add Job
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">{editingJob.id ? 'Edit Job' : 'New Job Entry'}</h3>
                  <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Job Details</h4>
                    <input 
                      placeholder="Job Title (e.g. SSC CGL 2024)" 
                      className="w-full p-3 border rounded-lg"
                      value={editingJob.job_name || ''}
                      onChange={e => setEditingJob({...editingJob, job_name: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                       <select 
                        className="p-3 border rounded-lg"
                        value={editingJob.status || JobStatus.DRAFT}
                        onChange={e => setEditingJob({...editingJob, status: e.target.value as JobStatus})}
                      >
                        <option value={JobStatus.DRAFT}>Draft</option>
                        <option value={JobStatus.ACTIVE}>Active</option>
                        <option value={JobStatus.CLOSED}>Closed</option>
                      </select>
                      <input 
                        type="date"
                        className="p-3 border rounded-lg"
                        value={editingJob.deadline || ''}
                        onChange={e => setEditingJob({...editingJob, deadline: e.target.value})}
                      />
                    </div>
                    <input 
                      placeholder="Apply Link" 
                      className="w-full p-3 border rounded-lg"
                      value={editingJob.apply_link || ''}
                      onChange={e => setEditingJob({...editingJob, apply_link: e.target.value})}
                    />
                    <input 
                      placeholder="Salary Range" 
                      className="w-full p-3 border rounded-lg"
                      value={editingJob.salary_range || ''}
                      onChange={e => setEditingJob({...editingJob, salary_range: e.target.value})}
                    />
                     <select 
                        className="w-full p-3 border rounded-lg"
                        value={editingJob.state || 'All India'}
                        onChange={e => setEditingJob({...editingJob, state: e.target.value})}
                      >
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>

                  {/* Eligibility Rules */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Eligibility Rules</h4>
                       <button 
                         onClick={() => setShowTester(!showTester)}
                         className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold flex items-center gap-1"
                        >
                         <Play size={10} /> {showTester ? 'Hide Tester' : 'Test Rules'}
                       </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500">Min Age</label>
                        <input 
                          type="number"
                          className="w-full p-3 border rounded-lg"
                          value={editingJob.min_age || ''}
                          onChange={e => setEditingJob({...editingJob, min_age: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Max Age (Gen)</label>
                        <input 
                          type="number"
                          className="w-full p-3 border rounded-lg"
                          value={editingJob.max_age || ''}
                          onChange={e => setEditingJob({...editingJob, max_age: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <select 
                      className="w-full p-3 border rounded-lg"
                      value={editingJob.qualification || ''}
                      onChange={e => setEditingJob({...editingJob, qualification: e.target.value as Qualification})}
                    >
                      <option value="">Select Min Qualification</option>
                      {Object.values(Qualification).map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                    
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 mb-2">Competition Level</p>
                        <div className="flex gap-2">
                            {Object.values(CompetitionLevel).map(l => (
                                <button 
                                    key={l}
                                    onClick={() => setEditingJob({...editingJob, competition_level: l})}
                                    className={`flex-1 text-xs py-1 rounded ${editingJob.competition_level === l ? 'bg-slate-800 text-white' : 'bg-white border text-slate-600'}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Eligibility Tester Tool */}
                    {showTester && (
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mt-4 animate-in slide-in-from-top-2">
                            <h5 className="font-bold text-indigo-800 text-xs mb-3 flex items-center gap-1">
                                <Shield size={12} /> Eligibility Checker Tool
                            </h5>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <input placeholder="Age" className="p-1.5 text-xs rounded border" type="number" value={testProfile.age} onChange={e => setTestProfile({...testProfile, age: Number(e.target.value)})} />
                                <select className="p-1.5 text-xs rounded border" value={testProfile.category} onChange={e => setTestProfile({...testProfile, category: e.target.value as Category})}>
                                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select className="p-1.5 text-xs rounded border" value={testProfile.qualification} onChange={e => setTestProfile({...testProfile, qualification: e.target.value as Qualification})}>
                                     {Object.values(Qualification).map(q => <option key={q} value={q}>{q}</option>)}
                                </select>
                            </div>
                            <button onClick={runEligibilityTest} className="w-full bg-indigo-600 text-white py-1.5 rounded text-xs font-bold mb-2">Run Test</button>
                            
                            {testResult && (
                                <div className={`p-2 rounded text-xs font-bold flex items-start gap-2 ${testResult.isEligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {testResult.isEligible ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                    <span>{testResult.reason}</span>
                                </div>
                            )}
                        </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-white rounded-lg">Cancel</button>
                  <button onClick={handleSaveJob} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-black flex items-center gap-2">
                    <Save size={18} /> Save Job
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 text-xs font-black text-slate-500 uppercase">Job Name</th>
                      <th className="p-4 text-xs font-black text-slate-500 uppercase hidden md:table-cell">Status</th>
                      <th className="p-4 text-xs font-black text-slate-500 uppercase hidden md:table-cell">Deadline</th>
                      <th className="p-4 text-xs font-black text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map(job => (
                      <tr key={job.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-800">
                          {job.job_name}
                          <div className="md:hidden text-xs text-slate-400 font-normal mt-1">{job.status} • {job.deadline}</div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            job.status === JobStatus.ACTIVE ? 'bg-green-100 text-green-700' : 
                            job.status === JobStatus.DRAFT ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600 hidden md:table-cell">{job.deadline}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingJob(job); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteJob(job.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: ALERTS --- */}
        {currentView === 'alerts' && (
             <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                 <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                     <Bell className="text-blue-500" /> Telegram Alert System
                 </h2>
                 <div className="space-y-4 mb-6">
                     <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                         <label className="flex items-center gap-3 cursor-pointer">
                             <input type="checkbox" className="w-5 h-5 accent-blue-600" defaultChecked />
                             <span className="font-medium text-slate-700">Auto-send when New Job is Published</span>
                         </label>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                         <label className="flex items-center gap-3 cursor-pointer">
                             <input type="checkbox" className="w-5 h-5 accent-blue-600" defaultChecked />
                             <span className="font-medium text-slate-700">Auto-send 48h before Deadline</span>
                         </label>
                     </div>
                 </div>
                 
                 <h3 className="font-bold text-slate-700 mb-2 text-sm uppercase">Manual Push</h3>
                 <textarea 
                    className="w-full p-4 border border-slate-200 rounded-xl mb-4 h-32 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Type alert message here..."
                    defaultValue="🚨 New Vacancy Alert: SSC CGL 2024 is out now! Apply before 24th Aug. Check eligibility on SarkarKiNaukari."
                 ></textarea>
                 <button 
                    onClick={() => alert("Simulated: Alert sent to 1,240 subscribers.")}
                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 flex items-center gap-2"
                 >
                     <Bell size={18} /> Send Broadcast Now
                 </button>
             </div>
        )}

      </main>
    </div>
  );
};

export default AdminPanel;