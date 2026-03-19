import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  deviceTime: string;
  studyLogs: StudyLog[];
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
  gender: 'boy' | 'girl' | '';
  themeName: string;
  onboardingComplete: boolean;
  
  // Settings
  thresholds: { screen: number; study: number; sleep: number };
  segments: string[];
  
  // Data
  localData: Record<string, DayData>;
  events: Event[];
  notes: Note[];
  
  // Habits: date -> array of completed habit names
  habits: string[];
  habitCompletions: Record<string, string[]>;

  // Actions
  setUserName: (name: string) => void;
  setGender: (gender: 'boy' | 'girl' | '') => void;
  setThemeName: (theme: string) => void;
  completeOnboarding: () => void;
  
  setThresholds: (thresholds: { screen: number; study: number; sleep: number }) => void;
  setSegments: (segments: string[]) => void;
  
  setLocalData: (data: Record<string, DayData>) => void;
  updateDayData: (date: string, data: Partial<DayData>) => void;
  
  addEvent: (event: Event) => void;
  removeEvent: (id: number) => void;
  
  addNote: (note: Note) => void;
  removeNote: (id: number) => void;
  
  setHabits: (habits: string[]) => void;
  toggleHabitCompletion: (date: string, habitName: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userName: '',
      gender: '',
      themeName: 'Midnight',
      onboardingComplete: false,
      
      thresholds: { screen: 120, study: 240, sleep: 480 },
      segments: ['Deep Work', 'Admin', 'Health', 'Learning'],
      
      localData: {},
      events: [],
      notes: [],
      
      habits: ['Morning Hydration', 'Deep Work Block', 'Movement', 'Evening Review'],
      habitCompletions: {},

      setUserName: (userName) => set({ userName }),
      setGender: (gender) => set({ gender }),
      setThemeName: (themeName) => set({ themeName }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      
      setThresholds: (thresholds) => set({ thresholds }),
      setSegments: (segments) => set({ segments }),
      
      setLocalData: (localData) => set({ localData }),
      updateDayData: (date, data) => set((state) => ({
        localData: {
          ...state.localData,
          [date]: {
            ...(state.localData[date] || { goals: [], deviceTime: "0", studyLogs: [] }),
            ...data
          }
        }
      })),
      
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      removeEvent: (id) => set((state) => ({ events: state.events.filter(e => e.id !== id) })),
      
      addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
      removeNote: (id) => set((state) => ({ notes: state.notes.filter(n => n.id !== id) })),
      
      setHabits: (habits) => set({ habits }),
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
