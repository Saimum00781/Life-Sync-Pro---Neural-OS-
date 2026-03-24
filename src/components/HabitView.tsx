import React, { useState, useRef, useEffect } from 'react';
import { Check, Trash2, Bot, Sparkles, Flame, Plus, ShieldAlert, Coffee } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { askAIArchitectStream } from '../../geminiService';
import { AppMode } from '../../types';

export const HabitView = ({ habits, currentDay, updateDayData, setHabits, customPrompt, localData, targetBaseMode, showSuccessToast, appMode }: any) => {
  const currentDayStr = new Date().toISOString().split('T')[0];
  const completed = currentDay?.habits || [];
  const [isGenerating, setIsGenerating] = useState(false);
  const [newHabitText, setNewHabitText] = useState('');
  const [newHabitTime, setNewHabitTime] = useState('morning');
  const [showAddForm, setShowAddForm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isGenerating && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [habits, isGenerating]);

  // Normalize existing string habits to object format
  const normalizedHabits = (habits || []).map((h: any, i: number) => {
    if (typeof h === 'string') {
      return { id: h, text: h, time: i < 2 ? 'morning' : i < 3 ? 'afternoon' : 'evening' };
    }
    return h;
  }).filter((h: any, index: number, self: any[]) => 
    index === self.findIndex((t) => t.id === h.id)
  );

  const toggle = (h: string) => {
    const up = completed.includes(h) ? completed.filter((x: string) => x !== h) : [...completed, h];
    updateDayData(currentDayStr, { habits: up });
    if (showSuccessToast && !completed.includes(h)) showSuccessToast("HABIT LOGGED");
  };

  const generateHabits = async () => {
    if (!customPrompt) return;
    const goal = await customPrompt("What is your primary goal right now?", "E.g., Better sleep, more energy, learning to code");
    if (!goal) return;
    
    setIsGenerating(true);
    try {
      let response = "";
      for await (const chunk of askAIArchitectStream(`Generate 3 daily habits for someone whose goal is: "${goal}". Format exactly as a JSON array of objects with 'text' (string) and 'time' (either 'morning', 'afternoon', or 'evening'). No markdown, just the JSON array.`)) {
        response += chunk;
      }
      
      const newHabits = JSON.parse(response.replace(/```json|```/g, '').trim());
      const formatted = newHabits.map((h: any, i: number) => ({
        id: h.text + Date.now() + i,
        text: h.text,
        time: h.time || 'morning'
      }));
      
      setHabits([...normalizedHabits, ...formatted]);
      if (showSuccessToast) showSuccessToast("HABITS GENERATED");
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const removeHabit = (id: string) => {
    setHabits(normalizedHabits.filter((h: any) => h.id !== id));
  };

  const addManualHabit = () => {
    if (!newHabitText.trim()) return;
    const newHabit = {
      id: newHabitText + Date.now(),
      text: newHabitText,
      time: newHabitTime
    };
    setHabits([...normalizedHabits, newHabit]);
    setNewHabitText('');
    setShowAddForm(false);
    if (showSuccessToast) showSuccessToast("HABIT ADDED");
  };

  const blocks = ['morning', 'afternoon', 'evening'];
  const completedCount = completed.length;
  const totalCount = normalizedHabits.length;
  
  // Calculate real streak
  let streak = 0;
  const today = new Date();
  let checkDate = new Date(today);
  
  // Start checking from today
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayData = localData?.[dateStr];
    
    // If it's today and not completed, we don't break the streak yet (user has time to complete)
    // But if it's a past day and not completed, streak is broken
    if (dayData?.habits && dayData.habits.length > 0) {
      streak++;
    } else if (dateStr !== currentDayStr) {
      break;
    }
    
    checkDate.setDate(checkDate.getDate() - 1);
    // Safety break
    if (streak > 365) break;
  }

  const isTarget = appMode === AppMode.TARGET;
  const isVacation = appMode === AppMode.VACATION;

  return (
    <div className="space-y-6 animate-in w-full max-w-md mx-auto">
      <SectionHeader 
        title={isTarget ? "Target Base Reprogramming" : isVacation ? "Recovery Habits" : "Neural Reprogramming"} 
        subtitle={`${completedCount}/${totalCount} Loops Executed`} 
        infoText={isTarget ? `Execute daily loops to forge permanent behavioral pathways strictly aligned with: ${targetBaseMode?.target}` : isVacation ? "Focus on rest, recovery, and spiritual rejuvenation." : "Execute daily loops to forge permanent behavioral pathways. Organized by time blocks for optimal cognitive load."}
        icon={isTarget ? ShieldAlert : isVacation ? Coffee : Sparkles}
        colorClass={isTarget ? "text-red-500" : isVacation ? "text-emerald-500" : "text-emerald-500"}
      />

      {isTarget && targetBaseMode && (
        <div className="bg-red-950/40 p-4 rounded-2xl border border-red-500/30 mb-6 flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-red-400 mb-1">Target Base Mode</h3>
            <p className="text-sm font-bold text-white leading-tight">Every habit must serve: {targetBaseMode.target}</p>
          </div>
        </div>
      )}

      {isVacation && (
        <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30 mb-6 flex items-start gap-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
            <Coffee size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-1">Grace Mode Active</h3>
            <p className="text-sm font-bold text-white leading-tight">Work habits are paused. Focus on healing and rest.</p>
          </div>
        </div>
      )}

      <div className={`flex items-center justify-between bg-white/5 p-4 rounded-[1.5rem] border ${isTarget ? 'border-red-500/20' : isVacation ? 'border-emerald-500/20' : 'border-white/10'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
            <Flame size={14} />
          </div>
          <div>
            <p className="text-[8px] font-mono uppercase tracking-widest text-slate-400">Current Streak</p>
            <p className="text-sm font-mono text-white">{streak} Days</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 text-slate-300 rounded-lg text-[8px] font-mono uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">
            <Plus size={12} /> Add
          </button>
          <button onClick={generateHabits} disabled={isGenerating} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[8px] font-mono uppercase tracking-widest transition-all disabled:opacity-50 border ${isTarget ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border-red-500/20' : isVacation ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border-emerald-500/20' : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border-indigo-500/20'}`}>
            <Bot size={12} /> {isGenerating ? 'Synthesizing...' : 'AI Generate'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2">
          <input 
            value={newHabitText}
            onChange={e => setNewHabitText(e.target.value)}
            placeholder="Enter new habit..."
            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-indigo-500/50"
          />
          <div className="flex gap-2">
            <select 
              value={newHabitTime}
              onChange={e => setNewHabitTime(e.target.value)}
              className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 outline-none focus:border-indigo-500/50"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
            <button onClick={addManualHabit} className={`flex-1 text-white rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${isTarget ? 'bg-red-600 hover:bg-red-500' : isVacation ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
              Save Habit
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {blocks.map(block => {
          const blockHabits = normalizedHabits.filter((h: any) => h.time === block);
          if (blockHabits.length === 0) return null;
          
          return (
            <div key={block} className="space-y-2">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 pl-2">{block} Protocol</h3>
              {blockHabits.map((h: any) => {
                const isDone = completed.includes(h.id);
                return (
                  <div key={h.id} className="relative group flex items-center gap-2">
                    <button onClick={() => toggle(h.id)} className={`flex-1 p-3.5 rounded-xl border transition-all flex items-center justify-between active:scale-[0.98] ${isDone ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900 border-white/5 text-slate-300 hover:border-white/10 shadow-lg'}`}>
                      <span className="text-xs font-mono tracking-wide text-left">{h.text}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ml-3 ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700 bg-white/5 group-hover:border-slate-500'}`}>
                        {isDone && <Check size={10} strokeWidth={3} />}
                      </div>
                    </button>
                    <button onClick={() => removeHabit(h.id)} className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
        {normalizedHabits.length === 0 && <p className="text-center py-12 opacity-30 font-mono uppercase text-[10px] tracking-[0.25em] text-white">No active loops</p>}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};
