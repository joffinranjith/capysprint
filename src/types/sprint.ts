export type EnergyLevel = 'low' | 'medium' | 'high';

export type TaskCategory = 'study' | 'build' | 'life' | 'creative';

export interface MicroSprint {
  id: string;
  parentTask: string;
  title: string;
  durationMinutes: number;
  energyRequired: EnergyLevel;
  category: TaskCategory;
  completed: boolean;
  completedAt?: string;
}

export interface FocusLog {
  id: string;
  sprintTitle: string;
  minutes: number;
  energyMatched: boolean;
  dateISO: string; // YYYY-MM-DD
}

export interface AppSettings {
  dailyGoalMinutes: number;
  soundEnabled: boolean;
  capyFound: boolean;
  zenAudioActive: boolean;
  anakinApiKey: string;
}
