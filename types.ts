
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

export enum AppState {
  WELCOME = 'welcome',
  DASHBOARD = 'dashboard'
}

export enum Tab {
  DAILY = 'daily',
  STATS = 'stats',
  DIGITAL = 'digital',
  HABIT = 'habit'
}

export enum AppMode {
  NORMAL = 'normal',
  TARGET = 'target',
  VACATION = 'vacation'
}

export enum Mood {
  GRATEFUL = 'grateful',
  ENERGETIC = 'energetic',
  SAD = 'sad',
  ANGRY = 'angry',
  DEPRESSED = 'depressed'
}

export interface UserProfile {
  name: string;
  email: string;
  level: number;
  karma: number;
  streak: number;
}
