/**
 * Date helpers shared between client (events page, promo materials) and the
 * server (event API). The app uses `YYYY-MM-DD` strings as the canonical
 * calendar date representation — these helpers do strict lexical comparison
 * after normalizing to that form so we get deterministic "date before today"
 * semantics without timezone drift.
 */

/** Returns today's date in the app's intended semantics: local time, `YYYY-MM-DD`. */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/**
 * True when `iso` represents a calendar date strictly before today.
 * Treats empty / malformed input as NOT past (conservative: keep visible).
 */
export function isPastDate(iso: string | undefined | null): boolean {
  if (!iso || typeof iso !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  return iso < todayISO();
}

/**
 * True when a series is considered "still relevant": at least one future
 * occurrence. Series with empty `dates[]` (e.g. broken / unscheduled)
 * are kept visible so admins can fix them.
 */
export function seriesHasFutureOccurrence(dates: string[] | undefined): boolean {
  if (!dates || dates.length === 0) return true;
  const today = todayISO();
  return dates.some((d) => d >= today);
}

/** Same as `isPastDate` but exposed with a more general name for shared use. */
export const isExpired = isPastDate;
