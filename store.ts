import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppMode, Mood } from './types';

export interface Goal {
  id: string;
  text: string;
  description?: string;
  priority: 'critical' | 'standard';
  done: boolean;
  date: string;
  source?: string;
}

export interface StudyLog {
  id: string;
  category: string;
  topic: string;
  time: string; // Total minutes
}

export interface DayData {
  goals: Goal[];
  deviceTime: string; // legacy
  leisureDeviceTime?: number;
  productiveDeviceTime?: number;
  offlineTime?: number;
  sleepTime?: number;
  waterIntake?: number;
  steps?: number;
  caloriesBurned?: number;
  caloriesEaten?: number;
  studyLogs: StudyLog[];
  habits?: string[];
}

export interface Event {
  id: number;
  date: string;
  text: string;
}

export interface Note {
  id: number;
  text: string;
}

export interface TargetBaseModeConfig {
  isActive: boolean;
  target: string;
  deadline: string;
  pillars: string[];
}

interface AppState {
  // User Profile
  userName: string;
  gender: 'boy' | 'girl' | '';
  themeName: string;
  onboardingComplete: boolean;
  healthProfile: { height: number; weight: number; workInfo?: string; location?: string };
  coreIdentity: string;
  targetBaseMode: TargetBaseModeConfig;
  appMode: AppMode;
  modeExpiration: number | null;
  dailyMood: Record<string, Mood>;
  
  // Settings
  thresholds: { leisureMax: number; productiveMin: number; offlineMin: number; sleepMin: number };
  segments: string[];
  habitStacks: { id: string; currentHabit: string; newHabit: string }[];
  
  // Data
  localData: Record<string, DayData>;
  events: Event[];
  notes: Note[];
  
  // Habits: date -> array of completed habit names
  habits: any[];
  habitCompletions: Record<string, string[]>;
  
  // Target Base Mode: date -> array of completed pillar indices (0, 1, 2)
  pillarCompletions: Record<string, number[]>;

  // Actions
  setUserName: (name: string) => void;
  setGender: (gender: 'boy' | 'girl' | '') => void;
  setThemeName: (theme: string) => void;
  completeOnboarding: () => void;
  setHealthProfile: (profile: { height: number; weight: number; workInfo?: string; location?: string }) => void;
  setCoreIdentity: (identity: string) => void;
  
  setThresholds: (thresholds: { leisureMax: number; productiveMin: number; offlineMin: number; sleepMin: number }) => void;
  setSegments: (segments: string[]) => void;
  setHabitStacks: (stacks: { id: string; currentHabit: string; newHabit: string }[]) => void;
  
  setLocalData: (data: Record<string, DayData>) => void;
  updateDayData: (date: string, data: Partial<DayData>) => void;
  
  addEvent: (event: Event) => void;
  removeEvent: (id: number) => void;
  
  addNote: (note: Note) => void;
  removeNote: (id: number) => void;
  
  setHabits: (habits: string[]) => void;
  toggleHabitCompletion: (date: string, habitName: string) => void;
  togglePillarCompletion: (date: string, pillarIndex: number) => void;
  setTargetBaseMode: (config: TargetBaseModeConfig) => void;
  setAppMode: (mode: AppMode, expiration?: number | null) => void;
  setDailyMood: (date: string, mood: Mood) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userName: '',
      gender: '',
      themeName: 'Midnight',
      onboardingComplete: false,
      healthProfile: { height: 170, weight: 65, workInfo: '', location: '' },
      coreIdentity: 'I am a high-performance operator.',
      targetBaseMode: { isActive: false, target: '', deadline: '', pillars: ['', '', ''] },
      appMode: AppMode.NORMAL,
      modeExpiration: null,
      dailyMood: {},
      
      thresholds: { leisureMax: 120, productiveMin: 240, offlineMin: 120, sleepMin: 480 },
      segments: ['Deep Work', 'Admin', 'Health', 'Learning'],
      habitStacks: [],
      
      localData: {},
      events: [],
      notes: [],
      
      habits: ['Morning Hydration', 'Deep Work Block', 'Movement', 'Evening Review'],
      habitCompletions: {},
      pillarCompletions: {},

      setUserName: (userName) => set({ userName }),
      setGender: (gender) => set({ gender }),
      setThemeName: (themeName) => set({ themeName }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      setHealthProfile: (healthProfile) => set({ healthProfile }),
      setCoreIdentity: (coreIdentity) => set({ coreIdentity }),
      
      setThresholds: (thresholds) => set({ thresholds }),
      setSegments: (segments) => set({ segments }),
      setHabitStacks: (habitStacks) => set({ habitStacks }),
      
      setLocalData: (localData) => set({ localData }),
      updateDayData: (date, data) => set((state) => ({
        localData: {
          ...state.localData,
          [date]: {
            ...(state.localData[date] || { goals: [], deviceTime: "0", studyLogs: [], leisureDeviceTime: 0, productiveDeviceTime: 0, offlineTime: 0, sleepTime: 0, waterIntake: 0 }),
            ...data
          }
        }
      })),
      
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      removeEvent: (id) => set((state) => ({ events: state.events.filter(e => e.id !== id) })),
      
      addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
      removeNote: (id) => set((state) => ({ notes: state.notes.filter(n => n.id !== id) })),
      
      setHabits: (habits) => set({ habits }),
      setTargetBaseMode: (targetBaseMode) => set({ targetBaseMode }),
      setAppMode: (appMode, expiration = null) => set({ appMode, modeExpiration: expiration }),
      setDailyMood: (date, mood) => set((state) => ({
        dailyMood: { ...state.dailyMood, [date]: mood }
      })),
      togglePillarCompletion: (date: string, pillarIndex: number) => set((state) => {
        const currentCompletions = state.pillarCompletions[date] || [];
        const isCompleted = currentCompletions.includes(pillarIndex);
        return {
          pillarCompletions: {
            ...state.pillarCompletions,
            [date]: isCompleted 
              ? currentCompletions.filter(i => i !== pillarIndex)
              : [...currentCompletions, pillarIndex]
          }
        };
      }),
      toggleHabitCompletion: (date, habitName) => set((state) => {
        const currentCompletions = state.habitCompletions[date] || [];
        const isCompleted = currentCompletions.includes(habitName);
        
        return {
          habitCompletions: {
            ...state.habitCompletions,
            [date]: isCompleted 
              ? currentCompletions.filter(h => h !== habitName)
              : [...currentCompletions, habitName]
          }
        };
      })
    }),
    {
      name: 'life-sync-pro-storage',
    }
  )
);
