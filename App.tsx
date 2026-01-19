
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, Zap, Smartphone, GraduationCap, BookOpen, Briefcase, 
  UserPlus, Moon, Trophy, Heart, Sparkles, Target, BrainCircuit, 
  Lightbulb, Activity, Cpu, Check, Settings2, Clock, Inbox, 
  CalendarDays, LayoutGrid, ChevronRight, User, Palette, Bell, 
  Layers, HelpCircle, Share2, Info, Search, MoreVertical,
  CheckCircle2, Menu, X, Wand2, Bot, LogOut, TrendingUp, Award,
  ChevronLeft, Trash, Timer, ListChecks, StickyNote, Flame, Waves, 
  Sun, CloudRain, Snowflake, Monitor, AlertCircle, Users, Calendar,
  Book, ArrowRight, UserRound
} from 'lucide-react';
import { AppState, Tab, DayData, Goal, StudyLog, UserProfile } from './types';
import { askAIArchitectStream } from './geminiService';

// --- ATMOSPHERE ENGINE CONFIG ---
const THEMES: Record<string, any> = {
  Night: { bg: '#020617', card: '#0f172a', accent: '#4f46e5', text: '#f8fafc' },
  Forest: { bg: '#052e16', card: '#064e3b', accent: '#22c55e', text: '#ecfdf5' },
  Sky: { bg: '#f0f9ff', card: '#ffffff', accent: '#0ea5e9', text: '#0c4a6e' },
  Sea: { bg: '#083344', card: '#164e63', accent: '#06b6d4', text: '#ecfeff' },
  Sunset: { bg: '#451a03', card: '#78350f', accent: '#f59e0b', text: '#fff7ed' },
  Sunrise: { bg: '#2d1b69', card: '#4c1d95', accent: '#f472b6', text: '#fdf2f8' },
  Rainy: { bg: '#1e293b', card: '#334155', accent: '#94a3b8', text: '#f1f5f9' },
  Winter: { bg: '#f1f5f9', card: '#ffffff', accent: '#38bdf8', text: '#1e293b' }
};

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Academic', icon: 'GraduationCap', color: 'from-blue-500 to-cyan-500' },
  { id: '2', name: 'Tuition', icon: 'BookOpen', color: 'from-emerald-500 to-teal-500' },
  { id: '3', name: 'Career', icon: 'Briefcase', color: 'from-amber-500 to-orange-500' },
  { id: '4', name: 'Self Growth', icon: 'Sparkles', color: 'from-purple-500 to-pink-500' },
  { id: '5', name: 'Islamic', icon: 'Moon', color: 'from-indigo-500 to-purple-500' }
];

const ICON_MAP: Record<string, any> = {
  GraduationCap: <GraduationCap size={20}/>, BookOpen: <BookOpen size={20}/>, Briefcase: <Briefcase size={20}/>,
  UserPlus: <UserPlus size={20}/>, Moon: <Moon size={20}/>, Lightbulb: <Lightbulb size={20}/>,
  Target: <Target size={20}/>, Activity: <Activity size={20}/>, Cpu: <Cpu size={20}/>, 
  Heart: <Heart size={20}/>, Zap: <Zap size={20}/>, Sparkles: <Sparkles size={20}/>
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [onboardingStep, setOnboardingStep] = useState(0); // 0: Cover, 1: Manual
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TODAY);
  const [overlayView, setOverlayView] = useState<string | null>(null);
  const [theme, setTheme] = useState('Night');
  const [localData, setLocalData] = useState<Record<string, DayData>>({});
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [userName, setUserName] = useState("");
  const [gender, setGender] = useState<'boy' | 'girl' | ''>('');
  const [karma, setKarma] = useState(100);

  useEffect(() => {
    const savedData = localStorage.getItem('lsp_v7_data');
    const savedName = localStorage.getItem('lsp_user_name');
    const savedGender = localStorage.getItem('lsp_user_gender');
    const savedTheme = localStorage.getItem('lsp_theme');
    const savedCats = localStorage.getItem('lsp_categories');
    const onboardingComplete = localStorage.getItem('lsp_onboarding_done');

    if (savedData) setLocalData(JSON.parse(savedData));
    if (savedName && savedGender && onboardingComplete) { 
      setUserName(savedName); 
      setGender(savedGender as any);
      setAppState(AppState.DASHBOARD); 
    }
    if (savedTheme) applyTheme(savedTheme);
    if (savedCats) setCategories(JSON.parse(savedCats));
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('lsp_user_name', userName);
    localStorage.setItem('lsp_user_gender', gender);
    localStorage.setItem('lsp_onboarding_done', 'true');
    setAppState(AppState.DASHBOARD);
  };

  const applyTheme = (name: string) => {
    const t = THEMES[name];
    if (!t) return;
    const root = document.documentElement;
    root.style.setProperty('--app-bg', t.bg);
    root.style.setProperty('--card-bg', t.card);
    root.style.setProperty('--accent-primary', t.accent);
    root.style.setProperty('--text-main', t.text);
    root.style.setProperty('--border-color', name === 'Sky' || name === 'Winter' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)');
    localStorage.setItem('lsp_theme', name);
    setTheme(name);
  };

  const updateDayData = (date: string, updates: Partial<DayData>) => {
    const day = localData[date] || { goals: [], deviceTime: '0', studyLogs: [] };
    const newData = { ...localData, [date]: { ...day, ...updates } };
    localStorage.setItem('lsp_v7_data', JSON.stringify(newData));
    setLocalData(newData);
  };

  const updateCategories = (newCats: any[]) => {
    setCategories(newCats);
    localStorage.setItem('lsp_categories', JSON.stringify(newCats));
  };

  const currentDay = localData[new Date().toISOString().split('T')[0]] || { goals: [], deviceTime: '0', studyLogs: [] };

  if (appState === AppState.WELCOME) {
    if (onboardingStep === 0) {
      return (
        <div className="h-screen flex items-center justify-center p-6 bg-[#020617] overflow-hidden">
          {/* Digital Diary Cover Design */}
          <div className="w-full max-w-sm aspect-[3/4] bg-[#4c1d95] rounded-[40px] shadow-2xl relative overflow-hidden border-[12px] border-[#2e1065] flex flex-col items-center justify-between p-10 text-center animate-in">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10"><Sparkles size={40}/></div>
                <div className="absolute bottom-20 right-10"><Target size={60}/></div>
                <div className="absolute top-1/2 left-4"><Zap size={30}/></div>
             </div>
             
             <div className="mt-8">
               <div className="w-20 h-2 bg-white/20 rounded-full mx-auto mb-4" />
               <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-2">MY LIFE<br/>SYNC PRO</h1>
               <p className="text-white/50 text-[10px] font-bold tracking-[0.3em]">NEURAL PROTOCOL v7</p>
             </div>

             <div className="w-full space-y-4 relative z-10">
               <input 
                 value={userName}
                 onChange={e => setUserName(e.target.value)}
                 className="w-full bg-white/10 border-2 border-white/20 p-4 rounded-2xl text-center text-white font-bold outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-white/20" 
                 placeholder="NAME OF USER"
               />
               
               <div className="flex gap-4">
                 <button 
                   onClick={() => setGender('boy')}
                   className={`flex-1 p-4 rounded-2xl border-2 transition-all font-black uppercase text-[10px] tracking-widest ${gender === 'boy' ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                 >
                   👦 Boy
                 </button>
                 <button 
                   onClick={() => setGender('girl')}
                   className={`flex-1 p-4 rounded-2xl border-2 transition-all font-black uppercase text-[10px] tracking-widest ${gender === 'girl' ? 'bg-pink-500 border-pink-400 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                 >
                   👧 Girl
                 </button>
               </div>
             </div>

             <button 
               disabled={!userName || !gender}
               onClick={() => setOnboardingStep(1)}
               className="group w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-[#4c1d95] disabled:opacity-30 active:scale-95 transition-all"
             >
               <ArrowRight className="group-hover:translate-x-1 transition-transform" size={32} />
             </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="h-screen bg-[#020617] p-8 flex flex-col items-center justify-center animate-in">
           <div className="max-w-md w-full bg-[#0f172a] rounded-[48px] border border-white/10 p-10 shadow-2xl space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white tracking-tighter">USER MANUAL 📖</h2>
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Protocol Index</div>
              </div>

              <div className="space-y-6 text-sm">
                 <div className="flex gap-4 items-start">
                   <div className="text-2xl">⚡</div>
                   <div>
                     <p className="font-bold text-white mb-1">Daily Sync</p>
                     <p className="text-slate-400 text-xs">Mark your targets. Achieve daily dopamine wins. 🎯</p>
                   </div>
                 </div>
                 <div className="flex gap-4 items-start">
                   <div className="text-2xl">🧠</div>
                   <div>
                     <p className="font-bold text-white mb-1">Performance Matrix</p>
                     <p className="text-slate-400 text-xs">Track study time across Academic, Career & more. 📚</p>
                   </div>
                 </div>
                 <div className="flex gap-4 items-start">
                   <div className="text-2xl">⏳</div>
                   <div>
                     <p className="font-bold text-white mb-1">Focus Chamber</p>
                     <p className="text-slate-400 text-xs">Deep work sprints for ultimate productivity. 🚀</p>
                   </div>
                 </div>
                 <div className="flex gap-4 items-start">
                   <div className="text-2xl">🗓️</div>
                   <div>
                     <p className="font-bold text-white mb-1">Countdown</p>
                     <p className="text-slate-400 text-xs">Never miss a deadline. Notifications included. 🔔</p>
                   </div>
                 </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={completeOnboarding}
                  className="w-full py-5 bg-indigo-500 rounded-3xl text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  Enter Neural OS
                </button>
              </div>
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
        onThemeChange={applyTheme}
        activeTheme={theme}
        userName={userName}
        gender={gender}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="px-6 pt-12 pb-5 flex justify-between items-center bg-transparent backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSidebar(true)} className="p-2 -ml-2 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors">
              <Menu size={26}/>
            </button>
            <h1 className="text-xl font-black capitalize tracking-tight">{overlayView ? overlayView.replace('-', ' ') : activeTab}</h1>
          </div>
          <button onClick={() => setShowAI(true)} className="p-2.5 bg-[var(--accent-primary)]/20 rounded-xl text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)]/30 transition-all">
            <Bot size={22}/>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto custom-scroll pb-32">
          {overlayView ? (
            <div className="px-6 py-4 animate-in">
              <button onClick={() => setOverlayView(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-[var(--text-dim)] mb-6 hover:text-[var(--text-main)]">
                <ChevronLeft size={14}/> Return to Dashboard
              </button>
              <OverlayRouter view={overlayView} />
            </div>
          ) : (
            <>
              {activeTab === Tab.TODAY && (
                <TodayView 
                  data={currentDay.goals} 
                  onToggle={id => {
                    const newGoals = currentDay.goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
                    updateDayData(new Date().toISOString().split('T')[0], { goals: newGoals });
                  }}
                  onDelete={id => {
                    const newGoals = currentDay.goals.filter(g => g.id !== id);
                    updateDayData(new Date().toISOString().split('T')[0], { goals: newGoals });
                  }}
                />
              )}
              {activeTab === Tab.UPCOMING && <ProductivityHub userName={userName} karma={karma} localData={localData} />}
              {activeTab === Tab.BROWSE && (
                <PerformanceView 
                  currentDay={currentDay} 
                  categories={categories} 
                  onUpdateDayData={updateDayData} 
                  onUpdateCategories={updateCategories}
                />
              )}
            </>
          )}
        </main>

        <button onClick={() => setShowQuickAdd(true)} className="fixed right-6 bottom-28 w-14 h-14 bg-[var(--accent-primary)] rounded-full shadow-2xl flex items-center justify-center text-white z-40 active:scale-95 transition-all">
          <Plus size={28} />
        </button>

        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--app-bg)]/80 backdrop-blur-2xl border-t border-[var(--border-color)] px-8 pt-4 pb-8 flex justify-between items-center z-50">
          <NavBtn icon={CalendarDays} label="Daily" active={activeTab === Tab.TODAY && !overlayView} onClick={() => {setActiveTab(Tab.TODAY); setOverlayView(null);}} />
          <NavBtn icon={Trophy} label="Productivity" active={activeTab === Tab.UPCOMING && !overlayView} onClick={() => {setActiveTab(Tab.UPCOMING); setOverlayView(null);}} />
          <NavBtn icon={Activity} label="Performance" active={activeTab === Tab.BROWSE && !overlayView} onClick={() => {setActiveTab(Tab.BROWSE); setOverlayView(null);}} />
        </nav>
      </div>

      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} onAdd={val => {
        const date = new Date().toISOString().split('T')[0];
        const day = localData[date] || { goals: [], deviceTime: '0', studyLogs: [] };
        updateDayData(date, { goals: [...day.goals, { id: Date.now().toString(), text: val, priority: 'standard', done: false, date }] });
        setShowQuickAdd(false);
      }} />}
      {showAI && <AIModal onClose={() => setShowAI(false)} context={currentDay} />}
    </div>
  );
};

// --- SIDEBAR ---

const Sidebar: React.FC<{ isOpen: boolean, onClose: () => void, onSelectOverlay: (v: string) => void, onThemeChange: (t: string) => void, activeTheme: string, userName: string, gender: string }> = ({ isOpen, onClose, onSelectOverlay, onThemeChange, activeTheme, userName, gender }) => (
  <>
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <aside className={`fixed top-0 left-0 h-full w-[85%] max-w-xs bg-[var(--card-bg)] z-[70] transform transition-transform duration-300 ease-out border-r border-[var(--border-color)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full p-6">
        <div className="flex flex-col mb-8 p-4 bg-white/5 rounded-3xl border border-white/5">
          <div className="text-3xl mb-2">{gender === 'boy' ? '👦' : '👧'}</div>
          <span className="text-lg font-black text-white leading-none">{userName || 'Sync Pilot'}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)] mt-1">Operational Status: Peak</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 custom-scroll">
          <SideItem icon={Timer} label="Focus Chamber" onClick={() => { onSelectOverlay('pomodoro'); onClose(); }} />
          <SideItem icon={Flame} label="Habit Sync" onClick={() => { onSelectOverlay('habits'); onClose(); }} />
          <SideItem icon={Clock} label="Countdown Protocol" onClick={() => { onSelectOverlay('countdown'); onClose(); }} />
          <SideItem icon={StickyNote} label="Neural Notes" onClick={() => { onSelectOverlay('notes'); onClose(); }} />
          
          <div className="pt-8 pb-4">
            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-dim)] block mb-4">Atmosphere Engine</span>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(THEMES).map(t => (
                <button 
                  key={t} 
                  onClick={() => onThemeChange(t)}
                  className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${activeTheme === t ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  style={{ backgroundColor: THEMES[t].accent }}
                >
                  {t === 'Night' && <Moon size={14} className="text-white"/>}
                  {t === 'Forest' && <Waves size={14} className="text-white"/>}
                  {t === 'Sky' && <Sun size={14} className="text-white"/>}
                  {t === 'Winter' && <Snowflake size={14} className="text-white"/>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  </>
);

const SideItem: React.FC<{ icon: any, label: string, onClick: () => void }> = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-all group text-left">
    <Icon size={20} className="group-hover:scale-110 transition-transform text-[var(--accent-primary)]" />
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </button>
);

const NavBtn: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all outline-none ${active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-dim)] opacity-60'}`}>
    <Icon className={`w-6 h-6 ${active ? 'fill-current scale-110' : ''}`} />
    <span className="text-[9px] font-black uppercase tracking-[0.15em]">{label}</span>
  </button>
);

// --- PRODUCTIVITY HUB ---

const ProductivityHub: React.FC<{ userName: string, karma: number, localData: Record<string, DayData> }> = ({ userName, karma, localData }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = localData[todayStr] || { goals: [] };
  const dailyTotal = todayData.goals.length;
  const dailyDone = todayData.goals.filter(g => g.done).length;
  const dailyPercent = dailyTotal > 0 ? (dailyDone / dailyTotal) * 100 : 0;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const data = localData[dateStr] || { goals: [] };
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      total: data.goals.length,
      done: data.goals.filter(g => g.done).length
    };
  }).reverse();

  const weeklyTotal = last7Days.reduce((acc, curr) => acc + curr.total, 0);
  const weeklyDone = last7Days.reduce((acc, curr) => acc + curr.done, 0);
  const weeklyTarget = 30; 
  const weeklyPercent = weeklyTarget > 0 ? (weeklyDone / weeklyTarget) * 100 : 0;

  const getRank = () => {
    if (karma > 150) return "Master Architect";
    if (karma > 100) return "Senior Strategist";
    return "Protocol Initiate";
  };

  const getWeeklyHealth = () => {
    if (weeklyPercent >= 100) return { label: 'Good', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' };
    if (weeklyPercent >= 70) return { label: 'OK', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10' };
    return { label: 'Not Good', color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10' };
  };

  const health = getWeeklyHealth();

  return (
    <div className="px-6 space-y-6 animate-in pb-10">
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-8 rounded-[40px] border border-white/10">
        <div className="flex items-center gap-6 mb-4">
          <div className="w-16 h-16 bg-[var(--accent-primary)] rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-2xl">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{userName}</h2>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{getRank()}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
            <span className="text-[8px] font-black uppercase text-slate-500 block">Karma Status</span>
            <span className="text-xs font-black text-[var(--accent-primary)]">{karma} Rating</span>
          </div>
          <div className="bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
            <span className="text-[8px] font-black uppercase text-slate-500 block">Efficiency</span>
            <span className="text-xs font-black text-white">{Math.round(dailyPercent)}%</span>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] p-6 rounded-[32px] border border-[var(--border-color)]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-[var(--accent-primary)]" size={20} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Daily Protocol</h3>
          </div>
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
              <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" 
                strokeDasharray={126} strokeDashoffset={126 - (126 * dailyPercent) / 100}
                className="text-[var(--accent-primary)] transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black">{Math.round(dailyPercent)}%</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
            <span className="text-[8px] font-black text-slate-500 uppercase block">Tasks Loaded</span>
            <span className="text-xl font-black text-white">{dailyTotal}</span>
          </div>
          <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
            <span className="text-[8px] font-black text-slate-500 uppercase block">Synchronized</span>
            <span className="text-xl font-black text-emerald-400">{dailyDone}</span>
          </div>
        </div>

        <div>
          <h4 className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2">
            <Waves size={12} /> Efficiency Wave
          </h4>
          <div className="flex items-end justify-between h-16 gap-1">
            {last7Days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-white/5 rounded-t-lg relative group overflow-hidden" style={{ height: '100%' }}>
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-[var(--accent-primary)] transition-all duration-500" 
                    style={{ height: d.total > 0 ? `${(d.done / 10) * 100}%` : '0%' }} 
                  />
                </div>
                <span className="text-[7px] font-black uppercase text-slate-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-[32px] border transition-all ${health.bg} ${health.border}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Award className={health.color} size={20} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Weekly Strategic</h3>
          </div>
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
              <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" 
                strokeDasharray={126} strokeDashoffset={126 - (126 * Math.min(weeklyPercent, 100)) / 100}
                className={`${health.color} transition-all duration-1000`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black">{Math.round(weeklyPercent)}%</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[8px] font-black text-slate-500 uppercase block">Sync Magnitude</span>
              <span className="text-2xl font-black text-white">{weeklyDone} <span className="text-xs text-slate-500 font-bold">/ {weeklyTarget}</span></span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black text-slate-500 uppercase block">Health Level</span>
              <span className={`text-xs font-black uppercase ${health.color}`}>{health.label}</span>
            </div>
          </div>

          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 shadow-lg ${health.color.replace('text', 'bg')}`} 
              style={{ width: `${Math.min(weeklyPercent, 100)}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PERFORMANCE VIEWS ---

const PerformanceView: React.FC<{ 
  currentDay: DayData, 
  categories: any[], 
  onUpdateDayData: (date: string, updates: Partial<DayData>) => void,
  onUpdateCategories: (cats: any[]) => void
}> = ({ currentDay, categories, onUpdateDayData, onUpdateCategories }) => {
  const [h, setH] = useState(0);
  const [m, setM] = useState(0);

  useEffect(() => {
    const totalMins = parseInt(currentDay.deviceTime || '0');
    setH(Math.floor(totalMins / 60));
    setM(totalMins % 60);
  }, [currentDay.deviceTime]);

  const handleDeviceTimeChange = (newH: number, newM: number) => {
    const total = (newH * 60) + newM;
    onUpdateDayData(new Date().toISOString().split('T')[0], { deviceTime: total.toString() });
  };

  const getDeviceStatus = () => {
    const total = (h * 60) + m;
    if (total < 240) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (total <= 420) return { label: 'OK', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { label: 'Not Good', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  };

  const status = getDeviceStatus();

  const addLog = (catId: string, topic: string, hr: string, min: string) => {
    const total = (parseInt(hr || '0') * 60) + parseInt(min || '0');
    const newLog = { id: Date.now().toString(), category: catId, topic, time: total.toString() };
    onUpdateDayData(new Date().toISOString().split('T')[0], { studyLogs: [...currentDay.studyLogs, newLog] });
  };

  const deleteLog = (id: string) => {
    onUpdateDayData(new Date().toISOString().split('T')[0], { studyLogs: currentDay.studyLogs.filter(l => l.id !== id) });
  };

  return (
    <div className="px-6 space-y-6 animate-in">
      <div className={`p-8 rounded-[40px] border transition-all ${status.bg} ${status.border}`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Cognitive Load: Device Time</h2>
            <p className="text-2xl font-black text-white">STATUS: <span className={status.color}>{status.label}</span></p>
          </div>
          <Smartphone className={status.color} />
        </div>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-black/40 p-4 rounded-3xl border border-white/5">
            <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Hours</span>
            <input type="number" value={h} onChange={e => handleDeviceTimeChange(parseInt(e.target.value) || 0, m)} className="w-full bg-transparent text-2xl font-black text-white outline-none" />
          </div>
          <div className="flex-1 bg-black/40 p-4 rounded-3xl border border-white/5">
            <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Minutes</span>
            <input type="number" value={m} onChange={e => handleDeviceTimeChange(h, parseInt(e.target.value) || 0)} className="w-full bg-transparent text-2xl font-black text-white outline-none" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {categories.map(cat => (
          <PerformanceSegment 
            key={cat.id} 
            cat={cat} 
            logs={currentDay.studyLogs.filter(l => l.category === cat.id)} 
            onAdd={addLog}
            onDelete={deleteLog}
            onRemoveCat={() => onUpdateCategories(categories.filter(c => c.id !== cat.id))}
          />
        ))}
      </div>
    </div>
  );
};

const PerformanceSegment: React.FC<{ 
  cat: any, 
  logs: StudyLog[], 
  onAdd: (cid: string, t: string, h: string, m: string) => void,
  onDelete: (id: string) => void,
  onRemoveCat: () => void
}> = ({ cat, logs, onAdd, onDelete, onRemoveCat }) => {
  const [topic, setTopic] = useState("");
  const [h, setH] = useState("");
  const [m, setM] = useState("");

  const totalMins = logs.reduce((acc, curr) => acc + parseInt(curr.time), 0);
  const totalH = Math.floor(totalMins / 60);
  const totalM = totalMins % 60;

  const getLogStatus = () => {
    const total = (totalH * 60) + totalM;
    if (total > 180) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' };
    if (total >= 60) return { label: 'OK', color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/10' };
    return { label: 'Not Good', color: 'text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/10' };
  };

  const status = getLogStatus();

  return (
    <div className={`p-6 rounded-[32px] border transition-all bg-[var(--card-bg)] ${status.border} relative group`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-xl`}>
            {ICON_MAP[cat.icon] || <Cpu size={20}/>}
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase text-white tracking-widest">{cat.name}</h3>
            <p className={`text-[11px] font-black tracking-tight ${status.color}`}>{totalH}h {totalM}m • {status.label}</p>
          </div>
        </div>
        <button onClick={onRemoveCat} className="p-2 text-rose-500/10 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
      </div>
      <div className="flex gap-2 mb-6">
        <input placeholder="Topic..." value={topic} onChange={e => setTopic(e.target.value)} className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-[10px] text-white outline-none" />
        <button onClick={() => { if(topic) { onAdd(cat.id, topic, h, m); setTopic(""); setH(""); setM(""); } }} className={`p-3 rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-md active:scale-90 transition-all`}><Plus size={18} /></button>
      </div>
    </div>
  );
};

// --- OVERLAY VIEWS ---

const OverlayRouter: React.FC<{ view: string }> = ({ view }) => {
  switch (view) {
    case 'pomodoro': return <PomodoroModule />;
    case 'habits': return <HabitTracker />;
    case 'notes': return <NoteSystem />;
    case 'countdown': return <CountdownProtocol />;
    default: return null;
  }
};

const PomodoroModule = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft(t => Math.max(0, t - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const fmt = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="bg-[var(--card-bg)] p-6 rounded-[32px] border border-white/5 shadow-2xl">
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Info size={18} className="text-[var(--accent-primary)]" /> 
          Focus Chamber: Protocol 🧠
        </h2>
        <div className="space-y-4 text-[11px] font-medium leading-relaxed">
          <section>
            <p className="text-white font-bold mb-1">What is this?</p>
            <p className="text-[var(--text-dim)]">A specialized work environment for extreme focus. No distractions, just neural synchronization with your goals.</p>
          </section>
          <section>
            <p className="text-white font-bold mb-1">How it works?</p>
            <p className="text-[var(--text-dim)]">25 minutes of pure work followed by a 5-minute break prevents brain fatigue and keeps you in the flow.</p>
          </section>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] p-10 rounded-[40px] border border-[var(--border-color)] text-center space-y-10 shadow-xl">
        <div className="text-8xl font-black tracking-tighter text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {fmt(timeLeft)}
        </div>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => setIsActive(!isActive)} 
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 ${isActive ? 'bg-rose-500 shadow-xl shadow-rose-500/20' : 'bg-[var(--accent-primary)] shadow-xl shadow-indigo-500/20'}`}
          >
            {isActive ? <X size={32} className="text-white"/> : <Zap size={32} className="text-white"/>}
          </button>
          <button 
            onClick={() => {setIsActive(false); setTimeLeft(25*60);}} 
            className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all active:scale-90"
          >
            <Clock size={32}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const HabitTracker = () => {
  const [habits, setHabits] = useState<{name: string, streaks: boolean[]}[]>([
    { name: 'Meditation', streaks: [true, true, true, true, false, false, false] },
    { name: 'Exercise', streaks: [true, true, false, false, false, false, false] },
  ]);

  return (
    <div className="space-y-6 animate-in">
      <div className="bg-[var(--card-bg)] p-6 rounded-[32px] border border-white/5 shadow-2xl">
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Info size={18} className="text-[var(--accent-primary)]" /> 
          Habit Sync Protocol 🗓️
        </h2>
        <div className="space-y-4 text-[11px] font-medium leading-relaxed">
          <section>
            <p className="text-white font-bold mb-1">What is this?</p>
            <p className="text-[var(--text-dim)]">A system to automate your excellence. Track repeat behaviors until they become second nature.</p>
          </section>
          <section>
            <p className="text-white font-bold mb-1">How it works?</p>
            <p className="text-[var(--text-dim)]">Consistency is key. Small daily boxes checked build a massive mental shield against failure.</p>
          </section>
        </div>
      </div>

      <div className="space-y-4">
        {habits.map((h, i) => (
          <div key={i} className="bg-[var(--card-bg)] p-5 rounded-3xl border border-[var(--border-color)] flex items-center justify-between">
            <span className="font-bold text-white text-sm">{h.name}</span>
            <div className="flex gap-1.5">
              {h.streaks.map((s, idx) => (
                <div key={idx} className={`w-6 h-6 rounded-lg border transition-all ${s ? 'bg-emerald-500 border-emerald-500' : 'border-white/5 bg-black/20'}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CountdownProtocol = () => {
  const [events, setEvents] = useState<{id: string, name: string, date: string}[]>(() => {
    const saved = localStorage.getItem('lsp_temporal_markers');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const addEventAtDate = (date: string) => {
    const name = window.prompt(`Plan neural event for ${date}:`);
    if (name) {
      const updated = [...events, { id: Date.now().toString(), name, date }];
      setEvents(updated);
      localStorage.setItem('lsp_temporal_markers', JSON.stringify(updated));
      alert(`🔔 PROTOCOL LOCKED: ${name} is set for ${date}. Notification primed.`);
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const monthName = currentMonth.toLocaleString('default', { month: 'long' });

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-16 border border-[var(--border-color)] opacity-5 bg-black/20" />);
    }

    for (let d = 1; d <= days; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasEvent = events.some(e => e.date === dateStr);
      cells.push(
        <div 
          key={dateStr}
          onClick={() => addEventAtDate(dateStr)}
          className={`h-16 border border-[var(--border-color)] p-1 flex flex-col gap-1 cursor-pointer transition-all hover:bg-white/5 ${hasEvent ? 'bg-indigo-500/10' : ''}`}
        >
          <span className="text-[10px] font-black text-slate-500">{d}</span>
          {hasEvent && <div className="w-2 h-2 bg-indigo-500 rounded-full mx-auto animate-pulse" />}
        </div>
      );
    }

    return (
      <div className="bg-[var(--card-bg)] rounded-[32px] border border-[var(--border-color)] overflow-hidden shadow-2xl">
        <div className="p-5 flex justify-between items-center border-b border-[var(--border-color)]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">{monthName} {year}</h3>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ChevronLeft size={18}/></button>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ChevronRight size={18}/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center py-2 bg-black/10 border-b border-[var(--border-color)]">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <span key={d} className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="bg-[var(--card-bg)] p-6 rounded-[32px] border border-white/5 shadow-2xl">
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Info size={18} className="text-[var(--accent-primary)]" /> 
          Temporal Matrix: Countdown 🔔
        </h2>
        <div className="space-y-4 text-[11px] font-medium leading-relaxed">
          <section>
            <p className="text-white font-bold mb-1">What is this?</p>
            <p className="text-[var(--text-dim)]">Spatial time management. Your future events mapped on a neural grid.</p>
          </section>
          <section>
            <p className="text-white font-bold mb-1">How it works?</p>
            <p className="text-[var(--text-dim)]">Select a date, lock in the mission. The OS will alert you when temporal alignment is achieved.</p>
          </section>
        </div>
      </div>
      {renderCalendar()}
    </div>
  );
};

const NoteSystem = () => {
  const [notes, setNotes] = useState<{id: string, content: string}[]>(() => {
    const saved = localStorage.getItem('lsp_neural_traces');
    return saved ? JSON.parse(saved) : [];
  });

  const addNote = () => {
    const content = window.prompt("What's on your mind?");
    if (content) {
      const updated = [...notes, { id: Date.now().toString(), content }];
      setNotes(updated);
      localStorage.setItem('lsp_neural_traces', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="bg-[var(--card-bg)] p-6 rounded-[32px] border border-white/5 shadow-2xl">
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Info size={18} className="text-[var(--accent-primary)]" /> 
          Neural Notes: Memory Bridge 🧠
        </h2>
        <div className="space-y-4 text-[11px] font-medium leading-relaxed">
          <section>
            <p className="text-white font-bold mb-1">What is this?</p>
            <p className="text-[var(--text-dim)]">External mental storage. Capture sparks of genius before they fade.</p>
          </section>
        </div>
      </div>

      <button 
        onClick={addNote}
        className="w-full p-8 bg-indigo-500/10 border-2 border-dashed border-indigo-500/30 rounded-[40px] text-indigo-400 font-black uppercase text-xs tracking-widest hover:bg-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
      >
        <Plus /> What's on your mind?
      </button>

      <div className="grid grid-cols-1 gap-4">
        {notes.map(n => (
          <div key={n.id} className="p-6 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] relative group">
             <button onClick={() => {
               const updated = notes.filter(note => note.id !== n.id);
               setNotes(updated);
               localStorage.setItem('lsp_neural_traces', JSON.stringify(updated));
             }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity p-2"><Trash2 size={16}/></button>
             <p className="text-sm text-slate-300 leading-relaxed pr-6">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- TODAY VIEW ---

const TodayView: React.FC<{ data: Goal[], onToggle: (id: string) => void, onDelete: (id: string) => void }> = ({ data, onToggle, onDelete }) => (
  <div className="px-6 space-y-4">
    {data.map(g => (
      <div key={g.id} className="flex items-start gap-4 p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl active:scale-[0.98] transition-transform">
        <button onClick={() => onToggle(g.id)} className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${g.done ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' : 'border-slate-800'}`}>
          {g.done && <Check size={14} className="text-white" strokeWidth={4}/>}
        </button>
        <div className="flex-1"><p className={`text-sm font-bold tracking-tight ${g.done ? 'line-through text-slate-700' : 'text-slate-100'}`}>{g.text}</p></div>
        <button onClick={() => onDelete(g.id)} className="text-rose-500/20 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
      </div>
    ))}
    {data.length === 0 && <div className="py-24 text-center opacity-10 font-black uppercase text-[10px] tracking-[0.5em]">System Zero</div>}
  </div>
);

const QuickAddModal: React.FC<{ onClose: () => void, onAdd: (v: string) => void }> = ({ onClose, onAdd }) => {
  const [val, setVal] = useState('');
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-end p-0" onClick={onClose}>
      <div className="bg-[var(--card-bg)] w-full rounded-t-[40px] p-8 space-y-8 border-t border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center text-[var(--text-dim)]"><span className="text-[10px] font-black uppercase tracking-[0.2em]">Immediate Objective</span><button onClick={onClose}><X size={20}/></button></div>
        <input autoFocus value={val} onChange={e => setVal(e.target.value)} placeholder="Protocol details..." className="w-full bg-transparent text-2xl font-black text-white outline-none" onKeyDown={e => e.key === 'Enter' && val && onAdd(val)} />
        <button onClick={() => val && onAdd(val)} className="w-full py-5 bg-[var(--accent-primary)] rounded-[24px] text-white font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-indigo-500/20">Initialize</button>
      </div>
    </div>
  );
};

const AIModal: React.FC<{ onClose: () => void, context: DayData }> = ({ onClose, context }) => {
  const [p, setP] = useState("");
  const [res, setRes] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = async () => {
    if(!p) return; setLoading(true); setRes("");
    for await (const chunk of askAIArchitectStream(p, context)) { setRes(v => v + chunk); }
    setLoading(false);
  };
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--card-bg)] w-full max-w-md rounded-[48px] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-8 bg-[var(--accent-primary)] flex justify-between items-center text-white"><Bot size={32}/><h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Oracle</h2><button onClick={onClose}><X size={28}/></button></div>
        <div className="p-8 space-y-6">
          <textarea value={p} onChange={e => setP(e.target.value)} className="w-full bg-black/40 rounded-3xl p-6 text-white text-sm outline-none border border-white/5 h-44 placeholder:opacity-30" placeholder="Submit strategic request..." />
          <button onClick={ask} disabled={loading} className="w-full py-5 bg-[var(--accent-primary)] text-white font-black uppercase text-[10px] tracking-widest rounded-3xl transition-transform active:scale-95">{loading ? 'Synthesizing...' : 'Sync with Architect'}</button>
          {res && <div className="p-6 bg-white/5 rounded-3xl text-sm italic text-indigo-100 border border-indigo-500/10 leading-relaxed max-h-40 overflow-y-auto custom-scroll">{res}</div>}
        </div>
      </div>
    </div>
  );
};

export default App;
