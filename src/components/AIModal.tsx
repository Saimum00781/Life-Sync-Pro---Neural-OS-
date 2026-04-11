import React, { useState } from 'react';
import { Cpu, Bot, Sparkles } from 'lucide-react';
import { askAIArchitectStream } from '../../geminiService';

import { StateOfHeart, AppMode } from '../../types';

export const AIModal: React.FC<any> = ({ onClose, coreIdentity, habits, localData, currentMood, appMode = AppMode.NORMAL }) => {
  const [p, setP] = useState("");
  const [r, setR] = useState("");
  const [l, setL] = useState(false);
  const ask = async () => {
    if(!p) return; setL(true); setR("");
    
    let moodContext = '';
    if (currentMood) {
      let category = 'DEPLETED';
      if (currentMood.energy > 50 && currentMood.mood > 50) category = 'FLOW_STATE';
      else if (currentMood.energy > 50 && currentMood.mood <= 50) category = 'ANXIOUS_WIRED';
      else if (currentMood.energy <= 50 && currentMood.mood > 50) category = 'CALM_RESTED';
      
      moodContext = `\nCURRENT STATE OF HEART: The user is currently feeling ${category} (Energy: ${currentMood.energy}/100, Mood: ${currentMood.mood}/100). Tailor your response to acknowledge and support this emotional state. If they are depleted or anxious, offer gentle wisdom to comfort them. If they are in flow state, amplify their energy.`;
    }

    const context = `
    User Identity: ${coreIdentity || 'Not set'}
    Active Habits: ${JSON.stringify(habits)}
    Recent Data: ${JSON.stringify(Object.values(localData || {}).slice(-3))}
    ${moodContext}
    
    You are Oracle AI, a high-performance neural architect and coach. Your primary directive is to help the user align their daily actions with their Core Identity using principles from "Atomic Habits" (Make it obvious, attractive, easy, satisfying; Habit Stacking; 2-Minute Rule).
    Analyze the user's request in the context of their identity, current habits, and emotional state. Keep responses concise, actionable, and formatted as a direct strategic directive.
    
    User Request: ${p}
    `;
    
    for await (const c of askAIArchitectStream(context)) { setR(v => v + c); }
    setL(false);
  };
  return (
    <div className="space-y-6 animate-in w-full max-w-md mx-auto pb-12">
      <div className={`p-6 rounded-[1.5rem] text-white flex flex-col items-center gap-3 text-center shadow-2xl relative overflow-hidden ${appMode === AppMode.TARGET ? 'bg-red-600' : appMode === AppMode.VACATION ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Cpu size={60}/></div>
        <Bot size={32}/>
        <h2 className="text-xl font-mono uppercase tracking-tighter">{appMode === AppMode.TARGET ? 'Oracle (Target Base Mode)' : appMode === AppMode.VACATION ? 'Oracle (Vacation Mode)' : 'Oracle AI'}</h2>
        <p className="text-[10px] font-mono uppercase tracking-widest opacity-80 mt-2 leading-relaxed max-w-[250px]">
          {appMode === AppMode.TARGET ? 'Your ruthless Target Base Architect. Ask for strategic directives to hit your Grand Target.' : appMode === AppMode.VACATION ? 'Your restorative guide. Ask for wisdom, comfort, or gentle reflection.' : 'Your Neural Architect. Ask for strategic directives, habit analysis, or identity alignment based on Atomic Habits principles.'}
        </p>
      </div>
      <div className="bg-slate-900 p-5 rounded-[1.5rem] border border-white/10 space-y-5 shadow-2xl">
        <textarea value={p} onChange={e => setP(e.target.value)} className={`w-full bg-black/40 p-4 rounded-xl text-white font-mono text-xs border border-white/5 h-32 resize-none outline-none transition-all shadow-inner placeholder:text-slate-600 ${appMode === AppMode.TARGET ? 'focus:border-red-500' : appMode === AppMode.VACATION ? 'focus:border-emerald-500' : 'focus:border-indigo-500'}`} placeholder={appMode === AppMode.VACATION ? "e.g., I'm feeling overwhelmed, can you share some wisdom?" : "e.g., How can I stack a reading habit onto my morning routine?"} />
        <button onClick={ask} disabled={l} className={`w-full py-3.5 text-white font-mono uppercase text-[10px] rounded-xl shadow-xl transition-colors disabled:opacity-50 active:scale-95 tracking-widest flex items-center justify-center gap-2 ${appMode === AppMode.TARGET ? 'bg-red-600 hover:bg-red-700' : appMode === AppMode.VACATION ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {l ? 'Synthesizing...' : <><Sparkles size={14}/> Submit Inquiry</>}
        </button>
        {r && <div className={`p-4 bg-white/5 rounded-xl text-[10px] font-mono max-h-60 overflow-y-auto leading-relaxed border border-white/5 custom-scroll shadow-inner whitespace-pre-wrap ${appMode === AppMode.TARGET ? 'text-red-100' : appMode === AppMode.VACATION ? 'text-emerald-100' : 'text-indigo-100'}`}>{r}</div>}
      </div>
    </div>
  );
};
