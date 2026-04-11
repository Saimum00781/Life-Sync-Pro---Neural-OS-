import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StateOfHeart } from './types';

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
  journal?: string;
  briefing?: string;
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

interface AppState {
  // User Profile
  userName: string;
  archetype: 'optimizer' | 'balancer' | '';
  themeName: string;
  onboardingComplete: boolean;
  healthProfile: { height: number; weight: number; workInfo?: string; location?: string };
  coreIdentity: string;
  dailyMood: Record<string, StateOfHeart>;
  weatherTheme: string;
  strictMode: boolean;
  hapticFeedback: boolean;
  createdAt: string;
  
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

  // Actions
  setUserName: (name: string) => void;
  setArchetype: (archetype: 'optimizer' | 'balancer' | '') => void;
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
  setDailyMood: (date: string, mood: StateOfHeart) => void;
  setWeatherTheme: (theme: string) => void;
  setStrictMode: (val: boolean) => void;
  setHapticFeedback: (val: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userName: '',
      archetype: '',
      themeName: 'Rainy',
      onboardingComplete: false,
      healthProfile: { height: 170, weight: 65, workInfo: '', location: '' },
      coreIdentity: 'I am a high-performance operator.',
      dailyMood: {},
      weatherTheme: 'Rainy',
      strictMode: false,
      hapticFeedback: true,
      createdAt: new Date().toISOString(),
      
      thresholds: { leisureMax: 120, productiveMin: 240, offlineMin: 120, sleepMin: 480 },
      segments: ['Deep Work', 'Admin', 'Health', 'Learning'],
      habitStacks: [],
      
      localData: {},
      events: [],
      notes: [],
      
      habits: ['Morning Hydration', 'Deep Work Block', 'Movement', 'Evening Review'],
      habitCompletions: {},

      setUserName: (userName) => set({ userName }),
      setArchetype: (archetype) => set({ archetype }),
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
          ...(state.localData || {}),
          [date]: {
            ...((state.localData && state.localData[date]) || { goals: [], deviceTime: "0", studyLogs: [], leisureDeviceTime: 0, productiveDeviceTime: 0, offlineTime: 0, sleepTime: 0, waterIntake: 0 }),
            ...data
          }
        }
      })),
      
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      removeEvent: (id) => set((state) => ({ events: state.events.filter(e => e.id !== id) })),
      
      addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
      removeNote: (id) => set((state) => ({ notes: state.notes.filter(n => n.id !== id) })),
      
      setHabits: (habits) => set({ habits }),
      setDailyMood: (date, mood) => set((state) => ({
        dailyMood: { ...(state.dailyMood || {}), [date]: mood }
      })),
      setWeatherTheme: (weatherTheme) => set({ weatherTheme }),
      setStrictMode: (strictMode) => set({ strictMode }),
      setHapticFeedback: (hapticFeedback) => set({ hapticFeedback }),
      toggleHabitCompletion: (date, habitName) => set((state) => {
        const currentCompletions = (state.habitCompletions && state.habitCompletions[date]) || [];
        const isCompleted = currentCompletions.includes(habitName);
        
        return {
          habitCompletions: {
            ...(state.habitCompletions || {}),
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
