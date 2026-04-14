import React, { useState, useEffect } from 'react';
import { Award, Trophy, Target, Activity, Smartphone, Sparkles, Zap, Moon, ShieldAlert, Coffee, Heart, CloudRain, Flame, Frown, BrainCircuit } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { AppMode, StateOfHeart } from '../../types';
import { generatePatternAnalysis } from '../../geminiService';

export const ProductivityHub: React.FC<any> = ({ data, userName, targetBaseMode, appMode, dailyMood }) => {
  const [activeSub, setActiveSub] = useState<'Daily'|'Weekly'>('Daily');
  const [patternAnalysis, setPatternAnalysis] = useState<string>("");
  const [isGeneratingPattern, setIsGeneratingPattern] = useState(false);

  useEffect(() => {
    const fetchPatternAnalysis = async () => {
      if (!patternAnalysis && !isGeneratingPattern && Object.keys(data).length > 0) {
        setIsGeneratingPattern(true);
        try {
          // Get last 14 days of data
          const sortedDates = Object.keys(data).sort().reverse().slice(0, 14);
          const historicalData = sortedDates.reduce((acc: any, date) => {
            acc[date] = data[date];
            return acc;
          }, {});
          
          const analysis = await generatePatternAnalysis(historicalData);
          setPatternAnalysis(analysis);
        } catch (e) {
          console.error(e);
        } finally {
          setIsGeneratingPattern(false);
        }
      }
    };
    fetchPatternAnalysis();
  }, [data]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = data[todayStr] || { goals: [], studyLogs: [], deviceTime: '0', habits: [], leisureDeviceTime: 0, productiveDeviceTime: 0, offlineTime: 0, sleepTime: 0, waterIntake: 0 };
  
  const done = todayData.goals.filter((g: any) => g.done).length;
  const total = todayData.goals.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const activeMins = todayData.studyLogs ? todayData.studyLogs.reduce((acc: number, cur: any) => acc + parseInt(cur.time), 0) : 0;
  const leisureMins = todayData.leisureDeviceTime || 0;
  const productiveMins = todayData.productiveDeviceTime || 0;
  const offlineMins = todayData.offlineTime || 0;
  const sleepMins = todayData.sleepTime || 0;
  const habitsDone = todayData.habits?.length || 0;

  const isTarget = appMode === AppMode.TARGET;
  const isVacation = appMode === AppMode.VACATION;

  // Calculate Mood Correlation
  const moodStats = Object.keys(dailyMood || {}).reduce((acc: any, date: string) => {
    const state = dailyMood[date];
    const dayData = data[date];
    if (dayData && state) {
      let category = 'DEPLETED';
      if (state.energy > 50 && state.mood > 50) category = 'FLOW_STATE';
      else if (state.energy > 50 && state.mood <= 50) category = 'ANXIOUS_WIRED';
      else if (state.energy <= 50 && state.mood > 50) category = 'CALM_RESTED';

      if (!acc[category]) acc[category] = { count: 0, totalFocus: 0, totalTasks: 0, doneTasks: 0 };
      acc[category].count += 1;
      acc[category].totalFocus += dayData.studyLogs ? dayData.studyLogs.reduce((sum: number, log: any) => sum + parseInt(log.time), 0) : 0;
      acc[category].totalTasks += dayData.goals ? dayData.goals.length : 0;
      acc[category].doneTasks += dayData.goals ? dayData.goals.filter((g: any) => g.done).length : 0;
    }
    return acc;
  }, {});

  const getMoodIcon = (category: string) => {
    switch (category) {
      case 'FLOW_STATE': return <Zap size={12} className="text-amber-400" />;
      case 'ANXIOUS_WIRED': return <Flame size={12} className="text-red-400" />;
      case 'CALM_RESTED': return <Heart size={12} className="text-emerald-400" />;
      case 'DEPLETED': return <CloudRain size={12} className="text-blue-400" />;
      default: return null;
    }
  };

  const getMoodColor = (category: string) => {
    switch (category) {
      case 'FLOW_STATE': return "text-amber-400";
      case 'ANXIOUS_WIRED': return "text-red-400";
      case 'CALM_RESTED': return "text-emerald-400";
      case 'DEPLETED': return "text-blue-400";
      default: return "text-white";
    }
  };

  return (
    <div className="space-y-6 animate-in pb-12 w-full max-w-md mx-auto">
      <SectionHeader 
        title={isTarget ? "Target Analytics" : isVacation ? "Recovery Metrics" : "Command Center"} 
        subtitle={isVacation ? "Rest & Rejuvenation" : "Operational Analytics"} 
        infoText={isTarget ? "Strict monitoring of your target-aligned output." : isVacation ? "Monitoring your rest, recovery, and spiritual well-being." : "Your daily performance metrics visualized in a high-density bento grid. Monitor your neural output and digital exposure."}
        icon={isTarget ? ShieldAlert : isVacation ? Coffee : Trophy}
        colorClass={isTarget ? "text-red-400" : isVacation ? "text-emerald-400" : "text-indigo-400"}
      />

      {isTarget && targetBaseMode && (
        <div className="bg-red-950/40 p-5 rounded-[2rem] border border-red-500/30 flex items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-md">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 shadow-lg shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-lg font-mono uppercase text-white tracking-tight leading-tight">{targetBaseMode.target}</h2>
            <p className="text-[10px] font-mono uppercase text-red-400 tracking-widest mt-1">Target Base Mode Active</p>
          </div>
        </div>
      )}

      {isVacation && (
        <div className="bg-emerald-950/40 p-5 rounded-[2rem] border border-emerald-500/30 flex items-center gap-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 shadow-lg shrink-0">
            <Coffee size={24} />
          </div>
          <div>
            <h2 className="text-lg font-mono uppercase text-white tracking-tight leading-tight">Vacation Mode Active</h2>
            <p className="text-[10px] font-mono uppercase text-emerald-400 tracking-widest mt-1">Focus on healing and rest</p>
          </div>
        </div>
      )}

      <div className={`bg-slate-900/50 p-5 rounded-[2rem] border border-white/5 flex items-center gap-4 shadow-xl backdrop-blur-md ${isTarget || isVacation ? 'hidden' : ''}`}>
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-xl font-mono text-white shadow-lg">{userName[0]}</div>
        <div>
          <h2 className="text-lg font-mono uppercase text-white tracking-tight">{userName}</h2>
          <p className="text-[10px] font-mono uppercase text-indigo-400 tracking-widest flex items-center gap-1.5 mt-1"><Award size={10}/> Tier-1 Operational</p>
        </div>
      </div>

      <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl">
        {['Daily', 'Weekly'].map(t => (
          <button key={t} onClick={() => setActiveSub(t as any)} className={`flex-1 py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${activeSub === t ? (isTarget ? 'bg-red-600 text-white shadow-md' : isVacation ? 'bg-emerald-600 text-white shadow-md' : 'bg-indigo-500 text-white shadow-md') : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Main Progress (Spans 2 columns) */}
        {!isVacation && (
          <div className={`col-span-2 bg-slate-900 p-5 rounded-[1.5rem] border border-white/5 flex items-center justify-between shadow-xl relative overflow-hidden ${isTarget ? 'border-red-500/20' : ''}`}>
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${isTarget ? 'bg-red-500/10' : 'bg-indigo-500/10'}`} />
            <div className="space-y-2 z-10">
              <div className={`flex items-center gap-2 mb-3 ${isTarget ? 'text-red-400' : 'text-indigo-400'}`}>
                <Target size={14} />
                <h4 className="text-[10px] font-mono uppercase tracking-widest">Objectives</h4>
              </div>
              <p className="text-3xl font-mono text-white">{done} <span className="text-lg text-slate-500">/ {total}</span></p>
              <p className="text-[8px] font-mono uppercase tracking-widest text-slate-400">Tasks Synchronized</p>
            </div>
            <div className="relative w-20 h-20 z-10">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={201} strokeDashoffset={201 - (201 * percent) / 100} className={`${isTarget ? 'text-red-500' : 'text-indigo-500'} transition-all duration-1000`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-mono text-white">{percent}%</div>
            </div>
          </div>
        )}

        {/* Productive / Offline */}
        <div className="bg-emerald-900/20 p-4 rounded-[1.5rem] border border-emerald-500/20 shadow-lg flex flex-col justify-between aspect-square">
          <div className="flex items-center gap-2 text-emerald-400">
            <Activity size={12} />
            <h4 className="text-[10px] font-mono uppercase tracking-widest">Productive</h4>
          </div>
          <div>
            <p className="text-2xl font-mono text-white">{Math.floor((productiveMins + offlineMins)/60)}<span className="text-sm text-emerald-500">h</span> {(productiveMins + offlineMins)%60}<span className="text-sm text-emerald-500">m</span></p>
            <p className="text-[8px] font-mono uppercase tracking-widest text-emerald-500/70 mt-1">Total Output</p>
          </div>
        </div>

        {/* Leisure Screen Time */}
        <div className="bg-rose-900/20 p-4 rounded-[1.5rem] border border-rose-500/20 shadow-lg flex flex-col justify-between aspect-square">
          <div className="flex items-center gap-2 text-rose-400">
            <Smartphone size={12} />
            <h4 className="text-[10px] font-mono uppercase tracking-widest">Leisure</h4>
          </div>
          <div>
            <p className="text-2xl font-mono text-white">{Math.floor(leisureMins/60)}<span className="text-sm text-rose-500">h</span> {leisureMins%60}<span className="text-sm text-rose-500">m</span></p>
            <p className="text-[8px] font-mono uppercase tracking-widest text-rose-500/70 mt-1">Device Exposure</p>
          </div>
        </div>

        {/* Focus Chamber */}
        {!isVacation && (
          <div className="bg-indigo-900/20 p-4 rounded-[1.5rem] border border-indigo-500/20 shadow-lg flex flex-col justify-between aspect-square">
            <div className="flex items-center gap-2 text-indigo-400">
              <Zap size={12} />
              <h4 className="text-[10px] font-mono uppercase tracking-widest">Focus</h4>
            </div>
            <div>
              <p className="text-2xl font-mono text-white">{Math.floor(activeMins/60)}<span className="text-sm text-indigo-500">h</span> {activeMins%60}<span className="text-sm text-indigo-500">m</span></p>
              <p className="text-[8px] font-mono uppercase tracking-widest text-indigo-500/70 mt-1">Deep Work</p>
            </div>
          </div>
        )}

        {/* Sleep Time */}
        <div className="bg-blue-900/20 p-4 rounded-[1.5rem] border border-blue-500/20 shadow-lg flex flex-col justify-between aspect-square">
          <div className="flex items-center gap-2 text-blue-400">
            <Moon size={12} />
            <h4 className="text-[10px] font-mono uppercase tracking-widest">Sleep</h4>
          </div>
          <div>
            <p className="text-2xl font-mono text-white">{Math.floor(sleepMins/60)}<span className="text-sm text-blue-500">h</span> {sleepMins%60}<span className="text-sm text-blue-500">m</span></p>
            <p className="text-[8px] font-mono uppercase tracking-widest text-blue-500/70 mt-1">Recovery Phase</p>
          </div>
        </div>

        {/* Habits / Loops */}
        <div className={`${isVacation ? 'col-span-1' : 'col-span-2'} bg-slate-900 p-4 rounded-[1.5rem] border border-white/5 shadow-lg flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
              <Sparkles size={14} />
            </div>
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{isVacation ? "Recovery" : "Neural Loops"}</h4>
              <p className="text-sm font-mono text-white">{habitsDone} Executed</p>
            </div>
          </div>
          {!isVacation && (
            <div className="text-right">
              <p className="text-[8px] font-mono uppercase tracking-widest text-slate-500">Daily Routine</p>
            </div>
          )}
        </div>
      </div>

      {/* Mood Correlation Section */}
      {Object.keys(moodStats).length > 0 && (
        <div className="mt-6 bg-slate-900/50 p-5 rounded-[1.5rem] border border-white/5 shadow-xl">
          <div className="flex items-center gap-2 mb-4 text-indigo-400">
            <Heart size={14} />
            <h4 className="text-[10px] font-mono uppercase tracking-widest">State of Heart Correlation</h4>
          </div>
          <div className="space-y-3">
            {Object.keys(moodStats).map(mood => {
              const stat = moodStats[mood];
              const avgFocus = Math.round(stat.totalFocus / stat.count);
              const taskCompletion = stat.totalTasks > 0 ? Math.round((stat.doneTasks / stat.totalTasks) * 100) : 0;
              return (
                <div key={mood} className="bg-black/20 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/5 rounded-lg">{getMoodIcon(mood)}</div>
                    <span className={`text-xs font-mono uppercase ${getMoodColor(mood)}`}>{mood}</span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs font-mono text-white">{Math.floor(avgFocus/60)}h {avgFocus%60}m</p>
                      <p className="text-[8px] font-mono uppercase text-slate-500">Avg Focus</p>
                    </div>
                    <div>
                      <p className="text-xs font-mono text-white">{taskCompletion}%</p>
                      <p className="text-[8px] font-mono uppercase text-slate-500">Task Success</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Predictive Pattern Analysis */}
      <div className="mt-6 bg-indigo-950/30 p-5 rounded-[1.5rem] border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
        <div className="flex items-center gap-2 mb-4 text-indigo-400">
          <BrainCircuit size={14} />
          <h4 className="text-[10px] font-mono uppercase tracking-widest">Neural Pattern Analysis</h4>
        </div>
        {isGeneratingPattern ? (
          <div className="flex items-center gap-2 text-indigo-400/50">
            <div className="w-3 h-3 border-2 border-indigo-400/50 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-mono uppercase tracking-widest">Analyzing historical telemetry...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {patternAnalysis.split('\n').map((line, i) => (
              line.trim() && (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <p className="text-xs font-mono text-indigo-100/80 leading-relaxed">{line.replace('•', '').trim()}</p>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
