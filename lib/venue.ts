/**
 * Venue filtering helpers for SRB Dashboard.
 *
 * Venue identity lives on each data item as a `venue` field with one of:
 *   - "torch1"  → only visible at Torch 1
 *   - "torch2"  → only visible at Torch 2
 *   - "both"    → visible at both venues
 *
 * Query param contract: `?venue=torch1|torch2|combined`
 *   - omitted / empty   → return everything (backwards compatible)
 *   - "combined"        → return everything (alias for omitted)
 *   - "torch1"          → venue === "torch1" OR venue === "both"
 *   - "torch2"          → venue === "torch2" OR venue === "both"
 */

import type { Venue } from "@/components/VenueSwitcher";

export type { Venue };

/** Read `venue` query param from a NextRequest URL. Returns undefined if absent/empty. */
export function getVenueParam(req: Request): Venue | undefined {
  const url = new URL(req.url);
  const raw = url.searchParams.get("venue");
  if (!raw) return undefined;
  if (raw === "torch1" || raw === "torch2" || raw === "combined") return raw;
  return undefined;
}

/** True if the request should NOT filter (combined / omitted / unknown). */
export function shouldSkipFilter(req: Request): boolean {
  const v = getVenueParam(req);
  return !v || v === "combined";
}

/**
 * Filter an array of items by venue. Items without a `venue` field are kept
 * (treated as legacy → default "torch1" assumption lives in the data layer).
 */
export function filterByVenue<T extends { venue?: string }>(
  items: T[],
  venue: Venue | undefined
): T[] {
  if (!venue || venue === "combined") return items;
  return items.filter((item) => {
    const iv = item.venue ?? "torch1";
    return iv === venue || iv === "both";
  });
}

/** Inject venue on creation when caller didn't supply one. Falls back to localStorage default of "torch1". */
export function withDefaultVenue<T extends { venue?: string }>(item: T): T & { venue: string } {
  if (item.venue) return item as T & { venue: string };
  return { ...item, venue: "torch1" };
}
