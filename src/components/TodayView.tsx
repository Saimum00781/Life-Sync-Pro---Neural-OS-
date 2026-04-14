import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Check, Trash2, Target, Flame, Heart, Droplet, Moon, Footprints, BookOpen, Smile, Zap, Play, Square, Timer, Send, Mic, Activity, X } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { useAppStore } from '../../store';
import { generateMorningBriefing } from '../../geminiService';

export const TodayView: React.FC<any> = ({ currentDay, updateDayData, showSuccessToast, currentMood, setMood, habits, healthProfile, setHealthProfile }) => {
  const currentDayStr = new Date().toISOString().split('T')[0];
  const data = currentDay.goals || [];
  
  const [val, setVal] = useState("");
  const [journalText, setJournalText] = useState(currentDay.journal || "");
  const [briefing, setBriefing] = useState(currentDay.briefing || "");
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  
  // Smart Command State
  const [smartCommand, setSmartCommand] = useState("");
  const [isParsingCommand, setIsParsingCommand] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      if (showSuccessToast) showSuccessToast("VOICE NOT SUPPORTED");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSmartCommand(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleSmartCommand = async () => {
    if (!smartCommand.trim() || isParsingCommand) return;
    setIsParsingCommand(true);
    try {
      const { parseNaturalLanguageCommand } = await import('../../geminiService');
      const updates = await parseNaturalLanguageCommand(smartCommand, currentDay, habits);
      if (updates) {
        const newDayData = { ...currentDay };
        if (updates.addedProductiveMins) newDayData.productiveDeviceTime = (newDayData.productiveDeviceTime || 0) + updates.addedProductiveMins;
        if (updates.addedLeisureMins) newDayData.leisureDeviceTime = (newDayData.leisureDeviceTime || 0) + updates.addedLeisureMins;
        if (updates.addedWater) newDayData.waterIntake = (newDayData.waterIntake || 0) + updates.addedWater;
        if (updates.addedSleepMins) newDayData.sleepTime = (newDayData.sleepTime || 0) + updates.addedSleepMins;
        if (updates.addedSteps) newDayData.steps = (newDayData.steps || 0) + updates.addedSteps;
        
        if (updates.completedHabits && updates.completedHabits.length > 0) {
          const currentHabits = newDayData.habits || [];
          newDayData.habits = Array.from(new Set([...currentHabits, ...updates.completedHabits]));
        }

        if (updates.newGoals && updates.newGoals.length > 0) {
          const newGoalsList = updates.newGoals.map((text: string) => ({
            id: Date.now().toString() + Math.random().toString(),
            text,
            priority: 'standard',
            done: false,
            date: currentDayStr
          }));
          newDayData.goals = [...(newDayData.goals || []), ...newGoalsList];
        }

        if (updates.completedGoalIds && updates.completedGoalIds.length > 0) {
          newDayData.goals = (newDayData.goals || []).map((g: any) => 
            updates.completedGoalIds.includes(g.id) ? { ...g, done: true } : g
          );
        }

        updateDayData(currentDayStr, newDayData);
        setSmartCommand("");
        if (showSuccessToast) showSuccessToast("TELEMETRY LOGGED");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsingCommand(false);
    }
  };

  // Focus Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins default
  const [selectedSegment, setSelectedSegment] = useState("Deep Work");
  const segments = useAppStore(state => state.segments);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      // Interconnected Tools: Add to productive time AND check off matching habits
      const currentProductive = currentDay.productiveDeviceTime || 0;
      const newDayData: any = { productiveDeviceTime: currentProductive + 25 };
      
      // Auto-check habit if segment matches
      const currentHabits = currentDay.habits || [];
      const matchingHabit = habits.find((h: string) => h.toLowerCase() === selectedSegment.toLowerCase());
      if (matchingHabit && !currentHabits.includes(matchingHabit)) {
        newDayData.habits = [...currentHabits, matchingHabit];
      }

      updateDayData(currentDayStr, newDayData);
      if (showSuccessToast) showSuccessToast("FOCUS SESSION COMPLETE");
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchBriefing = async () => {
      if (!currentDay.briefing && !isGeneratingBriefing) {
        setIsGeneratingBriefing(true);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const localData = useAppStore.getState().localData;
        const yesterdayData = localData[yesterdayStr] || {};
        const coreIdentity = useAppStore.getState().coreIdentity;
        const accountabilityLevel = useAppStore.getState().accountabilityLevel;
        
        try {
          const newBriefing = await generateMorningBriefing(yesterdayData, coreIdentity, accountabilityLevel);
          setBriefing(newBriefing);
          updateDayData(currentDayStr, { briefing: newBriefing });
        } catch (e) {
          console.error(e);
        } finally {
          setIsGeneratingBriefing(false);
        }
      }
    };
    fetchBriefing();
  }, [currentDayStr]);

  // Vitals State
  const [water, setWater] = useState(currentDay.waterIntake || 0);
  const [sleep, setSleep] = useState(currentDay.sleepTime || 420);
  const [steps, setSteps] = useState(currentDay.steps || 0);

  const handleAddGoal = () => {
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
  };

  const toggleHabit = (habitName: string) => {
    const currentHabits = currentDay.habits || [];
    const isDone = currentHabits.includes(habitName);
    const newHabits = isDone ? currentHabits.filter((h: string) => h !== habitName) : [...currentHabits, habitName];
    updateDayData(currentDayStr, { habits: newHabits });
    if (showSuccessToast && !isDone) showSuccessToast("HABIT COMPLETED");
  };

  const saveVitalsAndJournal = async () => {
    updateDayData(currentDayStr, { 
      waterIntake: water, 
      sleepTime: sleep, 
      steps: steps,
      journal: journalText
    });
    if (showSuccessToast) showSuccessToast("LOG SAVED");
    
    // Trigger Evening Review
    setShowEveningReview(true);
    setIsGeneratingReview(true);
    try {
      const { generateEveningReview } = await import('../../geminiService');
      const coreIdentity = useAppStore.getState().coreIdentity;
      const accountabilityLevel = useAppStore.getState().accountabilityLevel;
      const review = await generateEveningReview(currentDay, coreIdentity, accountabilityLevel);
      setEveningReviewText(review);
    } catch (e) {
      console.error(e);
      setEveningReviewText("Evening review complete. Rest well.");
    } finally {
      setIsGeneratingReview(false);
    }
  };

  const [showEveningReview, setShowEveningReview] = useState(false);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [eveningReviewText, setEveningReviewText] = useState("");

  const doneCount = data.filter((g: any) => g.done).length;
  const totalCount = data.length;

  // Calculate Sync Score
  const activeHabitsCount = habits.length;
  const completedHabitsCount = (currentDay.habits || []).length;
  const habitScore = activeHabitsCount > 0 ? (completedHabitsCount / activeHabitsCount) * 100 : 0;
  const sleepScore = Math.min((currentDay.sleepTime || 0) / 480, 1) * 100;
  const waterScore = Math.min((currentDay.waterIntake || 0) / 2000, 1) * 100;
  const moodVal = currentMood?.mood || 50;
  const energyVal = currentMood?.energy || 50;
  const syncScore = Math.round((habitScore + sleepScore + waterScore + moodVal + energyVal) / 5) || 0;

  return (
    <div className="space-y-10 animate-in w-full max-w-md mx-auto pb-12">
      
      {/* SYNC SCORE HEADER */}
      <div className="flex items-center justify-between bg-[var(--text-main)]/5 p-4 rounded-2xl border border-[var(--text-main)]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center border border-[var(--accent-primary)]/30">
            <Activity size={18} className="text-[var(--accent-primary)]" />
          </div>
          <div>
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-main)] opacity-60">Daily Sync Score</h2>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono tracking-tighter text-[var(--text-main)]">{syncScore}</span>
              <span className="text-[10px] font-mono text-[var(--text-main)] opacity-40">/100</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-mono uppercase tracking-widest text-emerald-400">{syncScore >= 80 ? 'Optimal' : syncScore >= 50 ? 'Nominal' : 'Sub-Optimal'}</p>
        </div>
      </div>

      {/* ORACLE BRIEFING */}
      <section className="bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 p-5 rounded-2xl relative overflow-hidden shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.15)]">
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-primary)]" />
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-[var(--accent-primary)]" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--accent-primary)]">Oracle Morning Briefing</h3>
        </div>
        {isGeneratingBriefing ? (
          <div className="flex items-center gap-2 text-[var(--text-main)] opacity-50">
            <div className="w-3 h-3 border-2 border-[var(--text-main)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-mono uppercase tracking-widest">Analyzing neural data...</p>
          </div>
        ) : (
          <p className="text-sm font-mono text-[var(--text-main)] leading-relaxed opacity-90">{briefing || "Good morning, Operator. Systems are online and ready for optimization."}</p>
        )}
      </section>

      {/* SMART COMMAND (Frictionless Input) */}
      <section className="space-y-2">
        <div className="flex gap-2 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/50">
            <Zap size={14} />
          </div>
          <input 
            value={smartCommand} 
            onChange={e => setSmartCommand(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSmartCommand()} 
            placeholder="Log anything (e.g., 'Drank 2 waters and ran 5k')..." 
            className="flex-1 bg-emerald-500/5 p-3.5 pl-9 pr-10 rounded-[1.25rem] text-xs font-mono outline-none border border-emerald-500/20 text-[var(--text-main)] placeholder:text-[var(--text-main)] placeholder:opacity-40 focus:border-emerald-500/50 focus:bg-emerald-500/10 transition-all shadow-inner" 
          />
          <button 
            onClick={startListening} 
            className={`absolute right-[3.5rem] top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${isListening ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'text-[var(--text-main)] opacity-40 hover:opacity-100'}`}
          >
            <Mic size={14} />
          </button>
          <button onClick={handleSmartCommand} disabled={isParsingCommand || !smartCommand.trim()} className="p-3.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-[1.25rem] active:scale-95 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 hover:bg-emerald-500/30">
            {isParsingCommand ? <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : <Send size={14}/>}
          </button>
        </div>
      </section>

      {/* 2. DAILY GOALS */}
      <section className="space-y-4">
        <SectionHeader title="Daily Briefing" subtitle={`${doneCount}/${totalCount} Objectives Executed`} icon={Target} colorClass="text-[var(--accent-primary)]" />
        <div className="flex gap-2 mb-4">
          <input 
            value={val} 
            onChange={e => setVal(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleAddGoal()} 
            placeholder="New mission objective..." 
            className="flex-1 bg-[var(--text-main)]/5 p-3 rounded-xl text-xs font-mono outline-none border border-[var(--text-main)]/10 text-[var(--text-main)] placeholder:text-[var(--text-main)] placeholder:opacity-40 focus:border-[var(--accent-primary)]/50 transition-colors" 
          />
          <button onClick={handleAddGoal} className="p-3 bg-[var(--accent-primary)] rounded-xl text-white active:scale-95 transition-all shadow-lg shadow-[var(--accent-primary)]/20"><Plus size={14}/></button>
        </div>
        <div className="space-y-2">
          {data.map((goal: any) => (
            <div key={goal.id} className="bg-[var(--text-main)]/5 p-3.5 rounded-[1.25rem] border border-[var(--text-main)]/5 flex flex-col gap-2 active:scale-[0.99] transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleGoal(goal)}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${goal.done ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' : 'border-[var(--text-main)]/30 bg-[var(--text-main)]/5'}`}
                >
                  {goal.done && <Check size={10} strokeWidth={3} className="text-white" />}
                </button>
                <p className={`text-[11px] font-mono flex-1 leading-snug ${goal.done ? 'line-through text-[var(--text-main)] opacity-40' : 'text-[var(--text-main)] opacity-90'}`}>{goal.text}</p>
                <button onClick={() => deleteGoal(goal.id)} className="p-1.5 text-[var(--text-main)] opacity-40 hover:text-rose-500 hover:opacity-100 transition-colors shrink-0"><Trash2 size={12}/></button>
              </div>
            </div>
          ))}
          {data.length === 0 && <p className="text-center py-6 opacity-30 font-mono uppercase text-[10px] tracking-[0.25em] text-[var(--text-main)]">No active traces</p>}
        </div>
      </section>

      {/* FOCUS TIMER */}
      <section className="space-y-4">
        <SectionHeader title="Deep Work Protocol" icon={Timer} colorClass="text-indigo-400" infoText="Focus Chamber: A dedicated space for uninterrupted deep work. Select your neural segment, engage the timer, and eliminate all distractions." />
        <div className="bg-[var(--text-main)]/5 p-6 rounded-[1.5rem] border border-[var(--text-main)]/10 flex flex-col items-center gap-4">
          <select 
            value={selectedSegment} 
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="bg-black/40 border border-[var(--text-main)]/10 text-[var(--text-main)] text-xs font-mono p-2 rounded-lg outline-none w-full text-center appearance-none"
          >
            {segments.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <div className="text-5xl font-mono tracking-tighter text-[var(--text-main)] drop-shadow-lg">
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={toggleTimer} 
              className={`flex-1 py-3 rounded-xl font-mono uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${timerActive ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20'}`}
            >
              {timerActive ? <><Square size={14} /> Pause</> : <><Play size={14} /> Engage</>}
            </button>
            <button 
              onClick={() => { setTimerActive(false); setTimeLeft(25 * 60); }} 
              className="px-4 py-3 bg-[var(--text-main)]/10 rounded-xl text-[var(--text-main)] opacity-60 hover:opacity-100 transition-all active:scale-95"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <p className="text-[8px] font-mono text-[var(--text-main)] opacity-30 tracking-widest uppercase mt-2 text-center w-full">Pro Tip: Use the stopwatch mode for open-ended brainstorming.</p>
        </div>
      </section>

      {/* 1. MOOD & ENERGY */}
      <section className="space-y-4">
        <SectionHeader title="State of Heart" icon={Smile} colorClass="text-amber-400" />
        <div className="bg-[var(--text-main)]/5 p-5 rounded-[1.5rem] border border-[var(--text-main)]/10 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-[var(--text-main)] opacity-60">
              <span className="flex items-center gap-1"><Smile size={12} className="text-amber-400"/> Mood</span>
              <span>{currentMood?.mood || 50}%</span>
            </div>
            <input type="range" min="0" max="100" value={currentMood?.mood || 50} onChange={e => setMood({ ...currentMood, mood: Number(e.target.value) })} className="w-full accent-amber-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-[var(--text-main)] opacity-60">
              <span className="flex items-center gap-1"><Zap size={12} className="text-blue-400"/> Energy</span>
              <span>{currentMood?.energy || 50}%</span>
            </div>
            <input type="range" min="0" max="100" value={currentMood?.energy || 50} onChange={e => setMood({ ...currentMood, energy: Number(e.target.value) })} className="w-full accent-blue-400" />
          </div>
        </div>
      </section>

      {/* 3. HABITS */}
      <section className="space-y-4">
        <SectionHeader title="Habit Protocols" icon={Flame} colorClass="text-orange-500" infoText="Atomic Habits: Small, consistent actions that compound over time. Check off your daily protocols to build unbreakable streaks." />
        <div className="grid grid-cols-2 gap-2">
          {habits.map((h: any) => {
            const habit = typeof h === 'string' ? h : (h.text || '');
            if (!habit) return null;
            const isDone = (currentDay.habits || []).includes(habit);
            
            // Calculate streak
            let streak = 0;
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const habitCompletions = useAppStore.getState().habitCompletions || {};
            
            if ((habitCompletions[todayStr] || []).includes(habit)) streak++;
            
            let checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - 1);
            while (true) {
              const dateStr = checkDate.toISOString().split('T')[0];
              if ((habitCompletions[dateStr] || []).includes(habit)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else {
                break;
              }
            }

            return (
              <button 
                key={habit}
                onClick={() => toggleHabit(habit)}
                className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all active:scale-95 ${isDone ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'bg-[var(--text-main)]/5 border-[var(--text-main)]/10 text-[var(--text-main)] opacity-70 hover:opacity-100 hover:border-[var(--text-main)]/20'}`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-1.5">
                    <Flame size={14} className={isDone ? "text-orange-500" : "text-[var(--text-main)] opacity-50"} />
                    {streak > 0 && <span className={`text-[9px] font-mono font-bold ${isDone ? 'text-orange-400' : 'text-[var(--text-main)] opacity-50'}`}>{streak}</span>}
                  </div>
                  {isDone && <Check size={12} className="text-orange-500" />}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest leading-tight">{habit}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[8px] font-mono text-[var(--text-main)] opacity-30 tracking-widest uppercase mt-2 text-center w-full">Pro Tip: Stack new habits onto existing ones for higher success rates.</p>
      </section>

      {/* 4. VITALS */}
      <section className="space-y-4">
        <SectionHeader title="Biometrics" icon={Heart} colorClass="text-rose-500" />
        <div className="space-y-3">
          <div className="bg-[var(--text-main)]/5 p-4 rounded-2xl border border-[var(--text-main)]/10 space-y-3">
            <div className="flex items-center justify-between text-cyan-400">
              <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest"><Droplet size={14} /> Hydration</span>
              <span className="text-xs font-mono text-[var(--text-main)]">{water} ml</span>
            </div>
            <input type="range" min="0" max="4000" step="100" value={water} onChange={e => setWater(Number(e.target.value))} className="w-full accent-cyan-500" />
          </div>

          <div className="bg-[var(--text-main)]/5 p-4 rounded-2xl border border-[var(--text-main)]/10 space-y-3">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest"><Moon size={14} /> Sleep</span>
              <span className="text-xs font-mono text-[var(--text-main)]">{(sleep / 60).toFixed(1)} h</span>
            </div>
            <input type="range" min="0" max="720" step="30" value={sleep} onChange={e => setSleep(Number(e.target.value))} className="w-full accent-indigo-500" />
          </div>

          <div className="bg-[var(--text-main)]/5 p-4 rounded-2xl border border-[var(--text-main)]/10 space-y-3">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest"><Footprints size={14} /> Steps</span>
              <span className="text-xs font-mono text-[var(--text-main)]">{steps}</span>
            </div>
            <input type="range" min="0" max="20000" step="500" value={steps} onChange={e => setSteps(Number(e.target.value))} className="w-full accent-emerald-500" />
          </div>
        </div>
      </section>

      {/* 5. JOURNAL */}
      <section className="space-y-4">
        <SectionHeader title="Daily Log" icon={BookOpen} colorClass="text-purple-400" />
        <textarea 
          value={journalText}
          onChange={e => setJournalText(e.target.value)}
          placeholder="Log your thoughts, wins, or reflections for today..."
          className="w-full h-32 bg-[var(--text-main)]/5 border border-[var(--text-main)]/10 rounded-2xl p-4 text-sm font-mono text-[var(--text-main)] placeholder:text-[var(--text-main)] placeholder:opacity-40 outline-none focus:border-purple-500/50 transition-all resize-none"
        />
      </section>

      <button 
        onClick={saveVitalsAndJournal}
        className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-xl font-mono uppercase tracking-widest hover:bg-[var(--accent-primary)]/80 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
      >
        <Sparkles size={16} /> Save Daily Log & Review
      </button>

      {/* Evening Review Modal */}
      {showEveningReview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in">
          <div className="bg-[var(--card-bg)] border border-[var(--text-main)]/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-indigo-400">
                <Moon size={18} />
                <h3 className="text-sm font-mono uppercase tracking-widest">Evening Review</h3>
              </div>
              <button onClick={() => setShowEveningReview(false)} className="text-[var(--text-main)] opacity-50 hover:opacity-100 transition-opacity">
                <X size={16} />
              </button>
            </div>
            
            <div className="bg-[var(--text-main)]/5 p-5 rounded-2xl border border-[var(--text-main)]/10 min-h-[120px] flex items-center justify-center">
              {isGeneratingReview ? (
                <div className="flex flex-col items-center gap-3 text-[var(--text-main)] opacity-50">
                  <div className="w-5 h-5 border-2 border-[var(--text-main)] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-mono uppercase tracking-widest">Analyzing daily telemetry...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eveningReviewText.split('\n').map((line, i) => (
                    <p key={i} className="text-xs font-mono text-[var(--text-main)] leading-relaxed opacity-90">{line}</p>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowEveningReview(false)} 
              className="w-full mt-6 py-3 bg-[var(--text-main)]/10 text-[var(--text-main)] rounded-xl font-mono uppercase text-[10px] tracking-widest hover:bg-[var(--text-main)]/20 transition-all"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
