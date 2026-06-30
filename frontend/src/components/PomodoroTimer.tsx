import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, EyeOff } from 'lucide-react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export const PomodoroTimer: React.FC<{
  onPomodoroComplete?: () => void;
}> = ({ onPomodoroComplete }) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false); // Distraction-free overlay

  // Map modes to durations (in seconds)
  const getDuration = (m: TimerMode) => {
    switch (m) {
      case 'focus': return 25 * 60;
      case 'shortBreak': return 5 * 60;
      case 'longBreak': return 15 * 60;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play chime or warning sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav');
        audio.volume = 0.4;
        audio.play();
      } catch (e) {
        console.log('Audio playback blocked');
      }

      if (mode === 'focus') {
        if (onPomodoroComplete) onPomodoroComplete();
        alert('Focus block complete! Time for a short break.');
        setMode('shortBreak');
        setTimeLeft(5 * 60);
      } else {
        alert('Break ended! Ready to focus?');
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, onPomodoroComplete]);

  const handleModeChange = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getDuration(mode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Percentage for progress indicators
  const totalDuration = getDuration(mode);
  const percentage = ((totalDuration - timeLeft) / totalDuration) * 100;

  const timerContent = (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Mode Switches */}
      {!isFocusMode && (
        <div className="flex gap-2 mb-6 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => handleModeChange('focus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'focus' ? 'bg-brand-primary text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'shortBreak' ? 'bg-brand-accent text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleModeChange('longBreak')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'longBreak' ? 'bg-brand-secondary text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Long Break (15m)
          </button>
        </div>
      )}

      {/* Circle Timer */}
      <div className={`relative w-44 h-44 rounded-full flex items-center justify-center border-4 ${
        mode === 'focus' ? 'border-brand-primary/20' : mode === 'shortBreak' ? 'border-brand-accent/20' : 'border-brand-secondary/20'
      } ${isActive ? 'timer-pulse' : ''} mb-6`}>
        {/* Simple inner circular visualization */}
        <div className="text-center">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-slate-100">
            {formatTime(timeLeft)}
          </span>
          <p className="text-[10px] text-slate-400 uppercase font-semibold mt-1 tracking-wider">
            {mode === 'focus' ? 'Focus Block' : 'Break Time'}
          </p>
        </div>
        
        {/* Dynamic Border Progress overlay using absolute CSS borders (simple slice representation) */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent pointer-events-none transition-all duration-1000"
          style={{
            borderColor: mode === 'focus' ? '#3B82F6' : mode === 'shortBreak' ? '#10B981' : '#A855F7',
            clipPath: `polygon(50% 50%, 50% 0%, ${percentage >= 25 ? '100% 0%,' : ''} ${percentage >= 50 ? '100% 100%,' : ''} ${percentage >= 75 ? '0% 100%,' : ''} 0% 0%)`,
            opacity: percentage > 0 ? 0.8 : 0,
          }}
        ></div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={resetTimer}
          className="p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTimer}
          className={`px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-md ${
            isActive
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/10'
              : 'bg-brand-primary hover:bg-brand-primary/90 shadow-brand-primary/10'
          } flex items-center gap-2`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-white" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" /> Start
            </>
          )}
        </button>

        <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className="p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title={isFocusMode ? 'Exit Distraction-Free' : 'Distraction-Free Mode'}
        >
          {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Default Widget View */}
      {!isFocusMode ? (
        <div className="glass-card p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <EyeOff className="w-5 h-5 text-brand-primary" />
            <h3 className="font-semibold text-lg">Focus Zone (Pomodoro)</h3>
          </div>
          {timerContent}
        </div>
      ) : (
        /* Distraction-Free Overlay View */
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[999] flex flex-col items-center justify-center p-6 transition-all duration-300">
          <div className="absolute top-8 right-8">
            <button
              onClick={() => setIsFocusMode(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Minimize2 className="w-4 h-4" />
              Exit Focus Mode
            </button>
          </div>

          <div className="max-w-md w-full scale-110">
            <h2 className="text-slate-400 font-medium text-sm text-center mb-10 tracking-widest uppercase">
              "Focus is a muscle. Keep it strong."
            </h2>
            {timerContent}
          </div>
        </div>
      )}
    </>
  );
};
