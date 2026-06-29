import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User,
  Settings,
  Bell,
  Lock,
  Award,
  Flame,
  CheckCircle2,
  HelpCircle,
  Save,
  Trash2,
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import api from '../services/api';

export const Profile: React.FC = () => {
  const { user, refreshUser, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile forms
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Notifications forms
  const [notifForm, setNotifForm] = useState({
    dailyReminder: user?.settings?.notifications?.dailyReminder ?? true,
    journalReminder: user?.settings?.notifications?.journalReminder ?? true,
    waterReminder: user?.settings?.notifications?.waterReminder ?? true,
    studyReminder: user?.settings?.notifications?.studyReminder ?? true,
    meditationReminder: user?.settings?.notifications?.meditationReminder ?? true,
    sleepReminder: user?.settings?.notifications?.sleepReminder ?? true,
  });

  // Privacy forms
  const [privacyForm, setPrivacyForm] = useState({
    shareData: user?.settings?.privacy?.shareData ?? true,
    anonymousAI: user?.settings?.privacy?.anonymousAI ?? false,
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSavingProfile(true);
    try {
      const res = await api.put('/users/profile', { name, bio, avatar });
      updateUser(res.data.user);
      alert('Profile updated successfully!');
      refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/users/settings', {
        theme: theme,
        privacy: privacyForm,
        notifications: notifForm,
      });
      alert('Settings saved successfully!');
      refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExportData = () => {
    // Open standard user JSON data export
    window.open('http://localhost:5000/api/users/profile');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account? This action is irreversible.')) return;
    try {
      await api.delete('/users');
      alert('Account deleted.');
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Bio Profile Card */}
      <section className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-3xl text-white shadow-lg shrink-0">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            user?.name?.substring(0, 1).toUpperCase()
          )}
        </div>
        <div className="space-y-1.5 flex-1 overflow-hidden">
          <h2 className="text-xl font-bold text-white leading-tight">{user?.name}</h2>
          <p className="text-xs text-slate-400 font-mono truncate">{user?.email}</p>
          <p className="text-xs text-slate-300 leading-relaxed italic max-w-md">
            {user?.bio || '"No bio written yet. Introduce yourself!"'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-2">
            <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-slate-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-yellow-500" /> Level {user?.stats?.level} Explorer
            </span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-slate-300 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" /> {user?.stats?.currentStreak} Day Streak
            </span>
          </div>
        </div>
      </section>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile edit */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-primary" /> Edit Profile Bio
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                Short Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your student goals or interests..."
                className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-primary h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold rounded-xl hover:opacity-95 flex items-center justify-center gap-1"
            >
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Bio Details
            </button>
          </form>
        </div>

        {/* Configurations edit */}
        <div className="glass-card p-6 space-y-5">
          <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-primary" /> Application Configs
          </h3>

          <form onSubmit={handleUpdateSettings} className="space-y-4">
            {/* Theme switcher */}
            <div className="flex justify-between items-center bg-white/5 px-3 py-2.5 rounded-xl border border-white/5">
              <span className="text-xs text-slate-300 font-medium">Visual Interface Theme:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    theme === 'light' ? 'bg-brand-primary text-white' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    theme === 'dark' ? 'bg-brand-primary text-white' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  Dark Mode
                </button>
              </div>
            </div>

            {/* Privacy logs */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Privacy Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Anonymize Chat Prompt logs</span>
                  <input
                    type="checkbox"
                    checked={privacyForm.anonymousAI}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, anonymousAI: e.target.checked })}
                    className="w-4.5 h-4.5 text-brand-primary"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Share diagnostics reports data</span>
                  <input
                    type="checkbox"
                    checked={privacyForm.shareData}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, shareData: e.target.checked })}
                    className="w-4.5 h-4.5 text-brand-primary"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold rounded-xl hover:opacity-95 flex items-center justify-center gap-1"
            >
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Configs
            </button>
          </form>
        </div>
      </div>

      {/* Notifications form */}
      <section className="glass-card p-6">
        <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-primary" /> Wellness Notification Reminders
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'dailyReminder', label: 'Daily Inspiration Reminder' },
            { id: 'journalReminder', label: 'Mindful Journal Alert' },
            { id: 'waterReminder', label: 'Drink Water Hydration Remind' },
            { id: 'studyReminder', label: 'Study Pomodoro Session Alert' },
            { id: 'meditationReminder', label: 'Breathing Meditation Alert' },
            { id: 'sleepReminder', label: 'Restful Sleep Alert' },
          ].map((n) => (
            <div key={n.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-300">{n.label}</span>
              <input
                type="checkbox"
                checked={(notifForm as any)[n.id]}
                onChange={(e) => {
                  const updated = { ...notifForm, [n.id]: e.target.checked };
                  setNotifForm(updated);
                  api.put('/users/settings', { notifications: updated }).then(() => refreshUser());
                }}
                className="w-4.5 h-4.5 text-brand-primary"
              />
            </div>
          ))}
        </div>
      </section>

      {/* High-risk operations */}
      <section className="glass-card p-6 border-red-500/10 bg-red-500/5 space-y-4">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="font-bold text-lg">Danger & Safety Zone</h3>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          Manage your sensitive details. You can request a copy of all user data logged under your session key, or delete your credentials completely.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export All Profile Data
          </button>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/10 text-red-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Delete Account & Records
          </button>
        </div>
      </section>
    </div>
  );
};
