import React, { useState } from 'react';
import { StickyNote, Trash2 } from 'lucide-react';

export const NoteView = ({ customPrompt, showSuccessToast }: any) => {
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
  return (
    <div className="space-y-6 animate-in w-full max-w-md mx-auto">
      <div className="bg-amber-600 p-5 rounded-[1.5rem] text-white shadow-xl">
        <h2 className="text-lg font-mono uppercase flex items-center gap-2"><StickyNote size={16}/> Neural Notes</h2>
        <p className="text-[10px] font-mono uppercase tracking-widest opacity-80 mt-2 leading-relaxed">Offload transient trace data to free up active memory capacity.</p>
      </div>
      <button onClick={add} className="w-full p-8 bg-amber-600/10 border border-dashed border-amber-600/20 rounded-[1.5rem] text-amber-500 font-mono uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-inner hover:bg-amber-600/20">Capture Trace</button>
      <div className="space-y-3">
        {notes.map(n => (
          <div key={n.id} className="bg-slate-900 p-5 rounded-[1.5rem] border border-white/5 relative group">
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
