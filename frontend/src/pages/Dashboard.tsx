import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  Sparkles,
  Smile,
  Flame,
  Award,
  Droplet,
  Moon,
  Coffee,
  CheckCircle2,
  TrendingUp,
  Compass,
  ArrowRight,
  BookOpen,
  Calendar,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend, Filler);

export const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [moodLogged, setMoodLogged] = useState(false);
  const [waterCups, setWaterCups] = useState(0);
  const [sleepHours, setSleepHours] = useState(8);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [weeklyCompletedHabits, setWeeklyCompletedHabits] = useState(0);
  
  const affirmations = [
    "You are capable of doing hard things. Take a breath.",
    "Your progress is valid, no matter how small it feels.",
    "Rest is just as productive as studying. Be kind to yourself.",
    "Every error is a lesson. Keep coding, keep growing.",
  ];
  
  const [dailyQuote] = useState(() => affirmations[Math.floor(Math.random() * affirmations.length)]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Get recent moods
      const moodRes = await api.get('/moods?limit=7');
      setMoodHistory(moodRes.data.reverse());
      
      // Check if logged mood today
      const todayStr = new Date().toDateString();
      const hasLoggedToday = moodRes.data.some(
        (m: any) => new Date(m.date).toDateString() === todayStr
      );
      setMoodLogged(hasLoggedToday);

      // 2. Get task stats
      const taskStatsRes = await api.get('/tasks/stats');
      setPendingTasks(taskStatsRes.data.summary.pending);

      // 3. Get habits completed count
      const habitRes = await api.get('/habits');
      const todayFormatStr = new Date().toISOString().split('T')[0];
      const completedTodayCount = habitRes.data.filter((h: any) =>
        h.completions.includes(todayFormatStr)
      ).length;
      setWeeklyCompletedHabits(completedTodayCount);
    } catch (err) {
      console.error('Error loading dashboard data', err);
    }
  };

  const handleQuickMoodLog = async (mood: string, value: number, emoji: string) => {
    try {
      await api.post('/moods', { mood, value, emoji, note: 'Quick logged from dashboard' });
      setMoodLogged(true);
      fetchDashboardData();
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncrementWater = () => {
    if (waterCups < 12) {
      setWaterCups((w) => w + 1);
      // Award 2 points per cup
      api.put('/users/profile', { stats: { points: (user?.stats?.points || 0) + 2 } }).then(() => refreshUser());
    }
  };

  const handleDecrementWater = () => {
    if (waterCups > 0) setWaterCups((w) => w - 1);
  };

  const handleSaveSleep = async () => {
    try {
      // Award 5 points for sleep tracking
      alert(`Hours of sleep logged: ${sleepHours} hours! (+5 XP)`);
      api.put('/users/profile', { stats: { points: (user?.stats?.points || 0) + 5 } }).then(() => refreshUser());
    } catch (err) {
      console.error(err);
    }
  };

  // Compile Chart data
  const chartData = {
    labels: moodHistory.map((m) =>
      new Date(m.date).toLocaleDateString([], { weekday: 'short' })
    ),
    datasets: [
      {
        fill: true,
        label: 'Emotional Score',
        data: moodHistory.map((m) => m.value),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.35,
        pointBackgroundColor: '#A855F7',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { min: 1, max: 5, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-brand-primary/30 via-brand-secondary/20 to-brand-dark border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-brand-primary/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-brand-primary text-sm font-semibold uppercase tracking-wider">
              <Sparkles className="w-4.5 h-4.5 animate-spin-slow" /> Daily Inspiration
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              "{dailyQuote}"
            </h2>
            <p className="text-slate-400 text-xs mt-1">Today's Challenge: Complete a Pomodoro session and log your hydration goals!</p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            <div className="text-left">
              <span className="text-xs text-slate-400 font-medium">Daily Streak</span>
              <p className="text-sm font-bold text-white leading-none">{user?.stats?.currentStreak || 0} Days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mood Log & Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Logger */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg text-slate-200 mb-2 flex items-center gap-2">
              <Smile className="w-5 h-5 text-brand-primary" /> How are you feeling today?
            </h3>
            <p className="text-slate-400 text-xs mb-4">Log your mood to unlock wellness stats and advice.</p>
            
            {moodLogged ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-2xl text-center">
                ✨ Thank you! You've logged your mood today. Check your analytics below.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { label: 'Happy', emoji: '😊', value: 5 },
                  { label: 'Calm', emoji: '🧘', value: 4 },
                  { label: 'Energetic', emoji: '⚡', value: 4 },
                  { label: 'Tired', emoji: '😴', value: 3 },
                  { label: 'Anxious', emoji: '😰', value: 2 },
                  { label: 'Sad', emoji: '😢', value: 1 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleQuickMoodLog(item.label, item.value, item.emoji)}
                    className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-brand-primary/40 transition-all flex flex-col items-center gap-1.5"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-[10px] font-semibold text-slate-300">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Mood Trend Chart */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-primary" /> Mood Trends (Weekly)
              </h3>
              <button onClick={() => navigate('/moods')} className="text-xs text-brand-primary font-semibold hover:underline flex items-center gap-0.5">
                Full Analytics <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="h-56">
              {moodHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Log your mood for a few days to compile history.
                </div>
              ) : (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Widgets */}
        <div className="space-y-6">
          {/* Water Intake Tracker */}
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <Droplet className="w-8 h-8 text-brand-primary mb-2 animate-bounce" />
            <h3 className="font-bold text-lg text-slate-200">Hydration Monitor</h3>
            <p className="text-slate-400 text-xs mb-4">Aim for 8 cups of water per day.</p>
            
            {/* Water glass visualization */}
            <div className="w-20 h-28 bg-slate-900 border-2 border-brand-primary/40 rounded-b-2xl rounded-t-lg relative overflow-hidden mb-4 shadow-inner">
              <div
                className="absolute bottom-0 inset-x-0 bg-brand-primary/40 transition-all duration-500"
                style={{ height: `${(waterCups / 8) * 100}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-white">
                {waterCups} / 8
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDecrementWater}
                className="px-3 py-1 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-xs font-semibold"
              >
                -
              </button>
              <button
                onClick={handleIncrementWater}
                className="px-4 py-1.5 bg-brand-primary text-white rounded-xl hover:opacity-90 text-xs font-semibold shadow-md"
              >
                + Drink Cup
              </button>
            </div>
          </div>

          {/* Sleep Tracker */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg text-slate-200 mb-2 flex items-center gap-2">
              <Moon className="w-5 h-5 text-brand-secondary" /> Sleep Logger
            </h3>
            <p className="text-slate-400 text-xs mb-4">Track sleep quality for focus logs.</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Sleep Duration:</span>
                <span className="text-sm font-bold text-brand-secondary font-mono">{sleepHours} Hours</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <button
                onClick={handleSaveSleep}
                className="w-full py-2 bg-brand-secondary/10 hover:bg-brand-secondary/20 text-brand-secondary text-xs font-semibold rounded-xl border border-brand-secondary/20 transition-colors"
              >
                Log Sleep
              </button>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="glass-card p-6 space-y-4.5">
            <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" /> Today's Overview
            </h3>
            
            <div className="space-y-3">
              {/* Study planner count */}
              <div className="flex justify-between items-center p-2.5 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-brand-primary" />
                  <span className="text-xs text-slate-300">Pending Tasks</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">{pendingTasks} Tasks</span>
              </div>

              {/* Habit completion stats */}
              <div className="flex justify-between items-center p-2.5 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-accent" />
                  <span className="text-xs text-slate-300">Habits Logged Today</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">{weeklyCompletedHabits} Checked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: 'Start Pomodoro', desc: 'Focus timer', path: '/study', icon: Coffee, color: 'hover:border-blue-500/50' },
          { name: 'Mindful Breathing', desc: 'Box exercises', path: '/meditation', icon: Compass, color: 'hover:border-emerald-500/50' },
          { name: 'Write Journal', desc: 'AI summary logs', path: '/journal', icon: BookOpen, color: 'hover:border-purple-500/50' },
          { name: 'Chat with AI', desc: 'Emotional support', path: '/chat', icon: MessageSquare, color: 'hover:border-sky-500/50' },
        ].map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.name}
              onClick={() => navigate(act.path)}
              className={`glass-card p-5 text-left flex flex-col gap-2 transition-all ${act.color}`}
            >
              <Icon className="w-6 h-6 text-slate-400 group-hover:text-white" />
              <div>
                <p className="font-semibold text-sm text-slate-100">{act.name}</p>
                <p className="text-[10px] text-slate-400">{act.desc}</p>
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
};
