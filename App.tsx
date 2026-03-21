
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Zap, Smartphone, GraduationCap, BookOpen, Briefcase, 
  Moon, Trophy, Sparkles, Target, Activity, Cpu, Check, Settings2, Clock, 
  CalendarDays, ChevronRight, Bot, ChevronLeft, Timer, StickyNote, Flame, 
  X, ArrowRight, Volume2, VolumeX, Tag, Bell, Menu, User, Award, TrendingUp,
  Info, ShieldCheck, Palette, Smile, Heart, Coffee, Book, Send
} from 'lucide-react';
import { AppState, Tab, DayData, Goal } from './types';
import { askAIArchitectStream } from './geminiService';
import { THEMES } from './src/constants';
import { TodayView } from './src/components/TodayView';
import { ProductivityHub } from './src/components/ProductivityHub';
import { EnergyMatrix } from './src/components/EnergyMatrix';
import { FocusView } from './src/components/FocusView';
import { HabitView } from './src/components/HabitView';
import { CountdownView } from './src/components/CountdownView';
import { NoteView } from './src/components/NoteView';
import { ProfileView } from './src/components/ProfileView';
import { AIModal } from './src/components/AIModal';
import { VitalsView } from './src/components/VitalsView';

import { useAppStore } from './store';

const App: React.FC = () => {
  const { 
    userName, setUserName, gender, setGender, themeName, setThemeName, onboardingComplete, completeOnboarding,
    thresholds, setThresholds, segments, setSegments, localData, updateDayData, habits, setHabits,
    healthProfile, setHealthProfile
  } = useAppStore();

  const [appState, setAppState] = useState<AppState>(onboardingComplete ? AppState.DASHBOARD : AppState.WELCOME);
  const [onboardingStep, setOnboardingStep] = useState(0); 
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TODAY);
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

  const applyTheme = (name: string) => {
    const t = THEMES[name];
    if (!t) return;
    const root = document.documentElement;
    root.style.setProperty('--app-bg', t.bg);
    root.style.setProperty('--card-bg', t.card);
    root.style.setProperty('--accent-primary', t.accent);
    root.style.setProperty('--text-main', t.text);
  };

  const saveProfile = (name: string, gen: 'boy' | 'girl') => {
    setUserName(name);
    setGender(gen);
    setThemeName(gen === 'boy' ? 'Teal' : 'Coral');
    
    // Set baseline health targets based on gender
    if (gen === 'boy') {
      setThresholds({ leisureMax: 120, productiveMin: 240, offlineMin: 120, sleepMin: 480 }); // 8 hours sleep
    } else {
      setThresholds({ leisureMax: 120, productiveMin: 240, offlineMin: 120, sleepMin: 540 }); // 9 hours sleep
    }
    
    completeOnboarding();
    setAppState(AppState.DASHBOARD);
  };

  const currentDayStr = new Date().toISOString().split('T')[0];
  const currentDay = localData[currentDayStr] || { goals: [], deviceTime: '0', studyLogs: [], leisureDeviceTime: 0, productiveDeviceTime: 0, offlineTime: 0, sleepTime: 0, waterIntake: 0 };

  if (appState === AppState.WELCOME) {
    if (onboardingStep === 0) {
      return (
        <div className="h-screen bg-[var(--app-bg)] flex items-center justify-center p-6 transition-colors duration-500">
          <div className="w-full max-w-sm aspect-[3/4] bg-[var(--card-bg)] rounded-[2rem] shadow-2xl relative border border-white/5 flex flex-col p-8 text-center animate-in overflow-hidden">
            <div className="mt-8 space-y-2">
              <h1 className="text-2xl font-mono text-[var(--text-main)] tracking-tighter uppercase text-white drop-shadow-lg">LIFE SYNC</h1>
              <p className="text-[var(--text-main)] opacity-60 text-[10px] font-mono tracking-[0.4em] uppercase">Neural OS v12</p>
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-6">
              <input 
                value={userName} 
                onChange={e => setUserName(e.target.value)} 
                className="w-full bg-black/20 border border-white/10 p-4 rounded-xl text-center text-white font-mono text-sm outline-none focus:border-[var(--accent-primary)] transition-all placeholder:text-white/30" 
                placeholder="ENTER OPERATOR ID" 
              />
              <div className="flex gap-4">
                <button onClick={() => setGender('boy')} className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-3 ${gender === 'boy' ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.3)]' : 'bg-white/5 border-white/5 opacity-50'}`}>
                  <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none stroke-current text-white stroke-2">
                    <circle cx="50" cy="35" r="15" />
                    <path d="M50 50 L50 75 M50 55 L35 70 M50 55 L65 70 M50 75 L35 90 M50 75 L65 90" />
                    <path d="M40 30 Q50 20 60 30" />
                  </svg>
                  <span className="text-[10px] text-white font-mono tracking-widest">MALE</span>
                </button>
                <button onClick={() => setGender('girl')} className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-3 ${gender === 'girl' ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.3)]' : 'bg-white/5 border-white/5 opacity-50'}`}>
                  <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none stroke-current text-white stroke-2">
                    <circle cx="50" cy="35" r="15" />
                    <path d="M50 50 L50 75 M50 55 L35 70 M50 55 L65 70 M50 75 L35 90 M50 75 L65 90" />
                    <path d="M35 35 Q50 15 65 35" />
                    <path d="M40 75 L60 75" />
                  </svg>
                  <span className="text-[10px] text-white font-mono tracking-widest">FEMALE</span>
                </button>
              </div>
            </div>
            
            <button 
              disabled={!userName || !gender} 
              onClick={() => setOnboardingStep(1)} 
              className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-xl font-mono uppercase text-[10px] tracking-widest disabled:opacity-30 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Initialize <ArrowRight size={14} />
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="h-screen bg-[var(--app-bg)] p-6 flex flex-col items-center justify-center animate-in">
          <div className="max-w-sm w-full bg-[var(--card-bg)] rounded-[2rem] border border-white/10 p-8 shadow-2xl space-y-8 relative overflow-hidden text-center">
            <h2 className="text-lg font-mono text-white uppercase tracking-tight">System Modules</h2>
            <div className="space-y-4 text-white opacity-80 text-left">
              <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5">
                <Activity size={16} className="text-emerald-400" />
                <p className="text-[10px] font-mono"><b>Digital Matrix:</b> Monitor device exposure.</p>
              </div>
              <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5">
                <Timer size={16} className="text-indigo-400" />
                <p className="text-[10px] font-mono"><b>Focus Chamber:</b> Interval protocol.</p>
              </div>
              <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5">
                <Sparkles size={16} className="text-orange-400" />
                <p className="text-[10px] font-mono"><b>Habit Sync:</b> Automate daily routines.</p>
              </div>
            </div>
            <button onClick={() => saveProfile(userName, gender as any)} className="w-full py-4 bg-[var(--accent-primary)] rounded-xl text-white font-mono uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg">Enter Dashboard</button>
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
      />

      <div className="flex-1 flex flex-col relative overflow-hidden max-w-5xl mx-auto w-full">
        <header className="px-6 pt-6 pb-4 flex justify-between items-center bg-transparent backdrop-blur-md z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(true)} className="p-2 -ml-2 text-slate-400 hover:text-white active:scale-90 transition-transform"><Menu size={18}/></button>
            <h1 className="text-base font-mono uppercase tracking-tighter text-white/90">{overlayView || activeTab}</h1>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <button onClick={() => setShowNotifPanel(!showNotifPanel)} className="p-2 bg-white/5 rounded-lg border border-white/5 text-slate-400 active:scale-90 transition-all">
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
              gender={gender as any}
              setUserName={setUserName}
              setGender={setGender}
              themeName={themeName}
              setThemeName={applyTheme}
              thresholds={thresholds}
              setThresholds={(t: any) => { setThresholds(t); localStorage.setItem('lsp_thresholds', JSON.stringify(t)); }}
              habits={habits}
              setHabits={(h: any) => { setHabits(h); localStorage.setItem('lsp_habits', JSON.stringify(h)); }}
              segments={segments}
              setSegments={(s: any) => { setSegments(s); localStorage.setItem('lsp_segments', JSON.stringify(s)); }}
              selectedDate={selectedCalendarDate}
              setSelectedDate={setSelectedCalendarDate}
              customPrompt={customPrompt}
              currentDay={currentDay}
              updateDayData={updateDayData}
              localData={localData}
              healthProfile={healthProfile}
              setHealthProfile={setHealthProfile}
              showSuccessToast={showSuccessToast}
            />
          ) : (
            <TabRouter 
              tab={activeTab} 
              currentDay={currentDay} 
              localData={localData}
              updateDayData={updateDayData}
              userName={userName}
              thresholds={thresholds}
              habits={habits}
              segments={segments}
              showSuccessToast={showSuccessToast}
            />
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 md:left-auto md:right-auto md:w-full md:max-w-5xl bg-[var(--card-bg)]/90 backdrop-blur-xl border-t border-white/5 px-6 pb-6 pt-4 flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
          <NavBtn icon={Target} label="Daily" active={activeTab === Tab.TODAY && !overlayView} onClick={() => {setActiveTab(Tab.TODAY); setOverlayView(null);}} />
          <NavBtn icon={Cpu} label="Stats" active={activeTab === Tab.UPCOMING && !overlayView} onClick={() => {setActiveTab(Tab.UPCOMING); setOverlayView(null);}} />
          <NavBtn icon={Activity} label="Digital" active={activeTab === Tab.BROWSE && !overlayView} onClick={() => {setActiveTab(Tab.BROWSE); setOverlayView(null);}} />
        </nav>
        
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
      <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
        <h3 className="text-sm font-mono uppercase text-white mb-4">{message}</h3>
        <input 
          ref={inputRef}
          value={val} 
          onChange={e => setVal(e.target.value)} 
          onKeyDown={e => { if (e.key === 'Enter') onSubmit(val); if (e.key === 'Escape') onCancel(); }}
          className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[var(--accent-primary)] transition-all mb-6 font-mono text-sm" 
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl text-slate-400 font-mono uppercase text-[10px] hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={() => onSubmit(val)} className="flex-1 py-3 bg-[var(--accent-primary)] rounded-xl text-white font-mono uppercase text-[10px] shadow-lg active:scale-95 transition-all">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<any> = ({ isOpen, onClose, userName, onSelectOverlay }) => (
  <>
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[60] transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <aside className={`fixed top-0 left-0 h-full w-[80%] max-w-[280px] bg-[var(--card-bg)] z-[70] transform transition-transform duration-300 border-r border-white/5 ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
      <div className="flex flex-col h-full p-6">
        <div className="bg-white/5 p-6 rounded-[2rem] mb-6 flex flex-col items-center gap-4 border border-white/5 text-center shadow-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-primary)] to-indigo-800 rounded-2xl flex items-center justify-center text-2xl font-mono text-white shadow-xl">
            {userName[0]}
          </div>
          <div>
             <h2 className="text-lg font-mono uppercase text-white tracking-tight">{userName}</h2>
             <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">Operator</p>
          </div>
          <button onClick={() => { onSelectOverlay('profile'); onClose(); }} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-mono uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/5">Config</button>
        </div>
        <div className="space-y-1 flex-1">
          <SideItem icon={Timer} label="Focus Chamber" onClick={() => { onSelectOverlay('focus'); onClose(); }} />
          <SideItem icon={Flame} label="Habit Sync" onClick={() => { onSelectOverlay('habits'); onClose(); }} />
          <SideItem icon={Clock} label="Countdown" onClick={() => { onSelectOverlay('countdown'); onClose(); }} />
          <SideItem icon={StickyNote} label="Neural Notes" onClick={() => { onSelectOverlay('notes'); onClose(); }} />
          <SideItem icon={Heart} label="Biometrics" onClick={() => { onSelectOverlay('vitals'); onClose(); }} />
        </div>
        <div className="mt-auto">
             <p className="text-center text-[10px] text-slate-600 font-mono uppercase tracking-widest">Neural OS v12</p>
        </div>
      </div>
    </aside>
  </>
);

const SideItem: React.FC<any> = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all group active:scale-95 border border-transparent hover:border-white/5">
    <Icon size={14} className="group-hover:text-[var(--accent-primary)] transition-all" />
    <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
  </button>
);

const NavBtn: React.FC<any> = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all p-2 rounded-xl ${active ? 'text-[var(--accent-primary)] scale-110' : 'text-slate-500 opacity-60 hover:opacity-100'}`}>
    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[8px] font-mono uppercase tracking-widest">{label}</span>
  </button>
);

const NotificationPanel: React.FC<any> = ({ notifications, onClose, setNotifications }) => (
  <div className="absolute top-14 right-0 w-72 bg-[var(--card-bg)] border border-white/10 rounded-[2rem] shadow-2xl z-[100] p-5 animate-in overflow-hidden origin-top-right">
    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Protocol Alerts</h3>
      <button onClick={() => setNotifications(notifications.map((n:any) => ({...n, read: true})))} className="text-[10px] font-mono text-[var(--accent-primary)] uppercase px-2 py-1 bg-[var(--accent-primary)]/10 rounded-lg">Clear</button>
    </div>
    <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll pr-1">
      {notifications.length === 0 ? <p className="text-[10px] font-mono text-slate-500 italic text-center py-6">No active alerts</p> :
        notifications.map((n:any) => (
          <div key={n.id} className={`p-3 rounded-xl border ${n.read ? 'bg-white/5 border-white/5 opacity-50' : 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20 shadow-sm'}`}>
            <p className="text-xs leading-snug text-[var(--text-main)] font-mono">{n.text}</p>
          </div>
        ))
      }
    </div>
  </div>
);

// --- TAB ROUTER ---

const TabRouter: React.FC<any> = ({ tab, currentDay, updateDayData, localData, userName, thresholds, habits, segments, showSuccessToast }) => {
  switch (tab) {
    case Tab.TODAY: return <TodayView data={currentDay.goals} updateDayData={updateDayData} showSuccessToast={showSuccessToast} />;
    case Tab.UPCOMING: return <ProductivityHub data={localData} userName={userName} />;
    case Tab.BROWSE: return <EnergyMatrix currentDay={currentDay} updateDayData={updateDayData} thresholds={thresholds} segments={segments} showSuccessToast={showSuccessToast} />;
    default: return null;
  }
};

// --- OVERLAY ROUTER ---

const OverlayRouter: React.FC<any> = (props) => {
  switch (props.view) {
    case 'focus': return <FocusView currentDay={props.currentDay} updateDayData={props.updateDayData} showSuccessToast={props.showSuccessToast} />;
    case 'habits': return <HabitView {...props} />;
    case 'countdown': return <CountdownView {...props} />;
    case 'notes': return <NoteView customPrompt={props.customPrompt} showSuccessToast={props.showSuccessToast} />;
    case 'vitals': return <VitalsView currentDay={props.currentDay} updateDayData={props.updateDayData} healthProfile={props.healthProfile} setHealthProfile={props.setHealthProfile} showSuccessToast={props.showSuccessToast} />;
    case 'profile': return <ProfileView {...props} />;
    case 'oracle': return <AIModal onClose={props.onClose} />;
    default: return null;
  }
};

export default App;
