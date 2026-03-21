import React, { useState } from 'react';
import { Sparkles, Plus, Check, Trash2, Target } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

export const TodayView: React.FC<any> = ({ data, updateDayData, showSuccessToast }) => {
  const currentDayStr = new Date().toISOString().split('T')[0];
  const [val, setVal] = useState("");
  const handleAdd = () => {
    if(!val) return;
    const newGoal = { id: Date.now().toString() + Math.random().toString(), text: val, priority: 'standard', done: false, date: currentDayStr };
    updateDayData(currentDayStr, { goals: [...data, newGoal] });
    setVal("");
    if (showSuccessToast) showSuccessToast("MISSION ADDED");
  };

  const toggleGoal = (goal: any) => {
    updateDayData(currentDayStr, { goals: data.map((g: any) => g.id === goal.id ? { ...g, done: !g.done } : g) });
    if (showSuccessToast && !goal.done) showSuccessToast("MISSION ACCOMPLISHED");
  };

  const deleteGoal = (goalId: string) => {
    updateDayData(currentDayStr, { goals: data.filter((g: any) => g.id !== goalId) });
    if (showSuccessToast) showSuccessToast("MISSION ABORTED");
  };

  const doneCount = data.filter((g: any) => g.done).length;
  const totalCount = data.length;

  return (
    <div className="space-y-6 animate-in w-full max-w-md mx-auto">
      <SectionHeader 
        title="Daily Briefing" 
        subtitle={`${doneCount}/${totalCount} Objectives Executed`}
        infoText="Execute current missions for peak output. Add new tasks or mark existing ones as complete."
        icon={Target}
        colorClass="text-[var(--accent-primary)]"
      />

      <div className="flex gap-2 mb-6">
        <input 
          value={val} 
          onChange={e => setVal(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleAdd()} 
          placeholder="New mission objective..." 
          className="flex-1 bg-white/5 p-3 rounded-xl text-xs font-mono outline-none border border-white/5 text-white placeholder:text-slate-600 focus:border-[var(--accent-primary)]/50 transition-colors" 
        />
        <button onClick={handleAdd} className="p-3 bg-[var(--accent-primary)] rounded-xl text-white active:scale-95 transition-all shadow-lg shadow-[var(--accent-primary)]/20"><Plus size={14}/></button>
      </div>

      <div className="space-y-2">
        {data.map((goal: any) => (
          <div key={goal.id} className="bg-white/5 p-3.5 rounded-[1.25rem] border border-white/5 flex flex-col gap-2 active:scale-[0.99] transition-all shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => toggleGoal(goal)}
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${goal.done ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' : 'border-slate-700 bg-white/5'}`}
              >
                {goal.done && <Check size={10} strokeWidth={3} className="text-white" />}
              </button>
              <p className={`text-[11px] font-mono flex-1 leading-snug ${goal.done ? 'line-through text-slate-600' : 'text-slate-200'}`}>{goal.text}</p>
              <button onClick={() => deleteGoal(goal.id)} className="p-1.5 text-slate-700 hover:text-rose-500 transition-colors shrink-0"><Trash2 size={12}/></button>
            </div>
            {goal.source && (
              <div className="flex items-center gap-2 ml-7">
                <span className="text-[8px] font-mono uppercase text-[var(--accent-primary)]/60 tracking-wider">Source:</span>
                <span className="text-[8px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">{goal.source}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {data.length === 0 && <p className="text-center py-12 opacity-30 font-mono uppercase text-[10px] tracking-[0.25em] text-white">No active traces</p>}
    </div>
  );
};
