import React, { useState, useEffect } from 'react';
import {
  Users,
  Settings2,
  FileText,
  LineChart,
  ShieldCheck,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Activity
} from 'lucide-react';
import api from '../services/api';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'feedback' | 'logs'>('users');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [sysStats, setSysStats] = useState<any>({
    counts: { users: 0, chats: 0, messages: 0, moods: 0, journals: 0, feedbacks: 0, aiUsageCount: 0 },
    averageMoodScore: 0,
    registrationTrend: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      setSysStats(statsRes.data);

      const usersRes = await api.get('/admin/users');
      setUsersList(usersRes.data);

      const feedbackRes = await api.get('/admin/feedbacks');
      setFeedbacks(feedbackRes.data);

      const logsRes = await api.get('/admin/logs');
      setAuditLogs(logsRes.data);
    } catch (err) {
      console.error('Error fetching admin diagnostics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-500/20 via-slate-800/25 to-slate-900 border border-white/5 rounded-3xl p-6 flex items-center justify-between">
        <div>
          <span className="text-brand-secondary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-secondary" /> Administrative Diagnostics Hub
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1.5">System Audit & Usage Summary</h2>
          <p className="text-slate-400 text-xs mt-1">Review active user details, platform usage metrics, and audit logs.</p>
        </div>
        <Settings2 className="w-10 h-10 text-brand-secondary animate-spin-slow opacity-80" />
      </section>

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">
          Loading administration stats...
        </div>
      ) : (
        <>
          {/* System Metrics Panel */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Registered Students', val: sysStats.counts.users, icon: Users, color: 'text-blue-400' },
              { label: 'AI Messages Streamed', val: sysStats.counts.aiUsageCount, icon: MessageSquare, color: 'text-purple-400' },
              { label: 'Emotional Mood Logs', val: sysStats.counts.moods, icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'Platform Reviews Logged', val: sysStats.counts.feedbacks, icon: ThumbsUp, color: 'text-yellow-400' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="glass-card p-5 text-left">
                  <Icon className={`w-6 h-6 ${stat.color} mb-3`} />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</span>
                  <p className="text-2xl font-extrabold text-white mt-1 font-mono">{stat.val}</p>
                </div>
              );
            })}
          </section>

          {/* Admin Tabs control */}
          <div className="flex gap-2.5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 w-fit">
            {[
              { id: 'users', label: 'User Directory', icon: Users },
              { id: 'feedback', label: 'User Feedback', icon: ThumbsUp },
              { id: 'logs', label: 'System Audit Logs', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all
                    ${activeTab === tab.id ? 'bg-brand-secondary text-white shadow-md' : 'text-slate-400 hover:text-white'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="glass-card p-6 min-h-[300px]">
            {/* Users Directory */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="font-bold text-sm text-slate-200">Registered Accounts</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Count: {usersList.length}</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-400 border-b border-white/5 uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-4">Name</th>
                        <th className="py-2.5 px-4">Email</th>
                        <th className="py-2.5 px-4">Role</th>
                        <th className="py-2.5 px-4">Points (XP)</th>
                        <th className="py-2.5 px-4 text-right">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {usersList.map((usr) => (
                        <tr key={usr._id} className="text-slate-300 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white">{usr.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{usr.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                              usr.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {usr.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-yellow-500">{usr.stats?.points || 0}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-500">
                            {new Date(usr.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Feedback Listing */}
            {activeTab === 'feedback' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="font-bold text-sm text-slate-200 font-sans">User Reviews & Feedbacks</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Total: {feedbacks.length}</span>
                </div>

                <div className="space-y-3.5 max-h-96 overflow-y-auto">
                  {feedbacks.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-10">No feedback submissions found.</p>
                  ) : (
                    feedbacks.map((fb) => (
                      <div key={fb._id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {fb.user?.name || 'Anonymous User'}
                            </span>
                            <span className="px-1.5 py-0.2 bg-white/5 border border-white/10 text-[9px] font-bold rounded text-slate-400 uppercase">
                              #{fb.category}
                            </span>
                          </div>
                          <span className="text-yellow-500 text-xs font-bold font-mono">{'★'.repeat(fb.rating)}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic">"{fb.comment}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* System Audit logs */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="font-bold text-sm text-slate-200">Event Audits Logger</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Stream: Active</span>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5 font-mono text-[11px] text-slate-400 space-y-2 max-h-96 overflow-y-auto">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 hover:text-white transition-colors">
                      <span className="text-slate-500 shrink-0">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>
                      <span className="text-purple-400 shrink-0 font-bold">[{log.event}]</span>
                      <span className="leading-relaxed">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
