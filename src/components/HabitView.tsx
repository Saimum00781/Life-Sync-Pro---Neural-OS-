import React, { useState, useRef, useEffect } from 'react';
import { Check, Trash2, Bot, Sparkles, Flame } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { askAIArchitectStream } from '../../geminiService';

export const HabitView = ({ habits, currentDay, updateDayData, setHabits, customPrompt, localData, showSuccessToast }: any) => {
  const currentDayStr = new Date().toISOString().split('T')[0];
  const completed = currentDay?.habits || [];
  const [isGenerating, setIsGenerating] = useState(false);
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

  return (
    <div className="space-y-6 animate-in w-full max-w-md mx-auto">
      <SectionHeader 
        title="Neural Reprogramming" 
        subtitle={`${completedCount}/${totalCount} Loops Executed`} 
        infoText="Execute daily loops to forge permanent behavioral pathways. Organized by time blocks for optimal cognitive load."
        icon={Sparkles}
        colorClass="text-emerald-500"
      />

      <div className="flex items-center justify-between bg-white/5 p-4 rounded-[1.5rem] border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
            <Flame size={14} />
          </div>
          <div>
            <p className="text-[8px] font-mono uppercase tracking-widest text-slate-400">Current Streak</p>
            <p className="text-sm font-mono text-white">{streak} Days</p>
          </div>
        </div>
        <button onClick={generateHabits} disabled={isGenerating} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/20 text-indigo-400 rounded-lg text-[8px] font-mono uppercase tracking-widest hover:bg-indigo-600/30 transition-all disabled:opacity-50 border border-indigo-500/20">
          <Bot size={12} /> {isGenerating ? 'Synthesizing...' : 'AI Generate'}
        </button>
      </div>

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
                  <div key={h.id} className="relative group">
                    <button onClick={() => toggle(h.id)} className={`w-full p-3.5 rounded-xl border transition-all flex items-center justify-between active:scale-[0.98] ${isDone ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900 border-white/5 text-slate-300 hover:border-white/10 shadow-lg'}`}>
                      <span className="text-xs font-mono tracking-wide">{h.text}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700 bg-white/5 group-hover:border-slate-500'}`}>
                        {isDone && <Check size={10} strokeWidth={3} />}
                      </div>
                    </button>
                    <button onClick={() => removeHabit(h.id)} className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110">
                      <Trash2 size={10} />
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
