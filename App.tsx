
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Zap, Smartphone, GraduationCap, BookOpen, Briefcase, 
  Moon, Trophy, Sparkles, Target, Activity, Cpu, Check, Settings2, Clock, 
  CalendarDays, ChevronRight, Bot, ChevronLeft, Timer, StickyNote, Flame, 
  X, ArrowRight, Tag, Bell, Menu, User, Award, TrendingUp,
  Info, ShieldCheck, Palette, Smile, Heart, Coffee, Book, Send, ShieldAlert, CloudRain, Sun, Trees, Snowflake, CloudOff
} from 'lucide-react';
import { AppState, Tab, DayData, Goal, StateOfHeart } from './types';
import { askAIArchitectStream } from './geminiService';
import { THEMES } from './src/constants';
import { TodayView } from './src/components/TodayView';
import { ProfileView } from './src/components/ProfileView';
import { UserPortfolio } from './src/components/UserPortfolio';
import { AIModal } from './src/components/AIModal';

import { useAppStore } from './store';

const App: React.FC = () => {
  const { 
    userName, setUserName, archetype, setArchetype, themeName, setThemeName, onboardingComplete, completeOnboarding,
    thresholds, setThresholds, segments, setSegments, localData, updateDayData, habits, setHabits,
    healthProfile, setHealthProfile, coreIdentity, setCoreIdentity, habitStacks, setHabitStacks,
    dailyMood, setDailyMood, weatherTheme, setWeatherTheme
  } = useAppStore();

  const [appState, setAppState] = useState<AppState>(onboardingComplete ? AppState.DASHBOARD : AppState.WELCOME);
  const [onboardingStep, setOnboardingStep] = useState(0); 
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DAILY);
  const [overlayView, setOverlayView] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{id: string, text: string, read: boolean}[]>([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  
  const showSuccessToast = (message: string = "DATA SYNCHRONIZED") => {
    setToast({show: true, message});
    setTimeout(() => setToast({show: false, message: ''}), 3000);
  };

  // Custom Prompt State
  const [promptConfig, setPromptConfig] = useState<{ isOpen: boolean; message: string; onSubmit: (val: string) => void; onCancel: () => void; defaultValue?: string } | null>(null);

  const customPrompt = (message: string, defaultValue: string = ""): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptConfig({
        isOpen: true,
        message,
        defaultValue,
        onSubmit: (val) => {
          setPromptConfig(null);
          resolve(val);
        },
        onCancel: () => {
          setPromptConfig(null);
          resolve(null);
        }
      });
    });
  };

  useEffect(() => {
    applyTheme(themeName);
  }, [themeName]);

  // Sanitize habits to ensure they are strings (migration from object format) and unique
  useEffect(() => {
    let needsUpdate = false;
    let sanitized = habits;

    if (habits && habits.some((h: any) => typeof h !== 'string')) {
      sanitized = habits.map((h: any) => typeof h === 'string' ? h : (h.text || ''));
      needsUpdate = true;
    }

    if (sanitized) {
      const uniqueHabits = Array.from(new Set(sanitized.filter((h: string) => h && h.trim() !== '')));
      if (uniqueHabits.length !== habits.length) {
        setHabits(uniqueHabits);
      } else if (needsUpdate) {
        setHabits(uniqueHabits);
      }
    }
  }, [habits, setHabits]);

  // Sanitize segments to ensure they are unique
  useEffect(() => {
    if (segments) {
      const uniqueSegments = Array.from(new Set(segments));
      if (uniqueSegments.length !== segments.length) {
        setSegments(uniqueSegments);
      }
    }
  }, [segments, setSegments]);

  const applyTheme = (name: string) => {
    const t = THEMES[name];
    if (!t) return;
    const root = document.documentElement;
    root.style.setProperty('--app-bg', t.bg);
    root.style.setProperty('--card-bg', t.card);
    root.style.setProperty('--accent-primary', t.accent);
    root.style.setProperty('--text-main', t.text);
    
    // Convert hex to rgb for rgba() usage
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '79, 70, 229';
    };
    root.style.setProperty('--accent-primary-rgb', hexToRgb(t.accent));
    root.style.setProperty('--text-main-rgb', hexToRgb(t.text));
  };

  const saveProfile = (name: string, arch: 'optimizer' | 'balancer') => {
    setUserName(name);
    setArchetype(arch);
    setThemeName('Rainy');
    
    // Set baseline health targets based on archetype
    if (arch === 'optimizer') {
      setThresholds({ leisureMax: 120, productiveMin: 240, offlineMin: 120, sleepMin: 420 }); // 7 hours sleep
      if (!habits || habits.length === 0) {
        setHabits(['Deep Work', 'Exercise', 'Read 10 Pages']);
      }
    } else {
      setThresholds({ leisureMax: 120, productiveMin: 240, offlineMin: 120, sleepMin: 480 }); // 8 hours sleep
      if (!habits || habits.length === 0) {
        setHabits(['Meditation', 'Walk', 'Journaling']);
      }
    }
    
    completeOnboarding();
    setAppState(AppState.DASHBOARD);
  };

  const currentDayStr = new Date().toISOString().split('T')[0];
  const currentDay = (localData && localData[currentDayStr]) || { goals: [], deviceTime: '0', studyLogs: [], leisureDeviceTime: 0, productiveDeviceTime: 0, offlineTime: 0, sleepTime: 0, waterIntake: 0 };
  const currentMood = (dailyMood && dailyMood[currentDayStr]) || null;

  if (appState === AppState.WELCOME) {
    if (onboardingStep === 0) {
      return (
        <div className="h-screen bg-[var(--app-bg)] flex items-center justify-center p-6 transition-colors duration-500">
          <div className="w-full max-w-sm bg-[var(--card-bg)] rounded-[2rem] shadow-2xl relative border border-white/5 flex flex-col p-8 text-center animate-in overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Cpu size={120} /></div>
            <div className="mt-4 space-y-2 relative z-10">
              <div className="w-20 h-20 mx-auto flex items-center justify-center mb-6 drop-shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.3)]">
                <img src="/icon.svg" alt="Life Sync Pro Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-mono text-[var(--text-main)] tracking-tighter uppercase drop-shadow-lg">LIFE SYNC</h1>
              <p className="text-[var(--text-main)] opacity-60 text-[10px] font-mono tracking-[0.4em] uppercase">Daily Tracking OS</p>
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-6 relative z-10 mt-8 mb-8">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-60 tracking-widest ml-2">Operator ID</label>
                <input 
                  value={userName} 
                  onChange={e => setUserName(e.target.value)} 
                  className="w-full bg-black/40 border border-[var(--text-main)]/10 p-4 rounded-xl text-[var(--text-main)] font-mono text-sm outline-none focus:border-[var(--accent-primary)] transition-all placeholder:text-[var(--text-main)]/20 shadow-inner" 
                  placeholder="Enter your name..." 
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-70 tracking-widest ml-2">System Archetype</label>
                <div className="flex gap-3">
                  <button onClick={() => setArchetype('optimizer')} className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-3 ${archetype === 'optimizer' ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.3)]' : 'bg-[var(--text-main)]/5 border-[var(--text-main)]/10 opacity-60 hover:opacity-100'}`}>
                    <Zap size={24} className={archetype === 'optimizer' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-main)] opacity-50'} />
                    <span className={`text-[10px] font-mono tracking-widest ${archetype === 'optimizer' ? 'text-[var(--text-main)]' : 'text-[var(--text-main)] opacity-50'}`}>OPTIMIZER</span>
                  </button>
                  <button onClick={() => setArchetype('balancer')} className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-3 ${archetype === 'balancer' ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.3)]' : 'bg-[var(--text-main)]/5 border-[var(--text-main)]/10 opacity-60 hover:opacity-100'}`}>
                    <Heart size={24} className={archetype === 'balancer' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-main)] opacity-50'} />
                    <span className={`text-[10px] font-mono tracking-widest ${archetype === 'balancer' ? 'text-[var(--text-main)]' : 'text-[var(--text-main)] opacity-50'}`}>BALANCER</span>
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              disabled={!userName || !archetype} 
              onClick={() => setOnboardingStep(1)} 
              className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-xl font-mono uppercase text-[10px] tracking-widest disabled:opacity-30 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.4)] flex items-center justify-center gap-2 relative z-10"
            >
              Initialize Sequence <ArrowRight size={14} />
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="h-screen bg-[var(--app-bg)] p-6 flex flex-col items-center justify-center animate-in">
          <div className="max-w-sm w-full bg-[var(--card-bg)] rounded-[2rem] border border-white/10 p-8 shadow-2xl space-y-8 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-primary)] shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.5)]" />
            
            <div className="space-y-2">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center mb-4 border border-emerald-500/30">
                <Check size={24} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-mono text-[var(--text-main)] uppercase tracking-tight">Profile Accepted</h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-main)] opacity-60">Welcome, Operator {userName}</p>
            </div>

            <div className="space-y-3 text-left bg-black/20 p-5 rounded-[1.5rem] border border-[var(--text-main)]/5">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-main)] opacity-50 mb-4">System Modules Online</h3>
              <div className="flex gap-4 items-center">
                <Activity size={16} className="text-emerald-400" />
                <p className="text-xs font-mono text-[var(--text-main)] opacity-80">Daily Log</p>
              </div>
              <div className="flex gap-4 items-center">
                <Sparkles size={16} className="text-orange-400" />
                <p className="text-xs font-mono text-[var(--text-main)] opacity-80">Habit Tracking</p>
              </div>
              <div className="flex gap-4 items-center">
                <Heart size={16} className="text-rose-400" />
                <p className="text-xs font-mono text-[var(--text-main)] opacity-80">Vitals & Mood</p>
              </div>
              <div className="flex gap-4 items-center">
                <Bot size={16} className="text-blue-400" />
                <p className="text-xs font-mono text-[var(--text-main)] opacity-80">Oracle AI Coach</p>
              </div>
            </div>
            
            <button onClick={() => saveProfile(userName, archetype as any)} className="w-full py-4 bg-[var(--accent-primary)] rounded-xl text-white font-mono uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.4)] flex items-center justify-center gap-2">
              Enter Dashboard <ArrowRight size={14} />
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex h-screen overflow-hidden text-[var(--text-main)] bg-[var(--app-bg)] transition-colors duration-500 font-sans">
      <Sidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)} 
        onSelectOverlay={setOverlayView}
        userName={userName}
        archetype={archetype}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden max-w-5xl mx-auto w-full">
        <header className="px-6 pt-6 pb-4 flex justify-between items-center bg-transparent backdrop-blur-md z-30 sticky top-0">
          <div className="flex items-center gap-3">
            {overlayView ? (
              <button onClick={() => setOverlayView(null)} className="p-2 -ml-2 text-slate-400 hover:text-white active:scale-90 transition-transform"><ChevronLeft size={20}/></button>
            ) : (
              <button onClick={() => setShowSidebar(true)} className="p-2 -ml-2 text-[var(--text-main)] opacity-60 hover:opacity-100 active:scale-90 transition-transform"><Menu size={18}/></button>
            )}
            <h1 className="text-base font-mono uppercase tracking-tighter text-[var(--text-main)] opacity-90">{overlayView === 'profile' ? 'Settings' : overlayView === 'portfolio' ? 'Profile' : overlayView || activeTab}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => {
              const weathers = ['None', 'Sunny', 'Rainy', 'Deep Forest', 'Snowy'];
              const currentIndex = weathers.indexOf(weatherTheme);
              const nextIndex = (currentIndex + 1) % weathers.length;
              setWeatherTheme(weathers[nextIndex]);
              setThemeName(weathers[nextIndex] === 'None' ? 'Midnight' : weathers[nextIndex]);
            }} className="p-2 bg-[var(--text-main)]/5 rounded-lg border border-[var(--text-main)]/10 text-[var(--text-main)] opacity-60 active:scale-90 transition-all hover:opacity-100">
              {weatherTheme === 'Sunny' ? <Sun size={16}/> : weatherTheme === 'Rainy' ? <CloudRain size={16}/> : weatherTheme === 'Deep Forest' ? <Trees size={16}/> : weatherTheme === 'Snowy' ? <Snowflake size={16}/> : <CloudOff size={16} className="opacity-50"/>}
            </button>
            <div className="relative">
              <button onClick={() => setShowNotifPanel(!showNotifPanel)} className="p-2 bg-[var(--text-main)]/5 rounded-lg border border-[var(--text-main)]/10 text-[var(--text-main)] opacity-60 active:scale-90 transition-all hover:opacity-100">
                <Bell size={16}/>
                {notifications.some(n => !n.read) && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse ring-2 ring-[var(--card-bg)]" />}
              </button>
              {showNotifPanel && (
                <NotificationPanel 
                  notifications={notifications} 
                  onClose={() => setShowNotifPanel(false)} 
                  setNotifications={setNotifications} 
                />
              )}
            </div>
            <button onClick={() => setOverlayView('oracle')} className="p-2 bg-[var(--accent-primary)] rounded-lg text-white shadow-lg shadow-[var(--accent-primary)]/20 active:scale-90 transition-all"><Bot size={16}/></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scroll pb-24 px-6 pt-2">
          {overlayView ? (
            <OverlayRouter 
              view={overlayView} 
              onClose={() => setOverlayView(null)}
              addNotification={(text: string) => setNotifications(prev => [{id: Date.now().toString() + Math.random().toString(), text, read: false}, ...prev])}
              userName={userName}
              archetype={archetype as any}
              setUserName={setUserName}
              setArchetype={setArchetype}
              themeName={themeName}
              setThemeName={applyTheme}
              weatherTheme={weatherTheme}
              setWeatherTheme={setWeatherTheme}
              thresholds={thresholds}
              setThresholds={setThresholds}
              habits={habits}
              setHabits={setHabits}
              segments={segments}
              setSegments={setSegments}
              selectedDate={selectedCalendarDate}
              setSelectedDate={setSelectedCalendarDate}
              customPrompt={customPrompt}
              currentDay={currentDay}
              updateDayData={updateDayData}
              localData={localData}
              healthProfile={healthProfile}
              setHealthProfile={setHealthProfile}
              coreIdentity={coreIdentity}
              setCoreIdentity={setCoreIdentity}
              habitStacks={habitStacks}
              setHabitStacks={setHabitStacks}
              showSuccessToast={showSuccessToast}
              currentMood={currentMood}
            />
          ) : (
            <TodayView 
              currentDay={currentDay} 
              updateDayData={updateDayData} 
              showSuccessToast={showSuccessToast} 
              currentMood={currentMood}
              setMood={(m: any) => setDailyMood(currentDayStr, m)}
              habits={habits}
              healthProfile={healthProfile}
              setHealthProfile={setHealthProfile}
            />
          )}
        </main>
        
        {promptConfig && promptConfig.isOpen && (
          <PromptModal 
            message={promptConfig.message} 
            defaultValue={promptConfig.defaultValue} 
            onSubmit={promptConfig.onSubmit} 
            onCancel={promptConfig.onCancel} 
          />
        )}

        {/* Global Success Toast */}
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] transition-all duration-300 pointer-events-none ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 border border-emerald-400">
            <Check size={16} strokeWidth={3} />
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">{toast.message}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const PromptModal: React.FC<{ message: string; defaultValue?: string; onSubmit: (val: string) => void; onCancel: () => void }> = ({ message, defaultValue, onSubmit, onCancel }) => {
  const [val, setVal] = useState(defaultValue || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in">
      <div className="bg-[var(--card-bg)] border border-[var(--text-main)]/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
        <h3 className="text-sm font-mono uppercase text-[var(--text-main)] mb-4">{message}</h3>
        <input 
          ref={inputRef}
          value={val} 
          onChange={e => setVal(e.target.value)} 
          onKeyDown={e => { if (e.key === 'Enter') onSubmit(val); if (e.key === 'Escape') onCancel(); }}
          className="w-full bg-black/40 border border-[var(--text-main)]/10 p-3 rounded-xl text-[var(--text-main)] outline-none focus:border-[var(--accent-primary)] transition-all mb-6 font-mono text-sm" 
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl text-[var(--text-main)] opacity-60 font-mono uppercase text-[10px] hover:bg-[var(--text-main)]/5 transition-colors">Cancel</button>
          <button onClick={() => onSubmit(val)} className="flex-1 py-3 bg-[var(--accent-primary)] rounded-xl text-white font-mono uppercase text-[10px] shadow-lg active:scale-95 transition-all">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<any> = ({ isOpen, onClose, userName, archetype, onSelectOverlay }) => (
  <>
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[60] transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <aside className={`fixed top-0 left-0 h-full w-[80%] max-w-[280px] bg-[var(--card-bg)] z-[70] transform transition-transform duration-300 border-r border-[var(--text-main)]/5 ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
      <div className="flex flex-col h-full p-6 overflow-y-auto">
        <div className="bg-[var(--text-main)]/5 p-6 rounded-[2rem] mb-6 flex flex-col items-center gap-4 border border-[var(--text-main)]/5 text-center shadow-lg">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl ${archetype === 'optimizer' ? 'bg-gradient-to-br from-teal-500 to-emerald-800' : archetype === 'balancer' ? 'bg-gradient-to-br from-rose-500 to-pink-800' : 'bg-gradient-to-br from-[var(--accent-primary)] to-indigo-800'}`}>
            {archetype === 'optimizer' ? <Zap size={32} className="text-white" /> : archetype === 'balancer' ? <Heart size={32} className="text-white" /> : <User size={32} className="text-white" />}
          </div>
          <div>
             <h2 className="text-lg font-mono uppercase text-[var(--text-main)] tracking-tight">{userName}</h2>
             <p className="text-[10px] text-[var(--text-main)] opacity-60 font-mono uppercase tracking-widest mt-1">Operator</p>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <button onClick={() => { onSelectOverlay(null); onClose(); }} className="w-full flex items-center gap-3 p-4 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)]/20 transition-all group active:scale-95">
            <CalendarDays size={16} />
            <span className="text-xs font-mono uppercase tracking-widest">Today</span>
          </button>
          <button onClick={() => { onSelectOverlay('portfolio'); onClose(); }} className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--text-main)]/5 text-[var(--text-main)] opacity-60 hover:opacity-100 transition-all group active:scale-95 border border-transparent hover:border-[var(--text-main)]/5">
            <User size={16} />
            <span className="text-xs font-mono uppercase tracking-widest">Portfolio</span>
          </button>
          <button onClick={() => { onSelectOverlay('profile'); onClose(); }} className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--text-main)]/5 text-[var(--text-main)] opacity-60 hover:opacity-100 transition-all group active:scale-95 border border-transparent hover:border-[var(--text-main)]/5">
            <Settings2 size={16} />
            <span className="text-xs font-mono uppercase tracking-widest">Settings</span>
          </button>
        </div>
        <div className="mt-auto">
             <p className="text-center text-[10px] text-[var(--text-main)] opacity-40 font-mono tracking-widest">© 2026 TeamSaimum09. All rights reserved</p>
        </div>
      </div>
    </aside>
  </>
);

const NotificationPanel: React.FC<any> = ({ notifications, onClose, setNotifications }) => (
  <div className="absolute top-14 right-0 w-72 bg-[var(--card-bg)] border border-[var(--text-main)]/10 rounded-[2rem] shadow-2xl z-[100] p-5 animate-in overflow-hidden origin-top-right">
    <div className="flex justify-between items-center mb-4 border-b border-[var(--text-main)]/5 pb-3">
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-main)] opacity-60">Protocol Alerts</h3>
      <button onClick={() => setNotifications(notifications.map((n:any) => ({...n, read: true})))} className="text-[10px] font-mono text-[var(--accent-primary)] uppercase px-2 py-1 bg-[var(--accent-primary)]/10 rounded-lg">Clear</button>
    </div>
    <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll pr-1">
      {notifications.length === 0 ? <p className="text-[10px] font-mono text-[var(--text-main)] opacity-50 italic text-center py-6">No active alerts</p> :
        notifications.map((n:any) => (
          <div key={n.id} className={`p-3 rounded-xl border ${n.read ? 'bg-[var(--text-main)]/5 border-[var(--text-main)]/5 opacity-50' : 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20 shadow-sm'}`}>
            <p className="text-xs leading-snug text-[var(--text-main)] font-mono">{n.text}</p>
          </div>
        ))
      }
    </div>
  </div>
);

// --- OVERLAY ROUTER ---

const OverlayRouter: React.FC<any> = (props) => {
  switch (props.view) {
    case 'profile': return <ProfileView {...props} />;
    case 'portfolio': return <UserPortfolio {...props} />;
    case 'oracle': return <AIModal onClose={props.onClose} coreIdentity={props.coreIdentity} habits={props.habits} localData={props.localData} currentMood={props.currentMood} />;
    default: return null;
  }
};

export default App;
