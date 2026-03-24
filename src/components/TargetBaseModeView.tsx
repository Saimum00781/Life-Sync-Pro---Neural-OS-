import React, { useState } from 'react';
import { Target, Calendar, Zap, Power, ShieldAlert, X } from 'lucide-react';
import { TargetBaseModeConfig } from '../../store';
import { AppMode } from '../../types';

export const TargetBaseModeView = ({ targetBaseMode, setTargetBaseMode, onClose, appMode, setAppMode }: any) => {
  const [target, setTarget] = useState(targetBaseMode?.target || '');
  const [deadline, setDeadline] = useState(targetBaseMode?.deadline || '');
  const [pillars, setPillars] = useState<string[]>(targetBaseMode?.pillars || ['', '', '']);

  const handleActivate = () => {
    if (!target || !deadline || pillars.some(p => !p.trim())) return;
    setTargetBaseMode({ isActive: true, target, deadline, pillars });
    if (setAppMode) setAppMode(AppMode.TARGET);
    onClose();
  };

  const handleDeactivate = () => {
    setTargetBaseMode({ ...targetBaseMode, isActive: false });
    if (setAppMode) setAppMode(AppMode.NORMAL);
    onClose();
  };

  const updatePillar = (index: number, value: string) => {
    const newPillars = [...pillars];
    newPillars[index] = value;
    setPillars(newPillars);
  };

  return (
    <div className="space-y-8 animate-in pb-12 w-full max-w-2xl mx-auto">
      <div className="bg-red-950/40 p-8 rounded-[2rem] border border-red-500/20 flex flex-col items-center text-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
        <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-3xl font-black uppercase text-white tracking-tighter mb-2">Target Base Mode</h2>
        <p className="text-sm text-red-200/70 font-mono uppercase tracking-widest max-w-md">
          Enter a state of absolute hyper-focus. Reshape the entire system to serve a single, uncompromising objective.
        </p>
      </div>

      {targetBaseMode?.isActive ? (
        <div className="bg-slate-900/60 p-6 rounded-[1.5rem] border border-red-500/30 space-y-6 text-center">
          <h3 className="text-lg font-mono uppercase text-red-400 tracking-widest">Protocol Active</h3>
          <p className="text-sm text-slate-300">You are currently locked onto: <strong className="text-white">{targetBaseMode.target}</strong></p>
          <button 
            onClick={handleDeactivate}
            className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl font-mono uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all w-full flex items-center justify-center gap-2"
          >
            <Power size={16} /> Abort Protocol
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-6 rounded-[1.5rem] border border-white/5 space-y-6">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-500 block tracking-widest ml-1 mb-2">Grand Target</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                <input 
                  value={target} 
                  onChange={e => setTarget(e.target.value)}
                  placeholder="e.g. Become the greatest app developer"
                  className="w-full bg-black/40 pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none font-mono text-white focus:border-red-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-500 block tracking-widest ml-1 mb-2">Absolute Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                <input 
                  type="date"
                  value={deadline} 
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-black/40 pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none font-mono text-white focus:border-red-500/50 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-[1.5rem] border border-white/5 space-y-6">
            <h3 className="text-[10px] font-mono uppercase text-slate-500 tracking-widest">The 3 Core Pillars</h3>
            <p className="text-xs text-slate-400 mb-4">Define the 3 daily non-negotiable actions required to hit your target.</p>
            
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative">
                <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                <input 
                  value={pillars[i]} 
                  onChange={e => updatePillar(i, e.target.value)}
                  placeholder={`Pillar ${i + 1} (e.g. Code for 4 hours)`}
                  className="w-full bg-black/40 pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none font-mono text-white focus:border-red-500/50 transition-all text-sm"
                />
              </div>
            ))}
          </div>

          <button 
            onClick={handleActivate}
            disabled={!target || !deadline || pillars.some(p => !p.trim())}
            className="w-full py-4 bg-red-600 text-white rounded-xl font-mono uppercase tracking-widest hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
          >
            <Power size={16} /> Initiate Protocol
          </button>
        </div>
      )}
    </div>
  );
};
