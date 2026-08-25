"use client";

import { useEffect, useState, useMemo } from "react";
import { useVenue } from "@/components/VenueSwitcher";
import { RECURRENCE_RULES, computeSeriesDates, normalizeRecurrenceCode, recurrenceLabel, CALENDAR_FROM, CALENDAR_TO } from "@/lib/recurrence";
import { type Role, hasPermission } from "@/lib/auth/roles";
import { isPastDate, seriesHasFutureOccurrence } from "@/lib/date";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };
const BADGE: Record<string, string> = {
  Confirmed: "#00a86b", Planned: "var(--accent2)", Cancelled: "var(--accent)",
};

type SRBStatus = "Confirmed" | "Planned" | "Cancelled";

interface ShowEntry {
  dates: string[];
  entertainer: string;
  showName: string;
  time?: string;
}

interface OneOffEvent {
  id: string; date: string; name: string; theme: string; status: SRBStatus;
  icon?: string; who?: string; format?: string; drinks?: string; games?: string; costuming?: string; verbiage?: string;
  shows?: ShowEntry[]; venue?: string;
}

interface EventSeries {
  id: string; name: string; theme: string; status: SRBStatus; dates: string[];
  icon?: string; day?: string; who?: string; format?: string; drinks?: string; games?: string; costuming?: string; verbiage?: string; flyerImage?: string; startDate?: string;
  shows?: ShowEntry[]; venue?: string;
}

type NewEventForm = Partial<OneOffEvent> & Partial<EventSeries> & { id: string };

interface EventsFile { oneOffs: OneOffEvent[]; series: EventSeries[]; }

const emptyOneOff: OneOffEvent = { id: "", date: "", name: "", theme: "", status: "Planned", icon: "", who: "", format: "", drinks: "", games: "", costuming: "", verbiage: "", shows: [] };

function formatVenueLabel(v?: string) {
  if (v === "torch1") return "Torch 1";
  if (v === "torch2") return "Torch 2";
  if (v === "both") return "Both";
  return v || "";
}

/** Normalize any legacy venue value to the canonical code. */
function normalizeVenueCode(v?: string): "torch1" | "torch2" | "both" | undefined {
  if (!v) return undefined;
  const lc = v.toLowerCase().trim();
  if (lc === "torch 1" || lc === "torch1") return "torch1";
  if (lc === "torch 2" || lc === "torch2") return "torch2";
  if (lc === "both") return "both";
  return undefined;
}

function StatusPill({ status }: { status: SRBStatus }) {
  return (
    <span style={{ background: BADGE[status] + "22", color: BADGE[status], padding: "3px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600 }}>
      {status}
    </span>
  );
}

function fmtDate(d: string) {
  if (!d) return "—";
  const dt = new Date(d + "T12:00:00");
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
  background: "var(--bg)", color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box",
};
const LABEL_STYLE: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4,
  textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700,
};

export default function EventsPage() {
  const [data, setData] = useState<EventsFile>({ oneOffs: [], series: [] });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'oneOff' | 'series'>('oneOff');
  const [form, setForm] = useState<NewEventForm>(emptyOneOff as NewEventForm);
  
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1));
  const [selectedEventIds, setSelectedEventIds] = useState<{ type: 'oneOff' | 'series', id: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<any>(null);
  const [openRegistryIds, setOpenRegistryIds] = useState<Set<string>>(new Set());

  const venue = useVenue();
  const [role, setRole] = useState<Role>("Employee");

  useEffect(() => {
    const checkRole = async () => {
      try {
        const currentEmail = sessionStorage.getItem("srb-session-email");
        if (!currentEmail) return;

        const res = await fetch("/api/users");
        if (!res.ok) return;
        const data = await res.json();
        const users = data.users || [];
        const matched = users.find((u: any) => u.email.toLowerCase() === currentEmail.toLowerCase());
        if (matched) setRole(matched.role);
      } catch {}
    };
    checkRole();
  }, []);

  const canEdit = hasPermission(role, "edit", "/events");
  const load = () => {
    fetch(`/api/events?venue=${venue}`).then((r) => r.json()).then((d) => setData(d ?? { oneOffs: [], series: [] })).catch(() => {});
  };
  
  useEffect(() => {
    load();
    // Verification log (Development only)
    console.log("Current User Role:", role);
  }, [venue, role]);

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, date: dateStr });
    }
    return days;
  }, [currentMonth]);

  const monthYearLabel = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Derived visible lists: hide expired events from display without mutating
  // the authoritative records. A one-off is expired when its date is before
  // today (lexical YYYY-MM-DD comparison). A series is expired when all of its
  // computed occurrences have passed; series with no dates are kept visible
  // so admins can fix broken schedules.
  const visibleOneOffs = useMemo(
    () => (data.oneOffs || []).filter((e) => !isPastDate(e.date)),
    [data.oneOffs]
  );
  const visibleSeries = useMemo(
    () => (data.series || []).filter((s) => seriesHasFutureOccurrence(s.dates)),
    [data.series]
  );

  const getEventsForDate = (date: string) => {
    // Only show "Confirmed" events on the calendar, and skip expired entries.
    const matchedOneOffs = (data.oneOffs || []).filter(
      (e) => e.date === date && e.status === "Confirmed" && !isPastDate(e.date)
    );

    // Series match is purely date-array-based (source of truth = dates[]).
    // Past occurrences are never rendered here because the dates[] array only
    // contains dates that pass the series generation rule, so past occurrences
    // (if any) are already absent from the grid.
    const matchedSeries = (data.series || []).filter((s) => {
      if (s.status !== "Confirmed") return false;
      return (s.dates || []).includes(date);
    });

    return { oneOffs: matchedOneOffs, series: matchedSeries };
  };

  const handleDayClick = (date: string) => {
    const events = getEventsForDate(date);
    const combined = [
      ...events.series.map(s => ({ type: 'series' as const, id: s.id })),
      ...events.oneOffs.map(e => ({ type: 'oneOff' as const, id: e.id })),
    ];
    setSelectedEventIds(combined);
  };

  const save = async (payload: any, explicitKind?: 'oneOff' | 'series') => {
    setLoading(true);
    try {
      // Determine kind: explicit > payload.day heuristic > look up in data
      let kind = explicitKind;
      if (!kind) kind = payload.day ? 'series' : 'oneOff';

      // Verify by checking if id exists in series list
      const existsInSeries = (data.series || []).some(s => s.id === payload.id);
      const existsInOneOffs = (data.oneOffs || []).some(e => e.id === payload.id);
      if (existsInSeries && !existsInOneOffs) kind = 'series';
      if (existsInOneOffs && !existsInSeries) kind = 'oneOff';

      // If no existing id, this is a CREATE not an update
      const isCreate = !payload.id;

      if (kind === 'series' && payload.day && payload.startDate) {
        const canonicalDay = normalizeRecurrenceCode(payload.day);
        if (canonicalDay) {
          payload.day = canonicalDay;
          payload.dates = computeSeriesDates(canonicalDay, payload.startDate, CALENDAR_FROM, CALENDAR_TO);
        }
      }

      await fetch("/api/events", {
        method: isCreate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isCreate ? { kind, ...payload } : { id: payload.id, kind, ...payload }),
      });

      setEditingId(null);
      setEditBuffer(null);
      setShowForm(false);
      setForm({ ...emptyOneOff, id: "", venue: "torch1" });
      await load();
    } finally { setLoading(false); }
  };

  const renderEventForm = (e: any, refType: 'oneOff' | 'series', isCalendarDetail: boolean = false) => {
    const isEditing = editingId === e.id;
    const isCollapsed = !isCalendarDetail && !openRegistryIds.has(e.id);
    const target = isEditing ? editBuffer : e;

    return (
      <div key={e.id} style={{ ...CARD, padding: isCollapsed ? "12px 20px" : "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <span style={{ fontSize: isCollapsed ? "1.2rem" : "2rem", minWidth: isCollapsed ? 24 : 44, textAlign: "center" }}>
            {isEditing ? (
              <input value={target.icon || ""} onChange={b => setEditBuffer({ ...editBuffer, icon: b.target.value })} style={{ ...INPUT_STYLE, width: 44, textAlign: "center" }} />
            ) : (
              e.icon || (refType === 'oneOff' ? "📅" : "📁")
            )}
          </span>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div 
                style={{ cursor: isCalendarDetail ? "default" : "pointer", flex: 1 }}
                onClick={() => !isCalendarDetail && setOpenRegistryIds(prev => {
                  const next = new Set(prev);
                  if (next.has(e.id)) next.delete(e.id); else next.add(e.id);
                  return next;
                })}
              >
                {isEditing ? (
                  <input value={target.name || ""} onChange={b => setEditBuffer({ ...editBuffer, name: b.target.value })} style={{ ...INPUT_STYLE, fontSize: "1.1rem", fontWeight: 700 }} />
                ) : (
                  <h3 style={{ margin: 0, fontSize: isCollapsed ? "1rem" : "1.3rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    {!isCalendarDetail && <span style={{ fontSize: "0.7rem", verticalAlign: "middle", opacity: 0.5 }}>{isCollapsed ? "▶" : "▼"}</span>}
                    <span>{e.name}</span>
                  </h3>
                )}
                {isCollapsed && (
                  <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
                    {refType === 'oneOff' ? fmtDate(e.date) : (e.day ? recurrenceLabel(e.day) : "—")} · {e.status}
                    {e.venue && (
                      <span style={{
                        display: "inline-block",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        background: e.venue === "torch1" ? "#fb923c" : e.venue === "torch2" ? "#facc15" : "#dc2626",
                        color: e.venue === "torch2" ? "#1a1a1a" : "#fff",
                      }}>
                        {formatVenueLabel(e.venue)}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
                {isEditing ? (
                  <>
                    <button onClick={() => save(editBuffer, refType)} style={{ background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", cursor: "pointer" }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", cursor: "pointer" }}>Cancel</button>
                  </>
                ) : (
                  <>
                    {e.status === "Confirmed" && (
                      <span title="Confirmed" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "#00a86b", color: "#fff", fontSize: "0.9rem", fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>✓</span>
                    )}
                    {canEdit && !isCollapsed && <button onClick={() => { setEditingId(e.id); setEditBuffer({ ...e }); }} style={{ background: "none", border: "1px solid var(--accent2)", color: "var(--accent2)", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", cursor: "pointer" }}>Edit</button>}
                    {!isCollapsed && <StatusPill status={e.status} />}
                  </>
                )}
              </div>
            </div>

            {!isCollapsed && (
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={LABEL_STYLE}>Status</label>
                  {isEditing ? (
                    <select value={target.status} onChange={b => setEditBuffer({ ...editBuffer, status: b.target.value })} style={INPUT_STYLE}>
                      <option>Planned</option><option>Confirmed</option><option>Cancelled</option>
                    </select>
                  ) : <p style={{ margin: 0, fontSize: "0.9rem" }}>{e.status}</p>}
                </div>
                <div>
                  <label style={LABEL_STYLE}>Theme</label>
                  {isEditing ? (
                    <input value={target.theme || ""} onChange={b => setEditBuffer({ ...editBuffer, theme: b.target.value })} style={INPUT_STYLE} />
                  ) : <p style={{ margin: 0, fontSize: "0.9rem" }}>{e.theme || "—"}</p>}
                </div>

                <div>
                  <label style={LABEL_STYLE}>Main Event Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={refType === 'oneOff' ? (target.date || "") : (target.startDate || "")}
                      onChange={b => setEditBuffer({ ...editBuffer, [refType === 'oneOff' ? 'date' : 'startDate']: b.target.value })}
                      style={INPUT_STYLE}
                    />
                  ) : <p style={{ margin: 0, fontSize: "0.9rem" }}>{refType === 'oneOff' ? fmtDate(e.date) : fmtDate(e.startDate)}</p>}
                </div>

                <div>
                  <label style={LABEL_STYLE}>{refType === 'series' ? "Recurring Day" : "Target Audience"}</label>
                  {isEditing ? (
                    refType === 'series' ? (
                      <select
                        value={target.day || ""}
                        onChange={b => setEditBuffer({ ...editBuffer, day: b.target.value })}
                        style={INPUT_STYLE}
                      >
                        <option value="">Select Recurring Day</option>
                        {RECURRENCE_RULES.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
                      </select>
                    ) : (
                      <input
                        value={target.who || ""}
                        onChange={b => setEditBuffer({ ...editBuffer, who: b.target.value })}
                        style={INPUT_STYLE}
                      />
                    )
                  ) : <p style={{ margin: 0, fontSize: "0.9rem" }}>{refType === 'series' ? (recurrenceLabel(e.day) || "—") : (e.who || "—")}</p>}
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={LABEL_STYLE}>Venue Selection</label>
                  {isEditing ? (
                    <select value={target.venue || ""} onChange={b => setEditBuffer({ ...editBuffer, venue: b.target.value })} style={INPUT_STYLE}>
                      <option value="">Select Venue</option>
                      <option value="torch1">Torch 1</option>
                      <option value="torch2">Torch 2</option>
                      <option value="both">Both</option>
                    </select>
                  ) : <p style={{ margin: 0, fontSize: "0.9rem" }}>{formatVenueLabel(e.venue) || "—"}</p>}
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={LABEL_STYLE}>Format</label>
                  {isEditing ? (
                    <textarea value={target.format || ""} onChange={b => setEditBuffer({ ...editBuffer, format: b.target.value })} style={{ ...INPUT_STYLE, minHeight: 40 }} />
                  ) : <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.4 }}>{e.format || "—"}</p>}
                </div>

                <div>
                  <label style={LABEL_STYLE}>Drinks</label>
                  {isEditing ? (
                    <input value={target.drinks || ""} onChange={b => setEditBuffer({ ...editBuffer, drinks: b.target.value })} style={INPUT_STYLE} />
                  ) : <p style={{ margin: 0, fontSize: "0.9rem" }}>{e.drinks || "—"}</p>}
                </div>
                <div>
                  <label style={LABEL_STYLE}>Games</label>
                  {isEditing ? (
                    <input value={target.games || ""} onChange={b => setEditBuffer({ ...editBuffer, games: b.target.value })} style={INPUT_STYLE} />
                  ) : <p style={{ margin: 0, fontSize: "0.9rem" }}>{e.games || "—"}</p>}
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={LABEL_STYLE}>Costuming</label>
                  {isEditing ? (
                    <input value={target.costuming || ""} onChange={b => setEditBuffer({ ...editBuffer, costuming: b.target.value })} style={INPUT_STYLE} />
                  ) : <p style={{ margin: 0, fontSize: "0.9rem" }}>{e.costuming || "—"}</p>}
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={LABEL_STYLE} title="MC / promo verbiage — synced bidirectionally with linked Promotional Materials cards">
                    🎙️ Verbiage <span style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>(synced to Promotional Materials)</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      data-testid="event-verbiage-input"
                      value={target.verbiage || ""}
                      onChange={b => setEditBuffer({ ...editBuffer, verbiage: b.target.value })}
                      placeholder="Suggested MC verbiage for this event…"
                      style={{ ...INPUT_STYLE, minHeight: 80, fontFamily: "inherit", resize: "vertical" }}
                    />
                  ) : (
                    <div
                      data-testid="event-verbiage-readonly"
                      style={{
                        margin: 0, fontSize: "0.9rem", lineHeight: 1.5, whiteSpace: "pre-wrap",
                        background: "rgba(0,0,0,0.15)", padding: 12, borderRadius: 8,
                        borderLeft: "2px solid var(--accent)", color: e.verbiage ? "var(--text)" : "var(--muted)",
                      }}
                    >
                      {e.verbiage || "—"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="toc-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>📅 Event Calendar</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>Confirmed Events Layout</p>
        </div>
        {canEdit && (
          <button onClick={() => { setForm({ ...emptyOneOff, id: "", venue: "torch1" }); setFormType('oneOff'); setShowForm(true); }} style={{ background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>+ Add Event</button>
        )}
      </div>

      <div style={{ ...CARD, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>←</button>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>{monthYearLabel}</h2>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>→</button>
        </div>

        {/* Venue legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, fontSize: "0.75rem", color: "var(--muted)", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#fb923c" }}></span>
            Torch 1
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#facc15" }}></span>
            Torch 2
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#dc2626" }}></span>
            Both Venues
          </span>
        </div>

        <div className="calendar-grid responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} style={{ background: "var(--bg)", padding: 12, textAlign: "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)" }}>{d}</div>
          ))}
          {calendarDays.map((d, i) => {
            if (!d) return <div key={i} style={{ background: "var(--card)", minHeight: 100 }} />;
            const events = getEventsForDate(d.date);
            return (
              <div key={i} onClick={() => handleDayClick(d.date)} style={{ background: "var(--card)", padding: 8, minHeight: 110, border: "0.5px solid var(--border)", cursor: "pointer" }}>
                <span className="cal-day-num" style={{ fontSize: "0.9rem", fontWeight: 600, opacity: 0.6 }}>{d.day}</span>
                <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                  {events.series.map(s => {
                    const bg = s.venue === "torch1" ? "#fb923c" : s.venue === "torch2" ? "#facc15" : s.venue === "both" ? "#dc2626" : "var(--border)";
                    const fg = s.venue === "torch2" ? "#1a1a1a" : "#fff";
                    return <div key={s.id} className="cal-pill" style={{ background: bg, color: fg, padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden" }}>{s.icon || "📁"} {s.name}</div>;
                  })}
                  {events.oneOffs.map(e => {
                    const bg = e.venue === "torch1" ? "#fb923c" : e.venue === "torch2" ? "#facc15" : e.venue === "both" ? "#dc2626" : "var(--accent2)";
                    const fg = e.venue === "torch2" ? "#1a1a1a" : "#fff";
                    return <div key={e.id} className="cal-pill" style={{ background: bg, color: fg, padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden" }}>{e.icon || "📅"} {e.name}</div>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedEventIds.length > 0 && (role === "Admin" || role === "Admin" || role === "Manager") && (
        <div style={{ marginBottom: 40 }}>
           <div className="toc-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
             <h2 style={{ fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>Selected Day Events</h2>
             <button onClick={() => setSelectedEventIds([])} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>Close ✕</button>
           </div>
           <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
             {selectedEventIds.map(ref => {
               const e = ref.type === 'oneOff' ? data.oneOffs.find(x => x.id === ref.id) : data.series.find(x => x.id === ref.id);
               return e ? renderEventForm(e, ref.type, true) : null;
             })}
           </div>
        </div>
      )}

      {hasPermission(role, "edit", "/events") && (
        <div style={{ marginTop: 40 }}>
          <div className="toc-header" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>Registry Management</h2>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setOpenRegistryIds(new Set())} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.8rem" }}>Collapse All</button>
              <button onClick={() => setOpenRegistryIds(new Set([...visibleSeries.map(s => s.id), ...visibleOneOffs.map(e => e.id)]))} style={{ background: "none", border: "none", color: "var(--accent2)", cursor: "pointer", fontSize: "0.8rem" }}>Expand All</button>
            </div>
          </div>

          <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <section>
              <h3 style={LABEL_STYLE}>Weekly Series</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(visibleSeries).map(s => renderEventForm(s, 'series'))}
              </div>
            </section>
            <section>
              <h3 style={LABEL_STYLE}>One-Off Events</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(visibleOneOffs).sort((a,b) => (a.date || "").localeCompare(b.date || "")).map(e => renderEventForm(e, 'oneOff'))}
              </div>
            </section>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
            <div className="toc-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem" }}>Add {formType === 'series' ? 'Weekly Series' : 'One-Off Event'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
            </div>

            {/* Type toggle */}
            <div style={{ display: "flex", gap: 6, marginBottom: 18, padding: 4, background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
              <button onClick={() => setFormType('oneOff')} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", background: formType === 'oneOff' ? "var(--accent2)" : "transparent", color: formType === 'oneOff' ? "#fff" : "var(--text)", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>📅 One-Off Event</button>
              <button onClick={() => setFormType('series')} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", background: formType === 'series' ? "var(--accent2)" : "transparent", color: formType === 'series' ? "#fff" : "var(--text)", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>📁 Weekly Series</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={LABEL_STYLE}>Icon</label><input value={form.icon ?? ""} onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))} style={INPUT_STYLE} placeholder={formType === 'series' ? "e.g. 📁" : "e.g. 🎉"} /></div>
                {formType === 'oneOff' ? (
                  <div><label style={LABEL_STYLE}>Date *</label><input type="date" value={form.date ?? ""} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} style={INPUT_STYLE} /></div>
                ) : (
                  <div><label style={LABEL_STYLE}>Start Date *</label><input type="date" value={form.startDate ?? ""} onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} style={INPUT_STYLE} /></div>
                )}
              </div>
              <div><label style={LABEL_STYLE}>Event Name *</label><input value={form.name ?? ""} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. Industry Night" /></div>
              <div><label style={LABEL_STYLE}>Theme</label><input value={form.theme ?? ""} onChange={(e) => setForm(f => ({ ...f, theme: e.target.value }))} style={INPUT_STYLE} placeholder="Optional" /></div>

              {formType === 'series' && (
                <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={LABEL_STYLE}>Recurring Day *</label>
                    <select value={form.day ?? ""} onChange={(e) => setForm(f => ({ ...f, day: e.target.value }))} style={INPUT_STYLE}>
                      <option value="">Select…</option>
                      {RECURRENCE_RULES.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Status</label>
                    <select value={form.status ?? "Planned"} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as SRBStatus }))} style={INPUT_STYLE}>
                      <option>Planned</option><option>Confirmed</option><option>Cancelled</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label style={LABEL_STYLE}>Venue Selection</label>
                <select value={form.venue || "torch1"} onChange={(e) => setForm(f => ({ ...f, venue: e.target.value }))} style={INPUT_STYLE}>
                    <option value="torch1">Torch 1</option>
                    <option value="torch2">Torch 2</option>
                    <option value="both">Both</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => save(form, formType)}
                  disabled={!form.name || (formType === 'oneOff' ? !form.date : (!form.startDate || !form.day))}
                  style={{ flex: 1, background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, cursor: "pointer", opacity: (!form.name || (formType === 'oneOff' ? !form.date : (!form.startDate || !form.day))) ? 0.5 : 1 }}
                >
                  Add {formType === 'series' ? 'Series' : 'Event'}
                </button>
                <button onClick={() => { setShowForm(false); setForm({ ...emptyOneOff, id: "", venue: "torch1" }); }} style={{ flex: 1, background: "none", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "10px", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
