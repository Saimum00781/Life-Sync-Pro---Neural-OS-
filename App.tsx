
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Zap, Smartphone, GraduationCap, BookOpen, Briefcase, 
  UserPlus, Moon, Trophy, Heart, Sparkles, Target, BrainCircuit, 
  Lightbulb, Activity, Cpu, Check, Settings2, Clock, Inbox, 
  CalendarDays, LayoutGrid, ChevronRight, User, Palette, Bell, 
  Layers, HelpCircle, Share2, Info, Search, MoreVertical,
  CheckCircle2, Menu, X, Wand2, Bot, LogOut, TrendingUp, Award,
  ChevronLeft, Trash
} from 'lucide-react';
import { AppState, Tab, DayData, Goal, StudyLog, UserProfile } from './types';
import { askAIArchitectStream } from './geminiService';

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Academic', icon: 'GraduationCap', color: 'from-blue-500 to-cyan-500' },
  { id: '2', name: 'Tuition', icon: 'BookOpen', color: 'from-emerald-500 to-teal-500' },
  { id: '3', name: 'Career', icon: 'Briefcase', color: 'from-amber-500 to-orange-500' },
  { id: '4', name: 'Self Growth', icon: 'UserPlus', color: 'from-purple-500 to-pink-500' },
  { id: '5', name: 'Islamic', icon: 'Moon', color: 'from-indigo-500 to-blue-500' },
  { id: '6', name: 'Self Thinking', icon: 'Lightbulb', color: 'from-rose-500 to-orange-500' }
];

const ICON_MAP: Record<string, any> = {
  GraduationCap: <GraduationCap />,
  BookOpen: <BookOpen />,
  Briefcase: <Briefcase />,
  UserPlus: <UserPlus />,
  Moon: <Moon />,
  Lightbulb: <Lightbulb />,
  Target: <Target />,
  Activity: <Activity />,
  Cpu: <Cpu />,
  Heart: <Heart />,
  Zap: <Zap />
};

const COLOR_OPTIONS = [
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-purple-500 to-pink-500',
  'from-indigo-500 to-blue-500',
  'from-rose-500 to-orange-500',
  'from-slate-500 to-slate-800'
];

const formatMins = (totalMins: number) => {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TODAY);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [localData, setLocalData] = useState<Record<string, DayData>>({});
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAI, setShowAI] = useState(false);
  
  const [userName, setUserName] = useState<string>("");
  const [isNewUser, setIsNewUser] = useState(true);

  // Performance Goals
  const [dailyGoalTarget, setDailyGoalTarget] = useState(5);
  const [weeklyGoalTarget, setWeeklyGoalTarget] = useState(30);
  const [karma, setKarma] = useState(100);

  useEffect(() => {
    const saved = localStorage.getItem('lsp_v7_data');
    const savedName = localStorage.getItem('lsp_user_name');
    const savedKarma = localStorage.getItem('lsp_karma');
    const savedCats = localStorage.getItem('lsp_categories');
    
    if (saved) setLocalData(JSON.parse(saved));
    if (savedCats) setCategories(JSON.parse(savedCats));
    if (savedName) {
      setUserName(savedName);
      setIsNewUser(false);
      setAppState(AppState.DASHBOARD);
    }
    if (savedKarma) setKarma(parseInt(savedKarma));
  }, []);

  const save = (data: any) => {
    localStorage.setItem('lsp_v7_data', JSON.stringify(data));
    setLocalData(data);
  };

  const saveCategories = (cats: any) => {
    localStorage.setItem('lsp_categories', JSON.stringify(cats));
    setCategories(cats);
  };

  const saveKarma = (newKarma: number) => {
    const clampedKarma = Math.max(0, newKarma);
    localStorage.setItem('lsp_karma', clampedKarma.toString());
    setKarma(clampedKarma);
  };

  const handleOnboarding = (name: string) => {
    if (!name.trim()) return;
    localStorage.setItem('lsp_user_name', name.trim());
    setUserName(name.trim());
    setIsNewUser(false);
    setAppState(AppState.DASHBOARD);
  };

  const currentDay = useMemo(() => localData[selectedDate] || { 
    goals: [], deviceTime: '0', studyLogs: [] 
  }, [localData, selectedDate]);

  const addTask = (text: string, date: string) => {
    const day = localData[date] || { goals: [], deviceTime: '0', studyLogs: [] };
    const newGoals = [...day.goals, { id: Date.now().toString(), text, priority: 'standard', done: false, date }];
    save({ ...localData, [date]: { ...day, goals: newGoals } });
  };

  const updateDayData = (date: string, updates: Partial<DayData>) => {
    const day = localData[date] || { goals: [], deviceTime: '0', studyLogs: [] };
    save({ ...localData, [date]: { ...day, ...updates } });
  };

  const addCategory = (name: string, icon: string, color: string) => {
    const newCats = [...categories, { id: Date.now().toString(), name, icon, color }];
    saveCategories(newCats);
  };

  const deleteCategory = (id: string) => {
    const newCats = categories.filter(c => c.id !== id);
    saveCategories(newCats);
  };

  if (appState === AppState.WELCOME) {
    return (
      <div className="h-screen bg-[#000000] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center shadow-2xl mb-8 animate-pulse">
          <BrainCircuit className="w-10 h-10 text-white" />
        </div>
        {isNewUser ? (
          <div className="w-full max-w-xs space-y-6 animate-in">
            <h1 className="text-2xl font-black text-white tracking-tight">Establish Link</h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed px-4">Identity recognition required for neural synchronization</p>
            <input 
              autoFocus
              className="w-full bg-[#0a0a0a] border border-white/10 p-4 rounded-2xl text-center text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
              placeholder="NAME"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) handleOnboarding(e.currentTarget.value);
              }}
            />
            <button 
              onClick={(e) => {
                const input = (e.currentTarget.previousSibling as HTMLInputElement).value;
                if (input) handleOnboarding(input);
              }}
              className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-4 hover:text-white transition-colors"
            >
              Sync Identity
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-black text-white mb-2">LIFE SYNC PRO</h1>
            <p className="text-slate-500 mb-12 uppercase tracking-widest text-[10px]">Neural Management System v7.0</p>
            <button 
              onClick={() => setAppState(AppState.DASHBOARD)}
              className="bg-white text-black w-full max-w-xs py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-transform active:scale-95 shadow-xl"
            >
              Initialize Sync
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#000000] text-slate-100 overflow-hidden font-['Inter']">
      <Header 
        activeTab={activeTab} 
        onMenu={() => setShowSidebar(true)} 
        onAI={() => setShowAI(true)}
      />

      <main className="flex-1 overflow-y-auto custom-scroll pb-32">
        {activeTab === Tab.TODAY && (
          <TodayView 
            data={currentDay.goals} 
            onToggle={(id) => {
              const goal = currentDay.goals.find(g => g.id === id);
              const newGoals = currentDay.goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
              updateDayData(selectedDate, { goals: newGoals });
              saveKarma(goal?.done ? karma - 5 : karma + 10);
            }}
            onDelete={(id) => {
              const newGoals = currentDay.goals.filter(g => g.id !== id);
              updateDayData(selectedDate, { goals: newGoals });
              saveKarma(karma - 5);
            }}
          />
        )}
        {activeTab === Tab.INBOX && <InboxView />}
        {activeTab === Tab.UPCOMING && (
          <ProductivityHub 
            userName={userName}
            karma={karma}
            localData={localData} 
            dailyGoal={dailyGoalTarget}
            weeklyGoal={weeklyGoalTarget}
            setDailyGoal={setDailyGoalTarget}
            setWeeklyGoal={setWeeklyGoalTarget}
          />
        )}
        {activeTab === Tab.BROWSE && (
          <PerformanceView 
            currentDay={currentDay} 
            categories={categories}
            totalMins={currentDay.studyLogs.reduce((acc, log) => acc + (parseInt(log.time) || 0), 0)}
            onUpdate={(updates) => updateDayData(selectedDate, updates)}
            onDeleteCategory={deleteCategory}
            onAddCategory={addCategory}
          />
        )}
      </main>

      <Sidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)} 
        userName={userName}
        karma={karma}
        setActiveTab={setActiveTab}
      />

      <button 
        onClick={() => setShowQuickAdd(true)}
        className="fixed right-6 bottom-24 w-12 h-12 bg-rose-500 rounded-2xl shadow-2xl flex items-center justify-center text-white active:scale-90 transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/5 px-4 pt-4 pb-6 flex justify-around items-center z-50">
        <NavBtn icon={Inbox} label="Inbox" active={activeTab === Tab.INBOX} color="text-amber-500" onClick={() => setActiveTab(Tab.INBOX)} />
        <NavBtn icon={CalendarDays} label="Today" active={activeTab === Tab.TODAY} color="text-indigo-500" onClick={() => setActiveTab(Tab.TODAY)} />
        <NavBtn icon={Trophy} label="Productivity" active={activeTab === Tab.UPCOMING} color="text-rose-500" onClick={() => setActiveTab(Tab.UPCOMING)} />
        <NavBtn icon={Activity} label="Performance" active={activeTab === Tab.BROWSE} color="text-emerald-500" onClick={() => setActiveTab(Tab.BROWSE)} />
      </nav>

      {showQuickAdd && (
        <QuickAddModal 
          onClose={() => setShowQuickAdd(false)} 
          onAdd={(val) => {
            addTask(val, selectedDate);
            setShowQuickAdd(false);
          }} 
        />
      )}

      {showAI && <AIModal onClose={() => setShowAI(false)} context={currentDay} />}
    </div>
  );
};

const Header: React.FC<{ activeTab: Tab, onMenu: () => void, onAI: () => void }> = ({ activeTab, onMenu, onAI }) => (
  <header className="px-6 pt-12 pb-5 flex justify-between items-center bg-black/80 backdrop-blur-lg sticky top-0 z-30 border-b border-white/5">
    <div className="flex items-center gap-4">
      <button onClick={onMenu} className="p-2 -ml-2 text-slate-400 hover:text-white"><Menu className="w-6 h-6" /></button>
      <h1 className="text-lg font-black text-white capitalize tracking-tight">
        {activeTab === Tab.BROWSE ? 'Performance' : activeTab === Tab.UPCOMING ? 'Productivity' : activeTab}
      </h1>
    </div>
    <button onClick={onAI} className="p-2.5 bg-indigo-600/20 rounded-xl text-indigo-400 border border-indigo-600/20"><Bot className="w-5 h-5" /></button>
  </header>
);

const NavBtn: React.FC<{ icon: any, label: string, active: boolean, color: string, onClick: () => void }> = ({ icon: Icon, label, active, color, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all outline-none ${active ? color : 'text-slate-600 opacity-60'}`}>
    <Icon className={`w-5 h-5 ${active ? 'fill-current scale-110' : ''}`} />
    <span className="text-[8px] font-black uppercase tracking-[0.15em]">{label}</span>
  </button>
);

const Sidebar: React.FC<{ isOpen: boolean, onClose: () => void, userName: string, karma: number, setActiveTab: (t: Tab) => void }> = ({ isOpen, onClose, userName, karma, setActiveTab }) => (
  <>
    <div className={`fixed inset-0 bg-black/75 backdrop-blur-md z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <aside className={`fixed top-0 left-0 h-full w-[80%] max-w-xs bg-[#0a0a0a] z-[70] transform transition-transform duration-300 ease-out border-r border-white/5 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 space-y-8 h-full flex flex-col">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/20">{userName.charAt(0).toUpperCase()}</div>
            <div>
              <p className="text-sm font-black text-white">{userName}</p>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{karma} Karma Points</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-600 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          <SideItem icon={Inbox} label="Inbox" onClick={() => { setActiveTab(Tab.INBOX); onClose(); }} color="text-amber-500" />
          <SideItem icon={CalendarDays} label="Today" onClick={() => { setActiveTab(Tab.TODAY); onClose(); }} color="text-indigo-500" />
          <SideItem icon={Trophy} label="Productivity" onClick={() => { setActiveTab(Tab.UPCOMING); onClose(); }} color="text-rose-500" />
          <SideItem icon={Activity} label="Performance" onClick={() => { setActiveTab(Tab.BROWSE); onClose(); }} color="text-emerald-500" />
        </div>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex items-center gap-3 p-4 bg-rose-500/10 rounded-xl text-rose-500 font-black uppercase text-[9px] tracking-widest hover:bg-rose-500/20 transition-all">
          <LogOut className="w-4 h-4" /> Reset Identity
        </button>
      </div>
    </aside>
  </>
);

const SideItem: React.FC<{ icon: any, label: string, onClick?: () => void, color: string }> = ({ icon: Icon, label, onClick, color }) => (
  <div onClick={onClick} className="flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer text-slate-400 hover:bg-white/5 hover:text-white">
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="text-xs font-bold">{label}</span>
    </div>
  </div>
);

const ProductivityHub: React.FC<{ 
  userName: string, karma: number, localData: Record<string, DayData>, dailyGoal: number, weeklyGoal: number, setDailyGoal: (n: number) => void, setWeeklyGoal: (n: number) => void 
}> = ({ userName, karma, localData, dailyGoal, weeklyGoal, setDailyGoal, setWeeklyGoal }) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'weekly' | 'karma'>('daily');
  const todayStr = new Date().toISOString().split('T')[0];
  const goalsToday = localData[todayStr]?.goals || [];
  const completedToday = goalsToday.filter(g => g.done).length;

  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      return (localData[ds]?.goals || []).filter(g => g.done).length;
    }).reverse();
  }, [localData]);

  const totalWeeklyCompleted = weeklyData.reduce((a, b) => a + b, 0);

  return (
    <div className="px-6 space-y-6 animate-in">
      <div className="flex items-center gap-4 bg-rose-500/10 p-4 rounded-3xl border border-rose-500/20 shadow-sm">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-rose-500/30">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-sm font-black text-white leading-tight">{userName}</h3>
          <p className="text-[8px] text-rose-400 font-black uppercase tracking-widest mt-1 flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" /> Efficiency Rank: Novice
          </p>
        </div>
      </div>
      <div className="flex bg-[#0a0a0a] p-1 rounded-xl border border-white/5">
        {['daily', 'weekly', 'karma'].map(t => (
          <button key={t} onClick={() => setActiveSubTab(t as any)} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeSubTab === t ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="min-h-[250px]">
        {activeSubTab === 'daily' && (
          <div className="space-y-6 animate-in">
            <div className="flex justify-between items-center bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 shadow-inner">
              <div className="space-y-1">
                <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Today's Alignment</h4>
                <p className="text-2xl font-black text-white">{completedToday}<span className="text-slate-800 mx-1">/</span>{dailyGoal}</p>
                <div className="flex gap-3 pt-1">
                   <button onClick={() => setDailyGoal(Math.max(1, dailyGoal - 1))} className="text-[9px] text-rose-500 font-black opacity-60">DEC</button>
                   <button onClick={() => setDailyGoal(dailyGoal + 1)} className="text-[9px] text-rose-500 font-black opacity-60">INC</button>
                </div>
              </div>
              <div className="relative w-14 h-14">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="24" fill="transparent" stroke="#111" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="transparent" stroke="#f43f5e" strokeWidth="4" strokeDasharray={150.8} strokeDashoffset={150.8 - (150.8 * Math.min(1, completedToday / Math.max(1, dailyGoal)))} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[7px] font-black text-white/40">{Math.round((completedToday/Math.max(1, dailyGoal))*100)}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 px-1">
              <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Efficiency Wave</h4>
              <div className="flex items-end gap-2 h-16 pt-2">
                {weeklyData.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-slate-900/40 rounded-sm relative overflow-hidden h-full">
                      <div className="absolute bottom-0 left-0 right-0 bg-rose-500 opacity-90 transition-all duration-500" style={{ height: `${Math.min(100, (v / Math.max(1, dailyGoal)) * 100)}%` }} />
                    </div>
                    <span className="text-[6px] font-black text-slate-700">{['T','W','T','F','S','S','M'][(new Date().getDay() + i + 1) % 7]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeSubTab === 'weekly' && (
          <div className="space-y-6 animate-in">
            <div className="flex justify-between items-center bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 shadow-inner">
              <div className="space-y-1">
                <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Strategic Cycle</h4>
                <p className="text-2xl font-black text-white">{totalWeeklyCompleted}<span className="text-slate-800 mx-1">/</span>{weeklyGoal}</p>
                <button onClick={() => setWeeklyGoal(weeklyGoal + 5)} className="text-[8px] text-rose-500 font-black uppercase mt-1 flex items-center gap-1"><Plus className="w-2 h-2"/> Scaling Target</button>
              </div>
              <div className="relative w-14 h-14">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="24" fill="transparent" stroke="#111" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="transparent" stroke="#f43f5e" strokeWidth="4" strokeDasharray={150.8} strokeDashoffset={150.8 - (150.8 * Math.min(1, totalWeeklyCompleted / Math.max(1, weeklyGoal)))} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-amber-500/40" />
                </div>
              </div>
            </div>
          </div>
        )}
        {activeSubTab === 'karma' && (
          <div className="space-y-6 animate-in">
            <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 flex justify-between items-center relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Standing</h4>
                <p className="text-3xl font-black text-white tracking-tighter">{karma} <span className="text-rose-500 text-[10px] font-black tracking-widest ml-1">POINTS</span></p>
                <p className="text-[8px] text-rose-500/70 font-black uppercase mt-2 tracking-[0.25em]">Status: Sync Stabilized</p>
              </div>
              <Sparkles className="w-10 h-10 text-rose-500 opacity-10" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TodayView: React.FC<{ data: Goal[], onToggle: (id: string) => void, onDelete: (id: string) => void }> = ({ data, onToggle, onDelete }) => (
  <div className="px-6 space-y-6 animate-in">
    <div className="flex items-center justify-between text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] border-b border-indigo-500/10 pb-3">
      <div className="flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5 text-indigo-500" />{new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
    </div>
    <div className="space-y-2.5">
      {data.map(goal => (
        <div key={goal.id} className="flex items-start gap-3 p-4 bg-indigo-500/5 rounded-2xl group border border-indigo-500/10 shadow-sm transition-all active:scale-[0.98]">
          <button onClick={() => onToggle(goal.id)} className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${goal.done ? 'bg-indigo-600 border-indigo-600' : 'border-slate-800'}`}>{goal.done && <Check className="w-3 h-3 text-white" strokeWidth={4} />}</button>
          <div className="flex-1"><p className={`text-sm font-bold tracking-tight leading-tight ${goal.done ? 'line-through text-slate-700' : 'text-slate-100'}`}>{goal.text}</p></div>
          <button onClick={() => onDelete(goal.id)} className="p-1.5 text-rose-500/30 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      {data.length === 0 && <div className="py-24 text-center flex flex-col items-center gap-4 opacity-10"><CheckCircle2 className="w-8 h-8" /><p className="text-[9px] font-black uppercase tracking-[0.4em]">Zero</p></div>}
    </div>
  </div>
);

const InboxView = () => (
  <div className="px-6 py-24 flex flex-col items-center justify-center text-center">
    <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-6 border border-amber-500/20 shadow-lg shadow-amber-500/5 animate-pulse"><Inbox className="w-8 h-8 text-amber-500" /></div>
    <h2 className="text-lg font-black text-white uppercase tracking-tighter">Queue Depleted</h2>
    <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-widest font-black max-w-[180px] leading-relaxed">System standby.</p>
  </div>
);

const PerformanceView: React.FC<{ 
  currentDay: DayData, categories: any[], totalMins: number, onUpdate: (u: Partial<DayData>) => void, onDeleteCategory: (id: string) => void, onAddCategory: (n: string, i: string, c: string) => void 
}> = ({ currentDay, categories, totalMins, onUpdate, onDeleteCategory, onAddCategory }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const deviceMins = parseInt(currentDay.deviceTime) || 0;
  const dH = Math.floor(deviceMins / 60);
  const dM = deviceMins % 60;

  return (
    <div className="px-6 space-y-8 animate-in">
      <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5"><Activity className="w-24 h-24" /></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Focus Matrix</h2>
            <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest">Deep Sync: {formatMins(totalMins)}</p>
          </div>
          <Cpu className="w-5 h-5 text-emerald-500/40" />
        </div>
        <div className="flex gap-3 relative z-10">
          <div className="flex-1 bg-black/60 p-3 rounded-xl border border-white/5">
            <span className="text-[7px] font-black text-slate-600 uppercase block mb-1">H</span>
            <input type="number" value={dH} onChange={e => onUpdate({ deviceTime: (Math.min(24, parseInt(e.target.value) || 0) * 60 + dM).toString() })} className="w-full bg-transparent border-none text-xl font-black text-white outline-none" />
          </div>
          <div className="flex-1 bg-black/60 p-3 rounded-xl border border-white/5">
            <span className="text-[7px] font-black text-slate-600 uppercase block mb-1">M</span>
            <input type="number" value={dM} onChange={e => onUpdate({ deviceTime: (dH * 60 + Math.min(59, parseInt(e.target.value) || 0)).toString() })} className="w-full bg-transparent border-none text-xl font-black text-white outline-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-md`}>{ICON_MAP[cat.icon] || <Activity />}</div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{cat.name}</h4>
              </div>
              <button onClick={() => onDeleteCategory(cat.id)} className="p-2 text-rose-500/20 hover:text-rose-500 transition-colors"><Trash className="w-3.5 h-3.5" /></button>
            </div>
            <SegmentMiniForm onAdd={(t, m) => onUpdate({ studyLogs: [...currentDay.studyLogs, { id: Date.now().toString(), category: cat.name, topic: t, time: m.toString() }] })} color={cat.color} />
            <div className="space-y-2 max-h-32 overflow-y-auto custom-scroll pr-1">
              {currentDay.studyLogs.filter(l => l.category === cat.name).map(log => (
                <div key={log.id} className="flex justify-between items-center p-2.5 bg-white/5 rounded-xl border border-white/5 text-[9px]">
                  <span className="font-bold text-slate-300 truncate max-w-[130px]">{log.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-600 uppercase tracking-tighter">{formatMins(parseInt(log.time))}</span>
                    <button onClick={() => onUpdate({ studyLogs: currentDay.studyLogs.filter(l => l.id !== log.id) })} className="text-rose-500/30 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {showAddForm ? (
          <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/10 space-y-4 animate-in">
            <h4 className="text-[9px] font-black text-white uppercase tracking-widest">Create Neural Segment</h4>
            <AddCategoryForm onAdd={(n, i, c) => { onAddCategory(n, i, c); setShowAddForm(false); }} onCancel={() => setShowAddForm(false)} />
          </div>
        ) : (
          <button onClick={() => setShowAddForm(true)} className="p-8 rounded-3xl border-2 border-dashed border-white/5 text-slate-600 flex items-center justify-center gap-3 hover:border-emerald-500/30 hover:text-emerald-500 transition-all">
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Initialize Segment</span>
          </button>
        )}
      </div>
    </div>
  );
};

const AddCategoryForm: React.FC<{ onAdd: (n: string, i: string, c: string) => void, onCancel: () => void }> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Activity');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  return (
    <div className="space-y-5">
      <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Category Name" className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none" />
      <div className="space-y-2">
        <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Select Node Icon</span>
        <div className="flex flex-wrap gap-2">
          {Object.keys(ICON_MAP).map(i => (
            <button key={i} onClick={() => setIcon(i)} className={`p-2 rounded-lg border ${icon === i ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-white/5 text-slate-600'} transition-all`}>
              {React.cloneElement(ICON_MAP[i], { size: 16 })}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Aura Color</span>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map(c => (
            <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} border-2 ${color === c ? 'border-white' : 'border-transparent'}`} />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest">Abort</button>
        <button onClick={() => name && onAdd(name, icon, color)} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest">Initialize</button>
      </div>
    </div>
  );
};

const SegmentMiniForm: React.FC<{ onAdd: (t: string, m: number) => void, color: string }> = ({ onAdd, color }) => {
  const [topic, setTopic] = useState('');
  const [mins, setMins] = useState('');
  return (
    <div className="flex gap-2">
      <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Task..." className="flex-1 bg-black border border-white/5 rounded-lg px-3 py-2 text-[9px] font-bold text-white outline-none" />
      <input type="number" value={mins} onChange={e => setMins(e.target.value)} placeholder="Min" className="w-12 bg-black border border-white/5 rounded-lg px-2 py-2 text-[9px] font-bold text-white text-center outline-none" />
      <button onClick={() => { if(topic && mins) { onAdd(topic, parseInt(mins)); setTopic(''); setMins(''); } }} className={`px-3 rounded-lg bg-gradient-to-br ${color} text-white font-black uppercase text-[8px] active:scale-95 transition-transform`}>ADD</button>
    </div>
  );
};

const QuickAddModal: React.FC<{ onClose: () => void, onAdd: (v: string) => void }> = ({ onClose, onAdd }) => {
  const [val, setVal] = useState('');
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-end justify-center p-0" onClick={onClose}>
      <div className="bg-[#0a0a0a] w-full rounded-t-[32px] p-6 pb-12 space-y-6 border-t border-white/10 animate-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center"><span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Immediate Objective</span><button onClick={onClose} className="p-2 text-slate-700"><X className="w-5 h-5"/></button></div>
        <input autoFocus value={val} onChange={e => setVal(e.target.value)} placeholder="Define protocol..." className="w-full bg-transparent border-none text-xl font-black text-white outline-none" onKeyDown={e => e.key === 'Enter' && val && onAdd(val)} />
        <div className="flex justify-end"><button onClick={() => val && onAdd(val)} className="bg-rose-500 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-500/20" disabled={!val}>Deploy</button></div>
      </div>
    </div>
  );
};

const AIModal: React.FC<{ onClose: () => void, context: DayData }> = ({ onClose, context }) => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const handleAsk = async () => {
    if (!prompt) return;
    setLoading(true); setResponse("");
    const stream = askAIArchitectStream(prompt, context);
    for await (const chunk of stream) { setResponse(prev => prev + chunk); }
    setLoading(false);
  };
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#050505] w-full max-w-md rounded-[40px] border border-white/10 overflow-hidden flex flex-col shadow-2xl animate-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 bg-indigo-600 flex justify-between items-center">
          <div className="flex items-center gap-3"><Bot className="w-8 h-8 text-white"/><h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Oracle</h2></div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto custom-scroll max-h-[70vh]">
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Consult architect..." className="w-full bg-black border border-white/5 rounded-2xl p-4 text-sm font-bold text-white h-40 outline-none focus:border-indigo-500" />
          <button onClick={handleAsk} disabled={loading} className="w-full py-4 bg-indigo-600 rounded-2xl font-black uppercase text-[10px] text-white disabled:opacity-50">{loading ? "BRIDGING..." : "SUBMIT"}</button>
          {response && <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl"><p className="text-sm italic text-indigo-100 whitespace-pre-wrap leading-relaxed">{response}</p></div>}
        </div>
      </div>
    </div>
  );
};

export default App;
