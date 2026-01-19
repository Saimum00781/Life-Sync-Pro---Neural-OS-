
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

// --- THEMES ---
const THEMES: Record<string, any> = {
  'Midnight': { bg: '#020617', card: '#0f172a', accent: '#4f46e5', text: '#f8fafc' },
  'Teal': { bg: '#004d40', card: '#00695c', accent: '#4db6ac', text: '#e0f2f1' },
  'Navy Blue': { bg: '#0d1b2a', card: '#1b263b', accent: '#415a77', text: '#e0e1dd' },
  'Beige': { bg: '#d6ccc2', card: '#f5ebe0', accent: '#d5bdaf', text: '#463f3a' },
  'Sage Green': { bg: '#7b8a7e', card: '#a3b18a', accent: '#588157', text: '#dad7cd' },
  'Coral': { bg: '#f08080', card: '#f4978e', accent: '#ffdab9', text: '#4a4e69' },
  'Cream': { bg: '#fdfcf0', card: '#ffffff', accent: '#e6ccb2', text: '#7f5539' },
  'Maroon': { bg: '#4a0e0e', card: '#601a1a', accent: '#9a031e', text: '#fb8b24' },
  'Charcoal': { bg: '#121212', card: '#1e1e1e', accent: '#3700b3', text: '#ffffff' }
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [onboardingStep, setOnboardingStep] = useState(0); 
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TODAY);
  const [overlayView, setOverlayView] = useState<string | null>(null);
  const [localData, setLocalData] = useState<Record<string, DayData>>({});
  const [userName, setUserName] = useState("");
  const [gender, setGender] = useState<'boy' | 'girl' | ''>('');
  const [themeName, setThemeName] = useState('Midnight');
  const [notifications, setNotifications] = useState<{id: string, text: string, read: boolean}[]>([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  
  // Custom Settings
  const [thresholds, setThresholds] = useState({ deviceGood: 240, deviceOk: 420, segmentGood: 180, segmentOk: 60 });
  const [habits, setHabits] = useState(['Reading', 'Meditation', 'Deep Work']);
  const [segments, setSegments] = useState(['Academic', 'Tuition', 'Career', 'Self Growth', 'Islamic', 'Custom']);

  useEffect(() => {
    const savedData = localStorage.getItem('lsp_v12_data');
    const savedName = localStorage.getItem('lsp_user_name');
    const savedGender = localStorage.getItem('lsp_user_gender');
    const savedTheme = localStorage.getItem('lsp_theme');
    const savedThresh = localStorage.getItem('lsp_thresholds');
    const savedHabits = localStorage.getItem('lsp_habits');
    const savedSegments = localStorage.getItem('lsp_segments');
    const onboardingComplete = localStorage.getItem('lsp_onboarding_done');

    if (savedData) setLocalData(JSON.parse(savedData));
    if (savedTheme) applyTheme(savedTheme);
    if (savedThresh) setThresholds(JSON.parse(savedThresh));
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedSegments) setSegments(JSON.parse(savedSegments));
    
    if (savedName && savedGender && onboardingComplete) { 
      setUserName(savedName); 
      setGender(savedGender as any);
      setAppState(AppState.DASHBOARD); 
    }
  }, []);

  const applyTheme = (name: string) => {
    const t = THEMES[name];
    if (!t) return;
    const root = document.documentElement;
    root.style.setProperty('--app-bg', t.bg);
    root.style.setProperty('--card-bg', t.card);
    root.style.setProperty('--accent-primary', t.accent);
    root.style.setProperty('--text-main', t.text);
    localStorage.setItem('lsp_theme', name);
    setThemeName(name);
  };

  const saveProfile = (name: string, gen: 'boy' | 'girl') => {
    setUserName(name);
    setGender(gen);
    localStorage.setItem('lsp_user_name', name);
    localStorage.setItem('lsp_user_gender', gen);
    localStorage.setItem('lsp_onboarding_done', 'true');
    setAppState(AppState.DASHBOARD);
  };

  const updateDayData = (date: string, updates: Partial<DayData>) => {
    const day = localData[date] || { goals: [], deviceTime: '0', studyLogs: [] };
    const newData = { ...localData, [date]: { ...day, ...updates } };
    localStorage.setItem('lsp_v12_data', JSON.stringify(newData));
    setLocalData(newData);
  };

  const currentDayStr = new Date().toISOString().split('T')[0];
  const currentDay = localData[currentDayStr] || { goals: [], deviceTime: '0', studyLogs: [] };

  if (appState === AppState.WELCOME) {
    if (onboardingStep === 0) {
      return (
        <div className="h-screen bg-[var(--app-bg)] flex items-center justify-center p-6 transition-colors duration-500">
          <div className="w-full max-w-sm aspect-[3/4] bg-[var(--card-bg)] rounded-[2rem] shadow-2xl relative border-[10px] border-black/20 flex flex-col p-8 text-center animate-in overflow-hidden">
            <div className="mt-12 space-y-2">
              <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase text-white">LIFE SYNC</h1>
              <p className="text-[var(--text-main)] opacity-40 text-[10px] font-bold tracking-[0.4em] uppercase">Neural OS v12</p>
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-6">
              <input 
                value={userName} 
                onChange={e => setUserName(e.target.value)} 
                className="w-full bg-black/20 border-2 border-white/10 p-4 rounded-xl text-center text-white font-bold outline-none focus:border-[var(--accent-primary)] transition-all" 
                placeholder="YOUR NAME" 
              />
              <div className="flex gap-4">
                <button onClick={() => setGender('boy')} className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'boy' ? 'bg-[var(--accent-primary)] border-white scale-105 shadow-xl' : 'bg-white/5 border-white/5 opacity-40'}`}>
                  <svg viewBox="0 0 100 100" className="w-16 h-16 fill-none stroke-current text-white stroke-2">
                    <circle cx="50" cy="35" r="15" />
                    <path d="M50 50 L50 75 M50 55 L35 70 M50 55 L65 70 M50 75 L35 90 M50 75 L65 90" />
                    <path d="M40 30 Q50 20 60 30" />
                  </svg>
                  <span className="text-[10px] text-white font-black">BOY</span>
                </button>
                <button onClick={() => setGender('girl')} className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'girl' ? 'bg-[var(--accent-primary)] border-white scale-105 shadow-xl' : 'bg-white/5 border-white/5 opacity-40'}`}>
                  <svg viewBox="0 0 100 100" className="w-16 h-16 fill-none stroke-current text-white stroke-2">
                    <circle cx="50" cy="35" r="15" />
                    <path d="M50 50 L50 75 M50 55 L35 70 M50 55 L65 70 M50 75 L35 90 M50 75 L65 90" />
                    <path d="M35 35 Q50 15 65 35" />
                    <path d="M40 75 L60 75" />
                  </svg>
                  <span className="text-[10px] text-white font-black">GIRL</span>
                </button>
              </div>
            </div>
            
            <button 
              disabled={!userName || !gender} 
              onClick={() => setOnboardingStep(1)} 
              className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-xl font-black uppercase tracking-widest disabled:opacity-30 active:scale-95 transition-all"
            >
              Sync Profile <ArrowRight className="inline ml-2" size={18} />
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="h-screen bg-[var(--app-bg)] p-8 flex flex-col items-center justify-center animate-in">
          <div className="max-w-md w-full bg-[var(--card-bg)] rounded-[2.5rem] border border-white/10 p-10 shadow-2xl space-y-8 relative overflow-hidden text-center">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Manual Trace ✍️</h2>
            <div className="space-y-6 text-white opacity-80 text-left">
              <div className="flex gap-4 items-start">
                <span className="text-2xl">⚡</span>
                <p className="text-sm"><b>Digital Matrix:</b> Monitor device exposure and deep segment learning.</p>
              </div>
              <div className="flex gap-4 items-start">
                <span className="text-2xl">⏳</span>
                <p className="text-sm"><b>Focus Chamber:</b> 25/5 interval protocol for peak cognitive synthesis.</p>
              </div>
              <div className="flex gap-4 items-start">
                <span className="text-2xl">🌱</span>
                <p className="text-sm"><b>Habit Sync:</b> Automate daily routines to reduce decision fatigue.</p>
              </div>
            </div>
            <button onClick={() => saveProfile(userName, gender as any)} className="w-full py-5 bg-[var(--accent-primary)] rounded-2xl text-white font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Enter Dashboard</button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex h-screen overflow-hidden text-[var(--text-main)] bg-[var(--app-bg)] transition-colors duration-500">
      <Sidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)} 
        onSelectOverlay={setOverlayView}
        userName={userName}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="px-6 pt-12 pb-5 flex justify-between items-center bg-transparent backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSidebar(true)} className="p-2 -ml-2 text-slate-400"><Menu size={24}/></button>
            <h1 className="text-lg font-black uppercase tracking-tighter">{overlayView || activeTab}</h1>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button onClick={() => setShowNotifPanel(!showNotifPanel)} className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-slate-400">
                <Bell size={20}/>
                {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />}
              </button>
              {showNotifPanel && (
                <NotificationPanel 
                  notifications={notifications} 
                  onClose={() => setShowNotifPanel(false)} 
                  setNotifications={setNotifications} 
                />
              )}
            </div>
            <button onClick={() => setOverlayView('oracle')} className="p-2.5 bg-[var(--accent-primary)] rounded-xl text-white shadow-lg"><Bot size={20}/></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scroll pb-32 px-6">
          {overlayView ? (
            <OverlayRouter 
              view={overlayView} 
              onClose={() => setOverlayView(null)}
              addNotification={(text: string) => setNotifications(prev => [{id: Date.now().toString(), text, read: false}, ...prev])}
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
            />
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--app-bg)]/80 backdrop-blur-2xl border-t border-white/5 px-10 pt-4 pb-8 flex justify-between items-center z-50">
          <NavBtn icon={CalendarDays} label="Daily" active={activeTab === Tab.TODAY && !overlayView} onClick={() => {setActiveTab(Tab.TODAY); setOverlayView(null);}} />
          <NavBtn icon={Trophy} label="Stats" active={activeTab === Tab.UPCOMING && !overlayView} onClick={() => {setActiveTab(Tab.UPCOMING); setOverlayView(null);}} />
          <NavBtn icon={Activity} label="Digital" active={activeTab === Tab.BROWSE && !overlayView} onClick={() => {setActiveTab(Tab.BROWSE); setOverlayView(null);}} />
        </nav>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const Sidebar: React.FC<any> = ({ isOpen, onClose, userName, onSelectOverlay }) => (
  <>
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <aside className={`fixed top-0 left-0 h-full w-[80%] max-w-xs bg-[var(--card-bg)] z-[70] transform transition-transform duration-300 border-r border-white/5 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full p-6">
        <div className="bg-white/5 p-6 rounded-3xl mb-8 flex flex-col items-center gap-3 border border-white/5 text-center">
          <h2 className="text-xl font-black text-white">{userName}</h2>
          <button onClick={() => { onSelectOverlay('profile'); onClose(); }} className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Profile & Settings</button>
        </div>
        <div className="space-y-1 flex-1">
          <SideItem icon={Timer} label="Focus Chamber" onClick={() => { onSelectOverlay('focus'); onClose(); }} />
          <SideItem icon={Flame} label="Habit Sync" onClick={() => { onSelectOverlay('habits'); onClose(); }} />
          <SideItem icon={Clock} label="Countdown" onClick={() => { onSelectOverlay('countdown'); onClose(); }} />
          <SideItem icon={StickyNote} label="Neural Notes" onClick={() => { onSelectOverlay('notes'); onClose(); }} />
        </div>
      </div>
    </aside>
  </>
);

const SideItem: React.FC<any> = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-slate-400 hover:text-white transition-all group">
    <Icon size={20} className="group-hover:text-[var(--accent-primary)] transition-all" />
    <span className="text-sm font-bold">{label}</span>
  </button>
);

const NavBtn: React.FC<any> = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-[var(--accent-primary)] scale-110' : 'text-slate-600 opacity-60'}`}>
    <Icon className="w-6 h-6" />
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const NotificationPanel: React.FC<any> = ({ notifications, onClose, setNotifications }) => (
  <div className="absolute top-14 right-0 w-72 bg-[var(--card-bg)] border border-white/10 rounded-[2rem] shadow-2xl z-[100] p-6 animate-in overflow-hidden">
    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
      <h3 className="text-[10px] font-black uppercase tracking-widest">Protocol Alerts</h3>
      <button onClick={() => setNotifications(notifications.map((n:any) => ({...n, read: true})))} className="text-[8px] font-black text-[var(--accent-primary)] uppercase">Clear</button>
    </div>
    <div className="space-y-3 max-h-60 overflow-y-auto custom-scroll pr-1">
      {notifications.length === 0 ? <p className="text-[10px] text-slate-500 italic text-center py-4">No active alerts</p> :
        notifications.map((n:any) => (
          <div key={n.id} className={`p-3 rounded-xl border ${n.read ? 'bg-white/5 border-white/5 opacity-50' : 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20 shadow-sm'}`}>
            <p className="text-[11px] leading-tight text-[var(--text-main)]">{n.text}</p>
          </div>
        ))
      }
    </div>
  </div>
);

// --- TAB ROUTER ---

const TabRouter: React.FC<any> = ({ tab, currentDay, updateDayData, localData, userName, thresholds, habits, segments }) => {
  switch (tab) {
    case Tab.TODAY: return <TodayView data={currentDay.goals} updateDayData={updateDayData} />;
    case Tab.UPCOMING: return <ProductivityHub data={localData} userName={userName} />;
    case Tab.BROWSE: return <EnergyMatrix currentDay={currentDay} updateDayData={updateDayData} thresholds={thresholds} segments={segments} />;
    default: return null;
  }
};

// --- VIEWS ---

const TodayView: React.FC<any> = ({ data, updateDayData }) => {
  const currentDayStr = new Date().toISOString().split('T')[0];
  const [val, setVal] = useState("");
  const handleAdd = () => {
    if(!val) return;
    const newGoal = { id: Date.now().toString(), text: val, priority: 'standard', done: false, date: currentDayStr };
    updateDayData(currentDayStr, { goals: [...data, newGoal] });
    setVal("");
  };

  return (
    <div className="space-y-4 animate-in">
      <div className="bg-[var(--accent-primary)]/10 p-5 rounded-3xl border border-[var(--accent-primary)]/20 mb-6 flex items-center gap-3">
        <Sparkles size={18} className="text-[var(--accent-primary)]"/>
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white">Daily Briefing</h3>
          <p className="text-slate-400 text-[10px]">Execute current missions for peak output.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="New mission objective..." className="flex-1 bg-white/5 p-4 rounded-2xl text-sm outline-none border border-white/5 text-white" />
        <button onClick={handleAdd} className="p-4 bg-[var(--accent-primary)] rounded-2xl text-white active:scale-95 transition-all shadow-lg"><Plus size={20}/></button>
      </div>

      {data.map((goal: any) => (
        <div key={goal.id} className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col gap-2 active:scale-[0.98] transition-all shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => updateDayData(currentDayStr, { goals: data.map((g: any) => g.id === goal.id ? { ...g, done: !g.done } : g) })}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${goal.done ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' : 'border-slate-800'}`}
            >
              {goal.done && <Check size={14} strokeWidth={4} className="text-white" />}
            </button>
            <p className={`text-sm font-bold flex-1 ${goal.done ? 'line-through text-slate-600' : 'text-slate-200'}`}>{goal.text}</p>
            <button onClick={() => updateDayData(currentDayStr, { goals: data.filter((g: any) => g.id !== goal.id) })} className="text-slate-700 hover:text-rose-500 transition-colors shrink-0"><Trash2 size={18}/></button>
          </div>
          {goal.source && (
            <div className="flex items-center gap-1.5 ml-10">
              <span className="text-[8px] font-black uppercase text-[var(--accent-primary)]/60 tracking-wider">Source:</span>
              <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{goal.source}</span>
            </div>
          )}
        </div>
      ))}
      {data.length === 0 && <p className="text-center py-10 opacity-20 font-black uppercase text-[10px] tracking-[0.2em] text-white">No active traces</p>}
    </div>
  );
};

const ProductivityHub: React.FC<any> = ({ data, userName }) => {
  const [activeSub, setActiveSub] = useState<'Daily'|'Weekly'>('Daily');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = data[todayStr] || { goals: [] };
  const done = todayData.goals.filter((g: any) => g.done).length;
  const total = todayData.goals.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-8 animate-in pb-12 w-full max-w-md mx-auto">
      <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 flex items-center gap-4 shadow-xl">
        <div className="w-14 h-14 bg-[var(--accent-primary)] rounded-2xl flex items-center justify-center text-2xl font-black text-white">{userName[0]}</div>
        <div>
          <h2 className="text-xl font-black text-white">{userName}</h2>
          <p className="text-[10px] font-black uppercase text-[var(--accent-primary)] tracking-widest flex items-center gap-1"><Award size={12}/> Tier-1 Operational</p>
        </div>
      </div>

      <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl">
        {['Daily', 'Weekly'].map(t => (
          <button key={t} onClick={() => setActiveSub(t as any)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSub === t ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'text-slate-500'}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center gap-8 shadow-2xl">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="54" stroke="#1e293b" strokeWidth="12" fill="transparent" />
              <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={339} strokeDashoffset={339 - (339 * percent) / 100} className="text-[var(--accent-primary)] transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">{percent}%</div>
          </div>
          <div className="text-center">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Objectives Synchronized</h4>
            <p className="text-3xl font-black text-white">{done} / {total}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EnergyMatrix: React.FC<any> = ({ currentDay, updateDayData, thresholds, segments }) => {
  const currentDayStr = new Date().toISOString().split('T')[0];
  const mins = parseInt(currentDay.deviceTime || '0');
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  
  const getDeviceStatus = () => {
    // Device: less is better
    if (mins < thresholds.deviceGood) return { label: 'Good', color: 'text-emerald-400', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.1)] border-emerald-500/20 bg-emerald-500/5' };
    if (mins <= thresholds.deviceOk) return { label: 'OK', color: 'text-amber-400', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.1)] border-amber-500/20 bg-amber-500/5' };
    return { label: 'High Load', color: 'text-rose-400', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.1)] border-rose-500/20 bg-rose-500/5' };
  };
  const status = getDeviceStatus();

  return (
    <div className="space-y-8 animate-in pb-12 max-w-md mx-auto">
      <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 ${status.glow} shadow-xl`}>
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Device Exposure</h4>
            <p className="text-xl font-black text-white">Status: <span className={status.color}>{status.label}</span></p>
          </div>
          <Smartphone className={status.color} size={28} />
        </div>
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
             <span className="text-[8px] font-black uppercase text-slate-500 ml-2">Hr</span>
             <input type="number" value={h} onChange={e => updateDayData(currentDayStr, { deviceTime: ((parseInt(e.target.value)||0)*60 + m).toString() })} className="w-full bg-black/40 p-4 rounded-2xl text-2xl font-black text-white text-center outline-none border border-white/5" />
          </div>
          <div className="flex-1 space-y-2">
             <span className="text-[8px] font-black uppercase text-slate-500 ml-2">Min</span>
             <input type="number" value={m} onChange={e => updateDayData(currentDayStr, { deviceTime: (h*60 + (parseInt(e.target.value)||0)).toString() })} className="w-full bg-black/40 p-4 rounded-2xl text-2xl font-black text-white text-center outline-none border border-white/5" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Active Segments</h4>
        {segments.map((seg: any) => (
          <SegmentCard 
            key={seg} 
            name={seg} 
            logs={currentDay.studyLogs.filter((l: any) => l.category === seg)} 
            thresholds={thresholds}
            onAdd={(topic: string, totalMins: number) => {
              const newLog = { id: Date.now().toString(), category: seg, topic, time: totalMins.toString() };
              const newGoal = { 
                id: 'sync-' + Date.now(), 
                text: `${topic} (${Math.floor(totalMins/60)}h ${totalMins%60}m)`, 
                priority: 'standard', 
                done: false, 
                date: currentDayStr,
                source: seg
              };
              updateDayData(currentDayStr, { 
                studyLogs: [...currentDay.studyLogs, newLog],
                goals: [...currentDay.goals, newGoal]
              });
            }}
          />
        ))}
      </div>
    </div>
  );
};

const SegmentCard: React.FC<any> = ({ name, logs, onAdd, thresholds }) => {
  const [topic, setTopic] = useState("");
  const [sh, setSh] = useState("");
  const [sm, setSm] = useState("");
  
  const totalMins = logs.reduce((acc: number, cur: any) => acc + parseInt(cur.time), 0);
  
  const getStatus = () => {
    if (totalMins >= thresholds.segmentGood) return { color: 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)] text-emerald-400' };
    if (totalMins >= thresholds.segmentOk) return { color: 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.05)] text-amber-400' };
    return { color: 'border-rose-500/30 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.05)] text-rose-400' };
  };
  const status = getStatus();

  const handleManualAdd = () => {
    const total = (parseInt(sh || "0") * 60) + parseInt(sm || "0");
    if (total > 0) {
      onAdd(topic || `${name} Block`, total);
      setTopic("");
      setSh("");
      setSm("");
    }
  };
  
  return (
    <div className={`p-6 rounded-[2rem] border transition-all ${status.color}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-black uppercase tracking-tight text-white/90">{name}</h4>
        <div className="flex items-center gap-1">
           <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full text-white">{Math.floor(totalMins/60)}h {totalMins%60}m</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <input 
            placeholder="Focus topic..." 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleManualAdd()}
            className="flex-1 bg-black/20 rounded-xl px-4 py-2.5 text-xs text-white outline-none border border-white/5 focus:border-[var(--accent-primary)] transition-all" 
          />
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex gap-2">
            <input 
              type="number" 
              placeholder="Hr" 
              value={sh} 
              onChange={e => setSh(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleManualAdd()}
              className="flex-1 bg-black/20 rounded-xl px-2 py-2 text-center text-xs text-white outline-none focus:bg-black/40 transition-colors border border-white/5" 
            />
            <input 
              type="number" 
              placeholder="Min" 
              value={sm} 
              onChange={e => setSm(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleManualAdd()}
              className="flex-1 bg-black/20 rounded-xl px-2 py-2 text-center text-xs text-white outline-none focus:bg-black/40 transition-colors border border-white/5" 
            />
          </div>
          <button 
            onClick={handleManualAdd} 
            className="p-3 bg-[var(--accent-primary)] rounded-xl text-white shadow-lg active:scale-90 transition-all flex items-center justify-center hover:bg-[var(--accent-primary)]/90"
          >
            <Send size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- OVERLAY ROUTER ---

const OverlayRouter: React.FC<any> = (props) => {
  switch (props.view) {
    case 'focus': return <FocusView />;
    case 'habits': return <HabitView habits={props.habits} />;
    case 'countdown': return <CountdownView {...props} />;
    case 'notes': return <NoteView />;
    case 'profile': return <ProfileView {...props} />;
    case 'oracle': return <AIModal onClose={props.onClose} />;
    default: return null;
  }
};

const FocusView = () => {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let timer: any;
    if (isActive && time > 0) {
      timer = setInterval(() => setTime(t => t - 1), 1000);
    } else if (time === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, time]);

  const switchMode = (m: 'work' | 'break') => {
    setMode(m);
    setTime(m === 'work' ? 25 * 60 : 5 * 60);
    setIsActive(false);
  };

  return (
    <div className="space-y-6 animate-in max-w-md mx-auto">
      <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl">
        <h2 className="text-lg font-black uppercase flex items-center gap-2"><Timer size={20}/> Focus Chamber</h2>
        <p className="text-[11px] opacity-80 mt-2">25/5 interval protocol. Breaks are mandatory for creative synthesis.</p>
      </div>
      
      <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl">
        <button onClick={() => switchMode('work')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${mode === 'work' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}>Work (25m)</button>
        <button onClick={() => switchMode('break')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${mode === 'break' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500'}`}>Break (5m)</button>
      </div>

      <div className="bg-slate-900 p-12 rounded-[2.5rem] border border-white/5 text-center space-y-8 shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 left-0 h-1 transition-all duration-1000 ${mode === 'work' ? 'bg-indigo-600' : 'bg-emerald-600'}`} style={{ width: `${(time / (mode === 'work' ? 25*60 : 5*60)) * 100}%` }} />
        <div className="text-8xl font-black tracking-tighter text-white tabular-nums drop-shadow-2xl">
          {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
        </div>
        <div className="flex justify-center gap-6">
          <button onClick={() => setIsActive(!isActive)} className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${isActive ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white active:scale-95'}`}>
            {isActive ? <X size={32}/> : <Zap size={32}/>}
          </button>
          <button onClick={() => switchMode(mode)} className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white"><Clock size={32}/></button>
        </div>
      </div>
    </div>
  );
};

const HabitView = ({ habits }: any) => (
  <div className="space-y-6 animate-in max-w-md mx-auto">
    <div className="bg-emerald-600 p-6 rounded-[2rem] text-white shadow-xl">
      <h2 className="text-lg font-black uppercase flex items-center gap-2"><Flame size={20}/> Habit Sync</h2>
      <p className="text-[11px] opacity-80 mt-2">Small daily shifts compound into high performance outcomes.</p>
    </div>
    <div className="space-y-3">
      {habits.map((h: string) => (
        <div key={h} className="bg-slate-900 p-5 rounded-2xl border border-white/5 flex justify-between items-center shadow-md">
          <span className="font-bold text-sm text-white">{h}</span>
          <div className="flex gap-1.5">{[1,1,1,0,0,0,0].map((s,i) => <div key={i} className={`w-5 h-5 rounded-md ${s ? 'bg-emerald-500 shadow-glow-sm' : 'bg-white/5'}`} />)}</div>
        </div>
      ))}
    </div>
  </div>
);

const CountdownView = ({ selectedDate, setSelectedDate, addNotification }: any) => {
  const [events, setEvents] = useState<any[]>(() => JSON.parse(localStorage.getItem('lsp_v12_events') || '[]'));
  const add = () => {
    const text = window.prompt("Capture Milestone Name:");
    if(text) {
      const newList = [...events, {id: Date.now(), date: selectedDate, text}];
      setEvents(newList);
      localStorage.setItem('lsp_v12_events', JSON.stringify(newList));
      addNotification(`Milestone Registered: ${text} for ${selectedDate}`);
    }
  };
  return (
    <div className="space-y-6 animate-in max-w-md mx-auto">
      <div className="bg-cyan-600 p-6 rounded-[2rem] text-white shadow-xl">
        <h2 className="text-lg font-black uppercase flex items-center gap-2"><Clock size={20}/> Milestone Matrix</h2>
        <p className="text-[11px] opacity-80 mt-2">Map future strategic dates. Prevent long-term friction.</p>
      </div>
      <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 grid grid-cols-7 gap-2 shadow-2xl">
        {Array.from({length: 31}, (_, i) => i+1).map(d => {
          const dateStr = `2026-01-${String(d).padStart(2,'0')}`;
          const isSelected = selectedDate === dateStr;
          return (
            <button key={d} onClick={() => setSelectedDate(dateStr)} className={`aspect-square rounded-xl text-[10px] font-black transition-all ${isSelected ? 'bg-cyan-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}>
              {d}
              {events.some(e => e.date === dateStr) && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mx-auto mt-0.5" />}
            </button>
          );
        })}
      </div>
      <button onClick={add} className="w-full py-5 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl text-slate-500 font-black uppercase text-[10px] active:scale-95 transition-all">Add Event on {selectedDate}</button>
      <div className="space-y-2">
        {events.filter(e => e.date === selectedDate).map(e => <div key={e.id} className="p-4 bg-slate-900 rounded-xl border border-white/5 text-sm font-bold text-white shadow-sm flex justify-between items-center group">
          <span>{e.text}</span>
          <button onClick={() => {
            const up = events.filter(x => x.id !== e.id);
            setEvents(up);
            localStorage.setItem('lsp_v12_events', JSON.stringify(up));
          }} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
        </div>)}
      </div>
    </div>
  );
};

const NoteView = () => {
  const [notes, setNotes] = useState<any[]>(() => JSON.parse(localStorage.getItem('lsp_v12_notes') || '[]'));
  const add = () => {
    const text = window.prompt("Capture Neural Insight:");
    if(text) {
      const up = [{id: Date.now(), text}, ...notes];
      setNotes(up);
      localStorage.setItem('lsp_v12_notes', JSON.stringify(up));
    }
  };
  return (
    <div className="space-y-6 animate-in max-w-md mx-auto">
      <div className="bg-amber-600 p-6 rounded-[2rem] text-white shadow-xl">
        <h2 className="text-lg font-black uppercase flex items-center gap-2"><StickyNote size={20}/> Neural Notes</h2>
        <p className="text-[11px] opacity-80 mt-2">Offload transient trace data to free up active memory capacity.</p>
      </div>
      <button onClick={add} className="w-full p-10 bg-amber-600/10 border-2 border-dashed border-amber-600/20 rounded-[2.5rem] text-amber-500 font-black uppercase text-xs active:scale-95 transition-all shadow-inner">Capture Trace</button>
      <div className="space-y-3">
        {notes.map(n => (
          <div key={n.id} className="bg-slate-900 p-5 rounded-2xl border border-white/5 relative group">
            <p className="text-sm text-slate-300 pr-8 leading-relaxed">{n.text}</p>
            <button onClick={() => {
              const up = notes.filter(x => x.id !== n.id);
              setNotes(up);
              localStorage.setItem('lsp_v12_notes', JSON.stringify(up));
            }} className="absolute top-4 right-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileView = ({ name, setUserName, gender, setGender, themeName, setThemeName, thresholds, setThresholds, habits, setHabits, segments, setSegments }: any) => {
  const [showAbout, setShowAbout] = useState(false);
  const addHabit = () => {
    const h = window.prompt("New Habit Loop?");
    if(h) setHabits([...habits, h]);
  };
  const addSegment = () => {
    const s = window.prompt("New Matrix Segment?");
    if(s) setSegments([...segments, s]);
  };

  return (
    <div className="space-y-8 animate-in pb-12 max-w-md mx-auto">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 space-y-8 shadow-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black uppercase text-white">Protocol Config</h3>
          <Settings2 className="text-slate-500" />
        </div>
        
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-500 block tracking-widest ml-1">Identity Protocol</label>
          <input value={name} onChange={e => setUserName(e.target.value)} className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none font-bold text-white focus:border-[var(--accent-primary)] transition-all shadow-inner" placeholder="Edit Name" />
          <div className="flex gap-4">
            <button onClick={() => setGender('boy')} className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'boy' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-white shadow-glow-sm' : 'border-white/5 opacity-40 grayscale'}`}>
               <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none stroke-current stroke-2"><circle cx="50" cy="35" r="15"/><path d="M50 50 L50 75 M50 55 L35 70 M50 55 L65 70 M50 75 L35 90 M50 75 L65 90"/><path d="M40 30 Q50 20 60 30"/></svg>
               <span className="text-[8px] font-black">BOY</span>
            </button>
            <button onClick={() => setGender('girl')} className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'girl' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-white shadow-glow-sm' : 'border-white/5 opacity-40 grayscale'}`}>
               <svg viewBox="0 0 100 100" className="w-8 h-8 fill-none stroke-current stroke-2"><circle cx="50" cy="35" r="15"/><path d="M50 50 L50 75 M50 55 L35 70 M50 55 L65 70 M50 75 L35 90 M50 75 L65 90"/><path d="M35 35 Q50 15 65 35"/><path d="M40 75 L60 75"/></svg>
               <span className="text-[8px] font-black">GIRL</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-500 block tracking-widest ml-1">Threshold Protocol (Mins)</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[8px] text-slate-600 uppercase ml-1">Max Device</span>
              <input type="number" value={thresholds.deviceGood} onChange={e => setThresholds({...thresholds, deviceGood: parseInt(e.target.value)||0})} className="w-full bg-black/40 p-3 rounded-lg text-xs text-white border border-white/5 shadow-inner" />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] text-slate-600 uppercase ml-1">Min Segment</span>
              <input type="number" value={thresholds.segmentGood} onChange={e => setThresholds({...thresholds, segmentGood: parseInt(e.target.value)||0})} className="w-full bg-black/40 p-3 rounded-lg text-xs text-white border border-white/5 shadow-inner" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-500 block tracking-widest ml-1">Visual Protocol (Themes)</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(THEMES).map(t => (
              <button key={t} onClick={() => setThemeName(t)} className={`p-2.5 rounded-xl text-[8px] font-black uppercase border-2 transition-all ${themeName === t ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white shadow-lg' : 'border-white/5 bg-black/20 text-slate-500'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-center ml-1">
             <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Habit Loops</label>
             <button onClick={addHabit} className="p-1.5 bg-white/5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"><Plus size={14}/></button>
           </div>
           <div className="flex flex-wrap gap-2">
             {habits.map((h: string) => (
               <div key={h} className="bg-white/5 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-white/5 flex items-center gap-2 group text-white">
                 {h}
                 <button onClick={() => setHabits(habits.filter((x: string) => x !== h))} className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400"><X size={12}/></button>
               </div>
             ))}
           </div>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-center ml-1">
             <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Neural Segments</label>
             <button onClick={addSegment} className="p-1.5 bg-white/5 rounded-lg text-indigo-400 hover:bg-indigo-400/10 transition-colors"><Plus size={14}/></button>
           </div>
           <div className="flex flex-wrap gap-2">
             {segments.map((s: string) => (
               <div key={s} className="bg-white/5 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-white/5 flex items-center gap-2 group text-white">
                 {s}
                 <button onClick={() => setSegments(segments.filter((x: string) => x !== s))} className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400"><X size={12}/></button>
               </div>
             ))}
           </div>
        </div>

        <button onClick={() => setShowAbout(true)} className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all shadow-md">About Us</button>
      </div>

      {showAbout && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 animate-in" onClick={() => setShowAbout(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 max-w-sm space-y-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-primary)] shadow-glow" />
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase text-white tracking-tighter">System Info</h2>
              <X className="cursor-pointer text-slate-500 hover:text-white transition-colors" onClick={() => setShowAbout(false)} />
            </div>
            <div className="space-y-4 text-xs leading-relaxed text-slate-400">
              <p><b className="text-white">Developer:</b> AM SAIMUM</p>
              <p><b className="text-white">Organization:</b> Comilla University, Bangladesh</p>
              <p><b className="text-white">Protocol:</b> Life Sync Pro is a neural-inspired OS designed to harmonize high-performance ambition with cognitive energy management. It leverages strategic feedback loops to optimize daily output and mental energy ROI.</p>
            </div>
            <button onClick={() => setShowAbout(false)} className="w-full py-5 bg-[var(--accent-primary)] rounded-2xl text-white font-black uppercase text-[10px] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Synchronize Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
};

const AIModal: React.FC<any> = ({ onClose }) => {
  const [p, setP] = useState("");
  const [r, setR] = useState("");
  const [l, setL] = useState(false);
  const ask = async () => {
    if(!p) return; setL(true); setR("");
    for await (const c of askAIArchitectStream(p)) { setR(v => v + c); }
    setL(false);
  };
  return (
    <div className="space-y-6 animate-in max-w-md mx-auto">
      <div className="p-10 bg-indigo-600 rounded-[2.5rem] text-white flex flex-col items-center gap-4 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Cpu size={120}/></div>
        <Bot size={48}/>
        <h2 className="text-3xl font-black uppercase tracking-tighter">Oracle AI</h2>
      </div>
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl">
        <textarea value={p} onChange={e => setP(e.target.value)} className="w-full bg-black/40 p-6 rounded-3xl text-white text-sm border border-white/5 h-48 resize-none outline-none focus:border-indigo-500 transition-all shadow-inner" placeholder="Request strategic directive..." />
        <button onClick={ask} disabled={l} className="w-full py-5 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 active:scale-95">{l ? 'Synthesizing...' : 'Submit Inquiry'}</button>
        {r && <div className="p-6 bg-white/5 rounded-3xl text-xs italic text-indigo-100 max-h-48 overflow-y-auto leading-relaxed border border-white/5 custom-scroll shadow-inner">{r}</div>}
      </div>
    </div>
  );
};

export default App;
