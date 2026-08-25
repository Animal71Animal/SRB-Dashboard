"use client";

import { useEffect, useState } from "react";
import { type Role } from "@/lib/auth/roles";

// --- Inline icons (avoid lucide dependency) -------------------------------
const ChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
const ChevronUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
);
const Plus = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5v14"/></svg>
);
const Trash2 = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>
);
const Edit2 = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const Check = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
);
const X = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
);
const LinkIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);

// --- Types -----------------------------------------------------------------
type TorchKey = "torch1" | "torch2";
type SectionKey = "heavy" | "upcoming";
type EventKind = "oneoff" | "series";

interface LinkedEventSnapshot {
  id: string;
  kind: EventKind;
  name: string;
  date?: string;
  startDate?: string;
  dates?: string[];
  theme?: string;
  who?: string;
  format?: string;
  drinks?: string;
  games?: string;
  costuming?: string;
  /** Authoritative MC/promo verbiage, mirrored from Event Calendar's `verbiage` field. Never aliased to `costuming`. */
  verbiage?: string;
  icon?: string;
  venue?: string;
  status?: string;
  linkedAt: string;
}

interface PromoItem {
  id: string;
  title: string;
  date: string;
  description: string;
  verbiage: string;
  drinkSpecials: string;
  mcVerbiage?: string;
  mcVerbiageCollapsed?: boolean;
  eventId?: string;
  eventKind?: EventKind;
  linkedEvent?: LinkedEventSnapshot;
  timestamp?: string;
}

interface TorchSection { heavy: PromoItem[]; upcoming: PromoItem[]; }
interface PromoData { torch1: TorchSection; torch2: TorchSection; }

interface OneOffEvent {
  id: string;
  date: string;
  name: string;
  theme: string;
  status: string;
  icon?: string;
  who?: string;
  format?: string;
  drinks?: string;
  games?: string;
  costuming?: string;
  verbiage?: string;
  venue?: string;
}

interface EventSeries {
  id: string;
  name: string;
  theme: string;
  status: string;
  dates: string[];
  venue?: string;
  icon?: string;
  day?: string;
  startDate?: string;
  who?: string;
  format?: string;
  drinks?: string;
  games?: string;
  costuming?: string;
  verbiage?: string;
}

interface EventsFile { oneOffs: OneOffEvent[]; series: EventSeries[]; }

// --- Helpers ---------------------------------------------------------------
function fmtDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d + "T12:00:00");
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isConfirmed(status?: string): boolean {
  return String(status ?? "").trim().toLowerCase() === "confirmed";
}

function eventDisplayLabel(e: { kind: EventKind; oneOff?: OneOffEvent; series?: EventSeries }): string {
  const name = e.oneOff?.name ?? e.series?.name ?? "(unnamed)";
  if (e.kind === "oneoff" && e.oneOff) {
    return `${name} · ${fmtDate(e.oneOff.date) || "—"}`;
  }
  if (e.kind === "series" && e.series) {
    const dates = e.series.dates ?? [];
    const first = dates[0];
    const last = dates[dates.length - 1];
    if (first && last && first !== last) {
      return `${name} · ${fmtDate(first)} → ${fmtDate(last)}`;
    }
    if (first) return `${name} · ${fmtDate(first)}`;
    return name;
  }
  return name;
}

// --- Page ------------------------------------------------------------------
export default function PromotionalMaterialsPage() {
  const [data, setData] = useState<PromoData>({
    torch1: { heavy: [], upcoming: [] },
    torch2: { heavy: [], upcoming: [] },
  });
  const [role, setRole] = useState<Role>("Employee");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<Partial<PromoItem>>({});
  const [addingTo, setAddingTo] = useState<{ torch: TorchKey; section: SectionKey } | null>(null);
  const [pickerSelection, setPickerSelection] = useState<Record<string, string>>({}); // torch|section -> selected event id
  const [pickerSubmitting, setPickerSubmitting] = useState<Record<string, boolean>>({});

  // Source-of-truth events from /api/events (single fetch, used to populate the picker)
  const [confirmedEvents, setConfirmedEvents] = useState<{ kind: EventKind; oneOff?: OneOffEvent; series?: EventSeries }[]>([]);

  useEffect(() => {
    const checkRole = async () => {
      const preview = sessionStorage.getItem("srb-role-preview");
      if (preview) { setRole(preview as Role); return; }
      const email = sessionStorage.getItem("srb-session-email");
      if (!email) return;
      try {
        const res = await fetch("/api/users");
        const d = await res.json();
        const matched = (d.users || []).find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (matched) setRole(matched.role);
      } catch {}
    };
    checkRole();
    fetchData();
    fetchConfirmedEvents();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/promotional-materials");
      const json = await res.json();
      // Defensive: ensure shape
      setData({
        torch1: { heavy: json?.torch1?.heavy ?? [], upcoming: json?.torch1?.upcoming ?? [] },
        torch2: { heavy: json?.torch2?.heavy ?? [], upcoming: json?.torch2?.upcoming ?? [] },
      });
    } catch (e) {
      console.error("fetchData failed", e);
    }
  };

  /**
   * Authoritative hydration from /api/events.
   *
   * On every load (and after any promo edit that propagates to events), refetch
   * the canonical events and overwrite the linkedEvent snapshot + display
   * fields on every linked promo card. This guarantees that:
   *   - edits made directly on Event Calendar cards (including `verbiage`)
   *     surface on linked promo cards on reload/refetch,
   *   - the `verbiage` field on the promo card always reflects the
   *     authoritative Event Calendar `verbiage` (never aliased to costuming),
   *   - the snapshot stays in sync without requiring a separate write.
   *
   * Does not mutate the promo file — local edits like `description`,
   * `drinkSpecials`, and `mcVerbiage` survive. Only the mirrored subset
   * (title/date/status/venue/theme/who/format/drinks/games/costuming/verbiage)
   * is overwritten from the events record.
   */
  const hydrateFromEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const json: EventsFile = await res.json();
      const byId = new Map<string, OneOffEvent | EventSeries>();
      for (const o of json.oneOffs ?? []) byId.set(o.id, o);
      for (const s of json.series ?? []) byId.set(s.id, s);

      const current = data;
      let mutated = false;
      const next: PromoData = {
        torch1: { heavy: [], upcoming: [] },
        torch2: { heavy: [], upcoming: [] },
      };
      (["torch1", "torch2"] as TorchKey[]).forEach((torch) => {
        (["heavy", "upcoming"] as SectionKey[]).forEach((section) => {
          next[torch][section] = current[torch][section].map((item) => {
            if (!item.eventId) return item;
            const ev = byId.get(item.eventId);
            if (!ev) return item; // Source event gone. Keep promo as-is.
            const isSeries = item.eventKind === "series";
            const merged: PromoItem = {
              ...item,
              title: ev.name ?? item.title,
              date: isSeries
                ? ((ev as EventSeries).startDate ?? (ev as EventSeries).dates?.[0] ?? item.date)
                : ((ev as OneOffEvent).date ?? item.date),
              verbiage: ev.verbiage ?? "",
              drinkSpecials: ev.drinks ?? item.drinkSpecials,
              description: [ev.theme, ev.who, ev.format].filter(Boolean).join(" · "),
              linkedEvent: {
                id: ev.id,
                kind: isSeries ? "series" : "oneoff",
                name: ev.name,
                date: isSeries ? undefined : (ev as OneOffEvent).date,
                startDate: isSeries ? (ev as EventSeries).startDate : undefined,
                dates: isSeries ? (ev as EventSeries).dates : undefined,
                theme: ev.theme,
                who: ev.who,
                format: ev.format,
                drinks: ev.drinks,
                games: ev.games,
                costuming: ev.costuming,
                verbiage: ev.verbiage ?? "",
                icon: ev.icon,
                venue: ev.venue,
                status: ev.status,
                linkedAt: item.linkedEvent?.linkedAt ?? new Date().toISOString(),
              },
            };
            // Cheap identity check — if nothing changed, keep the original object
            // reference so React doesn't re-render unnecessarily.
            if (
              merged.title === item.title &&
              merged.date === item.date &&
              merged.verbiage === item.verbiage &&
              merged.drinkSpecials === item.drinkSpecials &&
              merged.description === item.description &&
              merged.linkedEvent?.verbiage === item.linkedEvent?.verbiage &&
              merged.linkedEvent?.costuming === item.linkedEvent?.costuming &&
              merged.linkedEvent?.theme === item.linkedEvent?.theme &&
              merged.linkedEvent?.who === item.linkedEvent?.who &&
              merged.linkedEvent?.format === item.linkedEvent?.format &&
              merged.linkedEvent?.drinks === item.linkedEvent?.drinks &&
              merged.linkedEvent?.name === item.linkedEvent?.name &&
              merged.linkedEvent?.venue === item.linkedEvent?.venue &&
              merged.linkedEvent?.status === item.linkedEvent?.status
            ) {
              return item;
            }
            mutated = true;
            return merged;
          });
        });
      });
      if (mutated) setData(next);
    } catch (e) {
      console.error("hydrateFromEvents failed", e);
    }
  };

  /**
   * Authoritative hydration effect.
   *
   * Once `data` is populated (after the initial /api/promotional-materials
   * fetch resolves), re-fetch /api/events and refresh every linked card's
   * mirrored fields. Re-runs whenever `data` changes (e.g. after a save) so
   * promo cards always reflect the latest Event Calendar state.
   */
  useEffect(() => {
    const anyItem =
      data.torch1.heavy.length + data.torch1.upcoming.length +
      data.torch2.heavy.length + data.torch2.upcoming.length > 0;
    if (!anyItem) return;
    hydrateFromEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const fetchConfirmedEvents = async () => {
    try {
      // Fetch without a venue filter so all confirmed events appear regardless of the
      // caller's current venue context — the user explicitly picks the destination
      // torch/section.
      const res = await fetch(`/api/events`);
      const json: EventsFile = await res.json();
      const oneOffs = (json.oneOffs ?? []).filter((e) => isConfirmed(e.status));
      const series = (json.series ?? []).filter((s) => isConfirmed(s.status));
      const combined = [
        ...oneOffs.map((o) => ({ kind: "oneoff" as const, oneOff: o })),
        ...series.map((s) => ({ kind: "series" as const, series: s })),
      ];
      // Sort: series by first date asc, one-offs by date asc; then by name.
      combined.sort((a, b) => {
        const da = a.kind === "oneoff" ? (a.oneOff?.date ?? "") : (a.series?.dates?.[0] ?? "");
        const db = b.kind === "oneoff" ? (b.oneOff?.date ?? "") : (b.series?.dates?.[0] ?? "");
        if (da !== db) return da.localeCompare(db);
        const na = a.oneOff?.name ?? a.series?.name ?? "";
        const nb = b.oneOff?.name ?? b.series?.name ?? "";
        return na.localeCompare(nb);
      });
      setConfirmedEvents(combined);
    } catch (e) {
      console.error("fetchConfirmedEvents failed", e);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canEdit = role === "Admin" || role === "SuperAdmin";

  /**
   * Persist edits to a single promo item locally (so the section assignment and
   * promo-specific fields survive) AND propagate any linked-event field changes
   * back to the authoritative Event Calendar via /api/events PATCH.
   *
   * The promo card already mirrors the linked event through its `linkedEvent`
   * snapshot, so when the user edits fields that map to Event Calendar fields
   * we forward the same value to /api/events. This keeps Event Calendar the
   * single source of truth and prevents divergent duplicate records.
   *
   * Recurring safety: for `kind === "series"` the linked card represents the
   * whole series — that is how the Event Calendar models series (one row per
   * series with a dates[] array). We therefore PATCH the series record as a
   * whole, which matches the existing Event Calendar semantics. For one-off
   * events we PATCH the single record. No new event rows are created.
   */
  const persistItemUpdate = async (torch: TorchKey, section: SectionKey, id: string, update: Partial<PromoItem>) => {
    // 1. Persist locally to the promo file (preserves section assignment, linkedEvent snapshot, etc.).
    try {
      await fetch("/api/promotional-materials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ torch, section, id, update }),
      });
    } catch (e) {
      console.error("persistItemUpdate: local promo PUT failed", e);
    }

    // 2. Propagate to Event Calendar if this card is linked to one.
    //    We need the existing item to know eventId/eventKind — the caller passes
    //    the resolved item via `currentItem`. We resolve here too by reading
    //    from current `data`.
    const item = data[torch][section].find((m) => m.id === id);
    if (!item || !item.eventId) return;

    // Build a PATCH payload: only forward fields that exist on the Event Calendar
    // event record. Promo-only fields (mcVerbiage, drinkSpecials, etc.) stay local.
    const patch: Record<string, unknown> = {};
    if ("title" in update) patch.name = update.title;
    if ("date" in update) {
      if (item.eventKind === "series") patch.startDate = update.date;
      else patch.date = update.date;
    }
    if ("verbiage" in update) patch.verbiage = update.verbiage ?? "";
    if ("drinkSpecials" in update) patch.drinks = update.drinkSpecials ?? "";
    // `description` on the promo card is a join of [theme, who, format].
    // If the user changes it, split back into individual fields when possible.
    if ("description" in update) {
      const parts = String(update.description ?? "").split(" · ").map((s) => s.trim());
      // Best-effort split: 3 parts → theme/who/format; 2 → theme/who; 1 → theme.
      if (parts.length === 3) {
        patch.theme = parts[0];
        patch.who = parts[1];
        patch.format = parts[2];
      } else if (parts.length === 2) {
        patch.theme = parts[0];
        patch.who = parts[1];
      } else if (parts.length === 1) {
        patch.theme = parts[0];
      } else {
        // Empty description → clear theme.
        patch.theme = "";
      }
    }

    if (Object.keys(patch).length === 0) return;

    try {
      const res = await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.eventId,
          kind: item.eventKind === "series" ? "series" : "oneoff",
          ...patch,
        }),
      });
      if (!res.ok) {
        console.error("persistItemUpdate: events PATCH failed", res.status);
      }
    } catch (e) {
      console.error("persistItemUpdate: events PATCH error", e);
    }
  };

  const handleSave = async (torch: TorchKey, section: SectionKey, id?: string) => {
    if (id) {
      await persistItemUpdate(torch, section, id, editBuffer);
      setEditingId(null);
    } else {
      await fetch("/api/promotional-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ torch, section, item: editBuffer }),
      });
      setAddingTo(null);
    }
    setEditBuffer({});
    await fetchData();
  };

  const handleDelete = async (torch: string, section: string, id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/promotional-materials?torch=${torch}&section=${section}&id=${id}`, { method: "DELETE" });
    await fetchData();
  };

  // Picker submission: turn a confirmed event selection into a new promo card.
  const handlePickerSubmit = async (torch: TorchKey, section: SectionKey) => {
    const key = `${torch}|${section}`;
    const selectedId = pickerSelection[key];
    if (!selectedId) return;
    const event = confirmedEvents.find((e) => {
      const id = e.kind === "oneoff" ? e.oneOff?.id : e.series?.id;
      return id === selectedId;
    });
    if (!event) return;

    setPickerSubmitting((s) => ({ ...s, [key]: true }));
    try {
      const id = event.kind === "oneoff" ? event.oneOff!.id : event.series!.id;
      const name = event.kind === "oneoff" ? event.oneOff!.name : event.series!.name;
      const date = event.kind === "oneoff" ? event.oneOff!.date : (event.series!.startDate ?? event.series!.dates?.[0] ?? "");
      const linkedEvent: LinkedEventSnapshot = {
        id,
        kind: event.kind,
        name,
        date: event.kind === "oneoff" ? event.oneOff!.date : undefined,
        startDate: event.kind === "series" ? event.series!.startDate : undefined,
        dates: event.kind === "series" ? event.series!.dates : undefined,
        theme: event.kind === "oneoff" ? event.oneOff!.theme : event.series!.theme,
        who: event.kind === "oneoff" ? event.oneOff!.who : event.series!.who,
        format: event.kind === "oneoff" ? event.oneOff!.format : event.series!.format,
        drinks: event.kind === "oneoff" ? event.oneOff!.drinks : event.series!.drinks,
        games: event.kind === "oneoff" ? event.oneOff!.games : event.series!.games,
        costuming: event.kind === "oneoff" ? event.oneOff!.costuming : event.series!.costuming,
        verbiage: event.kind === "oneoff" ? (event.oneOff!.verbiage ?? "") : (event.series!.verbiage ?? ""),
        icon: event.kind === "oneoff" ? event.oneOff!.icon : event.series!.icon,
        venue: event.kind === "oneoff" ? event.oneOff!.venue : event.series!.venue,
        status: event.kind === "oneoff" ? event.oneOff!.status : event.series!.status,
        linkedAt: new Date().toISOString(),
      };
      const item: Partial<PromoItem> = {
        title: name,
        date: date ?? "",
        description: [linkedEvent.theme, linkedEvent.who, linkedEvent.format].filter(Boolean).join(" · "),
        verbiage: linkedEvent.verbiage ?? "",
        drinkSpecials: linkedEvent.drinks ?? "",
        mcVerbiage: "",
        mcVerbiageCollapsed: false,
        eventId: id,
        eventKind: event.kind,
        linkedEvent,
      };
      await fetch("/api/promotional-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ torch, section, item }),
      });
      // Clear selection, close picker, refresh.
      setPickerSelection((s) => ({ ...s, [key]: "" }));
      setAddingTo(null);
      await fetchData();
    } finally {
      setPickerSubmitting((s) => ({ ...s, [key]: false }));
    }
  };

  const renderSection = (torch: TorchKey, section: SectionKey, title: string) => {
    const items = data[torch][section];
    const pickerKey = `${torch}|${section}`;
    const showPicker = canEdit && addingTo?.torch === torch && addingTo?.section === section;

    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)" }}>{title}</h3>
          {canEdit && !addingTo && (
            <button
              onClick={() => {
                setAddingTo({ torch, section });
                setPickerSelection((s) => ({ ...s, [pickerKey]: s[pickerKey] ?? "" }));
              }}
              style={{
                background: "var(--accent)", color: "white", border: "none", borderRadius: 6,
                padding: "4px 12px", fontSize: "0.8rem", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <Plus size={14} /> Add Event
            </button>
          )}
        </div>

        {showPicker && (
          <div
            data-testid={`picker-${torch}-${section}`}
            style={{
              background: "var(--card)", border: "2px dashed var(--accent)", borderRadius: 12,
              padding: 20, marginBottom: 16,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.05em", fontWeight: 700 }}>
                Pick a Confirmed Event from Event Calendar
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                <select
                  aria-label={`Select confirmed event for ${torch} ${section}`}
                  value={pickerSelection[pickerKey] ?? ""}
                  onChange={(e) => setPickerSelection((s) => ({ ...s, [pickerKey]: e.target.value }))}
                  style={{
                    flex: 1, padding: "10px 12px", borderRadius: 8,
                    background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="">— Select an event —</option>
                  {confirmedEvents.length === 0 && (
                    <option value="" disabled>No confirmed events found</option>
                  )}
                  {confirmedEvents.map((e) => {
                    const id = e.kind === "oneoff" ? e.oneOff?.id : e.series?.id;
                    if (!id) return null;
                    return (
                      <option key={`${e.kind}:${id}`} value={id}>
                        {eventDisplayLabel(e)}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={() => handlePickerSubmit(torch, section)}
                  disabled={!pickerSelection[pickerKey] || pickerSubmitting[pickerKey]}
                  style={{
                    background: pickerSelection[pickerKey] ? "var(--accent)" : "var(--border)",
                    color: "white", border: "none", borderRadius: 8,
                    padding: "10px 18px", fontWeight: 600, cursor: pickerSelection[pickerKey] ? "pointer" : "not-allowed",
                    opacity: pickerSubmitting[pickerKey] ? 0.6 : 1,
                  }}
                >
                  {pickerSubmitting[pickerKey] ? "Adding…" : "Add to Section"}
                </button>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 8 }}>
                Selecting an event copies its event card into this {torch === "torch1" ? "Torch 1" : "Torch 2"} · {section === "heavy" ? "Heavy Rotation" : "Upcoming"} section. Edits to the linked card (including verbiage) sync back to the authoritative Event Calendar record.
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => { setAddingTo(null); setEditBuffer({}); }}
                style={{
                  background: "var(--muted)", color: "white", border: "none", borderRadius: 6,
                  padding: "6px 16px", cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.length === 0 && !showPicker && (
            <div style={{ color: "var(--muted)", fontSize: "0.85rem", fontStyle: "italic" }}>No items scheduled.</div>
          )}
          {items.map((item) => (
            <PromoCard
              key={item.id}
              item={item}
              torch={torch}
              section={section}
              isEditing={editingId === item.id}
              isExpanded={expandedItems.has(item.id) || editingId === item.id}
              onToggleExpand={() => toggleExpand(item.id)}
              editBuffer={editBuffer}
              setEditBuffer={setEditBuffer}
              canEdit={canEdit}
              onStartEdit={() => { setEditingId(item.id); setEditBuffer({ ...item }); }}
              onCancelEdit={() => setEditingId(null)}
              onSaveEdit={() => handleSave(torch, section, item.id)}
              onDelete={() => handleDelete(torch, section, item.id)}
              persistItemUpdate={(update) => persistItemUpdate(torch, section, item.id, update)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 1.75rem)", fontWeight: 700, margin: 0 }}>Promotional Materials</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: 4 }}>Standardized Marketing · Visual & Verbal Consistency</p>
      </div>

      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <div style={{ background: "var(--accent)", color: "white", padding: "4px 10px", borderRadius: 4, fontWeight: 800 }}>T1</div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Torch 1</h2>
          </div>
          {renderSection("torch1", "heavy", "Heavy Promotional Rotation")}
          {renderSection("torch1", "upcoming", "Upcoming Promotions")}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <div style={{ background: "var(--accent)", color: "white", padding: "4px 10px", borderRadius: 4, fontWeight: 800 }}>T2</div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Torch 2</h2>
          </div>
          {renderSection("torch2", "heavy", "Heavy Promotional Rotation")}
          {renderSection("torch2", "upcoming", "Upcoming Promotions")}
        </div>
      </div>
    </div>
  );
}

// --- Promo card (extracted for clarity) ------------------------------------
interface PromoCardProps {
  item: PromoItem;
  torch: TorchKey;
  section: SectionKey;
  isEditing: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  editBuffer: Partial<PromoItem>;
  setEditBuffer: (b: Partial<PromoItem>) => void;
  canEdit: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  persistItemUpdate: (update: Partial<PromoItem>) => Promise<void>;
}

function PromoCard({
  item, torch, section,
  isEditing, isExpanded,
  onToggleExpand, editBuffer, setEditBuffer,
  canEdit, onStartEdit, onCancelEdit, onSaveEdit, onDelete,
  persistItemUpdate,
}: PromoCardProps) {
  // The verbiage field is part of the collapsible event card body. When the
  // user edits (via Edit mode) and saves, `handleSave` -> `persistItemUpdate`
  // writes to BOTH /api/promotional-materials (local) AND /api/events (the
  // authoritative Event Calendar source). No standalone MC verbiage box.

  const linked = item.linkedEvent;
  const hasLink = !!item.eventId;

  return (
    <div
      data-testid={`promo-card-${item.id}`}
      data-event-id={item.eventId ?? ""}
      style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
        overflow: "hidden", transition: "all 0.15s",
      }}
    >
      {/* Header row */}
      <div
        onClick={() => !isEditing && onToggleExpand()}
        style={{
          padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
          cursor: "pointer", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {isEditing ? (
              <input
                value={editBuffer.title ?? ""}
                onChange={(e) => setEditBuffer({ ...editBuffer, title: e.target.value })}
                style={{ background: "transparent", border: "none", borderBottom: "1px solid var(--border)", color: "inherit", fontWeight: "inherit", fontSize: "0.9em", width: "100%" }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span>{linked?.icon || ""}</span>
                <span>{item.title}</span>
              </span>
            )}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
            {isEditing ? (
              <input
                value={editBuffer.date ?? ""}
                onChange={(e) => setEditBuffer({ ...editBuffer, date: e.target.value })}
                style={{ background: "transparent", border: "none", borderBottom: "1px solid var(--border)", color: "inherit", fontSize: "0.9em" }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{item.date ? fmtDate(item.date) : ""}</span>
            )}
          </div>
          {hasLink && (
            <span
              title={`Linked to Event Calendar: ${linked?.name ?? item.eventId}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "rgba(201,0,43,0.1)", color: "var(--accent)",
                padding: "2px 8px", borderRadius: 12, fontSize: "0.65rem", fontWeight: 700,
                border: "1px solid rgba(201,0,43,0.3)",
              }}
            >
              <LinkIcon size={11} /> Linked
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {canEdit && (
            <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
              {isEditing ? (
                <>
                  <button onClick={onSaveEdit} style={{ color: "#22c55e", background: "none", border: "none" }} title="Save"><Check size={18} /></button>
                  <button onClick={onCancelEdit} style={{ color: "var(--muted)", background: "none", border: "none" }} title="Cancel"><X size={18} /></button>
                </>
              ) : (
                <>
                  <button onClick={onStartEdit} style={{ color: "var(--muted)", background: "none", border: "none" }} title="Edit"><Edit2 size={16} /></button>
                  <button onClick={onDelete} style={{ color: "#ef4444", background: "none", border: "none" }} title="Delete"><Trash2 size={16} /></button>
                </>
              )}
            </div>
          )}
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expandable body */}
      {isExpanded && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 0 }}>
          <div style={{ paddingTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Event Description</div>
              {isEditing ? (
                <textarea
                  value={editBuffer.description ?? ""}
                  onChange={(e) => setEditBuffer({ ...editBuffer, description: e.target.value })}
                  style={{ width: "100%", minHeight: 80, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "white", padding: 8, borderRadius: 6, fontFamily: "inherit" }}
                />
              ) : (
                <div style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{item.description || "N/A"}</div>
              )}
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Drink Specials</div>
              {isEditing ? (
                <textarea
                  value={editBuffer.drinkSpecials ?? ""}
                  onChange={(e) => setEditBuffer({ ...editBuffer, drinkSpecials: e.target.value })}
                  style={{ width: "100%", minHeight: 80, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "white", padding: 8, borderRadius: 6, fontFamily: "inherit" }}
                />
              ) : (
                <div style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{item.drinkSpecials || "N/A"}</div>
              )}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>
                  🎙️ MC Verbiage{hasLink && " (synced to Event Calendar)"}
                </div>
                {hasLink && (item.verbiage ?? "") && !isEditing && (
                  <span
                    title="This card is linked to the Event Calendar record above. Edits sync back automatically."
                    style={{ fontSize: "0.65rem", color: "#22c55e", background: "rgba(34,197,94,0.15)", padding: "1px 6px", borderRadius: 8 }}
                  >
                    Linked · edits sync
                  </span>
                )}
              </div>
              {isEditing ? (
                <textarea
                  value={editBuffer.verbiage ?? ""}
                  onChange={(e) => setEditBuffer({ ...editBuffer, verbiage: e.target.value })}
                  placeholder="Suggested MC verbiage for this event…"
                  style={{ width: "100%", minHeight: 100, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "white", padding: 12, borderRadius: 6, fontFamily: "inherit", outline: "none", resize: "vertical" }}
                />
              ) : (
                <div
                  data-testid={`verbiage-readonly-${item.id}`}
                  style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.5, whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.15)", padding: 12, borderRadius: 8, borderLeft: "2px solid var(--accent)" }}
                >
                  {item.verbiage || "—"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No separate MC Verbiage box below the card — verbiage lives inside the
          expanded event card body and syncs to Event Calendar on save. */}
    </div>
  );
}

// (DetailKV helper removed — was only used inside the removed
// "Linked Event Calendar Record" badge box.)