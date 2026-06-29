import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Heart, Compass, CheckSquare, Calendar, ShieldCheck } from 'lucide-react';

export const Landing: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const features = [
    {
      title: 'Empathic AI Companion',
      description: 'Chat with a friendly, non-judgmental AI that supports stress relief, study anxiety, and emotional wellness.',
      icon: MessageSquare,
      color: 'text-blue-400 bg-blue-500/10'
    },
    {
      title: 'Mood Logs & Insights',
      description: 'Track daily emotions, map charts, and analyze triggers to understand your mental wellbeing trends.',
      icon: Heart,
      color: 'text-rose-400 bg-rose-500/10'
    },
    {
      title: 'Distraction-Free Study Timer',
      description: 'Maintain healthy study rhythms using our Pomodoro timer and full-screen distraction blockers.',
      icon: Calendar,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      title: 'Streak-Based Habits',
      description: 'Establish consistent routines for exercise, coding, prayer, hydration, and sleep with progress streaks.',
      icon: CheckSquare,
      color: 'text-purple-400 bg-purple-500/10'
    },
    {
      title: 'Audio Meditation Room',
      description: 'Relax your mind with breathing exercises (Box/4-7-8) and custom calming sound environments.',
      icon: Compass,
      color: 'text-amber-400 bg-amber-500/10'
    },
    {
      title: 'Privacy First & Secure',
      description: 'Fully encrypted user logs, anonymized AI chats, and absolute data control. Your safety is our priority.',
      icon: ShieldCheck,
      color: 'text-sky-400 bg-sky-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-primary" />
          <span className="font-extrabold text-xl tracking-tight text-gradient">YuviMantra AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-semibold rounded-xl hover:opacity-95 transition-opacity shadow-lg shadow-brand-primary/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:py-24 text-center z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6 text-xs text-brand-primary font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Student Wellbeing & Focus
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight font-sans"
          >
            "A Friend Who Listens.<br />
            <span className="text-gradient">An AI That Cares."</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Meet YuviMantra AI—your emotional wellness, productivity, and study companion. Navigate stress, build healthy habits, and master your classes with support by your side.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              to="/signup"
              className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-2xl hover:opacity-95 transition-all text-base shadow-xl shadow-brand-primary/20 scale-100 active:scale-95"
            >
              Begin Your Journey
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white/5 border border-white/10 text-slate-200 font-bold rounded-2xl hover:bg-white/10 transition-all text-base"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Core Features Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left max-w-7xl mx-auto"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="glass-card p-6 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.color} mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-100 mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-8 text-center text-xs text-slate-500 z-10">
        <p>&copy; {new Date().getFullYear()} YuviMantra AI. Built for student wellness.</p>
        <p className="mt-1.5 text-[10px] text-slate-600 max-w-md mx-auto px-4">
          Disclaimer: YuviMantra AI is an emotional wellness helper, not a substitute for professional therapy or medical diagnostics.
        </p>
      </footer>
    </div>
  );
};
