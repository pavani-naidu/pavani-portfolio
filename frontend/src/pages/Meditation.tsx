import React, { useState, useEffect, useRef } from 'react';
import { BreathingTimer } from '../components/BreathingTimer';
import {
  Compass,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Music,
  CloudRain,
  Flame,
  TreePine,
  Wind
} from 'lucide-react';

interface SoundChannel {
  id: string;
  name: string;
  url: string;
  icon: any;
  color: string;
  audio: any;
}

export const Meditation: React.FC = () => {
  const [isPlayingMain, setIsPlayingMain] = useState(false);
  const [ambientChannels, setAmbientChannels] = useState<SoundChannel[]>([
    {
      id: 'rain',
      name: 'Soft Rain',
      url: 'https://assets.mixkit.co/active_storage/sfx/2433/2433-600.wav', // rain effect loop
      icon: CloudRain,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      audio: null,
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      url: 'https://assets.mixkit.co/active_storage/sfx/2513/2513-600.wav', // wave loop
      icon: Wind,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      audio: null,
    },
    {
      id: 'forest',
      name: 'Forest Birds',
      url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-600.wav', // forest loop
      icon: TreePine,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      audio: null,
    },
  ]);

  const [activeChannels, setActiveChannels] = useState<string[]>([]);
  const [mainAudioTime, setMainAudioTime] = useState('05:00');
  const [meditationTimeLimit, setMeditationTimeLimit] = useState(300); // 5 minutes in secs
  const [meditationProgress, setMeditationProgress] = useState(0);

  const mainTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio channels on mount
  useEffect(() => {
    const initialized = ambientChannels.map((ch) => {
      const audio = new Audio(ch.url);
      audio.loop = true;
      audio.volume = 0.5;
      return { ...ch, audio };
    });
    setAmbientChannels(initialized);

    return () => {
      // Clear audio on leave
      initialized.forEach((ch) => {
        if (ch.audio) {
          ch.audio.pause();
          ch.audio = null;
        }
      });
      if (mainTimerRef.current) clearInterval(mainTimerRef.current);
    };
  }, []);

  const handleToggleChannel = (id: string) => {
    const isChannelActive = activeChannels.includes(id);
    let updatedActive;

    if (isChannelActive) {
      updatedActive = activeChannels.filter((cId) => cId !== id);
      const ch = ambientChannels.find((c) => c.id === id);
      if (ch && ch.audio) ch.audio.pause();
    } else {
      updatedActive = [...activeChannels, id];
      const ch = ambientChannels.find((c) => c.id === id);
      if (ch && ch.audio) {
        ch.audio.play().catch((e) => console.log('Audio playback prevented by browser'));
      }
    }

    setActiveChannels(updatedActive);
  };

  const handleChannelVolume = (id: string, vol: number) => {
    const ch = ambientChannels.find((c) => c.id === id);
    if (ch && ch.audio) {
      ch.audio.volume = vol;
    }
  };

  // Main Meditation Session timer
  useEffect(() => {
    if (isPlayingMain) {
      mainTimerRef.current = setInterval(() => {
        setMeditationProgress((p) => {
          if (p >= meditationTimeLimit) {
            handleStopMeditation();
            alert('Congratulations! Your meditation session is complete. Take a moment to stretch.');
            return 0;
          }
          const nextVal = p + 1;
          const leftSecs = meditationTimeLimit - nextVal;
          const mins = Math.floor(leftSecs / 60);
          const secs = leftSecs % 60;
          setMainAudioTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
          return nextVal;
        });
      }, 1000);
    } else {
      if (mainTimerRef.current) clearInterval(mainTimerRef.current);
    }

    return () => {
      if (mainTimerRef.current) clearInterval(mainTimerRef.current);
    };
  }, [isPlayingMain, meditationTimeLimit]);

  const handleStartMeditation = (durationSecs: number) => {
    setMeditationTimeLimit(durationSecs);
    setMeditationProgress(0);
    const mins = Math.floor(durationSecs / 60);
    setMainAudioTime(`${mins.toString().padStart(2, '0')}:00`);
    setIsPlayingMain(true);
  };

  const handleStopMeditation = () => {
    setIsPlayingMain(false);
    setMeditationProgress(0);
    setMainAudioTime('05:00');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-gradient-to-r from-brand-accent/20 via-brand-secondary/15 to-brand-dark border border-white/5 rounded-3xl p-6 flex items-center justify-between">
        <div>
          <span className="text-brand-accent text-xs font-bold uppercase tracking-wider">Mindfulness Audio Room</span>
          <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1.5">Unpack Study Stress & Breathe</h2>
          <p className="text-slate-400 text-xs mt-1">Blend ambient environments or run guided breathing exercises to center your focus.</p>
        </div>
        <Compass className="w-10 h-10 text-brand-accent animate-spin-slow opacity-80" />
      </section>

      {/* Main Grid: Audio Controls and Breathing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breathing Animation widget */}
        <div className="lg:col-span-1">
          <BreathingTimer />
        </div>

        {/* Ambient audio mixers */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-200 mb-2 flex items-center gap-2">
              <Music className="w-5 h-5 text-brand-primary" /> Ambient Environment Mixer
            </h3>
            <p className="text-slate-400 text-xs mb-6">Play multiple loops together to create your perfect study or relaxation backdrop.</p>

            <div className="space-y-4">
              {ambientChannels.map((ch) => {
                const Icon = ch.icon;
                const isActive = activeChannels.includes(ch.id);
                return (
                  <div
                    key={ch.id}
                    className={`
                      p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all
                      ${isActive ? 'border-brand-primary/20 bg-brand-primary/5' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      <button
                        onClick={() => handleToggleChannel(ch.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          isActive ? 'bg-brand-primary text-white border-transparent shadow-lg shadow-brand-primary/20' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'
                        }`}
                      >
                        {isActive ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-slate-500" />}
                      </button>

                      <div className="text-left">
                        <p className="font-bold text-xs text-slate-200">{ch.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Continuous Ambient Loop</p>
                      </div>
                    </div>

                    {/* Volume slider */}
                    <div className="flex items-center gap-2.5 w-full sm:w-48">
                      <Volume2 className="w-4 h-4 text-slate-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        defaultValue="0.5"
                        onChange={(e) => handleChannelVolume(ch.id, Number(e.target.value))}
                        disabled={!isActive}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-30"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simple timer for general guided meditations */}
          <div className="border-t border-white/5 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Compass className="w-8 h-8 text-brand-accent animate-pulse" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Session Timer</span>
                <p className="text-lg font-bold text-white font-mono leading-tight">{mainAudioTime}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {!isPlayingMain ? (
                <>
                  <button
                    onClick={() => handleStartMeditation(300)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/10 text-slate-200"
                  >
                    5-Min Relax
                  </button>
                  <button
                    onClick={() => handleStartMeditation(600)}
                    className="px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold rounded-xl hover:opacity-95 shadow-md"
                  >
                    10-Min Deep
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStopMeditation}
                  className="px-6 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl"
                >
                  End Session
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
