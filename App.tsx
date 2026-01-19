
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Zap, Smartphone, GraduationCap, BookOpen, Briefcase, 
  Moon, Trophy, Sparkles, Target, Activity, Cpu, Check, Settings2, Clock, 
  CalendarDays, ChevronRight, Bot, ChevronLeft, Timer, StickyNote, Flame, 
  X, ArrowRight, Volume2, VolumeX, Tag, Bell, Menu, User, Award, TrendingUp,
  Info, ShieldCheck, Palette, UserRound, UserRoundPlus
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

  // Thresholds for Digital Section
  const [thresholds, setThresholds] = useState({ deviceGood: 240, deviceOk: 420, segmentGood: 180, segmentOk: 60 });

  useEffect(() => {
    const savedData = localStorage.getItem('lsp_v10_data');
    const savedName = localStorage.getItem('lsp_user_name');
    const savedGender = localStorage.getItem('lsp_user_gender');
    const savedTheme = localStorage.getItem('lsp_theme');
    const savedThresh = localStorage.getItem('lsp_thresholds');
    const onboardingComplete = localStorage.getItem('lsp_onboarding_done');

    if (savedData) setLocalData(JSON.parse(savedData));
    if (savedTheme) applyTheme(savedTheme);
    if (savedThresh) setThresholds(JSON.parse(savedThresh));
    
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
    localStorage.setItem('lsp_v10_data', JSON.stringify(newData));
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
              <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase">LIFE SYNC</h1>
              <p className="text-[var(--text-main)] opacity-40 text-[10px] font-bold tracking-[0.4em] uppercase">Digital Diary v10</p>
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-6">
              <input 
                value={userName} 
                onChange={e => setUserName(e.target.value)} 
                className="w-full bg-black/20 border-2 border-white/10 p-4 rounded-xl text-center text-[var(--text-main)] font-bold outline-none focus:border-[var(--accent-primary)] transition-all" 
                placeholder="YOUR NAME" 
              />
              <div className="flex gap-4">
                <button onClick={() => setGender('boy')} className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'boy' ? 'bg-[var(--accent-primary)] border-white scale-105 shadow-xl' : 'bg-white/5 border-white/5 opacity-40'}`}>
                  <UserRound size={40} className="text-white" />
                  <span className="text-[10px] text-white font-black">BOY</span>
                </button>
                <button onClick={() => setGender('girl')} className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'girl' ? 'bg-[var(--accent-primary)] border-white scale-105 shadow-xl' : 'bg-white/5 border-white/5 opacity-40'}`}>
                  <UserRoundPlus size={40} className="text-white" />
                  <span className="text-[10px] text-white font-black">GIRL</span>
                </button>
              </div>
            </div>
            
            <button 
              disabled={!userName || !gender} 
              onClick={() => setOnboardingStep(1)} 
              className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-xl font-black uppercase tracking-widest disabled:opacity-30 active:scale-95 transition-all"
            >
              Open Diary <ArrowRight className="inline ml-2" size={18} />
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="h-screen bg-[var(--app-bg)] p-8 flex flex-col items-center justify-center animate-in">
          <div className="max-w-md w-full bg-[var(--card-bg)] rounded-[2.5rem] border border-white/10 p-10 shadow-2xl space-y-8 relative overflow-hidden">
            <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight">User Manual ✍️</h2>
            <div className="space-y-6 text-[var(--text-main)] opacity-80">
              <div className="flex gap-4 items-start">
                <span className="text-2xl">🎯</span>
                <p className="text-sm"><b>Daily Sync:</b> Complete your core mission targets.</p>
              </div>
              <div className="flex gap-4 items-start">
                <span className="text-2xl">⏳</span>
                <p className="text-sm"><b>Focus Chamber:</b> High-intensity work intervals.</p>
              </div>
              <div className="flex gap-4 items-start">
                <span className="text-2xl">🔋</span>
                <p className="text-sm"><b>Energy:</b> Track screen time vs deep learning.</p>
              </div>
            </div>
            <button onClick={() => saveProfile(userName, gender as any)} className="w-full py-5 bg-[var(--accent-primary)] rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Start Sync</button>
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
        gender={gender as any}
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
            />
          )}
        </main>

        {!overlayView && (
          <button 
            onClick={() => setOverlayView('quick-add')} 
            className="fixed right-6 bottom-28 w-14 h-14 bg-[var(--accent-primary)] rounded-full shadow-2xl flex items-center justify-center text-white active:scale-95 transition-all z-40"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        )}

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

const Sidebar: React.FC<any> = ({ isOpen, onClose, userName, gender, onSelectOverlay }) => (
  <>
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <aside className={`fixed top-0 left-0 h-full w-[80%] max-w-xs bg-[var(--card-bg)] z-[70] transform transition-transform duration-300 border-r border-white/5 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full p-6">
        <div className="bg-white/5 p-6 rounded-3xl mb-8 flex flex-col items-center gap-3 border border-white/5 text-center">
          <div className="w-20 h-20 rounded-full bg-black/20 border-2 border-[var(--accent-primary)] flex items-center justify-center text-white">
            {gender === 'boy' ? <UserRound size={40}/> : <UserRoundPlus size={40}/>}
          </div>
          <h2 className="text-lg font-black">{userName}</h2>
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

const TabRouter: React.FC<any> = ({ tab, currentDay, updateDayData, localData, userName, thresholds }) => {
  switch (tab) {
    case Tab.TODAY: return <TodayView data={currentDay.goals} updateDayData={updateDayData} />;
    case Tab.UPCOMING: return <ProductivityHub data={localData} userName={userName} />;
    case Tab.BROWSE: return <EnergyMatrix currentDay={currentDay} updateDayData={updateDayData} thresholds={thresholds} />;
    default: return null;
  }
};

// --- VIEWS ---

const TodayView: React.FC<any> = ({ data, updateDayData }) => {
  const currentDayStr = new Date().toISOString().split('T')[0];
  return (
    <div className="space-y-4 animate-in">
      <div className="bg-[var(--accent-primary)]/10 p-5 rounded-3xl border border-[var(--accent-primary)]/20 mb-6 flex items-center gap-3">
        <Sparkles size={18} className="text-[var(--accent-primary)]"/>
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest">Daily Briefing</h3>
          <p className="text-slate-400 text-[10px]">Synchronize your objectives for peak output.</p>
        </div>
      </div>
      {data.map((goal: any) => (
        <div key={goal.id} className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center gap-4 active:scale-95 transition-all">
          <button 
            onClick={() => updateDayData(currentDayStr, { goals: data.map((g: any) => g.id === goal.id ? { ...g, done: !g.done } : g) })}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${goal.done ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' : 'border-slate-800'}`}
          >
            {goal.done && <Check size={14} strokeWidth={4} className="text-white" />}
          </button>
          <p className={`text-sm font-bold flex-1 ${goal.done ? 'line-through text-slate-600' : 'text-slate-200'}`}>{goal.text}</p>
          <button onClick={() => updateDayData(currentDayStr, { goals: data.filter((g: any) => g.id !== goal.id) })} className="text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
        </div>
      ))}
      {data.length === 0 && <p className="text-center py-10 opacity-20 font-black uppercase text-[10px] tracking-widest">Protocol Empty</p>}
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
    <div className="space-y-8 animate-in pb-12">
      <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
        <div className="w-14 h-14 bg-[var(--accent-primary)] rounded-2xl flex items-center justify-center text-2xl font-black text-white">{userName[0]}</div>
        <div>
          <h2 className="text-xl font-black">{userName}</h2>
          <p className="text-[10px] font-black uppercase text-[var(--accent-primary)] tracking-widest flex items-center gap-1"><Award size={12}/> Tier-1 Operational</p>
        </div>
      </div>

      <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl">
        {['Daily', 'Weekly'].map(t => (
          <button key={t} onClick={() => setActiveSub(t as any)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeSub === t ? 'bg-[var(--accent-primary)] text-white' : 'text-slate-500'}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-8">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * percent) / 100} className="text-[var(--accent-primary)]" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-black">{done}/{total}</div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{activeSub} Completion</h4>
            <p className="text-2xl font-black">{percent}%</p>
          </div>
        </div>
        
        {activeSub === 'Daily' && (
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><TrendingUp size={14}/> Efficiency Wave</h4>
            <div className="flex justify-between items-end h-20 px-2">
              {[4,7,3,9,5,8,6].map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-1.5 bg-[var(--accent-primary)] rounded-full" style={{ height: `${v * 10}%` }} />
                  <span className="text-[8px] font-black text-slate-700">MTWTFSS"[i]</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EnergyMatrix: React.FC<any> = ({ currentDay, updateDayData, thresholds }) => {
  const currentDayStr = new Date().toISOString().split('T')[0];
  const mins = parseInt(currentDay.deviceTime || '0');
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  
  const getDeviceStatus = () => {
    if (mins < thresholds.deviceGood) return { label: 'Good', color: 'text-emerald-400', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.1)] border-emerald-500/20 bg-emerald-500/5' };
    if (mins <= thresholds.deviceOk) return { label: 'OK', color: 'text-amber-400', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.1)] border-amber-500/20 bg-amber-500/5' };
    return { label: 'Not Good', color: 'text-rose-400', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.1)] border-rose-500/20 bg-rose-500/5' };
  };
  const status = getDeviceStatus();

  return (
    <div className="space-y-8 animate-in pb-12">
      <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 ${status.glow}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Device Load</h4>
            <p className="text-xl font-black">Status: <span className={status.color}>{status.label}</span></p>
          </div>
          <Smartphone className={status.color} />
        </div>
        <div className="flex gap-4">
          <input type="number" value={h} onChange={e => updateDayData(currentDayStr, { deviceTime: ((parseInt(e.target.value)||0)*60 + m).toString() })} className="flex-1 bg-black/40 p-4 rounded-2xl text-2xl font-black text-white text-center" placeholder="H" />
          <input type="number" value={m} onChange={e => updateDayData(currentDayStr, { deviceTime: (h*60 + (parseInt(e.target.value)||0)).toString() })} className="flex-1 bg-black/40 p-4 rounded-2xl text-2xl font-black text-white text-center" placeholder="M" />
        </div>
      </div>

      <div className="space-y-4">
        {['Academic', 'Tuition', 'Career', 'Self Growth', 'Islamic', 'Custom'].map(seg => (
          <SegmentCard 
            key={seg} 
            name={seg} 
            logs={currentDay.studyLogs.filter((l: any) => l.category === seg)} 
            thresholds={thresholds}
            onAdd={(topic: string, hr: string, min: string) => {
              const total = (parseInt(hr||"0") * 60) + parseInt(min||"0");
              updateDayData(currentDayStr, { studyLogs: [...currentDay.studyLogs, {id: Date.now().toString(), category: seg, topic, time: total.toString()}] });
            }}
          />
        ))}
      </div>
    </div>
  );
};

const SegmentCard: React.FC<any> = ({ name, logs, onAdd, thresholds }) => {
  const [topic, setTopic] = useState("");
  const totalMins = logs.reduce((acc: number, cur: any) => acc + parseInt(cur.time), 0);
  const statusColor = totalMins >= thresholds.segmentGood ? 'border-emerald-500/30 bg-emerald-500/5' : 
                      totalMins >= thresholds.segmentOk ? 'border-amber-500/30 bg-amber-500/5' : 'border-rose-500/30 bg-rose-500/5';
  
  return (
    <div className={`p-6 rounded-[2rem] border transition-all ${statusColor}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-black uppercase tracking-tight">{name}</h4>
        <span className="text-[10px] font-black">{Math.floor(totalMins/60)}h {totalMins%60}m</span>
      </div>
      <div className="flex gap-2">
        <input placeholder="Topic..." value={topic} onChange={e => setTopic(e.target.value)} className="flex-1 bg-black/20 rounded-xl px-4 py-2 text-xs text-[var(--text-main)] outline-none" />
        <button onClick={() => { if(topic) { onAdd(topic, "0", "30"); setTopic(""); } }} className="p-2 bg-[var(--accent-primary)] rounded-xl text-white"><Plus size={16}/></button>
      </div>
    </div>
  );
};

// --- OVERLAY ROUTER ---

const OverlayRouter: React.FC<any> = (props) => {
  switch (props.view) {
    case 'focus': return <FocusView />;
    case 'habits': return <HabitView />;
    case 'countdown': return <CountdownView {...props} />;
    case 'notes': return <NoteView />;
    case 'profile': return <ProfileView {...props} />;
    case 'oracle': return <AIModal onClose={props.onClose} />;
    case 'quick-add': return <QuickAddView {...props} />;
    default: return null;
  }
};

const FocusView = () => (
  <div className="space-y-6 animate-in">
    <div className="bg-indigo-600 p-6 rounded-[2rem] text-white">
      <h2 className="text-lg font-black uppercase flex items-center gap-2"><Timer size={20}/> Focus Chamber</h2>
      <p className="text-[11px] opacity-80 mt-2">Activate the 25-minute Pomodoro method to maintain peak focus. Strategic intervals prevent neural ROI decay.</p>
    </div>
    <div className="bg-slate-900 p-12 rounded-[2.5rem] border border-white/5 text-center space-y-8 shadow-2xl">
      <div className="text-7xl font-black tracking-tighter text-white">25:00</div>
      <button className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center mx-auto shadow-xl text-white"><Zap size={32}/></button>
    </div>
  </div>
);

const HabitView = () => (
  <div className="space-y-6 animate-in">
    <div className="bg-emerald-600 p-6 rounded-[2rem] text-white">
      <h2 className="text-lg font-black uppercase flex items-center gap-2"><Flame size={20}/> Habit Sync</h2>
      <p className="text-[11px] opacity-80 mt-2">Forge long-term neural pathways via consistent synchronization. Small daily shifts compound into high performance.</p>
    </div>
    <div className="space-y-3">
      {['Reading', 'Meditation'].map(h => (
        <div key={h} className="bg-slate-900 p-5 rounded-2xl border border-white/5 flex justify-between items-center shadow-md">
          <span className="font-bold text-sm text-white">{h}</span>
          <div className="flex gap-1.5">{[1,1,1,0,0,0,0].map((s,i) => <div key={i} className={`w-5 h-5 rounded-md ${s ? 'bg-emerald-500 shadow-glow-sm' : 'bg-white/5'}`} />)}</div>
        </div>
      ))}
    </div>
  </div>
);

const CountdownView = ({ selectedDate, setSelectedDate, addNotification }: any) => {
  const [events, setEvents] = useState<any[]>(() => JSON.parse(localStorage.getItem('lsp_v10_events') || '[]'));
  const add = () => {
    const text = window.prompt("Event Name?");
    if(text) {
      const newList = [...events, {id: Date.now(), date: selectedDate, text}];
      setEvents(newList);
      localStorage.setItem('lsp_v10_events', JSON.stringify(newList));
      addNotification(`Event Registered: ${text} for ${selectedDate}`);
    }
  };
  return (
    <div className="space-y-6 animate-in">
      <div className="bg-cyan-600 p-6 rounded-[2rem] text-white">
        <h2 className="text-lg font-black uppercase flex items-center gap-2"><Clock size={20}/> Countdown Matrix</h2>
        <p className="text-[11px] opacity-80 mt-2">Map future milestones to your neural timeline. Prevent deadline-induced decision fatigue.</p>
      </div>
      <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 grid grid-cols-7 gap-2 shadow-2xl">
        {Array.from({length: 31}, (_, i) => i+1).map(d => {
          const dateStr = `2026-01-${String(d).padStart(2,'0')}`;
          const isSelected = selectedDate === dateStr;
          return (
            <button key={d} onClick={() => setSelectedDate(dateStr)} className={`aspect-square rounded-xl text-[10px] font-black transition-all ${isSelected ? 'bg-cyan-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}>
              {d}
              {events.some(e => e.date === dateStr) && <div className="w-1 h-1 bg-cyan-400 rounded-full mx-auto mt-0.5" />}
            </button>
          );
        })}
      </div>
      <button onClick={add} className="w-full py-4 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl text-slate-500 font-black uppercase text-[10px] active:scale-95 transition-all">Add Event on {selectedDate}</button>
      <div className="space-y-2">
        {events.filter(e => e.date === selectedDate).map(e => <div key={e.id} className="p-4 bg-slate-900 rounded-xl border border-white/5 text-sm font-bold text-white shadow-sm">{e.text}</div>)}
      </div>
    </div>
  );
};

const NoteView = () => (
  <div className="space-y-6 animate-in">
    <div className="bg-amber-600 p-6 rounded-[2rem] text-white">
      <h2 className="text-lg font-black uppercase flex items-center gap-2"><StickyNote size={20}/> Neural Notes</h2>
      <p className="text-[11px] opacity-80 mt-2">Instantly capture strategic trace data. Offloading cognitive overhead maximizes processing speed for current tasks.</p>
    </div>
    <button onClick={() => window.prompt("Neural Trace:")} className="w-full p-10 bg-amber-600/10 border-2 border-dashed border-amber-600/20 rounded-[2.5rem] text-amber-500 font-black uppercase text-xs active:scale-95 transition-all">What's on your mind?</button>
  </div>
);

const ProfileView = ({ name, setUserName, gender, setGender, themeName, setThemeName, thresholds, setThresholds }: any) => {
  const [showAbout, setShowAbout] = useState(false);
  return (
    <div className="space-y-8 animate-in pb-12">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl">
        <h3 className="text-xl font-black uppercase text-white">Configuration</h3>
        
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-500 block tracking-widest">Ident Protocol</label>
          <input value={name} onChange={e => setUserName(e.target.value)} className="w-full bg-black/40 p-4 rounded-xl border border-white/5 outline-none font-bold text-white focus:border-[var(--accent-primary)]" placeholder="Edit Name" />
          <div className="flex gap-4">
            <button onClick={() => setGender('boy')} className={`flex-1 p-3 rounded-xl border-2 transition-all ${gender === 'boy' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-white' : 'border-white/5 opacity-50'}`}><UserRound className="mx-auto"/></button>
            <button onClick={() => setGender('girl')} className={`flex-1 p-3 rounded-xl border-2 transition-all ${gender === 'girl' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-white' : 'border-white/5 opacity-50'}`}><UserRoundPlus className="mx-auto"/></button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-500 block tracking-widest">Visual Style (Themes)</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(THEMES).map(t => (
              <button key={t} onClick={() => setThemeName(t)} className={`p-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${themeName === t ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white shadow-lg' : 'border-white/5 bg-black/20 text-slate-500'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-500 block tracking-widest">Threshold Control (Mins)</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[8px] text-slate-600 uppercase">Device Target</span>
              <input type="number" value={thresholds.deviceGood} onChange={e => setThresholds({...thresholds, deviceGood: parseInt(e.target.value)||0})} className="w-full bg-black/40 p-3 rounded-lg text-xs text-white border border-white/5" />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] text-slate-600 uppercase">Segment Target</span>
              <input type="number" value={thresholds.segmentGood} onChange={e => setThresholds({...thresholds, segmentGood: parseInt(e.target.value)||0})} className="w-full bg-black/40 p-3 rounded-lg text-xs text-white border border-white/5" />
            </div>
          </div>
        </div>

        <button onClick={() => setShowAbout(true)} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors">About Protocol</button>
      </div>

      {showAbout && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 animate-in" onClick={() => setShowAbout(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 max-w-sm space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase text-white">About Us</h2>
              <X className="cursor-pointer text-slate-500 hover:text-white" onClick={() => setShowAbout(false)} />
            </div>
            <div className="space-y-4 text-xs leading-relaxed text-slate-400">
              <p><b className="text-white">Developer:</b> AM SAIMUM</p>
              <p><b className="text-white">Organization:</b> Comilla University, Bangladesh</p>
              <p><b className="text-white">The Mission:</b> Life Sync Pro is a neural-inspired OS designed to harmonize high-performance ambition with cognitive well-being. It leverages strategic feedback loops to optimize daily output and mental energy ROI.</p>
            </div>
            <button onClick={() => setShowAbout(false)} className="w-full py-4 bg-[var(--accent-primary)] rounded-xl text-white font-black uppercase text-[10px] shadow-lg">Return to Dashboard</button>
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
    <div className="space-y-6 animate-in">
      <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white flex flex-col items-center gap-4 text-center shadow-xl">
        <Bot size={40}/>
        <h2 className="text-2xl font-black uppercase tracking-tighter">Oracle AI</h2>
      </div>
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl">
        <textarea value={p} onChange={e => setP(e.target.value)} className="w-full bg-black/40 p-6 rounded-3xl text-white text-sm border border-white/5 h-40 resize-none outline-none focus:border-indigo-500" placeholder="Request Strategic Insight..." />
        <button onClick={ask} disabled={l} className="w-full py-5 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">{l ? 'Synthesizing...' : 'Request Insight'}</button>
        {r && <div className="p-6 bg-white/5 rounded-3xl text-xs italic text-indigo-100 max-h-40 overflow-y-auto leading-relaxed border border-white/5 custom-scroll">{r}</div>}
      </div>
    </div>
  );
};

const QuickAddView: React.FC<any> = ({ onClose, addNotification, updateDayData, localData }) => {
  const [val, setVal] = useState("");
  const currentDayStr = new Date().toISOString().split('T')[0];
  
  const handleAdd = () => {
    if(!val) return;
    const day = localData[currentDayStr] || { goals: [], deviceTime: '0', studyLogs: [] };
    const newGoal = { id: Date.now().toString(), text: val, priority: 'standard', done: false, date: currentDayStr };
    updateDayData(currentDayStr, { goals: [...day.goals, newGoal] });
    addNotification(`Sync Complete: ${val}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-end animate-in" onClick={onClose}>
      <div className="bg-slate-900 w-full rounded-t-[3rem] p-10 space-y-8 border-t border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center text-slate-500 uppercase text-[10px] font-black tracking-widest"><span>Initialize Parameter</span><button onClick={onClose}><X size={20}/></button></div>
        <input 
          autoFocus 
          value={val} 
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Objective details..." 
          className="w-full bg-transparent text-2xl font-black text-white outline-none placeholder:text-white/10" 
        />
        <button onClick={handleAdd} className="w-full py-5 bg-[var(--accent-primary)] rounded-2xl text-white font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Synchronize</button>
      </div>
    </div>
  );
};

export default App;
