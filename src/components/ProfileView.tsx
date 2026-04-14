import React, { useState } from 'react';
import { Settings2, Plus, X, User, Activity, Palette, Sliders, Heart, Zap, Download, Upload, Shield, Smartphone, Database, Terminal } from 'lucide-react';
import { THEMES } from '../constants';
import { useAppStore } from '../../store';

export const ProfileView = ({ name, setUserName, archetype, setArchetype, themeName, setThemeName, weatherTheme, setWeatherTheme, thresholds, setThresholds, habits, setHabits, segments, setSegments, customPrompt, showSuccessToast, coreIdentity, setCoreIdentity, habitStacks, setHabitStacks }: any) => {
  const [showAbout, setShowAbout] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'habits' | 'preferences' | 'system'>('identity');
  
  const { strictMode, setStrictMode, hapticFeedback, setHapticFeedback, createdAt, accountabilityLevel, setAccountabilityLevel } = useAppStore();

  const handleExport = () => {
    const data = localStorage.getItem('life-sync-pro-storage');
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-sync-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (showSuccessToast) showSuccessToast("DATA EXPORTED");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        localStorage.setItem('life-sync-pro-storage', json);
        window.location.reload();
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const addHabit = async () => {
    const h = await customPrompt("New Habit Loop?");
    if(h && !habits.includes(h)) {
      setHabits([...habits, h]);
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
  const addHabitStack = async () => {
    const current = await customPrompt("After I... (Current Habit)");
    if (!current) return;
    const newH = await customPrompt(`After I ${current}, I will... (New Habit)`);
    if (!newH) return;
    setHabitStacks([...(habitStacks || []), { id: Date.now().toString(), currentHabit: current, newHabit: newH }]);
    if (showSuccessToast) showSuccessToast("STACK ADDED");
  };

  const handleSaveConfig = () => {
    if (showSuccessToast) showSuccessToast("SETTINGS SYNCHRONIZED");
  };

  const standardThemes = Object.keys(THEMES);
  const weatherThemes = ['Sunny', 'Rainy', 'Deep Forest', 'Snowy', 'None'];

  return (
    <div className="space-y-6 animate-in pb-12 w-full max-w-md mx-auto">
      <div className="bg-[var(--card-bg)] p-5 rounded-[1.5rem] border border-[var(--text-main)]/10 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-mono uppercase text-[var(--text-main)]">System Settings</h3>
          <Settings2 size={16} className="text-[var(--text-main)] opacity-50" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-[var(--text-main)]/5 p-1.5 rounded-xl overflow-x-auto custom-scroll snap-x snap-mandatory">
          <button onClick={() => setActiveTab('identity')} className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all min-w-[100px] snap-center ${activeTab === 'identity' ? 'bg-[var(--text-main)]/10 text-[var(--text-main)] shadow-sm' : 'text-[var(--text-main)] opacity-50 hover:opacity-80'}`}>
            <User size={14} /> <span className="text-[10px] font-mono uppercase tracking-widest">Identity</span>
          </button>
          <button onClick={() => setActiveTab('habits')} className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all min-w-[100px] snap-center ${activeTab === 'habits' ? 'bg-[var(--text-main)]/10 text-[var(--text-main)] shadow-sm' : 'text-[var(--text-main)] opacity-50 hover:opacity-80'}`}>
            <Activity size={14} /> <span className="text-[10px] font-mono uppercase tracking-widest">Habits</span>
          </button>
          <button onClick={() => setActiveTab('preferences')} className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all min-w-[100px] snap-center ${activeTab === 'preferences' ? 'bg-[var(--text-main)]/10 text-[var(--text-main)] shadow-sm' : 'text-[var(--text-main)] opacity-50 hover:opacity-80'}`}>
            <Sliders size={14} /> <span className="text-[10px] font-mono uppercase tracking-widest">Prefs</span>
          </button>
          <button onClick={() => setActiveTab('system')} className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all min-w-[100px] snap-center ${activeTab === 'system' ? 'bg-[var(--text-main)]/10 text-[var(--text-main)] shadow-sm' : 'text-[var(--text-main)] opacity-50 hover:opacity-80'}`}>
            <Terminal size={14} /> <span className="text-[10px] font-mono uppercase tracking-widest">System</span>
          </button>
        </div>
        
        {/* Tab Content: Identity */}
        {activeTab === 'identity' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 block tracking-widest ml-1">Identity Protocol</label>
              <input value={name} onChange={e => setUserName(e.target.value)} className="w-full bg-[var(--text-main)]/5 p-3.5 rounded-xl border border-[var(--text-main)]/10 outline-none font-mono text-[var(--text-main)] focus:border-[var(--accent-primary)] transition-all shadow-inner text-xs" placeholder="Edit Name" />
              
              <div className="mt-4">
                <label className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 block tracking-widest ml-1 mb-2">Core Identity (Atomic Habits)</label>
                <textarea 
                  value={coreIdentity || ''} 
                  onChange={e => setCoreIdentity(e.target.value)} 
                  className="w-full bg-[var(--text-main)]/5 p-3.5 rounded-xl border border-[var(--text-main)]/10 outline-none font-mono text-[var(--text-main)] focus:border-[var(--accent-primary)] transition-all shadow-inner text-xs min-h-[80px]" 
                  placeholder="e.g., I am the type of person who never misses a workout." 
                />
                <p className="text-[8px] font-mono text-[var(--text-main)] opacity-50 mt-1 ml-1">True behavior change is identity change.</p>
              </div>

              <div className="mt-4">
                <label className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 block tracking-widest ml-1 mb-2">Accountability Level</label>
                <div className="flex gap-3">
                  <button onClick={() => setAccountabilityLevel('supportive')} className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${accountabilityLevel === 'supportive' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-[var(--text-main)]/10 opacity-40 grayscale'}`}>
                     <Heart className="w-5 h-5" />
                     <span className="text-[10px] font-mono tracking-widest">SUPPORTIVE</span>
                  </button>
                  <button onClick={() => setAccountabilityLevel('relentless')} className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${accountabilityLevel === 'relentless' ? 'border-rose-500 bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-[var(--text-main)]/10 opacity-40 grayscale'}`}>
                     <Zap className="w-5 h-5" />
                     <span className="text-[10px] font-mono tracking-widest">RELENTLESS</span>
                  </button>
                </div>
                <p className="text-[8px] font-mono text-[var(--text-main)] opacity-50 mt-2 ml-1 text-center">
                  {accountabilityLevel === 'relentless' ? 'The Oracle will hold you to the highest standard. No excuses.' : 'The Oracle will guide you with supportive, analytical feedback.'}
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setArchetype('optimizer')} className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${archetype === 'optimizer' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-main)] shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.3)]' : 'border-[var(--text-main)]/10 opacity-40 grayscale'}`}>
                   <Activity className="w-6 h-6 text-[var(--accent-primary)]" />
                   <span className="text-[10px] font-mono tracking-widest">OPTIMIZER</span>
                </button>
                <button onClick={() => setArchetype('balancer')} className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${archetype === 'balancer' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-main)] shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.3)]' : 'border-[var(--text-main)]/10 opacity-40 grayscale'}`}>
                   <Heart className="w-6 h-6 text-[var(--accent-primary)]" />
                   <span className="text-[10px] font-mono tracking-widest">BALANCER</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Habits */}
        {activeTab === 'habits' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-3">
               <div className="flex justify-between items-center ml-1">
                 <label className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 tracking-widest">Active Habit Loops</label>
                 <button onClick={addHabit} className="p-1.5 bg-[var(--text-main)]/5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"><Plus size={14}/></button>
               </div>
               <div className="flex flex-wrap gap-2">
                 {habits.map((h: any) => {
                   const habitStr = typeof h === 'string' ? h : (h.text || '');
                   if (!habitStr) return null;
                   return (
                     <div key={habitStr} className="bg-[var(--text-main)]/5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border border-[var(--text-main)]/10 flex items-center gap-2 group text-[var(--text-main)]">
                       {habitStr}
                       <button onClick={() => setHabits(habits.filter((x: any) => (typeof x === 'string' ? x : x.text) !== habitStr))} className="opacity-100 transition-opacity text-rose-400 p-0.5"><X size={10}/></button>
                     </div>
                   );
                 })}
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center ml-1">
                 <label className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 tracking-widest">Habit Stacking (Atomic)</label>
                 <button onClick={addHabitStack} className="p-1.5 bg-[var(--text-main)]/5 rounded-lg text-orange-400 hover:bg-orange-400/10 transition-colors"><Plus size={14}/></button>
               </div>
               <p className="text-[8px] font-mono text-[var(--text-main)] opacity-50 ml-1">"After I [Current Habit], I will [New Habit]"</p>
               <div className="flex flex-col gap-2">
                 {(habitStacks || []).map((stack: any) => (
                   <div key={stack.id} className="bg-[var(--text-main)]/5 p-3 rounded-xl text-[10px] font-mono border border-[var(--text-main)]/10 flex flex-col gap-1 relative group">
                     <div className="text-[var(--text-main)] opacity-70">After I <span className="text-[var(--text-main)] opacity-100">{stack.currentHabit}</span>,</div>
                     <div className="text-[var(--text-main)] opacity-70">I will <span className="text-orange-400">{stack.newHabit}</span>.</div>
                     <button onClick={() => setHabitStacks((habitStacks || []).filter((x: any) => x.id !== stack.id))} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 p-1"><X size={12}/></button>
                   </div>
                 ))}
                 {(!habitStacks || habitStacks.length === 0) && (
                   <div className="text-center py-4 opacity-30 font-mono uppercase text-[10px] tracking-[0.25em] text-[var(--text-main)] border border-dashed border-[var(--text-main)]/20 rounded-xl">No stacks defined</div>
                 )}
               </div>
            </div>
          </div>
        )}

        {/* Tab Content: Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 tracking-widest">Threshold Protocol (Mins)</label>
              </div>
              
              {/* Smart Presets */}
              <div className="flex gap-2 mb-4">
                <button onClick={() => setThresholds({ leisureMax: 60, productiveMin: 480, offlineMin: 60, sleepMin: 420 })} className="flex-1 py-2 bg-[var(--text-main)]/5 hover:bg-[var(--text-main)]/10 rounded-lg text-[9px] font-mono uppercase text-[var(--text-main)] transition-colors border border-[var(--text-main)]/10">Intense Focus</button>
                <button onClick={() => setThresholds({ leisureMax: 120, productiveMin: 240, offlineMin: 120, sleepMin: 480 })} className="flex-1 py-2 bg-[var(--text-main)]/5 hover:bg-[var(--text-main)]/10 rounded-lg text-[9px] font-mono uppercase text-[var(--text-main)] transition-colors border border-[var(--text-main)]/10">Balanced</button>
                <button onClick={() => setThresholds({ leisureMax: 240, productiveMin: 120, offlineMin: 240, sleepMin: 540 })} className="flex-1 py-2 bg-[var(--text-main)]/5 hover:bg-[var(--text-main)]/10 rounded-lg text-[9px] font-mono uppercase text-[var(--text-main)] transition-colors border border-[var(--text-main)]/10">Recovery</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[var(--text-main)] opacity-50 uppercase ml-2 font-mono">Max Leisure</span>
                  <input type="number" value={thresholds.leisureMax} onChange={e => setThresholds({...thresholds, leisureMax: parseInt(e.target.value)||0})} className="w-full bg-[var(--text-main)]/5 p-3 rounded-xl text-xs font-mono text-[var(--text-main)] border border-[var(--text-main)]/10 shadow-inner" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[var(--text-main)] opacity-50 uppercase ml-2 font-mono">Min Productive</span>
                  <input type="number" value={thresholds.productiveMin} onChange={e => setThresholds({...thresholds, productiveMin: parseInt(e.target.value)||0})} className="w-full bg-[var(--text-main)]/5 p-3 rounded-xl text-xs font-mono text-[var(--text-main)] border border-[var(--text-main)]/10 shadow-inner" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[var(--text-main)] opacity-50 uppercase ml-2 font-mono">Min Offline</span>
                  <input type="number" value={thresholds.offlineMin} onChange={e => setThresholds({...thresholds, offlineMin: parseInt(e.target.value)||0})} className="w-full bg-[var(--text-main)]/5 p-3 rounded-xl text-xs font-mono text-[var(--text-main)] border border-[var(--text-main)]/10 shadow-inner" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[var(--text-main)] opacity-50 uppercase ml-2 font-mono">Min Sleep</span>
                  <input type="number" value={thresholds.sleepMin} onChange={e => setThresholds({...thresholds, sleepMin: parseInt(e.target.value)||0})} className="w-full bg-[var(--text-main)]/5 p-3 rounded-xl text-xs font-mono text-[var(--text-main)] border border-[var(--text-main)]/10 shadow-inner" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center ml-1">
                 <label className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 tracking-widest">Neural Segments</label>
                 <button onClick={addSegment} className="p-1.5 bg-[var(--text-main)]/5 rounded-lg text-indigo-400 hover:bg-indigo-400/10 transition-colors"><Plus size={14}/></button>
               </div>
               <div className="flex flex-wrap gap-2">
                 {segments.map((s: string) => (
                   <div key={s} className="bg-[var(--text-main)]/5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border border-[var(--text-main)]/10 flex items-center gap-2 group text-[var(--text-main)]">
                     {s}
                     <button onClick={() => setSegments(segments.filter((x: string) => x !== s))} className="opacity-100 transition-opacity text-rose-400 p-0.5"><X size={10}/></button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
        
        {/* Tab Content: System */}
        {activeTab === 'system' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            
            <div className="space-y-3">
               <label className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 tracking-widest ml-1">Data Management</label>
               <div className="flex gap-3">
                 <button onClick={handleExport} className="flex-1 p-3 bg-[var(--text-main)]/5 rounded-xl border border-[var(--text-main)]/10 flex flex-col items-center gap-2 hover:bg-[var(--text-main)]/10 transition-colors">
                   <Download size={18} className="text-[var(--accent-primary)]" />
                   <span className="text-[10px] font-mono uppercase text-[var(--text-main)]">Export JSON</span>
                 </button>
                 <label className="flex-1 p-3 bg-[var(--text-main)]/5 rounded-xl border border-[var(--text-main)]/10 flex flex-col items-center gap-2 hover:bg-[var(--text-main)]/10 transition-colors cursor-pointer">
                   <Upload size={18} className="text-emerald-400" />
                   <span className="text-[10px] font-mono uppercase text-[var(--text-main)]">Import Data</span>
                   <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                 </label>
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 tracking-widest ml-1">Focus & Privacy</label>
               <div className="space-y-2">
                 <div className="flex items-center justify-between p-3 bg-[var(--text-main)]/5 rounded-xl border border-[var(--text-main)]/10">
                   <div className="flex items-center gap-3">
                     <Shield size={16} className={strictMode ? "text-rose-400" : "text-[var(--text-main)] opacity-50"} />
                     <div>
                       <p className="text-xs font-mono text-[var(--text-main)]">Strict Mode</p>
                       <p className="text-[8px] font-mono text-[var(--text-main)] opacity-50">Disables habit deletion for today</p>
                     </div>
                   </div>
                   <button onClick={() => setStrictMode(!strictMode)} className={`w-10 h-5 rounded-full transition-colors relative ${strictMode ? 'bg-rose-500' : 'bg-[var(--text-main)]/20'}`}>
                     <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${strictMode ? 'left-6' : 'left-1'}`} />
                   </button>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 bg-[var(--text-main)]/5 rounded-xl border border-[var(--text-main)]/10">
                   <div className="flex items-center gap-3">
                     <Smartphone size={16} className={hapticFeedback ? "text-[var(--accent-primary)]" : "text-[var(--text-main)] opacity-50"} />
                     <div>
                       <p className="text-xs font-mono text-[var(--text-main)]">Haptic Feedback</p>
                       <p className="text-[8px] font-mono text-[var(--text-main)] opacity-50">Vibrate on actions (mobile)</p>
                     </div>
                   </div>
                   <button onClick={() => setHapticFeedback(!hapticFeedback)} className={`w-10 h-5 rounded-full transition-colors relative ${hapticFeedback ? 'bg-[var(--accent-primary)]' : 'bg-[var(--text-main)]/20'}`}>
                     <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${hapticFeedback ? 'left-6' : 'left-1'}`} />
                   </button>
                 </div>
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 tracking-widest ml-1">System Telemetry</label>
               <div className="p-4 bg-[var(--text-main)]/5 rounded-xl border border-[var(--text-main)]/10 space-y-3">
                 <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <Database size={14} className="text-[var(--text-main)] opacity-50" />
                     <span className="text-[10px] font-mono text-[var(--text-main)] opacity-70">Storage Insights</span>
                   </div>
                   <span className="text-[10px] font-mono text-[var(--text-main)] opacity-80">
                     {Object.keys(useAppStore.getState().localData || {}).length} days tracked • {habits.length} active habits
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <Activity size={14} className="text-[var(--text-main)] opacity-50" />
                     <span className="text-[10px] font-mono text-[var(--text-main)] opacity-70">System Initialized</span>
                   </div>
                   <span className="text-[10px] font-mono text-[var(--text-main)]">{new Date(createdAt).toLocaleDateString()}</span>
                 </div>
               </div>
            </div>

          </div>
        )}
        
        {/* Auto-Save Indicator instead of big button */}
        <div className="flex items-center justify-center gap-2 mt-6 py-4">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 tracking-widest">Settings Auto-Synced</span>
        </div>

        <button onClick={() => setShowAbout(true)} className="w-full py-4 bg-[var(--text-main)]/5 border border-[var(--text-main)]/10 rounded-xl text-[10px] font-mono uppercase text-[var(--text-main)] opacity-60 hover:opacity-100 transition-all shadow-md mt-2">About Us</button>

        <div className="mt-8 pt-6 border-t border-rose-500/20">
          {showResetConfirm ? (
            <div className="p-4 border border-rose-500/50 bg-rose-500/10 rounded-xl space-y-3 animate-in fade-in">
              <p className="text-xs text-rose-400 font-mono uppercase text-center">Wipe all neural data?</p>
              <div className="flex gap-2">
                <button onClick={() => { localStorage.removeItem('life-sync-pro-storage'); window.location.reload(); }} className="flex-1 py-2 bg-rose-500 text-white text-[10px] font-mono rounded-lg active:scale-95 transition-all">Confirm</button>
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 bg-[var(--text-main)]/10 text-[var(--text-main)] text-[10px] font-mono rounded-lg active:scale-95 transition-all hover:bg-[var(--text-main)]/20">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowResetConfirm(true)} className="w-full py-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 font-mono uppercase text-[10px] hover:bg-rose-500 hover:text-white transition-all active:scale-95">
              Factory Reset (Wipe Data)
            </button>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-[8px] font-mono text-[var(--text-main)] opacity-30 tracking-widest uppercase">Life Sync OS v2.0 (Neural Edition)</p>
        </div>
      </div>

      {showAbout && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 animate-in" onClick={() => setShowAbout(false)}>
          <div className="bg-[var(--card-bg)] border border-[var(--text-main)]/10 rounded-[2rem] p-8 w-full max-w-sm space-y-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-primary)] shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.5)]" />
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-mono uppercase text-[var(--text-main)] tracking-tighter">System Info</h2>
              <X className="cursor-pointer text-[var(--text-main)] opacity-50 hover:opacity-100 transition-colors p-2" size={20} onClick={() => setShowAbout(false)} />
            </div>
            <div className="space-y-4 text-xs font-mono leading-relaxed text-[var(--text-main)] opacity-80">
              <p><b className="text-[var(--text-main)] opacity-100">Developer:</b> AM SAIMUM</p>
              <p><b className="text-[var(--text-main)] opacity-100">Organization:</b> Comilla University, Bangladesh</p>
              <p><b className="text-[var(--text-main)] opacity-100">Protocol:</b> Life Sync Pro is a neural-inspired OS designed to harmonize high-performance ambition with cognitive energy management. It leverages strategic feedback loops to optimize daily output and mental energy ROI.</p>
            </div>
            <button onClick={() => setShowAbout(false)} className="w-full py-4 bg-[var(--accent-primary)] rounded-xl text-white font-mono uppercase text-[10px] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Synchronize Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
};
