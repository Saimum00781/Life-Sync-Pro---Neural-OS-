
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bot, X, Wand2, Calendar as CalendarIcon, Plus, Trash2, CheckCircle2, Zap,
  Smartphone, GraduationCap, BookOpen, Briefcase, UserPlus, Moon, Trophy, Heart,
  Sparkles, Target, BrainCircuit, BatteryCharging, Timer, Coffee, ZapOff, Lightbulb,
  ArrowRight, Activity, TrendingUp, Star, ShieldAlert, Cpu, Check, Download
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
  const [proactiveAdvice, setProactiveAdvice] = useState<string>("Initializing Neural Core...");
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
        const stream = askAIArchitectStream("Brief elite coaching based on my goals.", currentDay);
        let full = "";
        for await (const chunk of stream) { full += chunk; }
        setProactiveAdvice(full || "Neural link stable.");
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
    a.download = `neural-os-backup.json`;
    a.click();
  };

  if (appState === AppState.WELCOME) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1e1b4b_0%,_#020617_100%)] opacity-70" />
        <div className="relative z-10 space-y-8 md:space-y-12 max-w-lg w-full">
          <div className="w-32 h-32 md:w-44 md:h-44 bg-gradient-to-br from-indigo-600 to-purple-900 rounded-[40px] md:rounded-[56px] flex items-center justify-center shadow-2xl mx-auto border border-white/10">
            <BrainCircuit className="w-16 h-16 md:w-24 md:h-24 text-white" />
          </div>
          <div className="space-y-2 md:space-y-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">SYNC <span className="text-indigo-500">PRO</span></h1>
            <p className="text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              The proactive operating system for high-performing humans.
            </p>
          </div>
          <button 
            onClick={() => setAppState(AppState.ONBOARDING)}
            className="w-full md:w-auto flex items-center justify-center gap-4 bg-white text-slate-950 px-10 py-6 md:px-16 md:py-8 rounded-[32px] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl active:scale-95"
          >
            Launch Protocol <ArrowRight className="w-5 h-5" />
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
      <div className="h-1 w-full bg-slate-900/50 relative z-[70]">
        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${syncLevel}%` }} />
      </div>

      <header className="px-4 py-4 md:px-6 md:py-6 bg-slate-950/80 border-b border-white/5 flex justify-between items-center backdrop-blur-3xl sticky top-0 z-[60]">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10">
            <Cpu className="w-5 h-5 md:w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Neural Status</span>
            <span className="text-xs md:text-sm font-black text-white">{syncLevel}% SYNCED</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={exportData} className="p-2 text-slate-500"><Download className="w-5 h-5"/></button>
          <button onClick={() => setShowAI(true)} className="bg-indigo-600 p-3 md:px-6 md:py-3 rounded-xl md:rounded-2xl shadow-xl">
            <Bot className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scroll pb-32">
        <div className="max-w-7xl mx-auto p-4 md:p-12 space-y-6 md:space-y-12">
          
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl md:rounded-[48px] p-6 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-10 backdrop-blur-2xl">
            <div className="p-4 md:p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <Sparkles className="text-indigo-400 w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-2">Neural Shadow</h2>
              <p className="text-lg md:text-2xl font-bold text-slate-100 italic">"{proactiveAdvice}"</p>
            </div>
          </div>

          {activeTab === Tab.CALENDAR && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
              <div className="lg:col-span-4 space-y-6 md:space-y-10">
                <div className="bg-slate-900/40 p-6 md:p-10 rounded-3xl md:rounded-[48px] border border-white/5">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                     <CalendarIcon className="w-4 h-4 text-indigo-400" /> Timeline
                   </h3>
                   <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 md:p-6 text-center font-black text-lg md:text-xl text-white outline-none" />
                </div>
                
                <div className="bg-slate-900/40 p-6 md:p-10 rounded-3xl md:rounded-[48px] border border-white/5 space-y-4 md:space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" /> Diagnostics
                  </h3>
                  <div className="space-y-4">
                    <DiagnosticItem label="Missions" value={currentDay.goals.length} sub="ACTIVE" color="text-indigo-400" />
                    <DiagnosticItem label="Assets" value={currentDay.studyLogs.length} sub="LOGS" color="text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6 md:space-y-12">
                <div className="bg-slate-900/20 border border-white/5 rounded-3xl md:rounded-[56px] p-6 md:p-12 space-y-10 md:space-y-16 backdrop-blur-xl">
                  <MissionControl title="Daily Missions" items={currentDay.goals} onUpdate={it => updateDayData(selectedDate, { goals: it })} accent="indigo" icon={<Zap className="w-6 h-6" />} progress={calculateProgress(currentDay.goals)} />
                  <div className="h-px bg-white/5" />
                  <MissionControl title="Strategic Goals" items={currentDay.weekly} onUpdate={it => updateDayData(selectedDate, { weekly: it })} accent="purple" icon={<Trophy className="w-6 h-6" />} progress={calculateProgress(currentDay.weekly)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === Tab.PLANNING && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                <StrategicHierarchy title="Intentions" icon={<Target className="text-indigo-400" />} color="indigo" placeholder="Success vision..." />
                <StrategicHierarchy title="Values" icon={<Heart className="text-rose-400" />} color="rose" placeholder="Non-negotiables..." />
             </div>
          )}

          {activeTab === Tab.DIGITAL && (
            <div className="space-y-6 md:space-y-12">
               <div className="flex flex-col xl:flex-row gap-6 md:gap-10">
                 <div className="flex-1 bg-slate-900/30 p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-white/5 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 md:gap-8 backdrop-blur-xl">
                   <div className="text-center md:text-left">
                     <h2 className="text-3xl md:text-5xl font-black text-white uppercase">Digital Hub</h2>
                     <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-2">Resource Allocation</p>
                   </div>
                   <div className="bg-cyan-500/5 border border-cyan-500/10 p-6 md:p-10 rounded-3xl flex items-center gap-6 md:gap-10">
                      <Smartphone className="w-8 h-8 text-cyan-400 opacity-50" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-cyan-500 uppercase">Screen Time</span>
                        <input value={currentDay.deviceTime} onChange={e => updateDayData(selectedDate, { deviceTime: e.target.value })} placeholder="0h" className="bg-transparent border-none text-cyan-400 font-black text-3xl md:text-4xl outline-none w-24 placeholder:text-cyan-950" />
                      </div>
                   </div>
                 </div>

                 <div className="xl:w-[400px] bg-slate-900/30 border border-white/5 p-6 md:p-12 rounded-3xl md:rounded-[56px] space-y-6">
                    <h3 className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5" /> Neural Load
                    </h3>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-indigo-500 transition-all" style={{ width: `${Math.min(100, (currentDay.studyLogs.length * 15))}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-center"><Timer className="w-5 h-5 text-indigo-400 mx-auto mb-1"/><span className="text-[8px] font-black uppercase text-slate-500">Deep Work</span></div>
                       <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-center"><Coffee className="w-5 h-5 text-emerald-400 mx-auto mb-1"/><span className="text-[8px] font-black uppercase text-slate-500">Rest</span></div>
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {CATEGORIES.map(cat => (
                  <CategoryCard key={cat.name} cat={cat} logs={currentDay.studyLogs.filter(l => l.category === cat.name)} onAdd={(t, tm, type) => updateDayData(selectedDate, { studyLogs: [...currentDay.studyLogs, { id: Date.now().toString(), category: cat.name, topic: t, time: `${tm} [${type.toUpperCase()}]` }] })} onDelete={id => updateDayData(selectedDate, { studyLogs: currentDay.studyLogs.filter(l => l.id !== id) })} />
                ))}
              </div>
            </div>
          )}

          {activeTab === Tab.ANALYTICS && (
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl md:rounded-[56px] p-6 md:p-16 space-y-10 md:space-y-16">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Analytics</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase mt-1">Performance Intelligence</p>
                </div>
                <div className="p-4 md:p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 w-fit"><TrendingUp className="text-emerald-500 w-8 h-8" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-10">
                <StatCard label="Nodes" value={CATEGORIES.length} unit="Types" color="text-indigo-400" />
                <StatCard label="Sync" value={`${calculateProgress(currentDay.goals)}%`} unit="Efficacy" color="text-indigo-400" />
                <StatCard label="Assets" value={currentDay.studyLogs.length} unit="Logs" color="text-purple-400" />
              </div>
              <div className="space-y-4">
                {currentDay.studyLogs.map(l => (
                  <div key={l.id} className="bg-slate-950/50 p-6 rounded-[32px] border border-white/5 flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${l.time.includes('[GAIN]') ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div>
                        <p className="font-black text-base text-white">{l.topic}</p>
                        <p className="text-[8px] uppercase text-slate-600 font-black">{l.category}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-4 py-2 bg-slate-900 rounded-xl">{l.time}</span>
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
  <div className="flex justify-between items-center p-4 md:p-6 bg-slate-950/50 rounded-2xl md:rounded-[32px] border border-white/5">
    <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-500">{label}</span>
    <span className={`text-base md:text-lg font-black ${color} flex items-center gap-2`}>{value} <span className="text-[8px] text-slate-700 font-bold">{sub}</span></span>
  </div>
);

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Peak Flow", icon: <Lightbulb className="w-12 h-12 text-rose-400" />, desc: "Convert daily thoughts into performance data." },
    { title: "Energy OS", icon: <BrainCircuit className="w-12 h-12 text-indigo-400" />, desc: "Triage your mental load to prevent burnout." },
    { title: "AI Strategy", icon: <Bot className="w-12 h-12 text-emerald-400" />, desc: "Real-time course corrections from your Neural Shadow." }
  ];

  return (
    <div className="h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-xl w-full bg-slate-900/80 border border-white/10 rounded-[40px] md:rounded-[64px] p-8 md:p-20 space-y-12 animate-in backdrop-blur-3xl">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-8 bg-slate-950 rounded-3xl border border-white/10">{steps[step].icon}</div>
          <h2 className="text-4xl font-black uppercase text-white tracking-tighter">{steps[step].title}</h2>
          <p className="text-slate-400 text-lg leading-relaxed">{steps[step].desc}</p>
        </div>
        <div className="flex gap-2 justify-center">
          {steps.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-10 bg-indigo-500' : 'w-3 bg-slate-800'}`} />)}
        </div>
        <button onClick={() => step === steps.length - 1 ? onComplete() : setStep(s => s + 1)} className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95">
          {step === steps.length - 1 ? "Initialize" : "Next"}
        </button>
      </div>
    </div>
  );
};

const MissionControl: React.FC<{ title: string, items: Goal[], onUpdate: (items: Goal[]) => void, accent: 'indigo' | 'purple', icon: React.ReactNode, progress: number }> = ({ title, items, onUpdate, accent, icon, progress }) => {
  const [val, setVal] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const add = () => { if(val) { onUpdate([...items, { text: val, priority: 'standard', id: Date.now().toString(), done: false }]); setVal(''); setShowAdd(false); } };
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-950 rounded-xl text-white">{icon}</div>
          <h3 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight">{title}</h3>
        </div>
        <div className="text-right">
          <span className={`text-2xl md:text-3xl font-black ${accent === 'indigo' ? 'text-indigo-400' : 'text-purple-400'}`}>{progress}%</span>
        </div>
      </div>
      <div className="space-y-4">
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)} className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2 hover:text-white transition-all">
            <Plus className="w-4 h-4" /> ADD MISSION
          </button>
        ) : (
          <div className="bg-slate-950/80 p-6 rounded-3xl border border-white/10 space-y-4">
             <input value={val} onChange={e => setVal(e.target.value)} placeholder="Objective..." className="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold text-white outline-none" />
             <div className="flex gap-2">
               <button onClick={add} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-black uppercase text-[10px]">Sync</button>
               <button onClick={() => setShowAdd(false)} className="px-6 py-3 rounded-xl bg-slate-800 text-slate-400 font-black uppercase text-[10px]">X</button>
             </div>
          </div>
        )}
        <div className="grid gap-3">
          {items.map(i => (
            <div key={i.id} className={`flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl border transition-all ${i.done ? 'bg-slate-950/20 opacity-40' : 'bg-slate-900/60 border-white/5'}`}>
               <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => onUpdate(items.map(x => x.id === i.id ? {...x, done: !x.done} : x))}>
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${i.done ? 'bg-indigo-600 border-transparent' : 'border-slate-700'}`}>
                    {i.done && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`text-base font-bold ${i.done ? 'line-through' : 'text-slate-100'}`}>{i.text}</span>
               </div>
               <button onClick={() => onUpdate(items.filter(x => x.id !== i.id))} className="text-rose-500/30 p-2"><Trash2 className="w-4 h-4" /></button>
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
    <div className="bg-slate-900/40 border border-white/5 rounded-3xl md:rounded-[56px] p-6 md:p-12 space-y-8 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-950 rounded-xl">{icon}</div>
        <h3 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight">{title}</h3>
      </div>
      <div className="flex gap-2">
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder={placeholder} className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white" />
        <button onClick={add} className={`px-5 rounded-xl bg-indigo-600 text-white active:scale-95 transition-all`}><Plus className="w-5 h-5" /></button>
      </div>
      <div className="space-y-3">
        {items.map(i => (
          <div key={i.id} className="bg-slate-950/60 p-4 rounded-2xl flex justify-between items-center border border-white/5">
            <span className="text-sm font-bold text-slate-200">{i.text}</span>
            <button onClick={() => setItems(items.filter(x => x.id !== i.id))} className="text-rose-500/40 p-2"><Trash2 className="w-4 h-4" /></button>
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
    <div className="bg-slate-900/40 border border-white/5 rounded-3xl md:rounded-[56px] p-6 md:p-10 flex flex-col min-h-[450px] md:h-[650px] group backdrop-blur-xl">
      <div className="flex items-center gap-4 mb-6 md:mb-10">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-lg`}>{cat.icon}</div>
        <h4 className="text-base md:text-lg font-black uppercase text-white/90">{cat.name}</h4>
      </div>
      <div className="space-y-4 mb-6">
        <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Objective..." className="w-full bg-slate-950/80 border border-white/5 rounded-xl px-4 py-3 text-xs md:text-sm font-bold text-white outline-none" />
        <div className="flex gap-2">
          <input value={time} onChange={e => setTime(e.target.value)} placeholder="90m" className="flex-1 bg-slate-950/80 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none" />
          <div className="flex bg-slate-950 rounded-xl p-1 border border-white/5">
             <button onClick={() => setLoad('gain')} className={`p-2 rounded-lg ${load === 'gain' ? 'bg-emerald-500 text-white' : 'text-slate-600'}`}><BatteryCharging className="w-4 h-4" /></button>
             <button onClick={() => setLoad('drain')} className={`p-2 rounded-lg ${load === 'drain' ? 'bg-rose-500 text-white' : 'text-slate-600'}`}><ZapOff className="w-4 h-4" /></button>
          </div>
        </div>
        <button onClick={submit} className={`w-full py-4 rounded-xl bg-gradient-to-br ${cat.color} text-white font-black uppercase text-[9px] tracking-widest shadow-lg active:scale-95 transition-all`}>Sync Log</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-1">
        {logs.map(l => (
          <div key={l.id} className="bg-slate-950/40 p-4 rounded-2xl flex justify-between items-center border border-white/5">
            <div className="flex flex-col">
              <p className="text-sm font-bold text-white">{l.topic}</p>
              <p className="text-[8px] text-slate-600 font-black mt-1 uppercase tracking-tighter">{l.time}</p>
            </div>
            <button onClick={() => onDelete(l.id)} className="text-rose-500/20 hover:text-rose-500 transition-all p-2"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, unit: string, color: string }> = ({ label, value, unit, color }) => (
  <div className="bg-slate-950/60 p-6 md:p-12 rounded-3xl md:rounded-[56px] border border-white/5 flex flex-col items-center justify-center space-y-2 shadow-inner">
    <span className="text-[9px] md:text-[11px] font-black uppercase text-slate-600 tracking-widest">{label}</span>
    <div className="flex items-baseline gap-2">
      <span className={`text-4xl md:text-6xl font-black ${color}`}>{value}</span>
      <span className="text-[9px] font-black text-slate-800 uppercase">{unit}</span>
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
    } catch (err) { setResponse("Neural bridge disrupted."); } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center md:p-6 animate-in" onClick={onClose}>
      <div className="bg-slate-950 border-white/10 w-full h-full md:h-auto md:max-w-4xl md:rounded-[48px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 md:p-10 bg-indigo-600 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Bot className="text-white w-8 h-8 md:w-10 h-10" />
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">AI Architect</h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-xl text-white"><X className="w-6 h-6"/></button>
        </div>
        <div className="flex-1 p-6 md:p-16 space-y-6 md:space-y-12 overflow-y-auto custom-scroll">
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ask anything..." className="w-full bg-slate-900 border-white/5 rounded-2xl md:rounded-[32px] p-6 md:p-10 text-base md:text-lg font-bold text-white h-40 md:h-56 resize-none outline-none focus:ring-2 focus:ring-indigo-500/20" />
          <button onClick={handleAsk} disabled={loading} className="w-full py-5 md:py-8 bg-indigo-600 rounded-2xl md:rounded-[32px] font-black uppercase tracking-widest text-xs shadow-2xl transition-all flex items-center justify-center gap-4 hover:bg-indigo-500 text-white disabled:opacity-50">
            {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Wand2 className="w-5 h-5"/>}
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
          {response && <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl md:rounded-[32px] p-6 md:p-12"><p className="text-base md:text-lg font-medium leading-relaxed text-indigo-100 italic whitespace-pre-wrap">{response}</p></div>}
        </div>
      </div>
    </div>
  );
};

export default App;
