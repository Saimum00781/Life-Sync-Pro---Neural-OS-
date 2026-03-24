import React, { useState } from 'react';
import { AppMode } from '../../types';
import { ShieldAlert, Coffee, Activity, Clock, Check } from 'lucide-react';

export const ModeSwitcher = ({ appMode, setAppMode, modeExpiration }: { appMode: AppMode, setAppMode: (m: AppMode, exp?: number | null) => void, modeExpiration?: number | null }) => {
  const [pendingMode, setPendingMode] = useState<AppMode | null>(null);
  const [duration, setDuration] = useState<number | null>(null); // hours

  const handleSave = () => {
    if (pendingMode) {
      const exp = duration ? Date.now() + duration * 60 * 60 * 1000 : null;
      setAppMode(pendingMode, exp);
      setPendingMode(null);
      setDuration(null);
    }
  };

  const getExpirationText = () => {
    if (!modeExpiration) return null;
    const hoursLeft = Math.max(0, Math.round((modeExpiration - Date.now()) / (1000 * 60 * 60)));
    if (hoursLeft > 24) return `${Math.round(hoursLeft / 24)}d left`;
    return `${hoursLeft}h left`;
  };

  return (
    <div className="mb-6">
      <div className="bg-black/20 border border-white/5 rounded-2xl p-2 flex gap-2">
        <button 
          onClick={() => { setAppMode(AppMode.NORMAL, null); setPendingMode(null); }}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest transition-all ${appMode === AppMode.NORMAL && !pendingMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner' : 'text-slate-500 hover:bg-white/5 border border-transparent'}`}
        >
          <Activity size={14} /> Normal
        </button>
        <button 
          onClick={() => setPendingMode(AppMode.TARGET)}
          className={`flex-1 py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-widest transition-all ${(appMode === AppMode.TARGET && !pendingMode) || pendingMode === AppMode.TARGET ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-inner' : 'text-slate-500 hover:bg-white/5 border border-transparent'}`}
        >
          <div className="flex items-center gap-2"><ShieldAlert size={14} /> Target</div>
          {appMode === AppMode.TARGET && modeExpiration && !pendingMode && <span className="text-[8px] opacity-70">{getExpirationText()}</span>}
        </button>
        <button 
          onClick={() => setPendingMode(AppMode.VACATION)}
          className={`flex-1 py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-widest transition-all ${(appMode === AppMode.VACATION && !pendingMode) || pendingMode === AppMode.VACATION ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner' : 'text-slate-500 hover:bg-white/5 border border-transparent'}`}
        >
          <div className="flex items-center gap-2"><Coffee size={14} /> Grace</div>
          {appMode === AppMode.VACATION && modeExpiration && !pendingMode && <span className="text-[8px] opacity-70">{getExpirationText()}</span>}
        </button>
      </div>

      {pendingMode && (
        <div className="mt-2 bg-black/40 border border-white/10 rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2"><Clock size={12}/> Set Duration</span>
            <button onClick={() => setPendingMode(null)} className="text-slate-500 hover:text-slate-300 text-xs font-mono uppercase">Cancel</button>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: '24h', val: 24 },
              { label: '48h', val: 48 },
              { label: '1w', val: 168 },
              { label: '∞', val: null }
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => setDuration(opt.val)}
                className={`py-2 rounded-lg text-[10px] font-mono uppercase transition-all border ${duration === opt.val ? 'bg-white/10 text-white border-white/20' : 'bg-black/20 text-slate-500 border-white/5 hover:bg-white/5'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button 
            onClick={handleSave}
            className={`w-full py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${pendingMode === AppMode.TARGET ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}`}
          >
            <Check size={14} /> Save Mode
          </button>
        </div>
      )}
    </div>
  );
};
