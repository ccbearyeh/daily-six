export type ISO8601Date = string;
export type Locale = "zh-TW" | "en";

export interface Task {
  id: string;
  text: string;
  order: number;
  completed: boolean;
  completedAt: number | null;
  createdAt: number;
  carriedFrom: ISO8601Date | null;
}

export interface DayRecord {
  date: ISO8601Date;
  tasks: Task[];
  locked: boolean;
  startedAt: number | null;
  completedAt: number | null;
}

export interface ReminderTime {
  enabled: boolean;
  time: string;
}

export interface ReminderStale {
  enabled: boolean;
  thresholdMinutes: number;
}

export interface Settings {
  locale: Locale;
  reminders: {
    morningPlan: ReminderTime;
    eveningReview: ReminderTime;
    staleFocus: ReminderStale;
  };
  rolloverPolicy: "prompt" | "auto-accept" | "auto-discard";
  historyRetentionDays: number;
}

export interface AppState {
  schemaVersion: 1;
  currentDay: ISO8601Date;
  days: Record<ISO8601Date, DayRecord>;
  settings: Settings;
  lastActiveAt: number;
}

export const STORAGE_KEY = "dailySix:state:v1";
export const SCHEMA_VERSION = 1 as const;

export function defaultSettings(): Settings {
  return {
    locale: "zh-TW",
    reminders: {
      morningPlan: { enabled: true, time: "08:00" },
      eveningReview: { enabled: true, time: "21:00" },
      staleFocus: { enabled: false, thresholdMinutes: 90 },
    },
    rolloverPolicy: "prompt",
    historyRetentionDays: 30,
  };
}

export function emptyDay(date: ISO8601Date): DayRecord {
  return {
    date,
    tasks: [],
    locked: false,
    startedAt: null,
    completedAt: null,
  };
}

export function defaultState(today: ISO8601Date): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    currentDay: today,
    days: { [today]: emptyDay(today) },
    settings: defaultSettings(),
    lastActiveAt: Date.now(),
  };
}
