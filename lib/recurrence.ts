/**
 * Recurrence rules — shared between client (events page) and server (API).
 *
 * Each rule has:
 *   - code:  canonical string stored in the data
 *   - label: human-readable text shown in the dropdown
 *   - generate(startDate, fromISO, toISO): returns YYYY-MM-DD[] sorted ascending
 *
 * The seven canonical weekdays are the simple cases. Complex multi-day
 * patterns (Fri+Sat weekly, last-Fri-and-Sat of month, etc.) live below.
 */

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export type Weekday = typeof WEEKDAYS[number];

/** Special recurrence codes (kept distinct from weekday names so dropdown order is clean). */
export const RECURRENCE_CODES = {
  FRI_SAT_WEEKLY: "__FRI_SAT_WEEKLY__",
  FRI_SAT_LAST_OF_MONTH: "__FRI_SAT_LAST__",
} as const;

export interface RecurrenceRule {
  code: string;
  label: string;
  /** True if this is a single canonical weekday (used for backwards-compat formatting). */
  isWeekday: boolean;
  generate: (startDate: string | undefined, fromISO: string, toISO: string) => string[];
}

/** YYYY-MM-DD string → Date at noon UTC (avoid TZ drift). */
function toDate(iso: string): Date {
  return new Date(iso + "T12:00:00");
}
function fromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

/** Generate weekly occurrences of a single weekday starting at startDate (or `from`, whichever is later). */
function generateWeeklyWeekday(targetIdx: number, startDate: string | undefined, fromISO: string, toISO: string): string[] {
  const out: string[] = [];
  if (!startDate) return out;
  const start = toDate(startDate);
  const from = toDate(fromISO);
  const to = toDate(toISO);
  if (Number.isNaN(start.getTime()) || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return out;
  const cursor = new Date(Math.max(start.getTime(), from.getTime()));
  while (cursor.getDay() !== targetIdx) cursor.setDate(cursor.getDate() - 1);
  while (cursor.getTime() <= to.getTime()) {
    out.push(fromDate(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  return out;
}

/** Generate the LAST occurrence of `targetIdx` in every month overlapping [from, to]. */
function generateLastWeekdayOfMonth(targetIdx: number, startDate: string | undefined, fromISO: string, toISO: string): string[] {
  const out: string[] = [];
  const start = startDate ? toDate(startDate) : toDate(fromISO);
  const from = toDate(fromISO);
  const to = toDate(toISO);
  if (Number.isNaN(start.getTime()) || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return out;

  // Walk month by month from `start` to `to`
  let year = start.getFullYear();
  let month = start.getMonth();
  const endYear = to.getFullYear();
  const endMonth = to.getMonth();

  while (year < endYear || (year === endYear && month <= endMonth)) {
    // Find the last day of this month
    const lastDay = new Date(year, month + 1, 0).getDate();
    const lastDate = new Date(year, month, lastDay);
    // Walk backwards to find the most recent occurrence of targetIdx
    while (lastDate.getDay() !== targetIdx) lastDate.setDate(lastDate.getDate() - 1);
    const iso = fromDate(lastDate);
    const inRange = iso >= fromISO && iso <= toISO;
    const onOrAfterStart = !startDate || iso >= startDate;
    if (inRange && onOrAfterStart) out.push(iso);
    // Advance one month
    month += 1;
    if (month > 11) { month = 0; year += 1; }
  }
  return out;
}

const FRIDAY_IDX = WEEKDAYS.indexOf("Friday");
const SATURDAY_IDX = WEEKDAYS.indexOf("Saturday");

/** Registry — order matters (this is dropdown order). */
export const RECURRENCE_RULES: RecurrenceRule[] = [
  ...WEEKDAYS.map((w) => ({
    code: w,
    label: w,
    isWeekday: true,
    generate: (startDate: string | undefined, fromISO: string, toISO: string) =>
      generateWeeklyWeekday(WEEKDAYS.indexOf(w), startDate, fromISO, toISO),
  })),
  {
    code: RECURRENCE_CODES.FRI_SAT_WEEKLY,
    label: "Every Friday and Saturday",
    isWeekday: false,
    generate: (startDate, fromISO, toISO) => {
      const fri = generateWeeklyWeekday(FRIDAY_IDX, startDate, fromISO, toISO);
      const sat = generateWeeklyWeekday(SATURDAY_IDX, startDate, fromISO, toISO);
      return Array.from(new Set([...fri, ...sat])).sort();
    },
  },
  {
    code: RECURRENCE_CODES.FRI_SAT_LAST_OF_MONTH,
    label: "Every last Friday and Saturday of each month",
    isWeekday: false,
    generate: (startDate, fromISO, toISO) => {
      const fri = generateLastWeekdayOfMonth(FRIDAY_IDX, startDate, fromISO, toISO);
      const sat = generateLastWeekdayOfMonth(SATURDAY_IDX, startDate, fromISO, toISO);
      return Array.from(new Set([...fri, ...sat])).sort();
    },
  },
];

/** Look up a rule by code (returns undefined for unknown / legacy strings). */
export function getRule(code: string | undefined): RecurrenceRule | undefined {
  if (!code) return undefined;
  return RECURRENCE_RULES.find((r) => r.code === code);
}

/** Map legacy / fuzzy day strings to a canonical rule code. */
export function normalizeRecurrenceCode(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const t = String(raw).trim();
  // Exact match against a rule code
  const exact = getRule(t);
  if (exact) return exact.code;
  const lc = t.toLowerCase();
  // Multi-day pattern detection
  if (lc.includes("last") && lc.includes("friday") && lc.includes("saturday")) {
    return RECURRENCE_CODES.FRI_SAT_LAST_OF_MONTH;
  }
  if (lc.includes("friday") && lc.includes("saturday")) {
    return RECURRENCE_CODES.FRI_SAT_WEEKLY;
  }
  // Single weekday fuzzy match
  for (const w of WEEKDAYS) {
    if (w.toLowerCase() === lc) return w;
  }
  return undefined;
}

/** Friendly display label for any stored code (falls back to the raw value). */
export function recurrenceLabel(code: string | undefined): string {
  if (!code) return "";
  return getRule(code)?.label ?? code;
}

/** Compute the full dates[] array for a series given its recurrence code + startDate. */
export function computeSeriesDates(code: string | undefined, startDate: string | undefined, fromISO: string, toISO: string): string[] {
  const rule = getRule(code ?? "");
  if (!rule) return [];
  return rule.generate(startDate, fromISO, toISO);
}

export const CALENDAR_FROM = "2026-08-01";
export const CALENDAR_TO = "2027-12-31";