
export interface Goal {
  id: string;
  text: string;
  intent?: string;
  priority: 'critical' | 'standard';
  done: boolean;
}

export interface StudyLog {
  id: string;
  category: string;
  topic: string;
  time: string;
}

export interface DayData {
  goals: Goal[];
  weekly: Goal[];
  steps: number;
  calories: number;
  deviceTime: string;
  studyLogs: StudyLog[];
}

export enum AppState {
  WELCOME = 'welcome',
  ONBOARDING = 'onboarding',
  DASHBOARD = 'dashboard'
}

export enum Tab {
  CALENDAR = 'calendar',
  PLANNING = 'planning',
  DIGITAL = 'digital',
  ANALYTICS = 'analytics'
}
