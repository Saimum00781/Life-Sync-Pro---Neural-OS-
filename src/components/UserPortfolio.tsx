import React, { useMemo } from 'react';
import { User, Activity, Heart, Zap, Flame, CalendarDays, Droplet, Moon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const UserPortfolio = ({ userName, archetype, healthProfile, coreIdentity, localData, dailyMood, habits }: any) => {
  
  // Calculate the last 7 days data
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = (localData && localData[dateStr]) || {};
      const moodData = (dailyMood && dailyMood[dateStr]) || { mood: 0, energy: 0 };
      
      // Calculate Habit Score (0-100)
      const activeHabitsCount = habits?.length || 0;
      const completedHabitsCount = (dayData.habits || []).length;
      const habitScore = activeHabitsCount > 0 ? (completedHabitsCount / activeHabitsCount) * 100 : 0;
      
      // Calculate Sleep Score (Target: 8 hours = 480 mins)
      const sleepScore = Math.min((dayData.sleepTime || 0) / 480, 1) * 100;
      
      // Calculate Water Score (Target: 2000 ml)
      const waterScore = Math.min((dayData.waterIntake || 0) / 2000, 1) * 100;
      
      // Daily Sync Score (Average of Habit, Sleep, Water, Mood, Energy)
      const syncScore = Math.round((habitScore + sleepScore + waterScore + moodData.mood + moodData.energy) / 5) || 0;
      
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        syncScore,
        mood: moodData.mood || 0,
        energy: moodData.energy || 0,
        habitScore,
      });
    }
    return data;
  }, [localData, dailyMood, habits]);

  // Calculate Habit Consistency
  const habitConsistency = useMemo(() => {
    if (!habits || habits.length === 0) return [];
    
    return habits.map((h: any) => {
      const habitName = typeof h === 'string' ? h : (h.text || '');
      if (!habitName) return null;
      
      let completions = 0;
      chartData.forEach(day => {
        const dayData = (localData && localData[day.date]) || {};
        if ((dayData.habits || []).includes(habitName)) {
          completions++;
        }
      });
      
      return {
        name: habitName.length > 10 ? habitName.substring(0, 10) + '...' : habitName,
        fullName: habitName,
        rate: Math.round((completions / 7) * 100)
      };
    }).filter(Boolean);
  }, [habits, chartData, localData]);

  // Calculate 30-Day Heatmap Data
  const heatmapData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = (localData && localData[dateStr]) || {};
      
      const activeHabitsCount = habits?.length || 0;
      const completedHabitsCount = (dayData.habits || []).length;
      const intensity = activeHabitsCount > 0 ? completedHabitsCount / activeHabitsCount : 0;
      
      data.push({
        date: dateStr,
        intensity,
        completed: completedHabitsCount,
        total: activeHabitsCount
      });
    }
    return data;
  }, [localData, habits]);

  const weeklyAverage = Math.round(chartData.reduce((acc, curr) => acc + curr.syncScore, 0) / 7);
  const bestHabit = habitConsistency.length > 0 ? habitConsistency.reduce((prev: any, current: any) => (prev.rate > current.rate) ? prev : current) : null;

  return (
    <div className="space-y-8 animate-in pb-12 w-full max-w-2xl mx-auto">
      
      {/* Header Section */}
      <div className="bg-[var(--card-bg)] p-8 rounded-[2rem] border border-[var(--text-main)]/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent pointer-events-none" />
        
        <div className={`w-32 h-32 rounded-3xl flex items-center justify-center text-6xl shadow-2xl z-10 shrink-0 ${archetype === 'optimizer' ? 'bg-gradient-to-br from-teal-500 to-emerald-800' : archetype === 'balancer' ? 'bg-gradient-to-br from-rose-500 to-pink-800' : 'bg-gradient-to-br from-[var(--accent-primary)] to-indigo-800'}`}>
          {archetype === 'optimizer' ? <Zap size={48} className="text-white" /> : archetype === 'balancer' ? <Heart size={48} className="text-white" /> : <User size={48} className="text-white" />}
        </div>
        
        <div className="text-center md:text-left z-10 flex-1 w-full">
          <h2 className="text-3xl font-black uppercase text-[var(--text-main)] tracking-tighter">{userName}</h2>
          <div className="flex items-center justify-center md:justify-start gap-3 mt-2 mb-4">
            <span className="px-3 py-1 bg-[var(--text-main)]/5 rounded-lg text-[10px] font-mono uppercase tracking-widest text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              {archetype || 'Unknown'} Operator
            </span>
            <span className="px-3 py-1 bg-[var(--text-main)]/5 rounded-lg text-[10px] font-mono uppercase tracking-widest text-[var(--text-main)] opacity-60 border border-[var(--text-main)]/10">
              Core: {coreIdentity || 'Not defined'}
            </span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--text-main)]/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-[var(--accent-primary)] opacity-50" />
          <Activity className="w-6 h-6 text-[var(--accent-primary)] mb-2" />
          <span className="text-3xl font-black text-[var(--text-main)]">{weeklyAverage}</span>
          <span className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 tracking-widest mt-1">Weekly Sync Score</span>
        </div>
        
        <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--text-main)]/10 flex flex-col items-center justify-center text-center">
          <Flame className="w-6 h-6 text-orange-400 mb-2" />
          <span className="text-xl font-black text-[var(--text-main)] truncate w-full px-2">{bestHabit ? bestHabit.fullName : 'None'}</span>
          <span className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 tracking-widest mt-1">Strongest Habit</span>
        </div>
        
        <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--text-main)]/10 flex flex-col items-center justify-center text-center">
          <CalendarDays className="w-6 h-6 text-indigo-400 mb-2" />
          <span className="text-3xl font-black text-[var(--text-main)]">{Object.keys(localData || {}).length}</span>
          <span className="text-[10px] font-mono uppercase text-[var(--text-main)] opacity-50 tracking-widest mt-1">Days Tracked</span>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="bg-[var(--card-bg)] p-6 rounded-[1.5rem] border border-[var(--text-main)]/10 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-mono uppercase text-[var(--text-main)] tracking-widest">7-Day Sync Trend</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--text-main)" strokeOpacity={0.1} vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-main)" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-main)" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid rgba(var(--text-main-rgb), 0.1)', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
              <Line type="monotone" dataKey="syncScore" name="Sync Score" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent-primary)' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="mood" name="Mood" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="energy" name="Energy" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habit Consistency Chart */}
      {habitConsistency.length > 0 && (
        <div className="bg-[var(--card-bg)] p-6 rounded-[1.5rem] border border-[var(--text-main)]/10 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-mono uppercase text-[var(--text-main)] tracking-widest">Habit Consistency (7 Days)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitConsistency} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--text-main)" strokeOpacity={0.1} horizontal={false} />
                <XAxis type="number" stroke="var(--text-main)" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="var(--text-main)" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: 'var(--text-main)', opacity: 0.05 }}
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid rgba(var(--text-main-rgb), 0.1)', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                />
                <Bar dataKey="rate" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 30-Day Habit Heatmap */}
      <div className="bg-[var(--card-bg)] p-6 rounded-[1.5rem] border border-[var(--text-main)]/10 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-mono uppercase text-[var(--text-main)] tracking-widest">30-Day Consistency Heatmap</h3>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {heatmapData.map((day, i) => {
            let opacity = 0.1;
            if (day.intensity > 0) opacity = 0.3;
            if (day.intensity >= 0.5) opacity = 0.6;
            if (day.intensity >= 0.8) opacity = 1;
            
            return (
              <div 
                key={day.date}
                className="w-5 h-5 rounded-sm transition-all hover:scale-125 relative group"
                style={{ backgroundColor: `rgba(var(--accent-primary-rgb), ${opacity})` }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-[8px] font-mono rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {day.date}: {day.completed}/{day.total} habits
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
