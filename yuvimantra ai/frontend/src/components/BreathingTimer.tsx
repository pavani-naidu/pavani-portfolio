import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, RefreshCw, Compass } from 'lucide-react';

type MethodType = '4444' | '478';

export const BreathingTimer: React.FC = () => {
  const [method, setMethod] = useState<MethodType>('4444');
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState<'inhale' | 'hold' | 'exhale' | 'holdOut'>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  const getMethodSteps = () => {
    if (method === '4444') {
      return {
        inhale: { text: 'Breathe In...', duration: 4, color: 'from-blue-500 to-indigo-500' },
        hold: { text: 'Hold your breath...', duration: 4, color: 'from-indigo-500 to-purple-500' },
        exhale: { text: 'Breathe Out...', duration: 4, color: 'from-purple-500 to-emerald-500' },
        holdOut: { text: 'Hold empty...', duration: 4, color: 'from-emerald-500 to-blue-500' },
      };
    } else {
      return {
        inhale: { text: 'Breathe In...', duration: 4, color: 'from-blue-500 to-indigo-500' },
        hold: { text: 'Hold your breath...', duration: 7, color: 'from-indigo-500 to-purple-500' },
        exhale: { text: 'Exhale slowly...', duration: 8, color: 'from-purple-500 to-emerald-500' },
        holdOut: { text: 'Rest...', duration: 0, color: 'from-emerald-500 to-blue-500' }, // Skip for 4-7-8
      };
    }
  };

  const stepsInfo = getMethodSteps();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying) {
      if (timeLeft <= 0) {
        // Transition to next state
        if (method === '4444') {
          if (step === 'inhale') {
            setStep('hold');
            setTimeLeft(stepsInfo.hold.duration);
          } else if (step === 'hold') {
            setStep('exhale');
            setTimeLeft(stepsInfo.exhale.duration);
          } else if (step === 'exhale') {
            setStep('holdOut');
            setTimeLeft(stepsInfo.holdOut.duration);
          } else {
            setStep('inhale');
            setTimeLeft(stepsInfo.inhale.duration);
            setCycleCount((c) => c + 1);
          }
        } else {
          // 4-7-8 Breathing
          if (step === 'inhale') {
            setStep('hold');
            setTimeLeft(stepsInfo.hold.duration);
          } else if (step === 'hold') {
            setStep('exhale');
            setTimeLeft(stepsInfo.exhale.duration);
          } else {
            setStep('inhale');
            setTimeLeft(stepsInfo.inhale.duration);
            setCycleCount((c) => c + 1);
          }
        }
      } else {
        timer = setTimeout(() => {
          setTimeLeft((t) => t - 1);
        }, 1000);
      }
    }

    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, step, method, stepsInfo]);

  const handleStart = () => {
    setIsPlaying(true);
    setStep('inhale');
    setTimeLeft(stepsInfo.inhale.duration);
    setCycleCount(0);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setStep('inhale');
    setTimeLeft(4);
  };

  // Determine expanding/shrinking values based on breathing states
  const getCircleScale = () => {
    if (!isPlaying) return 1;
    if (step === 'inhale') return 1.5;
    if (step === 'hold') return 1.5;
    return 1; // exhale and holdOut
  };

  return (
    <div className="glass-card p-6 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-5 h-5 text-brand-primary animate-spin-slow" />
        <h3 className="font-semibold text-lg">Guided Breathing Room</h3>
      </div>

      {/* Select Routine */}
      {!isPlaying && (
        <div className="flex gap-2.5 mb-8 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => { setMethod('4444'); setTimeLeft(4); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              method === '4444' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Box (4-4-4-4)
          </button>
          <button
            onClick={() => { setMethod('478'); setTimeLeft(4); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              method === '478' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Relax (4-7-8)
          </button>
        </div>
      )}

      {/* Breathing Guide Animation */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        {/* Glowing background ring */}
        <div className="absolute inset-0 rounded-full border border-white/5 bg-slate-900/30"></div>
        
        {/* Guided scaling circle */}
        <motion.div
          animate={{
            scale: getCircleScale(),
          }}
          transition={{
            duration: isPlaying ? (step === 'inhale' ? 4 : step === 'exhale' ? (method === '478' ? 8 : 4) : 0.2) : 0.5,
            ease: 'easeInOut',
          }}
          className={`w-28 h-28 rounded-full bg-gradient-to-tr ${
            stepsInfo[step].color
          } flex items-center justify-center opacity-85 shadow-2xl relative z-10`}
        >
          {isPlaying ? (
            <div className="text-center text-white">
              <span className="text-3xl font-bold font-mono">{timeLeft}</span>
              <p className="text-[10px] uppercase font-semibold tracking-wider mt-1">seconds</p>
            </div>
          ) : (
            <Compass className="w-12 h-12 text-white opacity-80" />
          )}
        </motion.div>

        {/* Outer pulse indicator */}
        {isPlaying && (step === 'inhale' || step === 'hold') && (
          <span className="absolute w-32 h-32 bg-brand-primary/10 rounded-full animate-ping z-0"></span>
        )}
      </div>

      {/* Display text */}
      <div className="text-center h-12 mb-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={isPlaying ? stepsInfo[step].text : 'Ready to begin'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-medium text-slate-200"
          >
            {isPlaying ? stepsInfo[step].text : 'Select your method and click Start'}
          </motion.p>
        </AnimatePresence>
        {isPlaying && (
          <p className="text-xs text-slate-400 mt-1">Cycles Completed: {cycleCount}</p>
        )}
      </div>

      {/* Controller Buttons */}
      <div className="flex gap-4">
        {!isPlaying ? (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-semibold rounded-xl hover:opacity-95 transition-opacity flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            Start Session
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-xl border border-red-500/20 transition-colors flex items-center gap-2"
          >
            <Square className="w-4 h-4 fill-red-400" />
            Stop Session
          </button>
        )}
      </div>
    </div>
  );
};
