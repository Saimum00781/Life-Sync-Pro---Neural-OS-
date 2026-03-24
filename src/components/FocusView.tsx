import React, { useState, useEffect } from 'react';
import { Timer, X, Zap, Clock, ShieldAlert, Coffee } from 'lucide-react';
import { AppMode } from '../../types';

export const FocusView: React.FC<any> = ({ currentDay, updateDayData, targetBaseMode, showSuccessToast, appMode }) => {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let timer: any;
    if (isActive && time > 0) {
      timer = setInterval(() => setTime(t => t - 1), 1000);
    } else if (time === 0 && isActive) {
      setIsActive(false);
      if (mode === 'work') {
        const currentDayStr = new Date().toISOString().split('T')[0];
        const newLog = { id: Date.now().toString() + Math.random().toString(), category: 'Deep Work', topic: 'Focus Session', time: '25' };
        updateDayData(currentDayStr, { 
          studyLogs: [...(currentDay?.studyLogs || []), newLog]
        });
        if (showSuccessToast) showSuccessToast("FOCUS SESSION LOGGED");
      }
    }
    return () => clearInterval(timer);
  }, [isActive, time, mode, currentDay, updateDayData, showSuccessToast]);

  const switchMode = (m: 'work' | 'break') => {
    setMode(m);
    setTime(m === 'work' ? 25 * 60 : 5 * 60);
    setIsActive(false);
  };

  const isTarget = appMode === AppMode.TARGET;
  const isVacation = appMode === AppMode.VACATION;

  return (
    <div className="space-y-6 animate-in w-full max-w-md mx-auto">
      <div className={`${isTarget ? 'bg-red-600' : isVacation ? 'bg-emerald-600' : 'bg-indigo-600'} p-5 rounded-[1.5rem] text-white shadow-xl transition-colors`}>
        <h2 className="text-lg font-mono uppercase flex items-center gap-2">
          {isTarget ? <ShieldAlert size={16}/> : isVacation ? <Coffee size={16}/> : <Timer size={16}/>} 
          {isTarget ? 'Target Base Chamber' : isVacation ? 'Recovery Chamber' : 'Focus Chamber'}
        </h2>
        <p className="text-[10px] font-mono uppercase tracking-widest opacity-80 mt-2 leading-relaxed">
          {isTarget 
            ? `Absolute focus required. Every second must serve: ${targetBaseMode?.target}` 
            : isVacation 
            ? 'Use this timer for meditation, deep breathing, or structured rest.'
            : '25/5 interval protocol. Breaks are mandatory for creative synthesis.'}
        </p>
      </div>
      
      <div className="flex gap-2 bg-white/5 p-1.5 rounded-[1.5rem]">
        <button onClick={() => switchMode('work')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest ${mode === 'work' ? (isTarget ? 'bg-red-600 text-white shadow-md' : isVacation ? 'bg-emerald-600 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md') : 'text-slate-500'}`}>{isVacation ? 'Meditation (25m)' : 'Work (25m)'}</button>
        <button onClick={() => switchMode('break')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest ${mode === 'break' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500'}`}>{isVacation ? 'Rest (5m)' : 'Break (5m)'}</button>
      </div>

      <div className={`bg-slate-900 p-8 rounded-[2rem] border border-white/5 text-center space-y-10 shadow-2xl relative overflow-hidden ${isTarget ? 'border-red-500/20' : isVacation ? 'border-emerald-500/20' : ''}`}>
        <div className={`absolute top-0 left-0 h-1 transition-all duration-1000 ${mode === 'work' ? (isTarget ? 'bg-red-600' : isVacation ? 'bg-emerald-600' : 'bg-indigo-600') : 'bg-emerald-600'}`} style={{ width: `${(time / (mode === 'work' ? 25*60 : 5*60)) * 100}%` }} />
        <div className="text-6xl font-mono tracking-tighter text-white tabular-nums drop-shadow-2xl mt-4">
          {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
        </div>
        <div className="flex justify-center gap-4 pb-4">
          <button onClick={() => setIsActive(!isActive)} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all ${isActive ? 'bg-rose-500 text-white' : (isTarget ? 'bg-red-600 text-white active:scale-95' : isVacation ? 'bg-emerald-600 text-white active:scale-95' : 'bg-indigo-600 text-white active:scale-95')}`}>
            {isActive ? <X size={24}/> : <Zap size={24}/>}
          </button>
          <button onClick={() => switchMode(mode)} className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white active:scale-95"><Clock size={24}/></button>
        </div>
      </div>
    </div>
  );
};
