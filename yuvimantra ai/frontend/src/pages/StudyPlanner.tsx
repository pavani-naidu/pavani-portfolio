import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PomodoroTimer } from '../components/PomodoroTimer';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  CheckCircle,
  Circle,
  Bookmark,
  CalendarCheck,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

export const StudyPlanner: React.FC = () => {
  const { refreshUser } = useAuth();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    summary: { total: 0, completed: 0, pending: 0, completionRate: 0, totalPomodorosSpent: 0 },
    subjectCounts: {},
    countdowns: [],
  });

  const [form, setForm] = useState({
    title: '',
    subject: '',
    category: 'study' as 'assignment' | 'exam' | 'study' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    pomodorosExpected: 1,
    notes: '',
  });

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const fetchPlannerData = async () => {
    try {
      const taskRes = await api.get('/tasks');
      setTasks(taskRes.data);

      const statsRes = await api.get('/tasks/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject.trim() || !form.dueDate) {
      alert('Please fill in required fields');
      return;
    }

    setCreating(true);
    try {
      await api.post('/tasks', form);
      setForm({
        title: '',
        subject: '',
        category: 'study',
        priority: 'medium',
        dueDate: '',
        pomodorosExpected: 1,
        notes: '',
      });
      fetchPlannerData();
      refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleComplete = async (task: any) => {
    try {
      await api.put(`/tasks/${task._id}`, { isCompleted: !task.isCompleted });
      fetchPlannerData();
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchPlannerData();
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncrementPomodoro = async (task: any) => {
    try {
      await api.put(`/tasks/${task._id}`, { pomodorosSpent: task.pomodorosSpent + 1 });
      fetchPlannerData();
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Completion summary */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Completion rate</span>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">{stats.summary.completionRate}%</p>
            <p className="text-[10px] text-slate-400 mt-1">{stats.summary.completed} of {stats.summary.total} completed</p>
          </div>
          <CalendarCheck className="w-8 h-8 text-brand-primary opacity-80" />
        </div>

        {/* Pomodoros counter */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Focus Sessions Done</span>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">{stats.summary.totalPomodorosSpent} pomodoros</p>
            <p className="text-[10px] text-slate-400 mt-1">~{stats.summary.totalPomodorosSpent * 25} minutes logged</p>
          </div>
          <Clock className="w-8 h-8 text-brand-secondary opacity-80" />
        </div>

        {/* Countdown warning alerts */}
        <div className="glass-card p-5 md:col-span-2 space-y-2">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-brand-primary" /> Exam countdown deadlines
          </span>
          <div className="space-y-1.5 max-h-16 overflow-y-auto">
            {stats.countdowns.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No upcoming exams. Relax!</p>
            ) : (
              stats.countdowns.map((cd: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[200px]">
                    {cd.subject}: {cd.title}
                  </span>
                  <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/10 text-red-400 rounded-lg font-bold text-[10px] shrink-0 font-mono">
                    {cd.daysLeft} days left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Main Grid: Planner and Pomodoro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pomodoro circular timer */}
        <div className="space-y-6">
          <PomodoroTimer onPomodoroComplete={fetchPlannerData} />
          
          {/* Quick task adder form */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-primary" /> Schedule Study Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read Chapter 5 of Biology"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Biology"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="study">Study</option>
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold rounded-xl hover:opacity-95 transition-opacity"
              >
                Create Study Plan
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Planner entries */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-brand-primary" /> Active Study Planner
            </h3>
            
            <div className="space-y-3 max-h-[calc(100vh-360px)] overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Your study list is empty. Add tasks to start planning focus sessions!
                </div>
              ) : (
                tasks.map((t) => (
                  <div
                    key={t._id}
                    className={`
                      p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4 transition-all
                      ${t.isCompleted ? 'opacity-65' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <button onClick={() => handleToggleComplete(t)} className="text-slate-400 hover:text-white shrink-0">
                        {t.isCompleted ? (
                          <CheckCircle2 className="w-5.5 h-5.5 text-brand-accent fill-brand-accent/15" />
                        ) : (
                          <Circle className="w-5.5 h-5.5" />
                        )}
                      </button>
                      
                      <div className="overflow-hidden">
                        <p className={`font-semibold text-xs text-slate-200 truncate ${t.isCompleted ? 'line-through text-slate-500' : ''}`}>
                          {t.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.2 rounded font-bold text-slate-400 uppercase">
                            {t.subject}
                          </span>
                          <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            t.priority === 'high' ? 'bg-red-500/15 text-red-400' : t.priority === 'medium' ? 'bg-orange-500/15 text-orange-400' : 'bg-slate-500/15 text-slate-400'
                          }`}>
                            {t.priority}
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono">
                            Due: {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Increment Pomodoro logged to this task */}
                      {!t.isCompleted && (
                        <button
                          onClick={() => handleIncrementPomodoro(t)}
                          className="px-2.5 py-1.5 bg-white/5 border border-white/10 text-[9px] font-bold rounded-lg text-slate-300 hover:text-white flex items-center gap-1"
                          title="Log 1 Focus Session"
                        >
                          🍅 <span className="font-mono">{t.pomodorosSpent}</span>
                        </button>
                      )}
                      
                      <button onClick={() => handleDeleteTask(t._id)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
