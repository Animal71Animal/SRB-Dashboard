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
  shows?: ShowEntry[];
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
  const dt = new Date(d + "T12:00:00");
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
  background: "var(--bg)", color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box",
};
const LABEL_STYLE: React.CSSProperties = {
  display: "block", fontSize: "0.78rem", color: "var(--muted)", marginBottom: 4,
  textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600,
};

export default function EventsPage() {
  const [data, setData] = useState<EventsFile>({ oneOffs: [], series: [] });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<OneOffEvent>>(emptyOneOff);
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1)); // Aug 2026
  const [selectedEventIds, setSelectedEventIds] = useState<{ type: 'oneOff' | 'series', id: string }[]>([]);
  
  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<any>(null);

  // Collapse State for Registry
  const [openRegistryIds, setOpenRegistryIds] = useState<Set<string>>(new Set());

  const toggleRegistryCollapse = (id: string) => {
    setOpenRegistryIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  const changeMonth = (delta: number) => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
    const minMonth = new Date(2026, 7, 1);
    const maxMonth = new Date(2027, 11, 1);
    if (newMonth >= minMonth && newMonth <= maxMonth) {
      setCurrentMonth(newMonth);
    }
  };

  const save = async (payload: any, id?: string) => {
    setLoading(true);
    try {
      const finalPayload = { ...payload, venue: payload.venue ?? venue };
      const targetId = id || editingId;
      if (targetId) {
        await fetch("/api/events", { 
          method: "PATCH", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ id: targetId, kind: payload.day ? 'series' : 'oneOff', ...finalPayload }) 
        });
      } else {
        await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(finalPayload) });
      }
      setEditingId(null);
      setEditBuffer(null);
      setShowForm(false);
      await load();
    } finally { setLoading(false); }
  };

  const getEventsForDate = (date: string) => {
    const matchedOneOffs = (data.oneOffs || []).filter(e => e.date === date);
    const matchedSeries = (data.series || []).filter(s => (s.dates || []).includes(date));
    return { oneOffs: matchedOneOffs, series: matchedSeries };
  };

  const handleDayClick = (date: string) => {
    const events = getEventsForDate(date);
    const combined = [
      ...events.oneOffs.map(e => ({ type: 'oneOff' as const, id: e.id })),
      ...events.series.map(s => ({ type: 'series' as const, id: s.id }))
    ];
    setSelectedEventIds(combined);
  };

  const startInlineEdit = (e: any) => {
    setEditingId(e.id);
    setEditBuffer({ ...e });
    // Force open if it was collapsed
    setOpenRegistryIds(prev => new Set(prev).add(e.id));
  };

  const del = async (id: string, kind: 'oneOff' | 'series' = 'oneOff') => {
    if (!confirm(`Delete this ${kind === 'series' ? 'recurring series' : 'event'}?`)) return;
    const url = kind === 'series' ? `/api/events?id=${id}&kind=series` : `/api/events?id=${id}`;
    await fetch(url, { method: "DELETE" });
    setSelectedEventIds(prev => prev.filter(ref => ref.id !== id));
    await load();
  };

  const renderEventForm = (isEditing: boolean, e: any, refType: 'oneOff' | 'series', isCalendarDetail: boolean = false) => {
    const isCollapsed = !isCalendarDetail && !openRegistryIds.has(e.id);
    
    return (
      <div key={e.id} style={{ ...CARD, padding: isCollapsed ? "12px 20px" : "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <span style={{ fontSize: isCollapsed ? "1.2rem" : "2rem", cursor: "pointer" }} onClick={() => !isCalendarDetail && toggleRegistryCollapse(e.id)}>
            {isEditing ? (
              <input value={editBuffer.icon} onChange={b => setEditBuffer({ ...editBuffer, icon: b.target.value })} style={{ ...INPUT_STYLE, width: 44, textAlign: "center" }} />
            ) : (
              e.icon || (refType === 'oneOff' ? "📅" : "📁")
            )}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div 
                style={{ cursor: isCalendarDetail ? "default" : "pointer", flex: 1 }}
                onClick={() => !isCalendarDetail && toggleRegistryCollapse(e.id)}
              >
                {isEditing ? (
                  <input value={editBuffer.name} onChange={b => setEditBuffer({ ...editBuffer, name: b.target.value })} style={{ ...INPUT_STYLE, fontSize: "1.1rem", fontWeight: 700 }} />
                ) : (
                  <h3 style={{ margin: 0, fontSize: isCollapsed ? "1rem" : "1.3rem", fontWeight: 700 }}>
                    {!isCalendarDetail && <span style={{ marginRight: 8, fontSize: "0.7rem", verticalAlign: "middle", opacity: 0.5 }}>{isCollapsed ? "▶" : "▼"}</span>}
                    {e.name}
                  </h3>
                )}
                {isCollapsed && (
                  <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
                    {refType === 'oneOff' ? fmtDate((e as OneOffEvent).date) : `Every ${e.day}`} · {e.status}
                  </p>
                )}
              </div>
              
              <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
                {isEditing ? (
                  <>
                    <button onClick={() => save(editBuffer)} style={{ background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", cursor: "pointer" }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", cursor: "pointer" }}>Cancel</button>
                  </>
                ) : (
                  <>
                    {!isCollapsed && <button onClick={() => startInlineEdit(e)} style={{ background: "none", border: "1px solid var(--accent2)", color: "var(--accent2)", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", cursor: "pointer" }}>Edit</button>}
                    {!isCollapsed && <button onClick={() => del(e.id, refType)} style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", cursor: "pointer" }}>Delete</button>}
                    {!isCollapsed && <StatusPill status={e.status} />}
                  </>
                )}
              </div>
            </div>

            {!isCollapsed && (
              <>
                <div style={{ margin: "12px 0", display: "flex", gap: 12, alignItems: "center" }}>
                  {isEditing ? (
                    <>
                      <select value={editBuffer.status} onChange={b => setEditBuffer({ ...editBuffer, status: b.target.value })} style={{ ...INPUT_STYLE, width: "auto" }}>
                        <option>Planned</option><option>Confirmed</option><option>Cancelled</option>
                      </select>
                      {refType === 'series' && (
                         <input value={editBuffer.day} onChange={b => setEditBuffer({ ...editBuffer, day: b.target.value })} style={{ ...INPUT_STYLE, width: "auto" }} placeholder="Day" />
                      )}
                    </>
                  ) : null}
                  <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--muted)" }}>
                    {refType === 'oneOff' ? fmtDate((e as OneOffEvent).date) : `Recurring Series (${(e as EventSeries).day})`}
                  </p>
                </div>

                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={LABEL_STYLE}>Audience</label>
                    {isEditing ? (
                      <input value={editBuffer.who} onChange={b => setEditBuffer({ ...editBuffer, who: b.target.value })} style={INPUT_STYLE} />
                    ) : (
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>{e.who || "—"}</p>
                    )}
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Theme</label>
                    {isEditing ? (
                      <input value={editBuffer.theme} onChange={b => setEditBuffer({ ...editBuffer, theme: b.target.value })} style={INPUT_STYLE} />
                    ) : (
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>{e.theme || "—"}</p>
                    )}
                  </div>
                  <div style={{ gridColumn: refType === 'oneOff' ? "auto" : "span 2" }}>
                    <label style={LABEL_STYLE}>Format</label>
                    {isEditing ? (
                      <textarea value={editBuffer.format} onChange={b => setEditBuffer({ ...editBuffer, format: b.target.value })} style={{ ...INPUT_STYLE, minHeight: 60 }} />
                    ) : (
                      <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.4 }}>{e.format || "—"}</p>
                    )}
                  </div>
                  {refType === 'oneOff' && (
                    <div>
                      <label style={LABEL_STYLE}>Event Date</label>
                      {isEditing ? (
                        <input type="date" value={editBuffer.date} onChange={b => setEditBuffer({ ...editBuffer, date: b.target.value })} style={INPUT_STYLE} />
                      ) : (
                        <p style={{ margin: 0, fontSize: "0.9rem" }}>{e.date ? fmtDate(e.date) : "—"}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <label style={LABEL_STYLE}>Drinks</label>
                    {isEditing ? (
                      <input value={editBuffer.drinks} onChange={b => setEditBuffer({ ...editBuffer, drinks: b.target.value })} style={INPUT_STYLE} />
                    ) : (
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>{e.drinks || "—"}</p>
                    )}
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Games</label>
                    {isEditing ? (
                      <input value={editBuffer.games} onChange={b => setEditBuffer({ ...editBuffer, games: b.target.value })} style={INPUT_STYLE} />
                    ) : (
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>{e.games || "—"}</p>
                    )}
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Costuming</label>
                    {isEditing ? (
                      <input value={editBuffer.costuming} onChange={b => setEditBuffer({ ...editBuffer, costuming: b.target.value })} style={INPUT_STYLE} />
                    ) : (
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>{e.costuming || "—"}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>📅 Event Calendar</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>August 2026 – December 2027 Operation Center</p>
        </div>
        <button
          onClick={() => { setForm(emptyOneOff); setShowForm(true); }}
          style={{ background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>
          + Add Event
        </button>
      </div>

      {/* ── Calendar UI ── */}
      <div style={{ ...CARD, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={() => changeMonth(-1)} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>←</button>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>{monthYearLabel}</h2>
          <button onClick={() => changeMonth(1)} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>→</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} style={{ background: "var(--bg)", padding: 12, textAlign: "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{d}</div>
          ))}
          {calendarDays.map((d, i) => {
            if (!d) return <div key={i} style={{ background: "var(--card)", minHeight: 100 }} />;
            const events = getEventsForDate(d.date);
            return (
              <div
                key={i}
                onClick={() => handleDayClick(d.date)}
                style={{
                  background: "var(--card)", padding: 8, minHeight: 110, position: "relative", cursor: "pointer",
                  transition: "background 0.2s", border: "0.5px solid var(--border)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card)")}
              >
                <span style={{ fontSize: "0.9rem", fontWeight: 600, opacity: 0.6 }}>{d.day}</span>
                <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                  {(events.series || []).map(s => (
                    <div key={s.id} style={{ background: "var(--border)", padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.icon || "📁"} {s.name}
                    </div>
                  ))}
                  {(events.oneOffs || []).map(e => (
                    <div key={e.id} style={{ background: "var(--accent2)", padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {e.icon || "📅"} {e.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Event Detail View (Selected from Calendar) ── */}
      {selectedEventIds.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
             <h2 style={{ fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)" }}>Selected Day Events</h2>
             <button onClick={() => { setSelectedEventIds([]); setEditingId(null); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>Close ✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {selectedEventIds.map(ref => {
              const e = ref.type === 'oneOff' ? data.oneOffs.find(x => x.id === ref.id) : data.series.find(x => x.id === ref.id);
              if (!e) return null;
              return renderEventForm(editingId === e.id, e, ref.type, true);
            })}
          </div>
        </div>
      )}

      {/* ── All Events List ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", margin: 0 }}>Registry Management</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setOpenRegistryIds(new Set())} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.75rem", cursor: "pointer" }}>Collapse All</button>
          <button 
            onClick={() => {
              const allIds = new Set([...(data.series || []).map(s => s.id), ...(data.oneOffs || []).map(e => e.id)]);
              setOpenRegistryIds(allIds);
            }} 
            style={{ background: "none", border: "none", color: "var(--accent2)", fontSize: "0.75rem", cursor: "pointer" }}>Expand All</button>
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <section>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 16 }}>Weekly Series</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(data.series || []).map(s => renderEventForm(editingId === s.id, s, 'series'))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 16 }}>One-Off Events</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(data.oneOffs || []).sort((a,b) => (a.date || "").localeCompare(b.date || "")).map(e => renderEventForm(editingId === e.id, e, 'oneOff'))}
          </div>
        </section>
      </div>

      {/* ── Add Form Modal ── */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", fontWeight: 700 }}>Add One-Off Event</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={LABEL_STYLE}>Icon</label><input value={form.icon ?? ""} onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. 🎉" /></div>
                <div><label style={LABEL_STYLE}>Date</label><input type="date" value={form.date ?? ""} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} style={INPUT_STYLE} /></div>
              </div>
              <div><label style={LABEL_STYLE}>Event Name</label><input value={form.name ?? ""} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. Industry Night" /></div>
              <div><label style={LABEL_STYLE}>Theme / Description</label><input value={form.theme ?? ""} onChange={(e) => setForm(f => ({ ...f, theme: e.target.value }))} style={INPUT_STYLE} placeholder="Optional" /></div>
              <div>
                <label style={LABEL_STYLE}>Status</label>
                <select value={form.status ?? "Planned"} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as SRBStatus }))} style={INPUT_STYLE}>
                  <option>Planned</option><option>Confirmed</option><option>Cancelled</option>
                </select>
              </div>
              <div><label style={LABEL_STYLE}>Target Audience</label><input value={form.who ?? ""} onChange={(e) => setForm(f => ({ ...f, who: e.target.value }))} style={INPUT_STYLE} /></div>
              <div><label style={LABEL_STYLE}>Format</label><textarea value={form.format ?? ""} onChange={(e) => setForm(f => ({ ...f, format: e.target.value }))} style={{ ...INPUT_STYLE, minHeight: 72, resize: "vertical" }} /></div>
              <div><label style={LABEL_STYLE}>Signature Drinks</label><input value={form.drinks ?? ""} onChange={(e) => setForm(f => ({ ...f, drinks: e.target.value }))} style={INPUT_STYLE} /></div>
              <div><label style={LABEL_STYLE}>Games & Activities</label><input value={form.games ?? ""} onChange={(e) => setForm(f => ({ ...f, games: e.target.value }))} style={INPUT_STYLE} /></div>
              <div><label style={LABEL_STYLE}>Costuming</label><input value={form.costuming ?? ""} onChange={(e) => setForm(f => ({ ...f, costuming: e.target.value }))} style={INPUT_STYLE} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => save(form)} disabled={loading} style={{ flex: 1, background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, cursor: "pointer" }}>
                {loading ? "Saving…" : "Add Event"}
              </button>
              <button onClick={() => { setShowForm(false); setForm(emptyOneOff); }}
                style={{ flex: 1, background: "none", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "10px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
