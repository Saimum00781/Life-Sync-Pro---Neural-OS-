import React, { useState } from 'react';
import { Award, Trophy, Target, Activity, Smartphone, Sparkles, Zap, Moon } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

export const ProductivityHub: React.FC<any> = ({ data, userName }) => {
  const [activeSub, setActiveSub] = useState<'Daily'|'Weekly'>('Daily');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = data[todayStr] || { goals: [], studyLogs: [], deviceTime: '0', habits: [], leisureDeviceTime: 0, productiveDeviceTime: 0, offlineTime: 0, sleepTime: 0, waterIntake: 0 };
  
  const done = todayData.goals.filter((g: any) => g.done).length;
  const total = todayData.goals.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const activeMins = todayData.studyLogs ? todayData.studyLogs.reduce((acc: number, cur: any) => acc + parseInt(cur.time), 0) : 0;
  const leisureMins = todayData.leisureDeviceTime || 0;
  const productiveMins = todayData.productiveDeviceTime || 0;
  const offlineMins = todayData.offlineTime || 0;
  const sleepMins = todayData.sleepTime || 0;
  const habitsDone = todayData.habits?.length || 0;

  return (
    <div className="space-y-6 animate-in pb-12 w-full max-w-md mx-auto">
      <SectionHeader 
        title="Command Center" 
        subtitle="Operational Analytics" 
        infoText="Your daily performance metrics visualized in a high-density bento grid. Monitor your neural output and digital exposure."
        icon={Trophy}
        colorClass="text-indigo-400"
      />

      <div className="bg-slate-900/50 p-5 rounded-[2rem] border border-white/5 flex items-center gap-4 shadow-xl backdrop-blur-md">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-xl font-mono text-white shadow-lg">{userName[0]}</div>
        <div>
          <h2 className="text-lg font-mono uppercase text-white tracking-tight">{userName}</h2>
          <p className="text-[10px] font-mono uppercase text-indigo-400 tracking-widest flex items-center gap-1.5 mt-1"><Award size={10}/> Tier-1 Operational</p>
        </div>
      </div>

      <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl">
        {['Daily', 'Weekly'].map(t => (
          <button key={t} onClick={() => setActiveSub(t as any)} className={`flex-1 py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${activeSub === t ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Main Progress (Spans 2 columns) */}
        <div className="col-span-2 bg-slate-900 p-5 rounded-[1.5rem] border border-white/5 flex items-center justify-between shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2 text-indigo-400 mb-3">
              <Target size={14} />
              <h4 className="text-[10px] font-mono uppercase tracking-widest">Objectives</h4>
            </div>
            <p className="text-3xl font-mono text-white">{done} <span className="text-lg text-slate-500">/ {total}</span></p>
            <p className="text-[8px] font-mono uppercase tracking-widest text-slate-400">Tasks Synchronized</p>
          </div>
          <div className="relative w-20 h-20 z-10">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" stroke="#1e293b" strokeWidth="8" fill="transparent" />
              <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={201} strokeDashoffset={201 - (201 * percent) / 100} className="text-indigo-500 transition-all duration-1000" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-mono text-white">{percent}%</div>
          </div>
        </div>

        {/* Productive / Offline */}
        <div className="bg-emerald-900/20 p-4 rounded-[1.5rem] border border-emerald-500/20 shadow-lg flex flex-col justify-between aspect-square">
          <div className="flex items-center gap-2 text-emerald-400">
            <Activity size={12} />
            <h4 className="text-[10px] font-mono uppercase tracking-widest">Productive</h4>
          </div>
          <div>
            <p className="text-2xl font-mono text-white">{Math.floor((productiveMins + offlineMins)/60)}<span className="text-sm text-emerald-500">h</span> {(productiveMins + offlineMins)%60}<span className="text-sm text-emerald-500">m</span></p>
            <p className="text-[8px] font-mono uppercase tracking-widest text-emerald-500/70 mt-1">Total Output</p>
          </div>
        </div>

        {/* Leisure Screen Time */}
        <div className="bg-rose-900/20 p-4 rounded-[1.5rem] border border-rose-500/20 shadow-lg flex flex-col justify-between aspect-square">
          <div className="flex items-center gap-2 text-rose-400">
            <Smartphone size={12} />
            <h4 className="text-[10px] font-mono uppercase tracking-widest">Leisure</h4>
          </div>
          <div>
            <p className="text-2xl font-mono text-white">{Math.floor(leisureMins/60)}<span className="text-sm text-rose-500">h</span> {leisureMins%60}<span className="text-sm text-rose-500">m</span></p>
            <p className="text-[8px] font-mono uppercase tracking-widest text-rose-500/70 mt-1">Device Exposure</p>
          </div>
        </div>

        {/* Focus Chamber */}
        <div className="bg-indigo-900/20 p-4 rounded-[1.5rem] border border-indigo-500/20 shadow-lg flex flex-col justify-between aspect-square">
          <div className="flex items-center gap-2 text-indigo-400">
            <Zap size={12} />
            <h4 className="text-[10px] font-mono uppercase tracking-widest">Focus</h4>
          </div>
          <div>
            <p className="text-2xl font-mono text-white">{Math.floor(activeMins/60)}<span className="text-sm text-indigo-500">h</span> {activeMins%60}<span className="text-sm text-indigo-500">m</span></p>
            <p className="text-[8px] font-mono uppercase tracking-widest text-indigo-500/70 mt-1">Deep Work</p>
          </div>
        </div>

        {/* Sleep Time */}
        <div className="bg-blue-900/20 p-4 rounded-[1.5rem] border border-blue-500/20 shadow-lg flex flex-col justify-between aspect-square">
          <div className="flex items-center gap-2 text-blue-400">
            <Moon size={12} />
            <h4 className="text-[10px] font-mono uppercase tracking-widest">Sleep</h4>
          </div>
          <div>
            <p className="text-2xl font-mono text-white">{Math.floor(sleepMins/60)}<span className="text-sm text-blue-500">h</span> {sleepMins%60}<span className="text-sm text-blue-500">m</span></p>
            <p className="text-[8px] font-mono uppercase tracking-widest text-blue-500/70 mt-1">Recovery Phase</p>
          </div>
        </div>

        {/* Habits / Loops */}
        <div className="col-span-2 bg-slate-900 p-4 rounded-[1.5rem] border border-white/5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
              <Sparkles size={14} />
            </div>
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Neural Loops</h4>
              <p className="text-sm font-mono text-white">{habitsDone} Executed</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-mono uppercase tracking-widest text-slate-500">Daily Routine</p>
          </div>
        </div>
      </div>
    </div>
  );
};
