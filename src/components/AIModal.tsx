import React, { useState } from 'react';
import { Cpu, Bot, Sparkles } from 'lucide-react';
import { askAIArchitectStream } from '../../geminiService';

export const AIModal: React.FC<any> = ({ onClose, coreIdentity, habits, localData }) => {
  const [p, setP] = useState("");
  const [r, setR] = useState("");
  const [l, setL] = useState(false);
  const ask = async () => {
    if(!p) return; setL(true); setR("");
    const context = `
    User Identity: ${coreIdentity || 'Not set'}
    Active Habits: ${JSON.stringify(habits)}
    Recent Data: ${JSON.stringify(Object.values(localData || {}).slice(-3))}
    
    You are Oracle AI, a high-performance neural architect and coach. Your primary directive is to help the user align their daily actions with their Core Identity using principles from "Atomic Habits" (Make it obvious, attractive, easy, satisfying; Habit Stacking; 2-Minute Rule).
    Analyze the user's request in the context of their identity and current habits. Keep responses concise, actionable, and formatted as a direct strategic directive.
    
    User Request: ${p}
    `;
    
    for await (const c of askAIArchitectStream(context)) { setR(v => v + c); }
    setL(false);
  };
  return (
    <div className="space-y-6 animate-in w-full max-w-md mx-auto pb-12">
      <div className="p-6 bg-indigo-600 rounded-[1.5rem] text-white flex flex-col items-center gap-3 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Cpu size={60}/></div>
        <Bot size={32}/>
        <h2 className="text-xl font-mono uppercase tracking-tighter">Oracle AI</h2>
        <p className="text-[10px] font-mono uppercase tracking-widest opacity-80 mt-2 leading-relaxed max-w-[250px]">Your Neural Architect. Ask for strategic directives, habit analysis, or identity alignment based on Atomic Habits principles.</p>
      </div>
      <div className="bg-slate-900 p-5 rounded-[1.5rem] border border-white/10 space-y-5 shadow-2xl">
        <textarea value={p} onChange={e => setP(e.target.value)} className="w-full bg-black/40 p-4 rounded-xl text-white font-mono text-xs border border-white/5 h-32 resize-none outline-none focus:border-indigo-500 transition-all shadow-inner placeholder:text-slate-600" placeholder="e.g., How can I stack a reading habit onto my morning routine?" />
        <button onClick={ask} disabled={l} className="w-full py-3.5 bg-indigo-600 text-white font-mono uppercase text-[10px] rounded-xl shadow-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 active:scale-95 tracking-widest flex items-center justify-center gap-2">
          {l ? 'Synthesizing...' : <><Sparkles size={14}/> Submit Inquiry</>}
        </button>
        {r && <div className="p-4 bg-white/5 rounded-xl text-[10px] font-mono text-indigo-100 max-h-60 overflow-y-auto leading-relaxed border border-white/5 custom-scroll shadow-inner whitespace-pre-wrap">{r}</div>}
      </div>
    </div>
  );
};
