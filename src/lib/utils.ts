import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

// ── Dates: the app shows every date as YYYY-MM-DD ───────────────────────────
const MONTH_ABBR = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const pad2 = (n: number | string): string => String(n).padStart(2, "0");
const monthNumber = (name: string): number => MONTH_ABBR.indexOf(name.slice(0, 3).toLowerCase()) + 1;

/** Date -> "YYYY-MM-DD" (local time). */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Date -> "YYYY-MM-DD HH:mm" (local time, 24h). */
export function toIsoDateTime(date: Date): string {
  return `${toIsoDate(date)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/**
 * Rewrites dates inside a text to YYYY-MM-DD, e.g. "23 Nov 2026", "17 June 2026",
 * "17 Jun, 2026", "Mar 15, 2026", "25/10/2026" (dd/mm/yyyy). Other text is kept.
 * Used for values saved earlier (localStorage) in the old format.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  return dateStr
    .replace(/\b(\d{1,2}) ([A-Za-z]{3,}),? (\d{4})\b/g, (m, d, mon, y) => {
      const mm = monthNumber(mon);
      return mm ? `${y}-${pad2(mm)}-${pad2(d)}` : m;
    })
    .replace(/\b([A-Za-z]{3,}) (\d{1,2}), (\d{4})\b/g, (m, mon, d, y) => {
      const mm = monthNumber(mon);
      return mm ? `${y}-${pad2(mm)}-${pad2(d)}` : m;
    })
    .replace(/\b(\d{2})\/(\d{2})\/(\d{4})\b/g, (_m, d, mm, y) => `${y}-${mm}-${d}`);
}

/** Month index (0-11) and year of a date string in YYYY-MM-DD (or an old format). */
export function getMonthYear(dateStr: string): { monthIdx: number; year: string } | null {
  const match = formatDate(dateStr || "").match(/(\d{4})-(\d{2})-\d{2}/);
  return match ? { monthIdx: Number(match[2]) - 1, year: match[1] } : null;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
