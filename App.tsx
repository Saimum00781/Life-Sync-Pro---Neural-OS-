
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bot, X, Wand2, Calendar as CalendarIcon, Plus, Trash2, CheckCircle2, Zap,
  Smartphone, GraduationCap, BookOpen, Briefcase, UserPlus, Moon, Trophy, Heart,
  Sparkles, Target, BrainCircuit, Rocket, BatteryCharging, Timer, Coffee, ZapOff, Lightbulb,
  ArrowRight, Activity, TrendingUp, Star, ShieldAlert, Cpu, Check, Download, Share2
} from 'lucide-react';
import { AppState, Tab, DayData, Goal, StudyLog } from './types';
import { Navigation } from './components/Navigation';
import { askAIArchitectStream } from './geminiService';

interface Category {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const CATEGORIES: Category[] = [
  { name: 'Academic', icon: <GraduationCap />, color: 'from-blue-500 to-cyan-500' },
  { name: 'Tuition', icon: <BookOpen />, color: 'from-emerald-500 to-teal-500' },
  { name: 'Career', icon: <Briefcase />, color: 'from-amber-500 to-orange-500' },
  { name: 'Self Growth', icon: <UserPlus />, color: 'from-purple-500 to-pink-500' },
  { name: 'Islamic', icon: <Moon />, color: 'from-indigo-500 to-blue-500' },
  { name: 'Self Thinking', icon: <Lightbulb />, color: 'from-rose-500 to-orange-500' }
];

// Helper to calculate completion percentage for a list of goals
const calculateProgress = (items: Goal[]) => {
  if (items.length === 0) return 0;
  const completed = items.filter(item => item.done).length;
  return Math.round((completed / items.length) * 100);
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CALENDAR);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAI, setShowAI] = useState(false);
  const [localData, setLocalData] = useState<Record<string, DayData>>({});
  const [proactiveAdvice, setProactiveAdvice] = useState<string>("Synchronizing Neural OS...");
  const [syncLevel, setSyncLevel] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('life-sync-pro-v4');
    if (saved) {
      setLocalData(JSON.parse(saved));
      setAppState(AppState.DASHBOARD);
    }
  }, []);

  const updateDayData = (date: string, updates: Partial<DayData>) => {
    const current = localData[date] || { goals: [], weekly: [], steps: 0, calories: 0, deviceTime: '', studyLogs: [] };
    const newData = {
      ...localData,
      [date]: { ...current, ...updates }
    };
    setLocalData(newData);
    localStorage.setItem('life-sync-pro-v4', JSON.stringify(newData));
  };

  const currentDay = useMemo(() => localData[selectedDate] || { 
    goals: [], weekly: [], steps: 0, calories: 0, deviceTime: '', studyLogs: [] 
  }, [localData, selectedDate]);

  useEffect(() => {
    const missionPoints = currentDay.goals.filter(g => g.done).length * 20;
    const weeklyPoints = currentDay.weekly.filter(g => g.done).length * 50;
    setSyncLevel(Math.min(100, missionPoints + weeklyPoints));
  }, [currentDay]);

  useEffect(() => {
    if (appState === AppState.DASHBOARD) {
      const triggerShadowAnalysis = async () => {
        const shadowPrompt = `Quick Analysis: User has ${currentDay.goals.length} missions and ${currentDay.studyLogs.length} neural logs. Give 1 sentence of elite coaching.`;
        const stream = askAIArchitectStream(shadowPrompt, currentDay);
        let full = "";
        for await (const chunk of stream) { full += chunk; }
        setProactiveAdvice(full || "Neural link stable. Maintain trajectory.");
      };
      const timer = setTimeout(triggerShadowAnalysis, 1500);
      return () => clearTimeout(timer);
    }
  }, [appState, selectedDate, currentDay.studyLogs.length]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(localData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neural-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (appState === AppState.WELCOME) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1e1b4b_0%,_#020617_100%)] opacity-70" />
        <div className="relative z-10 space-y-12 max-w-lg animate-in">
          <div className="relative inline-block">
            <div className="absolute -inset-12 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse" />
            <div className="w-44 h-44 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-900 rounded-[56px] flex items-center justify-center shadow-2xl relative border border-white/10">
              <BrainCircuit className="w-24 h-24 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-8xl font-black tracking-tighter text-white">SYNC <span className="text-indigo-500">PRO</span></h1>
            <p className="text-slate-400 font-medium text-xl leading-relaxed max-w-md mx-auto">
              Market Release v4.0. The proactive operating system for high-performing humans.
            </p>
          </div>
          <button 
            onClick={() => setAppState(AppState.ONBOARDING)}
            className="group relative flex items-center gap-6 bg-white text-slate-950 px-16 py-8 rounded-[40px] font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-2xl active:scale-95 overflow-hidden"
          >
            <span className="relative z-10">Launch Protocol</span>
            <div className="absolute inset-0 bg-indigo-100 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <ArrowRight className="w-6 h-6 relative z-10" />
          </button>
        </div>
      </div>
    );
  }

  if (appState === AppState.ONBOARDING) {
    return <Onboarding onComplete={() => setAppState(AppState.DASHBOARD)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-100 overflow-hidden font-['Inter']">
      <div className="h-1.5 w-full bg-slate-900/50 relative z-[70]">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 transition-all duration-1000 shadow-[0_0_20px_rgba(99,102,241,0.8)]"
          style={{ width: `${syncLevel}%` }}
        />
      </div>

      <header className="p-6 bg-slate-950/80 border-b border-white/5 flex justify-between items-center backdrop-blur-3xl sticky top-0 z-[60]">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-2 bg-indigo-500 opacity-20 blur-lg rounded-full animate-pulse" />
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/10">
              <Cpu className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Neural Status</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">{syncLevel}% SYNCED</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={exportData} title="Backup Data" className="p-3 text-slate-500 hover:text-white transition-all"><Download className="w-5 h-5"/></button>
          <button onClick={() => setShowAI(true)} className="flex items-center gap-3 bg-indigo-600 px-6 py-3 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 group">
            <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest hidden md:block text-white">Ask Architect</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,_#0f172a_0%,_#020617_100%)] pb-40 custom-scroll">
        <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
          
          <div className="relative group animate-in slide-in-from-top-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-[48px] opacity-10 blur-xl" />
            <div className="relative bg-slate-900/60 border border-white/10 rounded-[48px] p-12 flex flex-col md:flex-row items-center gap-10 backdrop-blur-2xl">
              <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20">
                <Sparkles className="text-indigo-400 w-10 h-10 animate-pulse" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-3">Live Neural Shadow Analysis</h2>
                <p className="text-2xl font-bold text-slate-100 tracking-tight leading-snug italic">"{proactiveAdvice}"</p>
              </div>
            </div>
          </div>

          {activeTab === Tab.CALENDAR && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 space-y-10 animate-in slide-in-from-left-4">
                <div className="bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-md">
                   <div className="flex items-center gap-3 mb-8">
                     <CalendarIcon className="w-6 h-6 text-indigo-400" />
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Timeline</h3>
                   </div>
                   <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-3xl p-6 text-center font-black text-xl text-white outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all" />
                </div>
                
                <div className="bg-slate-900/40 p-10 rounded-[48px] border border-white/5 space-y-8">
                  <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Diagnostic Hub</h3>
                  </div>
                  <div className="space-y-6">
                    <DiagnosticItem label="Missions" value={currentDay.goals.length} sub="ACTIVE" color="text-indigo-400" />
                    <DiagnosticItem label="Neural Assets" value={currentDay.studyLogs.length} sub="LOGGED" color="text-purple-400" />
                    <div className="flex justify-between items-center p-6 bg-slate-950/50 rounded-[32px] border border-white/5 hover:border-white/20 transition-all">
                      <span className="text-[10px] font-black uppercase text-slate-500">Security</span>
                      <span className="text-xs font-black text-emerald-500 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> SECURED
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 animate-in slide-in-from-right-4">
                <div className="bg-slate-900/20 border border-white/5 rounded-[56px] p-12 space-y-16 backdrop-blur-xl">
                  <MissionControl 
                    title="Daily High-Leverage Missions" 
                    progress={calculateProgress(currentDay.goals)} 
                    items={currentDay.goals} 
                    onUpdate={it => updateDayData(selectedDate, { goals: it })} 
                    accent="indigo" 
                    icon={<Zap className="w-7 h-7" />} 
                  />
                  <div className="h-px bg-white/5 mx-6" />
                  <MissionControl 
                    title="Quarterly Strategic Goals" 
                    progress={calculateProgress(currentDay.weekly)} 
                    items={currentDay.weekly} 
                    onUpdate={it => updateDayData(selectedDate, { weekly: it })} 
                    accent="purple" 
                    icon={<Trophy className="w-7 h-7" />} 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === Tab.PLANNING && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in">
                <StrategicHierarchy title="Core Intentions" icon={<Target className="text-indigo-400" />} color="indigo" placeholder="What governs your success?" />
                <StrategicHierarchy title="Peak Values" icon={<Heart className="text-rose-400" />} color="rose" placeholder="Your non-negotiables?" />
             </div>
          )}

          {activeTab === Tab.DIGITAL && (
            <div className="space-y-12 animate-in slide-in-from-bottom-6">
               <div className="flex flex-col xl:flex-row gap-10">
                 <div className="flex-1 bg-slate-900/30 p-12 rounded-[56px] border border-white/5 flex flex-col md:flex-row justify-between items-end gap-8 backdrop-blur-xl">
                   <div>
                     <h2 className="text-5xl font-black text-white tracking-tighter uppercase">Digital Hub</h2>
                     <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[11px] mt-4">Cognitive Resource Allocation</p>
                   </div>
                   <div className="bg-cyan-500/5 border border-cyan-500/10 p-10 rounded-[40px] flex items-center gap-10 shadow-3xl">
                      <Smartphone className="w-12 h-12 text-cyan-400 opacity-30" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Interface Time</span>
                        <input value={currentDay.deviceTime} onChange={e => updateDayData(selectedDate, { deviceTime: e.target.value })} placeholder="0h 0m" className="bg-transparent border-none text-cyan-400 font-black text-4xl outline-none w-40 placeholder:text-cyan-950" />
                      </div>
                   </div>
                 </div>

                 <div className="xl:w-[500px] bg-indigo-500/5 border border-indigo-500/10 p-12 rounded-[56px] backdrop-blur-xl relative overflow-hidden group shadow-2xl">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400 mb-8 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5" /> Neural Load
                    </h3>
                    <div className="space-y-8">
                      <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
                        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.6)]" style={{ width: `${Math.min(100, (currentDay.studyLogs.length * 15))}%` }} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 text-center"><Timer className="w-6 h-6 text-indigo-400 mx-auto mb-2"/><span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Deep Work</span></div>
                         <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 text-center"><Coffee className="w-6 h-6 text-emerald-400 mx-auto mb-2"/><span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Recovery</span></div>
                      </div>
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {CATEGORIES.map(cat => (
                  <CategoryCard key={cat.name} cat={cat} logs={currentDay.studyLogs.filter(l => l.category === cat.name)} onAdd={(t, tm, type) => updateDayData(selectedDate, { studyLogs: [...currentDay.studyLogs, { id: Date.now().toString(), category: cat.name, topic: t, time: `${tm} [${type.toUpperCase()}]` }] })} onDelete={id => updateDayData(selectedDate, { studyLogs: currentDay.studyLogs.filter(l => l.id !== id) })} />
                ))}
              </div>
            </div>
          )}

          {activeTab === Tab.ANALYTICS && (
            <div className="bg-slate-900/40 border border-white/5 rounded-[56px] p-16 space-y-16 animate-in zoom-in-95 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black uppercase text-white tracking-widest">Neural Assets</h2>
                  <p className="text-[11px] text-slate-500 font-black uppercase mt-2 tracking-widest">Historical Performance Logs</p>
                </div>
                <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 shadow-2xl"><TrendingUp className="text-emerald-500 w-10 h-10" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <StatCard label="Interface Nodes" value={CATEGORIES.length} unit="Types" color="text-indigo-400" />
                <StatCard label="Efficacy" value={`${calculateProgress(currentDay.goals)}%`} unit="Sync" color="text-indigo-400" />
                <StatCard label="Assets" value={currentDay.studyLogs.length} unit="Logs" color="text-purple-400" />
              </div>
              <div className="grid gap-6">
                {currentDay.studyLogs.map(l => (
                  <div key={l.id} className="bg-slate-950/50 p-8 rounded-[40px] border border-white/5 flex justify-between items-center hover:bg-slate-900/60 transition-all group">
                    <div className="flex items-center gap-8">
                      <div className={`w-5 h-5 rounded-full ${l.time.includes('[GAIN]') ? 'bg-emerald-500/40 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500/40 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'} border-2`} />
                      <div>
                        <p className="font-black text-xl text-white tracking-tight">{l.topic}</p>
                        <p className="text-[10px] uppercase text-slate-600 font-black tracking-[0.2em] mt-1">{l.category}</p>
                      </div>
                    </div>
                    <span className={`font-black ${l.time.includes('[GAIN]') ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'} px-6 py-3 rounded-2xl text-xs tracking-widest`}>{l.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {showAI && <AIModal onClose={() => setShowAI(false)} context={currentDay} />}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const DiagnosticItem: React.FC<{ label: string, value: string | number, sub: string, color: string }> = ({ label, value, sub, color }) => (
  <div className="flex justify-between items-center p-6 bg-slate-950/50 rounded-[32px] border border-white/5 group hover:border-white/20 transition-all shadow-inner">
    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
    <span className={`text-lg font-black ${color} flex items-center gap-2`}>{value} <span className="text-[9px] text-slate-700 tracking-widest font-bold">{sub}</span></span>
  </div>
);

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Introspection Core", icon: <Lightbulb className="w-16 h-16 text-rose-400" />, desc: "Convert internal dialogue into actionable performance data. Log your mental state to unlock peak flow cycles." },
    { title: "Energy Triage", icon: <BrainCircuit className="w-16 h-16 text-indigo-400" />, desc: "Balance your neural load. Classify activities into Energy Gain or Drain to prevent high-achiever burnout." },
    { title: "Proactive Shadow", icon: <Bot className="w-16 h-16 text-emerald-400" />, desc: "The AI Architect constantly scans your mission efficacy to suggest high-leverage strategic pivots in real-time." }
  ];

  return (
    <div className="h-screen bg-[#020617] flex items-center justify-center p-6 overflow-hidden">
      <div className="max-w-3xl w-full bg-slate-900/80 border border-white/10 rounded-[64px] p-20 space-y-16 animate-in shadow-[0_0_120px_rgba(79,70,229,0.2)] backdrop-blur-3xl">
        <div className="flex flex-col items-center text-center space-y-10">
          <div className="relative p-10 bg-slate-950 rounded-[48px] border border-white/10 shadow-2xl">{steps[step].icon}</div>
          <div className="space-y-6">
            <h2 className="text-5xl font-black uppercase text-white tracking-tighter">{steps[step].title}</h2>
            <p className="text-slate-400 text-xl font-medium leading-relaxed px-12">{steps[step].desc}</p>
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          {steps.map((_, i) => <div key={i} className={`h-2.5 rounded-full transition-all duration-700 ${i === step ? 'w-16 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'w-4 bg-slate-800'}`} />)}
        </div>
        <button onClick={() => step === steps.length - 1 ? onComplete() : setStep(s => s + 1)} className="w-full bg-white text-slate-950 py-8 rounded-[32px] font-black uppercase tracking-[0.3em] text-sm hover:bg-indigo-50 transition-all active:scale-95 shadow-2xl">
          {step === steps.length - 1 ? "Begin Mission" : "Engage Protocol"}
        </button>
      </div>
    </div>
  );
};

const MissionControl: React.FC<{ title: string, items: Goal[], onUpdate: (items: Goal[]) => void, accent: 'indigo' | 'purple', icon: React.ReactNode, progress: number }> = ({ title, items, onUpdate, accent, icon, progress }) => {
  const [val, setVal] = useState('');
  const [intent, setIntent] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const add = () => { if(val) { onUpdate([...items, { text: val, intent: intent || 'Strategic Alignment', priority: 'standard', id: Date.now().toString(), done: false }]); setVal(''); setIntent(''); setShowAdd(false); } };
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="p-5 bg-slate-950 rounded-3xl border border-white/5 text-white shadow-2xl">{icon}</div>
          <h3 className="text-3xl font-black uppercase tracking-tighter text-white">{title}</h3>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-4xl font-black tracking-tighter ${accent === 'indigo' ? 'text-indigo-400' : 'text-purple-400'}`}>{progress}%</span>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Efficacy</span>
        </div>
      </div>
      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
        <div className={`h-full bg-gradient-to-r ${accent === 'indigo' ? 'from-indigo-500 to-blue-600' : 'from-purple-500 to-pink-600'} transition-all duration-1000 shadow-[0_0_20px_rgba(99,102,241,0.4)]`} style={{ width: `${progress}%` }} />
      </div>
      <div className="space-y-8">
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)} className="w-full py-6 border border-dashed border-white/10 rounded-[32px] text-xs font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-4">
            <Plus className="w-6 h-6" /> NEW MISSION ENTRY
          </button>
        ) : (
          <div className="bg-slate-950/80 p-10 rounded-[48px] border border-white/10 space-y-8">
             <input value={val} onChange={e => setVal(e.target.value)} placeholder="Objective..." className="w-full bg-slate-900 border-none rounded-3xl px-8 py-5 text-base font-bold text-white outline-none" />
             <input value={intent} onChange={e => setIntent(e.target.value)} placeholder="Mission Intent..." className="w-full bg-slate-900 border-none rounded-3xl px-8 py-5 text-sm font-bold text-indigo-300 outline-none" />
             <div className="flex gap-4">
               <button onClick={add} className="flex-1 py-5 rounded-3xl bg-indigo-600 text-white font-black uppercase text-xs tracking-widest">Synchronize</button>
               <button onClick={() => setShowAdd(false)} className="px-10 py-5 rounded-3xl bg-slate-800 text-slate-400 font-black uppercase text-xs">Cancel</button>
             </div>
          </div>
        )}
        <div className="grid gap-6">
          {items.map(i => (
            <div key={i.id} className={`flex items-center justify-between p-8 rounded-[40px] border transition-all ${i.done ? 'bg-slate-950/20 opacity-40 grayscale' : 'bg-slate-900/60 border-white/5 hover:border-white/10'}`}>
               <div className="flex items-center gap-8 cursor-pointer flex-1" onClick={() => onUpdate(items.map(x => x.id === i.id ? {...x, done: !x.done} : x))}>
                  <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${i.done ? 'bg-indigo-600 border-transparent shadow-xl' : 'border-slate-700'}`}>
                    {i.done && <CheckCircle2 className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <span className={`text-xl font-black tracking-tight ${i.done ? 'line-through text-slate-600' : 'text-slate-100'}`}>{i.text}</span>
                    {i.intent && <p className="text-[11px] font-black uppercase mt-1 italic tracking-widest text-slate-500">{i.intent}</p>}
                  </div>
               </div>
               <button onClick={() => onUpdate(items.filter(x => x.id !== i.id))} className="text-rose-500/30 hover:text-rose-500 transition-all p-4"><Trash2 className="w-6 h-6" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StrategicHierarchy: React.FC<{ title: string, icon: React.ReactNode, color: 'rose' | 'indigo', placeholder: string }> = ({ title, icon, color, placeholder }) => {
  const [items, setItems] = useState<{id: string, text: string}[]>([]);
  const [val, setVal] = useState('');
  const add = () => { if(val) { setItems([...items, { id: Date.now().toString(), text: val }]); setVal(''); } };
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[56px] p-12 space-y-12 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-6">
        <div className="p-5 bg-slate-950 rounded-[28px] border border-white/5">{icon}</div>
        <h3 className="text-3xl font-black uppercase tracking-tighter text-white">{title}</h3>
      </div>
      <div className="flex gap-4">
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder={placeholder} className="flex-1 bg-slate-950/60 border border-white/10 rounded-3xl px-8 py-5 text-base font-bold outline-none text-white" />
        <button onClick={add} className={`px-10 rounded-3xl bg-gradient-to-br ${color === 'rose' ? 'from-rose-500 to-pink-600' : 'from-indigo-500 to-blue-600'} text-white font-black shadow-2xl active:scale-95 transition-all`}><Plus className="w-7 h-7" /></button>
      </div>
      <div className="space-y-5">
        {items.map(i => (
          <div key={i.id} className="bg-slate-950/60 p-8 rounded-[36px] flex justify-between items-center group border border-white/5">
            <span className="text-lg font-bold text-slate-200 tracking-tight">{i.text}</span>
            <button onClick={() => setItems(items.filter(x => x.id !== i.id))} className="opacity-0 group-hover:opacity-100 text-rose-500/40 hover:text-rose-500 transition-all p-3"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryCard: React.FC<{ cat: Category, logs: StudyLog[], onAdd: (t: string, tm: string, type: 'gain' | 'drain') => void, onDelete: (id: string) => void }> = ({ cat, logs, onAdd, onDelete }) => {
  const [topic, setTopic] = useState('');
  const [time, setTime] = useState('');
  const [load, setLoad] = useState<'drain' | 'gain'>('gain');
  const submit = () => { if(topic && time) { onAdd(topic, time, load); setTopic(''); setTime(''); } };
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[56px] p-10 flex flex-col h-[650px] group transition-all hover:shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-5 mb-10">
        <div className={`p-5 rounded-3xl bg-gradient-to-br ${cat.color} text-white shadow-2xl`}>{cat.icon}</div>
        <h4 className="text-lg font-black uppercase tracking-widest text-white/90">{cat.name}</h4>
      </div>
      <div className="space-y-5 mb-10">
        <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Objective..." className="w-full bg-slate-950/80 border border-white/5 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-white/10" />
        <div className="flex gap-4">
          <input value={time} onChange={e => setTime(e.target.value)} placeholder="90m" className="flex-1 bg-slate-950/80 border border-white/5 rounded-3xl px-8 py-5 text-sm font-bold text-white outline-none" />
          <div className="flex bg-slate-950 rounded-3xl p-1.5 border border-white/5 items-center">
             <button onClick={() => setLoad('gain')} className={`p-3 rounded-2xl transition-all ${load === 'gain' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-700 hover:text-slate-400'}`}><BatteryCharging className="w-5 h-5" /></button>
             <button onClick={() => setLoad('drain')} className={`p-3 rounded-2xl transition-all ${load === 'drain' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-700 hover:text-slate-400'}`}><ZapOff className="w-5 h-5" /></button>
          </div>
        </div>
        <button onClick={submit} className={`w-full py-5 rounded-3xl bg-gradient-to-br ${cat.color} text-white font-black uppercase text-[11px] tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3`}><Plus className="w-5 h-5" /> SYNC ASSET</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-5 custom-scroll pr-3">
        {logs.map(l => (
          <div key={l.id} className="bg-slate-950/40 p-6 rounded-[32px] flex justify-between items-center border border-white/5 hover:bg-slate-900/60 transition-all group/item">
            <div className="flex flex-col">
              <p className="text-base font-black text-white">{l.topic}</p>
              <div className="flex items-center gap-2 mt-2">
                 {l.time.includes('[GAIN]') ? <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" /> : <ZapOff className="w-3.5 h-3.5 text-rose-500" />}
                 <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{l.time}</p>
              </div>
            </div>
            <button onClick={() => onDelete(l.id)} className="opacity-0 group-hover/item:opacity-100 text-rose-500/40 hover:text-rose-500 p-3 rounded-2xl transition-all"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, unit: string, color: string }> = ({ label, value, unit, color }) => (
  <div className="bg-slate-950/60 p-12 rounded-[56px] border border-white/5 flex flex-col items-center justify-center space-y-5 shadow-inner">
    <span className="text-[11px] font-black uppercase text-slate-600 tracking-[0.4em]">{label}</span>
    <div className="flex items-baseline gap-3">
      <span className={`text-6xl font-black tracking-tighter ${color}`}>{value}</span>
      <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{unit}</span>
    </div>
  </div>
);

const AIModal: React.FC<{ onClose: () => void, context: DayData }> = ({ onClose, context }) => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const handleAsk = async () => {
    if (!prompt) return;
    setLoading(true);
    setResponse("");
    try {
      const stream = askAIArchitectStream(prompt, context);
      for await (const chunk of stream) { setResponse(prev => prev + chunk); }
    } catch (err) { setResponse("Neural bridge disrupted. Please check API credentials."); } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-6 animate-in fade-in" onClick={onClose}>
      <div className="bg-slate-950 border border-white/10 w-full max-w-4xl rounded-[72px] overflow-hidden shadow-[0_0_150px_rgba(79,70,229,0.3)] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="p-12 bg-indigo-600 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.2),_transparent)]" />
          <div className="flex items-center gap-8 relative z-10">
            <div className="p-5 bg-white/10 rounded-[32px] backdrop-blur-md border border-white/10"><Bot className="text-white w-10 h-10" /></div>
            <div><h2 className="text-[11px] font-black uppercase text-indigo-200 tracking-widest">Global AI Oracle</h2><p className="text-4xl font-black text-white tracking-tighter">Strategic Architect</p></div>
          </div>
          <button onClick={onClose} className="p-5 hover:bg-white/10 rounded-[32px] text-white border border-white/10 transition-all"><X className="w-8 h-8"/></button>
        </div>
        <div className="p-16 space-y-12">
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Analyze my current state and identify performance bottlenecks..." className="w-full bg-slate-900 border border-white/5 rounded-[48px] p-10 text-lg font-bold text-white h-56 resize-none transition-all placeholder:text-slate-800 focus:ring-4 focus:ring-indigo-500/10" />
          <button onClick={handleAsk} disabled={loading} className="w-full py-8 bg-indigo-600 rounded-[48px] font-black uppercase tracking-[0.4em] text-sm shadow-2xl transition-all flex items-center justify-center gap-5 hover:bg-indigo-500 disabled:opacity-50 text-white active:scale-95">
            {loading ? <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <><Wand2 className="w-7 h-7"/> RUN NEURAL ANALYSIS</>}
          </button>
          {response && <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[48px] p-12 max-h-[400px] overflow-y-auto custom-scroll shadow-inner"><p className="text-lg font-medium leading-relaxed text-indigo-100 whitespace-pre-wrap italic selection:bg-indigo-500/40">{response}</p></div>}
        </div>
      </div>
    </div>
  );
};

export default App;
