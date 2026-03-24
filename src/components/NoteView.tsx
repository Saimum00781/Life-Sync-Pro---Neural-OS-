import React, { useState } from 'react';
import { StickyNote, Trash2, ShieldAlert, Coffee } from 'lucide-react';
import { AppMode } from '../../types';

export const NoteView = ({ customPrompt, targetBaseMode, showSuccessToast, appMode }: any) => {
  const [notes, setNotes] = useState<any[]>(() => JSON.parse(localStorage.getItem('lsp_v12_notes') || '[]'));
  const add = async () => {
    const text = await customPrompt("Capture Neural Insight:");
    if(text) {
      const up = [{id: Date.now() + Math.random(), text}, ...notes];
      setNotes(up);
      localStorage.setItem('lsp_v12_notes', JSON.stringify(up));
      if (showSuccessToast) showSuccessToast("TRACE CAPTURED");
    }
  };
  const isTarget = appMode === AppMode.TARGET;
  const isVacation = appMode === AppMode.VACATION;

  return (
    <div className="space-y-6 animate-in w-full max-w-md mx-auto">
      <div className={`${isTarget ? 'bg-red-600' : isVacation ? 'bg-emerald-600' : 'bg-amber-600'} p-5 rounded-[1.5rem] text-white shadow-xl transition-colors`}>
        <h2 className="text-lg font-mono uppercase flex items-center gap-2">
          {isTarget ? <ShieldAlert size={16}/> : isVacation ? <Coffee size={16}/> : <StickyNote size={16}/>} 
          {isTarget ? 'Target Base Notes' : isVacation ? 'Recovery Journal' : 'Neural Notes'}
        </h2>
        <p className="text-[10px] font-mono uppercase tracking-widest opacity-80 mt-2 leading-relaxed">
          {isTarget 
            ? `Capture insights strictly related to: ${targetBaseMode?.target}` 
            : isVacation 
            ? 'Document your healing process, gratitude, and spiritual reflections.'
            : 'Offload transient trace data to free up active memory capacity.'}
        </p>
      </div>
      <button onClick={add} className={`w-full p-8 border border-dashed rounded-[1.5rem] font-mono uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-inner ${isTarget ? 'bg-red-600/10 border-red-600/20 text-red-500 hover:bg-red-600/20' : isVacation ? 'bg-emerald-600/10 border-emerald-600/20 text-emerald-500 hover:bg-emerald-600/20' : 'bg-amber-600/10 border-amber-600/20 text-amber-500 hover:bg-amber-600/20'}`}>
        {isTarget ? 'Capture Target Insight' : isVacation ? 'Capture Reflection' : 'Capture Trace'}
      </button>
      <div className="space-y-3">
        {notes.map(n => (
          <div key={n.id} className={`bg-slate-900 p-5 rounded-[1.5rem] border relative group ${isTarget ? 'border-red-500/20' : isVacation ? 'border-emerald-500/20' : 'border-white/5'}`}>
            <p className="text-xs font-mono text-slate-300 pr-8 leading-relaxed">{n.text}</p>
            <button onClick={() => {
              const up = notes.filter(x => x.id !== n.id);
              setNotes(up);
              localStorage.setItem('lsp_v12_notes', JSON.stringify(up));
            }} className="absolute top-3 right-3 text-slate-700 hover:text-rose-500 transition-colors p-2"><Trash2 size={14}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};
