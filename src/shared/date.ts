import type { ISO8601Date } from "./types";

export function todayISO(d: Date = new Date()): ISO8601Date {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: ISO8601Date, delta: number): ISO8601Date {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return todayISO(date);
}

export function daysBetween(a: ISO8601Date, b: ISO8601Date): number {
  const toMs = (s: ISO8601Date) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d).getTime();
  };
  return Math.round((toMs(b) - toMs(a)) / 86_400_000);
}

export function formatLocaleDate(iso: ISO8601Date, locale: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (locale.startsWith("zh")) {
    const wk = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
    return `${iso} (${wk})`;
  }
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
