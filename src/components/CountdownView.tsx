import React, { useState } from 'react';
import { Clock, Trash2, ShieldAlert, Coffee } from 'lucide-react';
import { AppMode } from '../../types';

export const CountdownView = ({ selectedDate, setSelectedDate, addNotification, customPrompt, targetBaseMode, showSuccessToast, appMode }: any) => {
  const [events, setEvents] = useState<any[]>(() => JSON.parse(localStorage.getItem('lsp_v12_events') || '[]'));
  const add = async () => {
    const text = await customPrompt("Capture Milestone Name:");
    if(text) {
      const newList = [...events, {id: Date.now() + Math.random(), date: selectedDate, text}];
      setEvents(newList);
      localStorage.setItem('lsp_v12_events', JSON.stringify(newList));
      addNotification(`Milestone Registered: ${text} for ${selectedDate}`);
      if (showSuccessToast) showSuccessToast("MILESTONE REGISTERED");
    }
  };
  const isTarget = appMode === AppMode.TARGET;
  const isVacation = appMode === AppMode.VACATION;

  return (
    <div className="space-y-6 animate-in w-full max-w-md mx-auto">
      <div className={`${isTarget ? 'bg-red-600' : isVacation ? 'bg-emerald-600' : 'bg-cyan-600'} p-5 rounded-[1.5rem] text-white shadow-xl transition-colors`}>
        <h2 className="text-lg font-mono uppercase flex items-center gap-2">
          {isTarget ? <ShieldAlert size={16}/> : isVacation ? <Coffee size={16}/> : <Clock size={16}/>} 
          {isTarget ? 'Target Base Timeline' : isVacation ? 'Recovery Timeline' : 'Milestone Matrix'}
        </h2>
        <p className="text-[10px] font-mono uppercase tracking-widest opacity-80 mt-2 leading-relaxed">
          {isTarget 
            ? `Map strategic dates to achieve: ${targetBaseMode?.target}` 
            : isVacation 
            ? 'Track days of rest, healing, and spiritual rejuvenation.'
            : 'Map future strategic dates. Prevent long-term friction.'}
        </p>
      </div>
      <div className={`bg-slate-900 p-5 rounded-[1.5rem] border grid grid-cols-7 gap-1.5 shadow-2xl ${isTarget ? 'border-red-500/20' : isVacation ? 'border-emerald-500/20' : 'border-white/5'}`}>
        {Array.from({length: 31}, (_, i) => i+1).map(d => {
          const dateStr = `2026-01-${String(d).padStart(2,'0')}`;
          const isSelected = selectedDate === dateStr;
          return (
            <button key={d} onClick={() => setSelectedDate(dateStr)} className={`aspect-square rounded-lg text-[10px] font-mono transition-all ${isSelected ? (isTarget ? 'bg-red-600 text-white shadow-lg' : isVacation ? 'bg-emerald-600 text-white shadow-lg' : 'bg-cyan-600 text-white shadow-lg') : 'bg-white/5 text-slate-500'}`}>
              {d}
              {events.some(e => e.date === dateStr) && <div className={`w-1 h-1 rounded-full mx-auto mt-0.5 ${isTarget ? 'bg-red-400' : isVacation ? 'bg-emerald-400' : 'bg-cyan-400'}`} />}
            </button>
          );
        })}
      </div>
      <button onClick={add} className={`w-full py-4 bg-white/5 border border-dashed rounded-[1.5rem] font-mono uppercase text-[10px] tracking-widest active:scale-95 transition-all hover:bg-white/10 hover:text-white ${isTarget ? 'border-red-500/20 text-red-500 hover:border-red-500/40 hover:text-red-400' : isVacation ? 'border-emerald-500/20 text-emerald-500 hover:border-emerald-500/40 hover:text-emerald-400' : 'border-white/10 text-slate-500'}`}>Add Event on {selectedDate}</button>
      <div className="space-y-2">
        {events.filter(e => e.date === selectedDate).map(e => <div key={e.id} className={`p-3.5 bg-slate-900 rounded-[1.25rem] border text-xs font-mono text-white shadow-sm flex justify-between items-center group ${isTarget ? 'border-red-500/20' : isVacation ? 'border-emerald-500/20' : 'border-white/5'}`}>
          <span>{e.text}</span>
          <button onClick={() => {
            const up = events.filter(x => x.id !== e.id);
            setEvents(up);
            localStorage.setItem('lsp_v12_events', JSON.stringify(up));
          }} className="text-slate-700 hover:text-rose-500 transition-colors p-1.5"><Trash2 size={14}/></button>
        </div>)}
      </div>
    </div>
  );
};
