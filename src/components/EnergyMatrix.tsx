import React, { useState } from 'react';
import { Clock, Save, Activity, Smartphone, Moon, Briefcase, Plus, Minus, ShieldAlert, Coffee } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { AppMode } from '../../types';

export const EnergyMatrix: React.FC<any> = ({ currentDay, updateDayData, thresholds, targetBaseMode, showSuccessToast, appMode }) => {
  const currentDayStr = new Date().toISOString().split('T')[0];
  
  const [leisure, setLeisure] = useState(currentDay?.leisureDeviceTime || 0);
  const [productive, setProductive] = useState(currentDay?.productiveDeviceTime || 0);
  const [offline, setOffline] = useState(currentDay?.offlineTime || 0);
  const [sleep, setSleep] = useState(currentDay?.sleepTime || 420);

  const totalMins = leisure + productive + offline + sleep;
  const remaining = 1440 - totalMins;

  const isTarget = appMode === AppMode.TARGET;
  const isVacation = appMode === AppMode.VACATION;

  const handleSave = () => {
    updateDayData(currentDayStr, {
      leisureDeviceTime: leisure,
      productiveDeviceTime: productive,
      offlineTime: offline,
      sleepTime: sleep
    });
    if (showSuccessToast) showSuccessToast("MATRIX SYNCHRONIZED");
  };

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const adjustTime = (setter: any, current: number, amount: number) => {
    setter(Math.max(0, Math.min(1440, current + amount)));
  };

  const getStatusColor = (val: number, type: 'leisure' | 'productive' | 'offline' | 'sleep') => {
    if (type === 'leisure') {
      if (val <= thresholds.leisureMax * 0.5) return 'text-emerald-400 border-emerald-500/30';
      if (val <= thresholds.leisureMax) return 'text-amber-400 border-amber-500/30';
      return 'text-rose-400 border-rose-500/30';
    } else if (type === 'productive' || type === 'offline') {
      const min = type === 'productive' ? thresholds.productiveMin : thresholds.offlineMin;
      if (val >= min) return 'text-emerald-400 border-emerald-500/30';
      if (val >= min * 0.5) return 'text-amber-400 border-amber-500/30';
      return 'text-rose-400 border-rose-500/30';
    } else {
      if (val >= thresholds.sleepMin) return 'text-emerald-400 border-emerald-500/30';
      if (val >= thresholds.sleepMin * 0.8) return 'text-amber-400 border-amber-500/30';
      return 'text-rose-400 border-rose-500/30';
    }
  };

  const getBarColor = (type: 'leisure' | 'productive' | 'offline' | 'sleep') => {
    if (type === 'leisure') return 'bg-rose-500';
    if (type === 'productive') return 'bg-indigo-500';
    if (type === 'offline') return 'bg-emerald-500';
    return 'bg-cyan-500';
  };

  const renderControl = (label: string, value: number, setter: (v: number) => void, icon: any, type: 'leisure' | 'productive' | 'offline' | 'sleep') => {
    const Icon = icon;
    const colorClass = getStatusColor(value, type);
    
    return (
      <div className={`p-4 rounded-[1.5rem] border bg-slate-900/50 backdrop-blur-sm transition-all shadow-lg ${colorClass}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-white/5`}>
              <Icon size={16} />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300">{label}</span>
          </div>
          <span className="text-lg font-mono text-white">{formatTime(value)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => adjustTime(setter, value, -30)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 active:scale-95 transition-all"><Minus size={14}/></button>
          <div className="flex-1 grid grid-cols-3 gap-1.5">
            <button onClick={() => adjustTime(setter, value, 15)} className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 active:scale-95 transition-all">+15m</button>
            <button onClick={() => adjustTime(setter, value, 30)} className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 active:scale-95 transition-all">+30m</button>
            <button onClick={() => adjustTime(setter, value, 60)} className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 active:scale-95 transition-all">+1h</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in pb-24 w-full max-w-md mx-auto">
      <SectionHeader 
        title={isTarget ? "Target Matrix" : isVacation ? "Recovery Matrix" : "Chronos Matrix"} 
        subtitle="24-Hour Distribution" 
        infoText={isTarget ? "Strictly allocate your 24 hours to maximize target output." : isVacation ? "Allocate time for rest, healing, and spiritual growth." : "Allocate your 24 hours. Quick-log your activities to maintain an accurate neural map of your day."}
        icon={isTarget ? ShieldAlert : isVacation ? Coffee : Clock}
        colorClass={isTarget ? "text-red-400" : isVacation ? "text-emerald-400" : "text-indigo-400"}
      />

      {isTarget && targetBaseMode && (
        <div className="bg-red-950/40 p-4 rounded-2xl border border-red-500/30 mb-6 flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-red-400 mb-1">Target Base Mode</h3>
            <p className="text-sm font-bold text-white leading-tight">Every minute logged must serve: {targetBaseMode.target}</p>
          </div>
        </div>
      )}

      {isVacation && (
        <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30 mb-6 flex items-start gap-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
            <Coffee size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-1">Grace Mode Active</h3>
            <p className="text-sm font-bold text-white leading-tight">Prioritize sleep and offline recovery.</p>
          </div>
        </div>
      )}

      <div className={`bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden ${isTarget ? 'border-red-500/20' : isVacation ? 'border-emerald-500/20' : ''}`}>
        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${isTarget ? 'bg-red-500/10' : isVacation ? 'bg-emerald-500/10' : 'bg-indigo-500/10'}`} />
        
        <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">Unallocated Time</p>
            <p className={`text-3xl font-mono tracking-tighter ${remaining < 0 ? 'text-rose-400' : 'text-white'}`}>
              {remaining < 0 ? `-${formatTime(Math.abs(remaining))}` : formatTime(remaining)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Total Logged</p>
            <p className="text-sm font-mono text-slate-300">{formatTime(totalMins)}</p>
          </div>
        </div>
        
        <div className="flex h-4 rounded-full overflow-hidden bg-black/40 border border-white/5 relative z-10 shadow-inner">
          <div className={`${getBarColor('leisure')} transition-all duration-500`} style={{ width: `${(leisure / 1440) * 100}%` }} title="Leisure" />
          <div className={`${getBarColor('productive')} transition-all duration-500`} style={{ width: `${(productive / 1440) * 100}%` }} title="Productive" />
          <div className={`${getBarColor('offline')} transition-all duration-500`} style={{ width: `${(offline / 1440) * 100}%` }} title="Offline" />
          <div className={`${getBarColor('sleep')} transition-all duration-500`} style={{ width: `${(sleep / 1440) * 100}%` }} title="Sleep" />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"/><span className="text-[9px] font-mono uppercase text-slate-300 tracking-wider">Leisure</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"/><span className="text-[9px] font-mono uppercase text-slate-300 tracking-wider">Productive</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"/><span className="text-[9px] font-mono uppercase text-slate-300 tracking-wider">Offline</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"/><span className="text-[9px] font-mono uppercase text-slate-300 tracking-wider">Sleep</span></div>
        </div>
      </div>

      <div className="space-y-3">
        {renderControl("Leisure Device", leisure, setLeisure, Smartphone, 'leisure')}
        {!isVacation && renderControl("Productive Device", productive, setProductive, Briefcase, 'productive')}
        {renderControl("Offline Active", offline, setOffline, Activity, 'offline')}
        {renderControl("Sleep / Recovery", sleep, setSleep, Moon, 'sleep')}
      </div>

      <button 
        onClick={handleSave}
        className={`w-full py-4 text-white rounded-[1.5rem] font-mono uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 ${isTarget ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : isVacation ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}`}
      >
        <Save size={14} /> Sync Matrix
      </button>
    </div>
  );
};
