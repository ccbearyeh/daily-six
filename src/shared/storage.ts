import {
  type AppState,
  STORAGE_KEY,
  SCHEMA_VERSION,
  defaultState,
} from "./types";
import { todayISO } from "./date";

export async function loadState(): Promise<AppState> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const raw = stored[STORAGE_KEY] as AppState | undefined;
  if (!raw) {
    const fresh = defaultState(todayISO());
    await saveState(fresh);
    return fresh;
  }
  return migrate(raw);
}

export async function saveState(state: AppState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

function migrate(state: AppState): AppState {
  if (state.schemaVersion === SCHEMA_VERSION) return state;
  return state;
}

export function subscribeState(
  cb: (state: AppState) => void,
): () => void {
  const handler = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: chrome.storage.AreaName,
  ) => {
    if (area !== "local") return;
    const change = changes[STORAGE_KEY];
    if (!change?.newValue) return;
    cb(change.newValue as AppState);
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}

export function pruneHistory(state: AppState): AppState {
  const days = { ...state.days };
  const retention = state.settings.historyRetentionDays;
  if (retention <= 0) return state;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retention);
  const cutoffISO = todayISO(cutoff);
  for (const k of Object.keys(days)) {
    if (k < cutoffISO) delete days[k];
  }
  return { ...state, days };
}
