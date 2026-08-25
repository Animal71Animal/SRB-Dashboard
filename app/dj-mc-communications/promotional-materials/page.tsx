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
}

interface EventsFile { oneOffs: OneOffEvent[]; series: EventSeries[]; }

// --- Helpers ---------------------------------------------------------------
function formatVenueLabel(v?: string) {
  if (v === "torch1") return "Torch 1";
  if (v === "torch2") return "Torch 2";
  if (v === "both") return "Both";
  return v || "";
}

function fmtDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d + "T12:00:00");
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isConfirmed(status?: string): boolean {
  return String(status ?? "").trim().toLowerCase() === "confirmed";
}

function newLocalId(): string {
  return `${Date.now().toString()}-${Math.random().toString(36).slice(2, 8)}`;
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

  // Persist MC verbiage for a single item. Optimistic local update + PUT to backend.
  const persistItemUpdate = async (torch: TorchKey, section: SectionKey, id: string, update: Partial<PromoItem>) => {
    try {
      await fetch("/api/promotional-materials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ torch, section, id, update }),
      });
    } catch (e) {
      console.error("persistItemUpdate failed", e);
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
        icon: event.kind === "oneoff" ? event.oneOff!.icon : event.series!.icon,
        venue: event.kind === "oneoff" ? event.oneOff!.venue : event.series!.venue,
        status: event.kind === "oneoff" ? event.oneOff!.status : event.series!.status,
        linkedAt: new Date().toISOString(),
      };
      const item: Partial<PromoItem> = {
        title: name,
        date: date ?? "",
        description: [linkedEvent.theme, linkedEvent.who, linkedEvent.format].filter(Boolean).join(" · "),
        verbiage: linkedEvent.costuming ?? "",
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
                Selecting an event copies its event card into this {torch === "torch1" ? "Torch 1" : "Torch 2"} · {section === "heavy" ? "Heavy Rotation" : "Upcoming"} section. An MC Verbiage box will appear under the card for staff to fill in.
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
  // Local MC verbiage buffer for the collapsible box. Initialize from item, but
  // allow controlled editing. We persist on blur.
  const [mcBuffer, setMcBuffer] = useState<string>(item.mcVerbiage ?? "");
  const [mcDirty, setMcDirty] = useState(false);
  const [mcSaving, setMcSaving] = useState(false);

  // Sync local buffer if item.mcVerbiage changes externally (after fetch).
  useEffect(() => {
    if (!mcDirty) setMcBuffer(item.mcVerbiage ?? "");
  }, [item.mcVerbiage, mcDirty]);

  const isMcCollapsed = item.mcVerbiageCollapsed ?? false;

  const toggleMc = async () => {
    const next = !isMcCollapsed;
    // Optimistic local
    item.mcVerbiageCollapsed = next;
    await persistItemUpdate({ mcVerbiageCollapsed: next });
  };

  const saveMc = async () => {
    if (!mcDirty) return;
    setMcSaving(true);
    try {
      item.mcVerbiage = mcBuffer;
      await persistItemUpdate({ mcVerbiage: mcBuffer });
      setMcDirty(false);
    } finally {
      setMcSaving(false);
    }
  };

  const linked = item.linkedEvent;
  const hasLink = !!item.eventId;

  const venueLabel = formatVenueLabel(linked?.venue);
  const venueColor =
    linked?.venue === "torch1" ? "#fb923c" :
    linked?.venue === "torch2" ? "#facc15" :
    linked?.venue === "both" ? "#dc2626" : "var(--muted)";

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
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Verbiage Ideas</div>
              {isEditing ? (
                <textarea
                  value={editBuffer.verbiage ?? ""}
                  onChange={(e) => setEditBuffer({ ...editBuffer, verbiage: e.target.value })}
                  style={{ width: "100%", minHeight: 80, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "white", padding: 8, borderRadius: 6, fontFamily: "inherit" }}
                />
              ) : (
                <div style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.5, whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.15)", padding: 12, borderRadius: 8, borderLeft: "2px solid var(--accent)" }}>{item.verbiage || "N/A"}</div>
              )}
            </div>
          </div>

          {/* Linked event details — only when this card was created from the picker */}
          {hasLink && (
            <div style={{ marginTop: 16, padding: 12, background: "rgba(0,0,0,0.18)", borderRadius: 8, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.05em", fontWeight: 700 }}>
                Linked Event Calendar Record · {item.eventKind === "series" ? "Series" : "One-off"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, fontSize: "0.85rem" }}>
                <DetailKV k="Event ID" v={linked?.id} mono />
                <DetailKV k="Venue" v={venueLabel || "—"} accentColor={venueColor} />
                <DetailKV k="Theme" v={linked?.theme} />
                <DetailKV k="Audience" v={linked?.who} />
                <DetailKV k="Format" v={linked?.format} />
                <DetailKV k="Games" v={linked?.games} />
                <DetailKV k="Costuming" v={linked?.costuming} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* MC Verbiage box — collapsible, always visible directly below the card */}
      <div
        data-testid={`mc-verbiage-${item.id}`}
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(201,0,43,0.04)",
        }}
      >
        <button
          onClick={toggleMc}
          aria-expanded={!isMcCollapsed}
          aria-controls={`mc-verbiage-body-${item.id}`}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 20px", background: "transparent", border: "none",
            color: "var(--text)", cursor: "pointer", textAlign: "left",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.8rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🎙️ Suggested MC Verbiage
            {(item.mcVerbiage ?? "") && (
              <span style={{ fontSize: "0.65rem", color: "#22c55e", background: "rgba(34,197,94,0.15)", padding: "1px 6px", borderRadius: 8 }}>
                Saved
              </span>
            )}
          </span>
          <span style={{ color: "var(--muted)" }}>
            {isMcCollapsed ? <ChevronDown /> : <ChevronUp />}
          </span>
        </button>
        {!isMcCollapsed && (
          <div id={`mc-verbiage-body-${item.id}`} style={{ padding: "0 20px 16px" }}>
            <textarea
              value={mcBuffer}
              onChange={(e) => { setMcBuffer(e.target.value); setMcDirty(true); }}
              onBlur={saveMc}
              placeholder="Enter suggested MC verbiage for this event…"
              disabled={!canEdit && !hasLink}
              style={{
                width: "100%", minHeight: 100, padding: 12,
                background: "rgba(0,0,0,0.25)", border: "1px solid var(--border)",
                color: "var(--text)", borderRadius: 8, fontSize: "0.9rem",
                fontFamily: "inherit", resize: "vertical", outline: "none",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                {mcSaving ? "Saving…" : mcDirty ? "Unsaved changes (blur to save)" : "Auto-saves on blur"}
              </span>
              {canEdit && (
                <button
                  onClick={saveMc}
                  disabled={!mcDirty || mcSaving}
                  style={{
                    background: mcDirty && !mcSaving ? "var(--accent)" : "var(--border)",
                    color: "white", border: "none", borderRadius: 6,
                    padding: "6px 14px", cursor: mcDirty && !mcSaving ? "pointer" : "not-allowed",
                    fontSize: "0.8rem",
                  }}
                >
                  Save Verbiage
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Tiny detail row used inside the linked-event box ---------------------
function DetailKV({ k, v, mono, accentColor }: { k: string; v?: string; mono?: boolean; accentColor?: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{k}</div>
      <div
        style={{
          fontSize: "0.85rem", color: accentColor ?? "var(--text)",
          fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit",
          wordBreak: "break-word",
        }}
      >
        {v || "—"}
      </div>
    </div>
  );
}