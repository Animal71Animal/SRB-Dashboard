"use client";

import { useEffect, useState, useMemo } from "react";
import { useVenue } from "@/components/VenueSwitcher";

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
  icon?: string; who?: string; format?: string; drinks?: string; games?: string; costuming?: string;
  shows?: ShowEntry[]; venue?: string;
}

interface EventSeries {
  id: string; name: string; theme: string; status: SRBStatus; dates: string[];
  icon?: string; day?: string; who?: string; format?: string; drinks?: string; games?: string; costuming?: string; flyerImage?: string; startDate?: string;
  shows?: ShowEntry[]; venue?: string;
}

interface EventsFile { oneOffs: OneOffEvent[]; series: EventSeries[]; }

const emptyOneOff: OneOffEvent = { id: "", date: "", name: "", theme: "", status: "Planned", icon: "", who: "", format: "", drinks: "", games: "", costuming: "", shows: [] };

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
  const [form, setForm] = useState<Partial<OneOffEvent>>(emptyOneOff);
  
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1));
  const [selectedEventIds, setSelectedEventIds] = useState<{ type: 'oneOff' | 'series', id: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<any>(null);
  const [openRegistryIds, setOpenRegistryIds] = useState<Set<string>>(new Set());

  const venue = useVenue();
  const load = () => {
    fetch(`/api/events?venue=${venue}`).then((r) => r.json()).then((d) => setData(d ?? { oneOffs: [], series: [] })).catch(() => {});
  };
  useEffect(() => { load(); }, [venue]);

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

  const getEventsForDate = (date: string) => {
    // Only show "Confirmed" events on the calendar
    const matchedOneOffs = (data.oneOffs || []).filter(e => e.date === date && e.status === "Confirmed");
    
    const dt = new Date(date + "T12:00:00");
    const dayName = dt.toLocaleDateString("en-US", { weekday: "long" });
    
    const matchedSeries = (data.series || []).filter(s => {
      if (s.status !== "Confirmed") return false;
      const isCalculatedDate = s.day?.toLowerCase() === dayName.toLowerCase();
      const isManualDate = (s.dates || []).includes(date);
      return isCalculatedDate || isManualDate;
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

      if (kind === 'series' && payload.startDate) {
        if (!payload.dates) payload.dates = [];
        if (!payload.dates.includes(payload.startDate)) {
          payload.dates.push(payload.startDate);
        }
      }

      await fetch("/api/events", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ id: payload.id, kind, ...payload }) 
      });
      
      setEditingId(null);
      setEditBuffer(null);
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
                  <h3 style={{ margin: 0, fontSize: isCollapsed ? "1rem" : "1.3rem", fontWeight: 700 }}>
                    {!isCalendarDetail && <span style={{ marginRight: 8, fontSize: "0.7rem", verticalAlign: "middle", opacity: 0.5 }}>{isCollapsed ? "▶" : "▼"}</span>}
                    {e.name}
                  </h3>
                )}
                {isCollapsed && (
                  <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
                    {refType === 'oneOff' ? fmtDate(e.date) : `Every ${e.day || "—"}`} · {e.status}
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
                    {!isCollapsed && <button onClick={() => { setEditingId(e.id); setEditBuffer({ ...e }); }} style={{ background: "none", border: "1px solid var(--accent2)", color: "var(--accent2)", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", cursor: "pointer" }}>Edit</button>}
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
                    <input
                      value={refType === 'series' ? (target.day || "") : (target.who || "")}
                      onChange={b => setEditBuffer({ ...editBuffer, [refType === 'series' ? 'day' : 'who']: b.target.value })}
                      style={INPUT_STYLE}
                      placeholder={refType === 'series' ? "e.g. Sunday" : ""}
                    />
                  ) : <p style={{ margin: 0, fontSize: "0.9rem" }}>{refType === 'series' ? (e.day || "—") : (e.who || "—")}</p>}
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={LABEL_STYLE}>Venue Selection</label>
                  {isEditing ? (
                    <select value={target.venue || ""} onChange={b => setEditBuffer({ ...editBuffer, venue: b.target.value })} style={INPUT_STYLE}>
                      <option value="">Select Venue</option>
                      <option value="Torch 1">Torch 1</option>
                      <option value="Torch 2">Torch 2</option>
                      <option value="Both">Both</option>
                    </select>
                  ) : <p style={{ margin: 0, fontSize: "0.9rem" }}>{e.venue || "—"}</p>}
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
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>📅 Event Calendar</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>Confirmed Events Layout</p>
        </div>
        <button onClick={() => { setForm(emptyOneOff); setShowForm(true); }} style={{ background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>+ Add Event</button>
      </div>

      <div style={{ ...CARD, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>←</button>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>{monthYearLabel}</h2>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>→</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} style={{ background: "var(--bg)", padding: 12, textAlign: "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)" }}>{d}</div>
          ))}
          {calendarDays.map((d, i) => {
            if (!d) return <div key={i} style={{ background: "var(--card)", minHeight: 100 }} />;
            const events = getEventsForDate(d.date);
            return (
              <div key={i} onClick={() => handleDayClick(d.date)} style={{ background: "var(--card)", padding: 8, minHeight: 110, border: "0.5px solid var(--border)", cursor: "pointer" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, opacity: 0.6 }}>{d.day}</span>
                <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                  {events.series.map(s => <div key={s.id} style={{ background: "var(--border)", padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden" }}>{s.icon || "📁"} {s.name}</div>)}
                  {events.oneOffs.map(e => <div key={e.id} style={{ background: "var(--accent2)", padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden" }}>{e.icon || "📅"} {e.name}</div>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedEventIds.length > 0 && (
        <div style={{ marginBottom: 40 }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
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

      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>Registry Management</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setOpenRegistryIds(new Set())} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.8rem" }}>Collapse All</button>
          <button onClick={() => setOpenRegistryIds(new Set([...(data.series || []).map(s => s.id), ...(data.oneOffs || []).map(e => e.id)]))} style={{ background: "none", border: "none", color: "var(--accent2)", cursor: "pointer", fontSize: "0.8rem" }}>Expand All</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <section>
          <h3 style={LABEL_STYLE}>Weekly Series</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(data.series || []).map(s => renderEventForm(s, 'series'))}
          </div>
        </section>
        <section>
          <h3 style={LABEL_STYLE}>One-Off Events</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(data.oneOffs || []).sort((a,b) => (a.date || "").localeCompare(b.date || "")).map(e => renderEventForm(e, 'oneOff'))}
          </div>
        </section>
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", fontWeight: 700 }}>Add One-Off Event</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={LABEL_STYLE}>Icon</label><input value={form.icon ?? ""} onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. 🎉" /></div>
                <div><label style={LABEL_STYLE}>Date</label><input type="date" value={form.date ?? ""} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} style={INPUT_STYLE} /></div>
              </div>
              <div><label style={LABEL_STYLE}>Event Name</label><input value={form.name ?? ""} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} style={INPUT_STYLE} /></div>
              <div><label style={LABEL_STYLE}>Theme</label><input value={form.theme ?? ""} onChange={(e) => setForm(f => ({ ...f, theme: e.target.value }))} style={INPUT_STYLE} /></div>
              <div>
                <label style={LABEL_STYLE}>Venue Selection</label>
                <select value={form.venue || ""} onChange={(e) => setForm(f => ({ ...f, venue: e.target.value }))} style={INPUT_STYLE}>
                    <option value="">Select Venue</option>
                    <option value="Torch 1">Torch 1</option>
                    <option value="Torch 2">Torch 2</option>
                    <option value="Both">Both</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={() => save(form)} style={{ flex: 1, background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, cursor: "pointer" }}>Add Event</button>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "none", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "10px", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
