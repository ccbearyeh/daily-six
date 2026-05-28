import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  type AppState,
  type DayRecord,
  type ISO8601Date,
  type Settings,
  type Task,
  defaultState,
  emptyDay,
} from "./types";
import { todayISO } from "./date";
import { loadState, saveState, subscribeState, pruneHistory } from "./storage";

export const MAX_TASKS = 6;
export const MAX_TASK_LEN = 120;

export type RolloverDecision = { taskId: string; carry: boolean };

interface StoreActions {
  hydrate: () => Promise<void>;
  addTask: (text: string) => void;
  updateTaskText: (id: string, text: string) => void;
  removeTask: (id: string) => void;
  reorderTasks: (orderedIds: string[]) => void;
  lockAndStart: () => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  applyRollover: (decisions: RolloverDecision[]) => void;
  dismissRolloverDay: () => void;
  setLocale: (locale: Settings["locale"]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => Promise<void>;
  exportJSON: () => string;
  importState: (next: AppState) => Promise<void>;
}

interface StoreState extends AppState {
  hydrated: boolean;
  needsRolloverFrom: ISO8601Date | null;
}

function findRolloverSource(state: AppState): ISO8601Date | null {
  const today = todayISO();
  if (state.currentDay === today) return null;
  const prev = state.days[state.currentDay];
  if (!prev) return null;
  const incomplete = prev.tasks.filter((t) => !t.completed);
  return incomplete.length > 0 ? state.currentDay : null;
}

function todayRecord(state: AppState): DayRecord {
  const today = todayISO();
  if (!state.days[today]) state.days[today] = emptyDay(today);
  return state.days[today];
}

async function persist(state: AppState): Promise<AppState> {
  const pruned = pruneHistory({ ...state, lastActiveAt: Date.now() });
  await saveState(pruned);
  return pruned;
}

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  ...defaultState(todayISO()),
  hydrated: false,
  needsRolloverFrom: null,

  async hydrate() {
    const loaded = await loadState();
    const today = todayISO();
    const next: AppState = { ...loaded };

    if (!next.days[today]) {
      next.days[today] = emptyDay(today);
    }

    const rolloverFrom = findRolloverSource(next);

    if (!rolloverFrom && next.currentDay !== today) {
      next.currentDay = today;
    }

    await saveState(next);

    set({
      ...next,
      hydrated: true,
      needsRolloverFrom: rolloverFrom,
    });

    subscribeState((remote) => {
      if (remote.lastActiveAt === get().lastActiveAt) return;
      set({ ...remote });
    });
  },

  addTask(text) {
    const trimmed = text.trim().slice(0, MAX_TASK_LEN);
    if (!trimmed) return;
    const state = get();
    const today = todayRecord(state);
    if (today.tasks.length >= MAX_TASKS) return;
    const task: Task = {
      id: "t_" + nanoid(10),
      text: trimmed,
      order: today.tasks.length,
      completed: false,
      completedAt: null,
      createdAt: Date.now(),
      carriedFrom: null,
    };
    const updatedDay: DayRecord = {
      ...today,
      tasks: [...today.tasks, task],
    };
    const next = {
      ...state,
      days: { ...state.days, [updatedDay.date]: updatedDay },
    };
    persist(next).then((p) => set(p));
  },

  updateTaskText(id, text) {
    const state = get();
    const today = todayRecord(state);
    if (today.locked) return;
    const tasks = today.tasks.map((t) =>
      t.id === id ? { ...t, text: text.slice(0, MAX_TASK_LEN) } : t,
    );
    const updatedDay = { ...today, tasks };
    const next = {
      ...state,
      days: { ...state.days, [updatedDay.date]: updatedDay },
    };
    persist(next).then((p) => set(p));
  },

  removeTask(id) {
    const state = get();
    const today = todayRecord(state);
    if (today.locked) return;
    const tasks = today.tasks
      .filter((t) => t.id !== id)
      .map((t, idx) => ({ ...t, order: idx }));
    const updatedDay = { ...today, tasks };
    const next = {
      ...state,
      days: { ...state.days, [updatedDay.date]: updatedDay },
    };
    persist(next).then((p) => set(p));
  },

  reorderTasks(orderedIds) {
    const state = get();
    const today = todayRecord(state);
    if (today.locked) return;
    const byId = new Map(today.tasks.map((t) => [t.id, t]));
    const tasks = orderedIds
      .map((id, idx) => {
        const t = byId.get(id);
        return t ? { ...t, order: idx } : null;
      })
      .filter((t): t is Task => t !== null);
    const updatedDay = { ...today, tasks };
    const next = {
      ...state,
      days: { ...state.days, [updatedDay.date]: updatedDay },
    };
    persist(next).then((p) => set(p));
  },

  lockAndStart() {
    const state = get();
    const today = todayRecord(state);
    if (today.tasks.length === 0) return;
    const updatedDay: DayRecord = {
      ...today,
      locked: true,
      startedAt: today.startedAt ?? Date.now(),
    };
    const next = {
      ...state,
      days: { ...state.days, [updatedDay.date]: updatedDay },
    };
    persist(next).then((p) => set(p));
  },

  completeTask(id) {
    const state = get();
    const today = todayRecord(state);
    const sorted = [...today.tasks].sort((a, b) => a.order - b.order);
    const nextActive = sorted.find((t) => !t.completed);
    if (!nextActive || nextActive.id !== id) return;
    const now = Date.now();
    const tasks = today.tasks.map((t) =>
      t.id === id ? { ...t, completed: true, completedAt: now } : t,
    );
    const allDone = tasks.every((t) => t.completed);
    const updatedDay: DayRecord = {
      ...today,
      tasks,
      locked: true,
      startedAt: today.startedAt ?? now,
      completedAt: allDone ? now : null,
    };
    const next = {
      ...state,
      days: { ...state.days, [updatedDay.date]: updatedDay },
    };
    persist(next).then((p) => set(p));
  },

  uncompleteTask(id) {
    const state = get();
    const today = todayRecord(state);
    const sorted = [...today.tasks].sort((a, b) => a.order - b.order);
    const lastCompleted = [...sorted].reverse().find((t) => t.completed);
    if (!lastCompleted || lastCompleted.id !== id) return;
    const tasks = today.tasks.map((t) =>
      t.id === id ? { ...t, completed: false, completedAt: null } : t,
    );
    const updatedDay: DayRecord = {
      ...today,
      tasks,
      completedAt: null,
    };
    const next = {
      ...state,
      days: { ...state.days, [updatedDay.date]: updatedDay },
    };
    persist(next).then((p) => set(p));
  },

  applyRollover(decisions) {
    const state = get();
    const source = state.needsRolloverFrom;
    if (!source) return;
    const prev = state.days[source];
    if (!prev) return;
    const today = todayISO();
    const todayDay = state.days[today] ?? emptyDay(today);
    const carriedIds = new Set(
      decisions.filter((d) => d.carry).map((d) => d.taskId),
    );
    const carried: Task[] = prev.tasks
      .filter((t) => !t.completed && carriedIds.has(t.id))
      .map((t, idx) => ({
        ...t,
        id: "t_" + nanoid(10),
        order: idx,
        carriedFrom: t.carriedFrom ?? source,
        createdAt: Date.now(),
      }));
    const existingTasks = todayDay.tasks.map((t, idx) => ({
      ...t,
      order: idx + carried.length,
    }));
    const newToday: DayRecord = {
      ...todayDay,
      tasks: [...carried, ...existingTasks],
    };
    const next: AppState = {
      ...state,
      currentDay: today,
      days: { ...state.days, [today]: newToday },
    };
    persist(next).then((p) => {
      set({ ...p, needsRolloverFrom: null });
    });
  },

  dismissRolloverDay() {
    const state = get();
    const today = todayISO();
    const next: AppState = { ...state, currentDay: today };
    persist(next).then((p) => {
      set({ ...p, needsRolloverFrom: null });
    });
  },

  setLocale(locale) {
    const state = get();
    const next: AppState = {
      ...state,
      settings: { ...state.settings, locale },
    };
    persist(next).then((p) => set(p));
  },

  updateSettings(patch) {
    const state = get();
    const next: AppState = {
      ...state,
      settings: { ...state.settings, ...patch },
    };
    persist(next).then((p) => set(p));
  },

  async resetAll() {
    const fresh = defaultState(todayISO());
    await saveState(fresh);
    set({ ...fresh, needsRolloverFrom: null });
  },

  exportJSON() {
    const state = get();
    const { hydrated, needsRolloverFrom, ...rest } = state;
    return JSON.stringify(rest, null, 2);
  },

  async importState(next) {
    await saveState(next);
    set({ ...next, needsRolloverFrom: findRolloverSource(next) });
  },
}));

export function selectTodayRecord(state: StoreState): DayRecord {
  const today = todayISO();
  return state.days[today] ?? emptyDay(today);
}

export function selectPhase(state: StoreState): "planning" | "focus" | "done" {
  const day = selectTodayRecord(state);
  if (day.tasks.length === 0) return "planning";
  const anyCompleted = day.tasks.some((t) => t.completed);
  if (day.tasks.every((t) => t.completed)) return "done";
  if (day.locked || anyCompleted) return "focus";
  return "planning";
}

export function selectActiveTask(state: StoreState): Task | null {
  const day = selectTodayRecord(state);
  const sorted = [...day.tasks].sort((a, b) => a.order - b.order);
  return sorted.find((t) => !t.completed) ?? null;
}
