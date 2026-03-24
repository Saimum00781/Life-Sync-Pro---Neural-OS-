import React, { useState } from 'react';
import { Heart, Droplet, Moon, Activity, Save, Scale, Footprints, Flame, ShieldAlert, Coffee } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { AppMode } from '../../types';

export const VitalsView = ({ currentDay, updateDayData, healthProfile, setHealthProfile, targetBaseMode, showSuccessToast, appMode }: any) => {
  const currentDayStr = new Date().toISOString().split('T')[0];
  const [height, setHeight] = useState(healthProfile?.height || 170);
  const [weight, setWeight] = useState(healthProfile?.weight || 65);
  const [water, setWater] = useState(currentDay?.waterIntake || 0);
  const [sleep, setSleep] = useState(currentDay?.sleepTime || 420); // in minutes
  const [steps, setSteps] = useState(currentDay?.steps || 0);
  const [caloriesEaten, setCaloriesEaten] = useState(currentDay?.caloriesEaten || 0);

  const caloriesBurned = Math.round(steps * 0.04);
  const waterGoal = 2500;
  const sleepGoal = 480; // 8 hours
  const stepsGoal = 10000;
  const caloriesGoal = 2000; // Static goal for now

  const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);
  let bmiStatus = "Normal";
  let bmiColor = "text-emerald-400";
  if (parseFloat(bmi) < 18.5) { bmiStatus = "Underweight"; bmiColor = "text-orange-400"; }
  else if (parseFloat(bmi) > 25) { bmiStatus = "Overweight"; bmiColor = "text-rose-400"; }

  const isTarget = appMode === AppMode.TARGET;
  const isVacation = appMode === AppMode.VACATION;

  const saveVitals = () => {
    setHealthProfile({ ...healthProfile, height, weight });
    updateDayData(currentDayStr, { waterIntake: water, sleepTime: sleep, steps, caloriesEaten, caloriesBurned });
    if (showSuccessToast) showSuccessToast("VITALS SYNCHRONIZED");
  };

  return (
    <div className="space-y-6 animate-in w-full max-w-md mx-auto">
      <SectionHeader 
        title={isTarget ? "Target Base Biometrics" : isVacation ? "Recovery Biometrics" : "Biometrics & Vitals"} 
        subtitle="Physical Integrity" 
        infoText={isTarget ? `Optimize your physical vessel to achieve: ${targetBaseMode?.target}` : isVacation ? "Monitor hydration and sleep to maximize recovery and healing." : "Monitor your physical vessel. BMI, hydration, and recovery metrics are essential for optimal neural performance."}
        icon={isTarget ? ShieldAlert : isVacation ? Coffee : Heart}
        colorClass={isTarget ? "text-red-500" : isVacation ? "text-emerald-500" : "text-rose-500"}
      />

      {isTarget && targetBaseMode && (
        <div className="bg-red-950/40 p-4 rounded-2xl border border-red-500/30 mb-6 flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-red-400 mb-1">Target Base Mode</h3>
            <p className="text-sm font-bold text-white leading-tight">Physical optimization is mandatory for target acquisition.</p>
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
            <p className="text-sm font-bold text-white leading-tight">Prioritize hydration and sleep for maximum recovery.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Scale size={14} />
            <span className="text-[10px] font-mono uppercase tracking-widest">Weight (kg)</span>
          </div>
          <input 
            type="number" 
            value={weight} 
            onChange={e => setWeight(Number(e.target.value))}
            className="w-full bg-black/20 border border-white/5 p-3 rounded-xl text-white font-mono text-center outline-none focus:border-rose-500/50 transition-all"
          />
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity size={14} />
            <span className="text-[10px] font-mono uppercase tracking-widest">Height (cm)</span>
          </div>
          <input 
            type="number" 
            value={height} 
            onChange={e => setHeight(Number(e.target.value))}
            className="w-full bg-black/20 border border-white/5 p-3 rounded-xl text-white font-mono text-center outline-none focus:border-rose-500/50 transition-all"
          />
        </div>
      </div>

      <div className="bg-white/5 p-5 rounded-[1.5rem] border border-white/10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Current BMI</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-2xl font-mono text-white">{bmi}</span>
            <span className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${bmiColor}`}>{bmiStatus}</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 ${bmiColor}`}>
          <Heart size={20} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 pl-2">Daily Intake & Recovery</h3>
        
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400">
              <Droplet size={14} />
              <span className="text-[10px] font-mono uppercase tracking-widest">Hydration (ml)</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-white">{water} ml</span>
              <span className="text-[9px] font-mono text-slate-500 block">Goal: {waterGoal} ml</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 transition-all" style={{ width: `${Math.min(100, (water / waterGoal) * 100)}%` }} />
          </div>
          <input 
            type="range" 
            min="0" max="4000" step="100"
            value={water} 
            onChange={e => setWater(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400">
              <Moon size={14} />
              <span className="text-[10px] font-mono uppercase tracking-widest">Sleep (Hours)</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-white">{(sleep / 60).toFixed(1)} h</span>
              <span className="text-[9px] font-mono text-slate-500 block">Goal: {(sleepGoal / 60).toFixed(1)} h</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${Math.min(100, (sleep / sleepGoal) * 100)}%` }} />
          </div>
          <input 
            type="range" 
            min="0" max="720" step="30"
            value={sleep} 
            onChange={e => setSleep(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Footprints size={14} />
              <span className="text-[10px] font-mono uppercase tracking-widest">Steps</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-white">{steps}</span>
              <span className="text-[9px] font-mono text-slate-500 block">Goal: {stepsGoal}</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, (steps / stepsGoal) * 100)}%` }} />
          </div>
          <input 
            type="range" 
            min="0" max="20000" step="500"
            value={steps} 
            onChange={e => setSteps(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="text-[10px] font-mono text-slate-400 text-right">
            Est. Burn: <span className="text-orange-400 font-bold">{caloriesBurned} kcal</span>
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-400">
              <Flame size={14} />
              <span className="text-[10px] font-mono uppercase tracking-widest">Nutrition (kcal)</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-white">{caloriesEaten} kcal</span>
              <span className="text-[9px] font-mono text-slate-500 block">Goal: {caloriesGoal} kcal</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 transition-all" style={{ width: `${Math.min(100, (caloriesEaten / caloriesGoal) * 100)}%` }} />
          </div>
          <input 
            type="range" 
            min="0" max="4000" step="50"
            value={caloriesEaten} 
            onChange={e => setCaloriesEaten(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
      </div>

      <button 
        onClick={saveVitals}
        className={`w-full py-4 border rounded-xl font-mono uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${isTarget ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30' : isVacation ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'}`}
      >
        <Save size={14} /> Sync Vitals
      </button>

    </div>
  );
};
