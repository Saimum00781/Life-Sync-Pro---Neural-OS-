import React from 'react';
import { Flame } from 'lucide-react';
import { useAppStore } from '../store';

export const HabitView = () => {
  const { habits, habitCompletions, toggleHabitCompletion } = useAppStore();
  
  // Get last 7 days
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  return (
    <div className="space-y-6 animate-in max-w-md mx-auto w-full">
      <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl">
        <h2 className="text-xl font-black uppercase flex items-center gap-3"><Flame size={24}/> Habit Sync</h2>
        <p className="text-xs opacity-80 mt-2 leading-relaxed">Small daily shifts compound into high performance outcomes.</p>
      </div>
      <div className="space-y-3">
        {habits.map((h: string) => (
          <div key={h} className="bg-slate-900 p-5 rounded-2xl border border-white/5 flex flex-col gap-3 shadow-md">
            <span className="font-bold text-sm text-white">{h}</span>
            <div className="flex justify-between gap-2">
              {days.map((date, i) => {
                const isCompleted = habitCompletions[date]?.includes(h) || false;
                const isToday = i === 6;
                return (
                  <button 
                    key={date}
                    onClick={() => toggleHabitCompletion(date, h)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-110' 
                        : 'bg-white/5 hover:bg-white/10'
                    } ${isToday ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-slate-900' : ''}`}
                    title={date}
                  />
                );
              })}
            </div>
            <div className="flex justify-between px-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Past</span>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Today</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
