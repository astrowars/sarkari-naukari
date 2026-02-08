import React, { useState, useEffect } from 'react';
import { Bell, Check, MapPin, Smartphone, Mail, Clock, Zap, MessageSquare, Shield, CheckCircle2, X } from 'lucide-react';
import { AlertPreferences, AlertType, NotificationChannel, AlertFrequency, Job } from '../types';
import { STATES } from '../constants';
import { getJobCategory } from '../services/jobService';

interface AlertDashboardProps {
  initialPreferences: AlertPreferences;
  onSave: (prefs: AlertPreferences) => void;
  onClose: () => void;
  prefillJob?: Job | null;
}

const JOB_CATEGORIES = ['SSC', 'Banking', 'Railways', 'Defence', 'Teaching', 'State Govt', 'UPSC'];
const ALERT_TYPES: AlertType[] = ['New Job', 'Deadline', 'Admit Card', 'Result'];

const AlertDashboard: React.FC<AlertDashboardProps> = ({ initialPreferences, onSave, onClose, prefillJob }) => {
  const [prefs, setPrefs] = useState<AlertPreferences>(initialPreferences);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (prefillJob) {
      const jobCat = getJobCategory(prefillJob);
      const catToSelect = jobCat === 'Other' ? 'State Govt' : jobCat;
      
      setPrefs(prev => ({
        ...prev,
        categories: prev.categories.includes(catToSelect) ? prev.categories : [...prev.categories, catToSelect],
        alertTypes: prev.alertTypes.includes('Deadline') ? prev.alertTypes : [...prev.alertTypes, 'Deadline']
      }));
    }
  }, [prefillJob]);

  const toggleSelection = <T extends string>(item: T, list: T[], key: keyof AlertPreferences) => {
    const newList = list.includes(item)
      ? list.filter(i => i !== item)
      : [...list, item];
    setPrefs({ ...prefs, [key]: newList });
  };

  const handleSave = () => {
    if (!prefs.contact || prefs.contact.length < 5) {
      setError('Please enter a valid Phone Number or Email.');
      return;
    }
    if (prefs.categories.length === 0) {
      setError('Select at least one job category.');
      return;
    }
    if (prefs.channels.length === 0) {
      setError('Select a notification channel (WhatsApp/Telegram).');
      return;
    }

    setError('');
    onSave({ ...prefs, isSubscribed: true, lastUpdated: Date.now() });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1500); // Faster close
  };

  const getPreviewMessage = () => {
    const cat = prefs.categories[0] || 'SSC';
    const channel = prefs.channels.includes('WhatsApp') ? 'WhatsApp' : 'Telegram';
    const deadlineAlert = prefs.alertTypes.includes('Deadline') ? `\n⏰ *Reminder:* ${prefs.deadlineDays} Days left` : '';
    
    if (channel === 'WhatsApp') {
        return `🔔 *New ${cat} Job Alert*\n\n👮‍♂️ *SSC CGL 2024*\n💰 Salary: ₹45,000 - ₹1,10,000\n📅 Deadline: 24 Aug 2025${deadlineAlert}\n\n👇 *Apply Now:*\nhttps://sarkar-naukari.app/job/123`;
    } else {
        return `📢 **New ${cat} Vacancy**\n\n**Post:** SSC CGL 2024\n**Sal:** ₹45k - ₹1.1L\n**Last Date:** 24 Aug${deadlineAlert}\n\n[Apply Here](https://sarkar-naukari.app)`;
    }
  };

  if (isSaved) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Preferences Saved!</h3>
        <p className="text-slate-500 max-w-xs">You will now receive customized alerts on <b>{prefs.contact}</b>.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] md:h-auto overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
        
        <section className="mb-8">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">1. Contact Info</h4>
            <div className="relative">
                <input
                    type="text"
                    value={prefs.contact}
                    onChange={(e) => setPrefs({ ...prefs, contact: e.target.value })}
                    placeholder="WhatsApp Number or Email"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    {prefs.contact.includes('@') ? <Mail size={18} /> : <Smartphone size={18} />}
                </div>
            </div>
             {error && <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1"><X size={12}/> {error}</p>}
        </section>

        <section className="mb-8">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">2. Job Categories</h4>
            <div className="flex flex-wrap gap-2">
                {JOB_CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => toggleSelection(cat, prefs.categories, 'categories')}
                        className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${
                            prefs.categories.includes(cat)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {prefs.categories.includes(cat) && <Check size={14} strokeWidth={3} />}
                        {cat}
                    </button>
                ))}
            </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <section>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">3. Alert Types</h4>
                <div className="space-y-2">
                    {ALERT_TYPES.map(type => (
                        <label key={type} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${prefs.alertTypes.includes(type) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                {prefs.alertTypes.includes(type) && <Check size={12} className="text-white" />}
                            </div>
                            <input 
                                type="checkbox" 
                                className="hidden"
                                checked={prefs.alertTypes.includes(type)}
                                onChange={() => toggleSelection(type, prefs.alertTypes, 'alertTypes')}
                            />
                            <span className="text-sm font-medium text-slate-700">{type}</span>
                        </label>
                    ))}
                </div>

                {prefs.alertTypes.includes('Deadline') && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <label className="text-xs font-semibold text-blue-700 mb-2 block flex items-center gap-1">
                            <Clock size={12} /> Remind me before:
                        </label>
                        <div className="flex gap-2">
                            {[1, 3, 7].map(days => (
                                <button
                                    key={days}
                                    onClick={() => setPrefs({...prefs, deadlineDays: days})}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded border transition-colors ${
                                        prefs.deadlineDays === days 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-100'
                                    }`}
                                >
                                    {days} Day{days > 1 ? 's' : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <section>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">4. Location</h4>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select
                        value={prefs.locations[0] || 'All India'}
                        onChange={(e) => setPrefs({ ...prefs, locations: [e.target.value] })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    >
                         {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </section>
        </div>

        <section className="mb-8">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">5. Delivery Preferences</h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-500 mb-2 block">Channels</label>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => toggleSelection('WhatsApp', prefs.channels, 'channels')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold border flex items-center justify-center gap-2 ${prefs.channels.includes('WhatsApp') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-slate-200 grayscale opacity-60'}`}
                            >
                                <MessageSquare size={16} /> WA
                            </button>
                            <button 
                                onClick={() => toggleSelection('Telegram', prefs.channels, 'channels')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold border flex items-center justify-center gap-2 ${prefs.channels.includes('Telegram') ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-white border-slate-200 grayscale opacity-60'}`}
                            >
                                <MessageSquare size={16} /> TG
                            </button>
                        </div>
                    </div>
                    <div className="flex-1">
                         <label className="text-xs font-semibold text-slate-500 mb-2 block">Frequency</label>
                         <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                            {['Instant', 'Daily', 'Weekly'].map((freq) => (
                                <button
                                    key={freq}
                                    onClick={() => setPrefs({ ...prefs, frequency: freq as AlertFrequency })}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${prefs.frequency === freq ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    {freq}
                                </button>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </section>

        <section>
             <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Preview Message</h4>
             <div className="bg-white border border-slate-200 rounded-lg p-4 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${prefs.channels.includes('WhatsApp') ? 'bg-green-500' : 'bg-sky-500'}`}></div>
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${prefs.channels.includes('WhatsApp') ? 'bg-green-100 text-green-600' : 'bg-sky-100 text-sky-600'}`}>
                        {prefs.channels.includes('WhatsApp') ? <MessageSquare size={16} /> : <Zap size={16} />}
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold mb-1">
                            Incoming via {prefs.channels.includes('WhatsApp') ? 'WhatsApp' : 'Telegram'} • {prefs.frequency}
                        </p>
                        <pre className="font-sans text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {getPreviewMessage()}
                        </pre>
                    </div>
                </div>
             </div>
        </section>

      </div>

      <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-4">
        <button onClick={onClose} className="text-slate-500 font-bold text-sm px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors">
            Cancel
        </button>
        <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
        >
            <Shield size={18} /> Save Preferences
        </button>
      </div>
    </div>
  );
};

export default AlertDashboard;