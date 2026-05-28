import { loadState, saveState, subscribeState } from "./shared/storage";
import { todayISO } from "./shared/date";
import { emptyDay, type AppState } from "./shared/types";

const ALARM_MORNING = "dailySix:morningPlan";
const ALARM_EVENING = "dailySix:eveningReview";
const ALARM_STALE = "dailySix:staleFocus";
const ALARM_DAY_TICK = "dailySix:dayTick";

const NOTIF_MORNING = "dailySix:notif:morning";
const NOTIF_EVENING = "dailySix:notif:evening";
const NOTIF_STALE = "dailySix:notif:stale";
const NOTIF_ROLLOVER = "dailySix:notif:rollover";

const COLOR_ACCENT = "#2A4D6E";
const COLOR_SUCCESS = "#5A7A6A";

const messages: Record<
  "zh-TW" | "en",
  {
    morningTitle: string;
    morningBody: string;
    eveningTitle: (done: number, total: number) => string;
    eveningBody: string;
    staleTitle: (task: string) => string;
    staleBody: (mins: number) => string;
    rolloverTitle: (n: number) => string;
    rolloverBody: string;
  }
> = {
  "zh-TW": {
    morningTitle: "今天還沒寫今日 6 項",
    morningBody: "花 5 分鐘規劃，剩下的時間更值錢。",
    eveningTitle: (d, t) => `今天完成了 ${d} / ${t}`,
    eveningBody: "要規劃明天嗎？把未完成項處理掉，今晚就睡得好一點。",
    staleTitle: (task) => `在「${task}」上卡住了嗎？`,
    staleBody: (m) => `已專注 ${m} 分鐘 — 需要拆解或先放下？`,
    rolloverTitle: (n) => `昨天有 ${n} 項未完成`,
    rolloverBody: "打開 Side Panel 決定要轉移哪些到今天。",
  },
  en: {
    morningTitle: "Plan today's six",
    morningBody: "Five minutes now buys you the rest of the day.",
    eveningTitle: (d, t) => `Done ${d}/${t} today`,
    eveningBody: "Plan tomorrow? Closing out unfinished items lets you sleep better.",
    staleTitle: (task) => `Stuck on '${task}'?`,
    staleBody: (m) => `Focused for ${m} min — break it down or set it aside?`,
    rolloverTitle: (n) => `${n} unfinished from yesterday`,
    rolloverBody: "Open the side panel to decide what carries over.",
  },
};

function getIconPath(): string {
  return chrome.runtime.getURL("public/icon-128.png");
}

function getCurrentDayTasks(state: AppState) {
  const today = todayISO();
  const day = state.days[today];
  if (!day) return { done: 0, total: 0, remaining: 0, active: null };
  const total = day.tasks.length;
  const done = day.tasks.filter((t) => t.completed).length;
  const remaining = total - done;
  const sorted = [...day.tasks].sort((a, b) => a.order - b.order);
  const active = sorted.find((t) => !t.completed) ?? null;
  return { done, total, remaining, active };
}

async function updateBadge(state: AppState): Promise<void> {
  const { total, remaining } = getCurrentDayTasks(state);
  if (total === 0) {
    await chrome.action.setBadgeText({ text: "" });
    return;
  }
  if (remaining === 0) {
    await chrome.action.setBadgeText({ text: "✓" });
    await chrome.action.setBadgeBackgroundColor({ color: COLOR_SUCCESS });
    return;
  }
  await chrome.action.setBadgeText({ text: String(remaining) });
  await chrome.action.setBadgeBackgroundColor({ color: COLOR_ACCENT });
}

function nextOccurrence(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    h,
    m,
    0,
    0,
  );
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime();
}

async function scheduleAlarms(state: AppState): Promise<void> {
  await chrome.alarms.clear(ALARM_MORNING);
  await chrome.alarms.clear(ALARM_EVENING);
  await chrome.alarms.clear(ALARM_STALE);
  await chrome.alarms.clear(ALARM_DAY_TICK);

  const { morningPlan, eveningReview, staleFocus } = state.settings.reminders;
  if (morningPlan.enabled) {
    await chrome.alarms.create(ALARM_MORNING, {
      when: nextOccurrence(morningPlan.time),
      periodInMinutes: 24 * 60,
    });
  }
  if (eveningReview.enabled) {
    await chrome.alarms.create(ALARM_EVENING, {
      when: nextOccurrence(eveningReview.time),
      periodInMinutes: 24 * 60,
    });
  }
  if (staleFocus.enabled) {
    await chrome.alarms.create(ALARM_STALE, { periodInMinutes: 15 });
  }
  await chrome.alarms.create(ALARM_DAY_TICK, {
    when: nextOccurrence("00:05"),
    periodInMinutes: 60,
  });
}

async function notify(
  id: string,
  title: string,
  body: string,
  priority = 1,
): Promise<void> {
  try {
    await chrome.notifications.create(id, {
      type: "basic",
      iconUrl: getIconPath(),
      title,
      message: body,
      priority,
      requireInteraction: priority >= 2,
    });
  } catch {
    /* notifications may be blocked */
  }
}

async function onMorningAlarm(state: AppState): Promise<void> {
  const today = todayISO();
  const day = state.days[today];
  const hasPlanned = day && day.tasks.length > 0;
  if (hasPlanned) return;
  const t = messages[state.settings.locale];
  await notify(NOTIF_MORNING, t.morningTitle, t.morningBody);
}

async function onEveningAlarm(state: AppState): Promise<void> {
  const { done, total } = getCurrentDayTasks(state);
  if (total === 0) return;
  const t = messages[state.settings.locale];
  await notify(NOTIF_EVENING, t.eveningTitle(done, total), t.eveningBody);
}

async function onStaleAlarm(state: AppState): Promise<void> {
  const { active } = getCurrentDayTasks(state);
  if (!active) return;
  const today = todayISO();
  const day = state.days[today];
  if (!day?.startedAt) return;
  const elapsed = Math.floor((Date.now() - day.startedAt) / 60_000);
  const threshold = state.settings.reminders.staleFocus.thresholdMinutes;
  if (elapsed < threshold) return;
  const now = new Date();
  const hour = now.getHours();
  if (hour < 9 || hour >= 18) return;
  const t = messages[state.settings.locale];
  await notify(NOTIF_STALE, t.staleTitle(active.text), t.staleBody(elapsed));
}

async function onDayTick(state: AppState): Promise<void> {
  const today = todayISO();
  if (state.currentDay === today) return;
  const prev = state.days[state.currentDay];
  if (!prev) return;
  const unfinished = prev.tasks.filter((t) => !t.completed).length;
  if (unfinished === 0) {
    const next: AppState = { ...state, currentDay: today };
    if (!next.days[today]) next.days[today] = emptyDay(today);
    await saveState(next);
    await updateBadge(next);
    return;
  }
  const t = messages[state.settings.locale];
  await notify(
    NOTIF_ROLLOVER,
    t.rolloverTitle(unfinished),
    t.rolloverBody,
    2,
  );
}

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch {
    /* older Chrome may not support setPanelBehavior */
  }
  const state = await loadState();
  await scheduleAlarms(state);
  await updateBadge(state);
});

chrome.runtime.onStartup.addListener(async () => {
  const state = await loadState();
  await scheduleAlarms(state);
  await updateBadge(state);
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const state = await loadState();
  switch (alarm.name) {
    case ALARM_MORNING:
      await onMorningAlarm(state);
      break;
    case ALARM_EVENING:
      await onEveningAlarm(state);
      break;
    case ALARM_STALE:
      await onStaleAlarm(state);
      break;
    case ALARM_DAY_TICK:
      await onDayTick(state);
      break;
  }
});

chrome.notifications.onClicked.addListener(async (id) => {
  try {
    const win = await chrome.windows.getCurrent();
    if (win.id != null) {
      await chrome.sidePanel.open({ windowId: win.id });
    }
  } catch {
    /* open requires user gesture; notifications callback usually counts */
  }
  await chrome.notifications.clear(id);
});

subscribeState(async (state) => {
  await updateBadge(state);
  await scheduleAlarms(state);
});
