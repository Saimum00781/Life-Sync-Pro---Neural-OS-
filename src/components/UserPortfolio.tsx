import React from 'react';
import { User, Briefcase, MapPin, Activity, Heart, BrainCircuit, Target, Shield } from 'lucide-react';

export const UserPortfolio = ({ userName, gender, healthProfile, coreIdentity, setHealthProfile }: any) => {
  return (
    <div className="space-y-8 animate-in pb-12 w-full max-w-2xl mx-auto">
      
      {/* Header Section */}
      <div className="bg-slate-900/80 p-8 rounded-[2rem] border border-white/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent pointer-events-none" />
        
        <div className={`w-32 h-32 rounded-3xl flex items-center justify-center text-6xl shadow-2xl z-10 ${gender === 'boy' ? 'bg-gradient-to-br from-teal-500 to-emerald-800' : gender === 'girl' ? 'bg-gradient-to-br from-rose-500 to-pink-800' : 'bg-gradient-to-br from-[var(--accent-primary)] to-indigo-800'}`}>
          {gender === 'boy' ? '👨‍🚀' : gender === 'girl' ? '👩‍🚀' : '👤'}
        </div>
        
        <div className="text-center md:text-left z-10 flex-1">
          <h2 className="text-3xl font-black uppercase text-white tracking-tighter">{userName}</h2>
          <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
            <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-mono uppercase tracking-widest text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              {gender || 'Unknown'} Operator
            </span>
            <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-mono uppercase tracking-widest text-slate-400 border border-white/5">
              Level 12
            </span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identity & Work */}
        <div className="bg-slate-900/60 p-6 rounded-[1.5rem] border border-white/5 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-mono uppercase text-white tracking-widest">Identity Profile</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-500 block tracking-widest ml-1 mb-1">Core Identity</label>
              <p className="text-sm text-slate-300 font-medium bg-black/20 p-3 rounded-xl border border-white/5">{coreIdentity || 'Not defined'}</p>
            </div>
            
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-500 block tracking-widest ml-1 mb-1">Occupation / Work</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  value={healthProfile.workInfo || ''} 
                  onChange={e => setHealthProfile({ ...healthProfile, workInfo: e.target.value })}
                  placeholder="e.g. Software Engineer"
                  className="w-full bg-black/40 pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none font-mono text-white focus:border-[var(--accent-primary)] transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-500 block tracking-widest ml-1 mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  value={healthProfile.location || ''} 
                  onChange={e => setHealthProfile({ ...healthProfile, location: e.target.value })}
                  placeholder="e.g. Neo Tokyo"
                  className="w-full bg-black/40 pl-10 pr-4 py-3 rounded-xl border border-white/5 outline-none font-mono text-white focus:border-[var(--accent-primary)] transition-all text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Physical Metrics */}
        <div className="bg-slate-900/60 p-6 rounded-[1.5rem] border border-white/5 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-mono uppercase text-white tracking-widest">Physical Metrics</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-500 block tracking-widest mb-2">Height (cm)</span>
              <input 
                type="number"
                value={healthProfile.height || 170} 
                onChange={e => setHealthProfile({ ...healthProfile, height: parseInt(e.target.value) || 0 })}
                className="w-full bg-transparent text-center text-2xl font-black text-white outline-none"
              />
            </div>
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-500 block tracking-widest mb-2">Weight (kg)</span>
              <input 
                type="number"
                value={healthProfile.weight || 65} 
                onChange={e => setHealthProfile({ ...healthProfile, weight: parseInt(e.target.value) || 0 })}
                className="w-full bg-transparent text-center text-2xl font-black text-white outline-none"
              />
            </div>
          </div>
          
          <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-widest">BMI Index</span>
              <span className="text-xs font-bold text-emerald-400">
                {((healthProfile.weight || 65) / Math.pow((healthProfile.height || 170) / 100, 2)).toFixed(1)}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[45%]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
