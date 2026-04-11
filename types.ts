
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

export enum AppMode {
  NORMAL = 'normal',
  TARGET = 'target',
  VACATION = 'vacation'
}

export enum Tab {
  DAILY = 'daily',
  STATS = 'stats',
  DIGITAL = 'digital',
  HABIT = 'habit'
}

export interface StateOfHeart {
  energy: number; // 0 to 100
  mood: number; // 0 to 100
}

export interface UserProfile {
  name: string;
  email: string;
  level: number;
  karma: number;
  streak: number;
}
