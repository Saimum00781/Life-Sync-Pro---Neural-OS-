
export interface Goal {
  id: string;
  text: string;
  description?: string;
  priority: 'critical' | 'standard';
  done: boolean;
  date: string;
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
  INBOX = 'inbox',
  TODAY = 'today',
  UPCOMING = 'upcoming',
  BROWSE = 'browse'
}

export interface UserProfile {
  name: string;
  email: string;
  level: number;
  karma: number;
  streak: number;
}
