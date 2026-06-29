import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Smile,
  Heart,
  Calendar,
  AlertCircle,
  TrendingUp,
  Tag,
  Plus,
  Trash2
} from 'lucide-react';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const MoodTracker: React.FC = () => {
  const { refreshUser } = useAuth();
  
  const [moods, setMoods] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    totalEntries: 0,
    averageScore: 0,
    distribution: {},
    recentTrends: [],
    commonTags: [],
    insight: 'Log your first mood to unlock emotional insights.',
  });

  const [form, setForm] = useState({
    mood: 'Happy',
    value: 5,
    emoji: '😊',
    note: '',
    tagsInput: '',
  });
  
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    fetchMoodData();
  }, []);

  const fetchMoodData = async () => {
    try {
      const moodsRes = await api.get('/moods?limit=30');
      setMoods(moodsRes.data);

      const analyticsRes = await api.get('/moods/analytics');
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmojiSelect = (emoji: string, label: string, val: number) => {
    setForm((f) => ({ ...f, emoji, mood: label, value: val }));
  };

  const handleLogMood = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogging(true);
    try {
      const tags = form.tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await api.post('/moods', {
        mood: form.mood,
        value: form.value,
        emoji: form.emoji,
        note: form.note,
        tags,
      });

      // Clear Form
      setForm({
        mood: 'Happy',
        value: 5,
        emoji: '😊',
        note: '',
        tagsInput: '',
      });

      fetchMoodData();
      refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  // Compile Bar Chart Data
  const distKeys = Object.keys(analytics.distribution);
  const distVals = Object.values(analytics.distribution);

  const barChartData = {
    labels: distKeys,
    datasets: [
      {
        label: 'Logs Count',
        data: distVals,
        backgroundColor: [
          'rgba(59, 130, 246, 0.4)', // Blue
          'rgba(16, 185, 129, 0.4)', // Emerald
          'rgba(168, 85, 247, 0.4)', // Purple
          'rgba(249, 115, 22, 0.4)', // Orange
          'rgba(239, 68, 68, 0.4)',  // Red
        ],
        borderColor: [
          '#3B82F6',
          '#10B981',
          '#A855F7',
          '#F97316',
          '#EF4444',
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  // Compile 30-day mood calendar cells (Github contribution visual style)
  const renderCalendarGrid = () => {
    // Generate dates array for last 28 days
    const cells = [];
    for (let i = 27; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Find if we have mood registered on this day
      const log = moods.find((m) => m.date.split('T')[0] === dateStr);
      let colorClass = 'bg-white/5 border border-white/5';
      if (log) {
        if (log.value === 5) colorClass = 'bg-brand-primary/50 text-white';
        else if (log.value === 4) colorClass = 'bg-brand-accent/50 text-white';
        else if (log.value === 3) colorClass = 'bg-brand-secondary/40 text-white';
        else if (log.value === 2) colorClass = 'bg-brand-warning/40 text-white';
        else colorClass = 'bg-brand-error/40 text-white';
      }

      cells.push(
        <div
          key={dateStr}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold relative group shadow-sm ${colorClass}`}
          title={`${date.toLocaleDateString()}: ${log ? `${log.emoji} ${log.mood}` : 'No Log'}`}
        >
          {log ? log.emoji : ''}
          {/* Tooltip on hover */}
          <span className="absolute bottom-full mb-1 bg-slate-950 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
            {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}: {log ? log.mood : 'Not Logged'}
          </span>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="space-y-6">
      {/* Header and statistics banner */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <span className="text-brand-primary text-xs font-bold uppercase tracking-wider">AI Emotional Advisor</span>
            <h3 className="font-extrabold text-xl mt-1.5 text-white mb-3">Your Mindful Diagnostics</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{analytics.insight}</p>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-brand-accent bg-brand-accent/5 px-3 py-1.5 rounded-xl border border-brand-accent/10 w-fit">
            <TrendingUp className="w-4 h-4" /> Average wellness rating: {analytics.averageScore} / 5.0
          </div>
        </div>

        {/* Counter Widget */}
        <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
          <Calendar className="w-7 h-7 text-brand-primary mb-2" />
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Records</span>
          <p className="text-3xl font-extrabold text-white mt-1 font-mono">{analytics.totalEntries}</p>
        </div>

        {/* Triggers Widget */}
        <div className="glass-card p-6">
          <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3">Top Mood Triggers</h4>
          <div className="flex flex-wrap gap-2">
            {analytics.commonTags.length === 0 ? (
              <span className="text-xs text-slate-500">No triggers logged. Add tags to your logs.</span>
            ) : (
              analytics.commonTags.map((tagObj: any) => (
                <span
                  key={tagObj.name}
                  className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-xl text-xs text-slate-300 font-medium flex items-center gap-1.5"
                >
                  <Tag className="w-3 h-3 text-brand-primary" />
                  {tagObj.name} ({tagObj.count})
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Entry Logger and Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Log Form */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-primary" /> Daily Check-In
          </h3>

          <form onSubmit={handleLogMood} className="space-y-4">
            {/* Emoji selects */}
            <div>
              <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                Select Emoji
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: 'Happy', emoji: '😊', value: 5 },
                  { label: 'Calm', emoji: '🧘', value: 4 },
                  { label: 'Energetic', emoji: '⚡', value: 4 },
                  { label: 'Tired', emoji: '😴', value: 3 },
                  { label: 'Anxious', emoji: '😰', value: 2 },
                  { label: 'Sad', emoji: '😢', value: 1 },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => handleEmojiSelect(item.emoji, item.label, item.value)}
                    className={`
                      p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1
                      ${form.emoji === item.emoji ? 'bg-brand-primary/20 border-brand-primary text-white' : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'}
                    `}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-[9px] font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                Private Journal Note (Optional)
              </label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-brand-primary text-slate-200 h-16 resize-none"
                placeholder="What is influencing your mood today? (e.g. school grades, good sleep)"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                Activity Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tagsInput}
                onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-brand-primary text-slate-200"
                placeholder="study, sleep, coding, coffee"
              />
            </div>

            <button
              type="submit"
              disabled={logging}
              className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold rounded-xl hover:opacity-95 transition-opacity"
            >
              {logging ? 'Saving Record...' : 'Log Mood Check-In'}
            </button>
          </form>
        </div>

        {/* Analytics Distribution */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-primary" /> Sentiment Distribution
          </h3>
          <div className="h-64">
            {distKeys.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Log a few moods to analyze your emotional distributions.
              </div>
            ) : (
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }, x: { grid: { display: false } } },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Grid of last 28 days */}
      <section className="glass-card p-6">
        <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-primary" /> 28-Day Mood Calendar
        </h3>
        <div className="flex flex-wrap gap-2.5 justify-center py-2 bg-slate-950/20 border border-white/5 rounded-2xl">
          {renderCalendarGrid()}
        </div>
      </section>
    </div>
  );
};
