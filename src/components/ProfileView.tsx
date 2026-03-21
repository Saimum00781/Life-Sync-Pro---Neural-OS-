import React, { useState } from 'react';
import { Settings2, Plus, X } from 'lucide-react';
import { THEMES } from '../constants';

export const ProfileView = ({ name, setUserName, gender, setGender, themeName, setThemeName, thresholds, setThresholds, habits, setHabits, segments, setSegments, customPrompt, showSuccessToast }: any) => {
  const [showAbout, setShowAbout] = useState(false);
  const addHabit = async () => {
    const h = await customPrompt("New Habit Loop?");
    if(h && !habits.find((x: any) => (typeof x === 'string' ? x : x.text) === h)) {
      setHabits([...habits, { id: Date.now().toString(), text: h, time: 'morning' }]);
      if (showSuccessToast) showSuccessToast("HABIT ADDED");
    }
  };
  const addSegment = async () => {
    const s = await customPrompt("New Matrix Segment?");
    if(s && !segments.includes(s)) {
      setSegments([...segments, s]);
      if (showSuccessToast) showSuccessToast("SEGMENT ADDED");
    }
  };

  const handleSaveConfig = () => {
    if (showSuccessToast) showSuccessToast("CONFIG SYNCHRONIZED");
  };

  return (
    <div className="space-y-8 animate-in pb-12 w-full max-w-md mx-auto">
      <div className="bg-slate-900 p-5 rounded-[1.5rem] border border-white/10 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-mono uppercase text-white">Protocol Config</h3>
          <Settings2 size={16} className="text-slate-500" />
        </div>
        
        <div className="space-y-3">
          <label className="text-[10px] font-mono uppercase text-slate-500 block tracking-widest ml-1">Identity Protocol</label>
          <input value={name} onChange={e => setUserName(e.target.value)} className="w-full bg-black/40 p-3.5 rounded-xl border border-white/5 outline-none font-mono text-white focus:border-[var(--accent-primary)] transition-all shadow-inner text-xs" placeholder="Edit Name" />
          <div className="flex gap-3">
            <button onClick={() => setGender('boy')} className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${gender === 'boy' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-white shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.3)]' : 'border-white/5 opacity-40 grayscale'}`}>
               <svg viewBox="0 0 100 100" className="w-6 h-6 fill-none stroke-current stroke-2"><circle cx="50" cy="35" r="15"/><path d="M50 50 L50 75 M50 55 L35 70 M50 55 L65 70 M50 75 L35 90 M50 75 L65 90"/><path d="M40 30 Q50 20 60 30"/></svg>
               <span className="text-[10px] font-mono tracking-widest">BOY</span>
            </button>
            <button onClick={() => setGender('girl')} className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${gender === 'girl' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-white shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.3)]' : 'border-white/5 opacity-40 grayscale'}`}>
               <svg viewBox="0 0 100 100" className="w-6 h-6 fill-none stroke-current stroke-2"><circle cx="50" cy="35" r="15"/><path d="M50 50 L50 75 M50 55 L35 70 M50 55 L65 70 M50 75 L35 90 M50 75 L65 90"/><path d="M35 35 Q50 15 65 35"/><path d="M40 75 L60 75"/></svg>
               <span className="text-[10px] font-mono tracking-widest">GIRL</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-mono uppercase text-slate-500 block tracking-widest ml-1">Threshold Protocol (Mins)</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase ml-2 font-mono">Max Leisure</span>
              <input type="number" value={thresholds.leisureMax} onChange={e => setThresholds({...thresholds, leisureMax: parseInt(e.target.value)||0})} className="w-full bg-black/40 p-3 rounded-xl text-xs font-mono text-white border border-white/5 shadow-inner" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase ml-2 font-mono">Min Productive</span>
              <input type="number" value={thresholds.productiveMin} onChange={e => setThresholds({...thresholds, productiveMin: parseInt(e.target.value)||0})} className="w-full bg-black/40 p-3 rounded-xl text-xs font-mono text-white border border-white/5 shadow-inner" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase ml-2 font-mono">Min Offline</span>
              <input type="number" value={thresholds.offlineMin} onChange={e => setThresholds({...thresholds, offlineMin: parseInt(e.target.value)||0})} className="w-full bg-black/40 p-3 rounded-xl text-xs font-mono text-white border border-white/5 shadow-inner" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase ml-2 font-mono">Min Sleep</span>
              <input type="number" value={thresholds.sleepMin} onChange={e => setThresholds({...thresholds, sleepMin: parseInt(e.target.value)||0})} className="w-full bg-black/40 p-3 rounded-xl text-xs font-mono text-white border border-white/5 shadow-inner" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-mono uppercase text-slate-500 block tracking-widest ml-1">Visual Protocol (Themes)</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(THEMES).map(t => (
              <button key={t} onClick={() => setThemeName(t)} className={`p-2.5 rounded-xl text-[10px] font-mono uppercase border transition-all ${themeName === t ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white shadow-lg' : 'border-white/5 bg-black/20 text-slate-500'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
           <div className="flex justify-between items-center ml-1">
             <label className="text-[10px] font-mono uppercase text-slate-500 tracking-widest">Active Habit Loops</label>
             <button onClick={addHabit} className="p-1.5 bg-white/5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"><Plus size={14}/></button>
           </div>
           <div className="flex flex-wrap gap-2">
             {habits.map((h: any) => {
               const text = typeof h === 'string' ? h : h.text;
               const id = typeof h === 'string' ? h : h.id;
               return (
               <div key={id} className="bg-white/5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border border-white/5 flex items-center gap-2 group text-white">
                 {text}
                 <button onClick={() => setHabits(habits.filter((x: any) => (typeof x === 'string' ? x : x.id) !== id))} className="opacity-100 transition-opacity text-rose-400 p-0.5"><X size={10}/></button>
               </div>
             )})}
           </div>
        </div>

        <div className="space-y-3">
           <div className="flex justify-between items-center ml-1">
             <label className="text-[10px] font-mono uppercase text-slate-500 tracking-widest">Neural Segments</label>
             <button onClick={addSegment} className="p-1.5 bg-white/5 rounded-lg text-indigo-400 hover:bg-indigo-400/10 transition-colors"><Plus size={14}/></button>
           </div>
           <div className="flex flex-wrap gap-2">
             {segments.map((s: string) => (
               <div key={s} className="bg-white/5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border border-white/5 flex items-center gap-2 group text-white">
                 {s}
                 <button onClick={() => setSegments(segments.filter((x: string) => x !== s))} className="opacity-100 transition-opacity text-rose-400 p-0.5"><X size={10}/></button>
               </div>
             ))}
           </div>
        </div>
        
        <button onClick={handleSaveConfig} className="w-full py-4 bg-[var(--accent-primary)] rounded-xl text-white font-mono uppercase text-[10px] shadow-xl shadow-[var(--accent-primary)]/20 active:scale-95 transition-all mt-6">
          Synchronize Config
        </button>

        <button onClick={() => setShowAbout(true)} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono uppercase text-slate-400 hover:text-white transition-all shadow-md mt-4">About Us</button>
      </div>

      {showAbout && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 animate-in" onClick={() => setShowAbout(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 w-full max-w-sm space-y-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-primary)] shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.5)]" />
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-mono uppercase text-white tracking-tighter">System Info</h2>
              <X className="cursor-pointer text-slate-500 hover:text-white transition-colors p-2" size={20} onClick={() => setShowAbout(false)} />
            </div>
            <div className="space-y-4 text-xs font-mono leading-relaxed text-slate-400">
              <p><b className="text-white">Developer:</b> AM SAIMUM</p>
              <p><b className="text-white">Organization:</b> Comilla University, Bangladesh</p>
              <p><b className="text-white">Protocol:</b> Life Sync Pro is a neural-inspired OS designed to harmonize high-performance ambition with cognitive energy management. It leverages strategic feedback loops to optimize daily output and mental energy ROI.</p>
            </div>
            <button onClick={() => setShowAbout(false)} className="w-full py-4 bg-[var(--accent-primary)] rounded-xl text-white font-mono uppercase text-[10px] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Synchronize Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
};
