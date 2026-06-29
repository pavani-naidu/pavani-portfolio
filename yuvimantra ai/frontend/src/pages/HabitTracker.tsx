import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Plus,
  Trash2,
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  Dumbbell,
  Compass,
  Droplet,
  BookOpen,
  Code,
  Footprints,
  Activity,
  Check
} from 'lucide-react';
import api from '../services/api';

export const HabitTracker: React.FC = () => {
  const { user, refreshUser } = useAuth();
  
  const [habits, setHabits] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('custom');
  const [icon, setIcon] = useState('check');
  const [frequency, setFrequency] = useState('daily');

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchHabitData();
  }, []);

  const fetchHabitData = async () => {
    try {
      const res = await api.get('/habits');
      setHabits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      await api.post('/habits', {
        name,
        type,
        icon,
        frequency,
        isCustom: type === 'custom',
      });
      setName('');
      fetchHabitData();
      refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleHabit = async (habit: any) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isCompleted = habit.completions.includes(todayStr);

    try {
      if (isCompleted) {
        // Uncomplete
        await api.put(`/habits/${habit._id}/uncomplete`, { date: todayStr });
      } else {
        // Complete
        await api.put(`/habits/${habit._id}/complete`, { date: todayStr });
      }
      fetchHabitData();
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    try {
      await api.delete(`/habits/${id}`);
      fetchHabitData();
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  // Map icon strings to Lucide icon components
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'exercise': return Dumbbell;
      case 'meditation': return Compass;
      case 'water': return Droplet;
      case 'reading': return BookOpen;
      case 'coding': return Code;
      case 'walking': return Footprints;
      default: return Check;
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Streaks and points banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-sans">Level Achievements</span>
            <p className="text-2xl font-extrabold text-white mt-1">Level {user?.stats?.level || 1}</p>
            <p className="text-[10px] text-slate-400 mt-1">{user?.stats?.points || 0} XP points accumulated</p>
          </div>
          <Award className="w-9 h-9 text-yellow-500 opacity-90 animate-bounce" />
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-sans">Active Login Streak</span>
            <p className="text-2xl font-extrabold text-white mt-1">{user?.stats?.currentStreak || 0} Days</p>
            <p className="text-[10px] text-slate-400 mt-1">Longest Streak: {user?.stats?.longestStreak || 0} Days</p>
          </div>
          <Flame className="w-9 h-9 text-orange-500 opacity-90" />
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-sans">Unlocks & Badges</span>
            <p className="text-2xl font-extrabold text-white mt-1">
              {user?.achievements?.length || 0} Unlocked
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Complete habits to unlock more badges</p>
          </div>
          <CheckSquare className="w-9 h-9 text-brand-primary opacity-80" />
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Habits List */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-primary" /> Daily Habits Checklist
          </h3>

          <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {habits.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No habits configured. Create a habit below to build consistency!
              </div>
            ) : (
              habits.map((h) => {
                const IconComponent = getIcon(h.type);
                const isCompleted = h.completions.includes(todayStr);
                return (
                  <div
                    key={h._id}
                    className={`
                      p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4 transition-all
                      ${isCompleted ? 'bg-brand-primary/5 border-brand-primary/20' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <button
                        onClick={() => handleToggleHabit(h)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          isCompleted
                            ? 'bg-brand-primary border-transparent text-white shadow-lg shadow-brand-primary/20'
                            : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white hover:border-slate-400'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </button>

                      <div className="overflow-hidden text-left">
                        <p className={`font-semibold text-xs text-slate-200 truncate ${isCompleted ? 'text-slate-400' : ''}`}>
                          {h.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span className="font-semibold uppercase tracking-wider">{h.frequency}</span>
                          <span className="text-slate-500">•</span>
                          <span className="flex items-center gap-0.5 text-orange-400 font-bold">
                            <Flame className="w-3.5 h-3.5 fill-orange-500/10" /> {h.streak} Streak
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteHabit(h._id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Custom Habit Creator & Achievements */}
        <div className="space-y-6">
          {/* Creator Form */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-primary" /> Create Routine Habit
            </h3>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 15 pages of novel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Habit Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setIcon(e.target.value); // Sync default icons
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="custom">Custom</option>
                    <option value="exercise">Exercise</option>
                    <option value="meditation">Meditation</option>
                    <option value="water">Water</option>
                    <option value="reading">Reading</option>
                    <option value="coding">Coding</option>
                    <option value="walking">Walking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold rounded-xl hover:opacity-95 transition-opacity"
              >
                Start Logging Habit
              </button>
            </form>
          </div>

          {/* Badges unlocked */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" /> Unlocked Badges
            </h3>
            
            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {user?.achievements && user.achievements.length > 0 ? (
                user.achievements.map((ach) => (
                  <div key={ach.id} className="p-2.5 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2.5">
                    <span className="text-xl">🏆</span>
                    <div>
                      <p className="font-semibold text-xs text-slate-200">{ach.title}</p>
                      <p className="text-[9px] text-slate-400 leading-normal mt-0.5">{ach.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Complete goals and level up to unlock badges!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
