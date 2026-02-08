import React from 'react';
import { Bell, X, Shield } from 'lucide-react';
import { UserProfile, Job, AlertPreferences } from '../types';
import AlertDashboard from './AlertDashboard';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  job?: Job | null;
  savedPreferences?: AlertPreferences;
  onSavePreferences: (prefs: AlertPreferences) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ 
  isOpen, 
  onClose, 
  profile, 
  job,
  savedPreferences,
  onSavePreferences
}) => {

  if (!isOpen) return null;

  const initialPrefs: AlertPreferences = savedPreferences ? {
    ...savedPreferences,
    deadlineDays: savedPreferences.deadlineDays || 3 
  } : {
    contact: '',
    isSubscribed: false,
    categories: job ? [] : [], 
    alertTypes: ['New Job', 'Deadline'],
    locations: ['All India'],
    frequency: 'Instant',
    channels: ['WhatsApp'],
    deadlineDays: 3,
    lastUpdated: 0
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        <div className={`px-6 py-4 text-white flex justify-between items-center shrink-0 ${job ? 'bg-indigo-600' : 'bg-slate-900'}`}>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
                {job ? <Bell size={18} /> : <Shield size={18} />} 
                {job ? 'Set Job Reminder' : 'Alert Preferences'}
            </h3>
            <p className="text-slate-300 text-xs mt-0.5">
                {job ? `Specific alert for ${job.job_name}` : 'Manage your notification settings'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors p-1 bg-white/10 rounded-full hover:bg-white/20">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
            <AlertDashboard 
                initialPreferences={initialPrefs} 
                onSave={onSavePreferences}
                onClose={onClose}
                prefillJob={job}
            />
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;