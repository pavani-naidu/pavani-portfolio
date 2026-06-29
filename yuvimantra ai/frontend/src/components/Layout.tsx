import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  MessageSquare,
  Smile,
  BookOpen,
  Calendar,
  CheckSquare,
  Sparkles,
  User,
  LogOut,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  Compass,
  Award,
  BookOpenCheck
} from 'lucide-react';
import api from '../services/api';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Mood Tracker', path: '/moods', icon: Smile },
    { name: 'Journal', path: '/journal', icon: BookOpen },
    { name: 'Study Planner', path: '/study', icon: Calendar },
    { name: 'Habit Tracker', path: '/habits', icon: CheckSquare },
    { name: 'Meditation Room', path: '/meditation', icon: Compass },
    { name: 'Profile & Bio', path: '/profile', icon: User },
  ];

  // Admin access
  if (user?.role === 'admin') {
    menuItems.push({ name: 'Admin Hub', path: '/admin', icon: BookOpenCheck });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row relative overflow-hidden">
      {/* Premium ambient glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-secondary/5 blur-[120px] pointer-events-none z-0"></div>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-white/5 sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-primary" />
          <span className="font-extrabold text-xl tracking-tight text-gradient">Yuvi Mantra AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="text-slate-400 hover:text-white">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400 hover:text-white">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/60 backdrop-blur-xl border-r border-white/5 flex flex-col justify-between p-4
        transition-transform duration-300 md:translate-x-0 md:static md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo */}
          <Link to="/dashboard" className="hidden md:flex items-center gap-2 mb-8 px-2 py-1">
            <Sparkles className="w-7 h-7 text-brand-primary animate-pulse" />
            <span className="font-extrabold text-2xl tracking-tight text-gradient">Yuvi Mantra</span>
          </Link>

          {/* User Widget */}
          {user && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-md">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.substring(0, 1).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-yellow-500" />
                  <p className="text-xs text-slate-400">Level {user.stats?.level} | {user.stats?.points} XP</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 text-white border-l-2 border-brand-primary'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-primary' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5 text-yellow-500" /> Light Mode
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-brand-primary" /> Dark Mode
              </>
            )}
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
        {/* Top Navbar */}
        <header className="hidden md:flex items-center justify-between p-6 bg-slate-950 border-b border-white/5">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Welcome, {user?.name.split(' ')[0]}</h1>
            <p className="text-xs text-slate-400 mt-0.5">"A Friend Who Listens. An AI That Cares."</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <button onClick={handleMarkAllRead} className="text-xs text-brand-primary hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-2.5 rounded-xl text-xs border ${
                            n.isRead ? 'bg-white/0 border-transparent text-slate-400' : 'bg-white/5 border-white/5 text-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-semibold">{n.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Shortcuts */}
            <button
              onClick={() => navigate('/chat')}
              className="px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-lg shadow-brand-primary/20"
            >
              <Sparkles className="w-4 h-4" />
              Quick Chat
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
