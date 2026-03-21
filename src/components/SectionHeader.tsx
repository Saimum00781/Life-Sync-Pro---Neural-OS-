import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export const SectionHeader = ({ title, subtitle, infoText, icon: Icon, colorClass = "text-[var(--accent-primary)]" }: any) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="mb-5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={14} className={colorClass} />}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-white">{title}</h2>
            {subtitle && <p className={`text-[8px] font-mono uppercase tracking-widest ${colorClass} opacity-80 mt-0.5`}>{subtitle}</p>}
          </div>
        </div>
        {infoText && (
          <button onClick={() => setShowInfo(!showInfo)} className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            {showInfo ? <X size={12} /> : <Info size={12} />}
          </button>
        )}
      </div>
      {showInfo && infoText && (
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-mono text-slate-300 leading-relaxed animate-in">
          {infoText}
        </div>
      )}
    </div>
  );
};
