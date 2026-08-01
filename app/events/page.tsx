"use client";

import { useEffect, useState } from "react";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };
const BADGE: Record<string, string> = {
  Confirmed: "#00a86b", Planned: "var(--accent2)", Cancelled: "var(--accent)",
};

type SRBStatus = "Confirmed" | "Planned" | "Cancelled";

interface OneOffEvent {
  id: string; date: string; name: string; theme: string; status: SRBStatus;
  icon?: string; who?: string; format?: string; drinks?: string; games?: string; costuming?: string;
  shows?: ShowEntry[];
}
interface ShowEntry {
  dates: string[];
  entertainer: string;
  showName: string;
  time?: string;
}
interface EventSeries {
  id: string; name: string; theme: string; status: SRBStatus; dates: string[];
  icon?: string; day?: string; who?: string; format?: string; drinks?: string; games?: string; costuming?: string; flyerImage?: string; startDate?: string;
  shows?: ShowEntry[];
}
interface EventsFile { oneOffs: OneOffEvent[]; series: EventSeries[]; }

const emptyOneOff: OneOffEvent = { id: "", date: "", name: "", theme: "", status: "Planned", icon: "", who: "", format: "", drinks: "", games: "", costuming: "", shows: [] };
const emptySeriesForm = (): Partial<EventSeries> => ({
  name: "", theme: "", status: "Planned", icon: "", day: "", who: "", format: "", drinks: "", games: "", costuming: "", startDate: "",
});

const DAY_MAP: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
};

function generateWeeklyDates(startDate: string, dayName: string, endDate: string): string[] {
  const targetDay = DAY_MAP[(dayName || "").toLowerCase().trim()];
  if (targetDay === undefined || !startDate) return [];
  const end = new Date(endDate + "T12:00:00");
  const cur = new Date(startDate + "T12:00:00");
  // Advance to first matching weekday on or after startDate
  while (cur.getDay() !== targetDay) cur.setDate(cur.getDate() + 1);
  const dates: string[] = [];
  while (cur <= end) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 7);
  }
  return dates;
}

function StatusPill({ status }: { status: SRBStatus }) {
  return (
    <span style={{ background: BADGE[status] + "22", color: BADGE[status], padding: "3px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600 }}>
      {status}
    </span>
  );
}

function fmtDate(d: string) {
  const dt = new Date(d + "T00:00:00");
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
  const [form, setForm] = useState<Partial<OneOffEvent>>(emptyOneOff);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  // Series edit state
  const [editingSeries, setEditingSeries] = useState<EventSeries | null>(null);
  const [seriesForm, setSeriesForm] = useState<Partial<EventSeries>>(emptySeriesForm());
  const [seriesSaving, setSeriesSaving] = useState(false);
  const [genEndDate, setGenEndDate] = useState("2026-08-31");
  const [previewDates, setPreviewDates] = useState<string[] | null>(null);

  // Section / per-card collapse state
  const [seriesSectionOpen, setSeriesSectionOpen] = useState(false);
  const [oneOffSectionOpen, setOneOffSectionOpen] = useState(false);
  const [openSeriesId, setOpenSeriesId] = useState<string | null>(null);
  const [openOneOffId, setOpenOneOffId] = useState<string | null>(null);

  const load = () => {
    fetch("/api/events").then((r) => r.json()).then((d) => setData(d ?? { oneOffs: [], series: [] })).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true);
    try {
      if (editing) {
        await fetch("/api/events", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing, ...form }) });
      } else {
        await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      }
      setForm(emptyOneOff); setEditing(null); setShowForm(false); await load();
    } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    await load();
  };

  const delSeries = async (id: string, name: string) => {
    if (!confirm(`Delete the entire "${name}" series and all its dates?`)) return;
    await fetch(`/api/events?id=${id}&kind=series`, { method: "DELETE" });
    await load();
  };

  const openEditSeries = (s: EventSeries) => {
    setEditingSeries(s);
    setSeriesForm({
      name: s.name, theme: s.theme, status: s.status,
      icon: s.icon ?? "", day: s.day ?? "", who: s.who ?? "",
      format: s.format ?? "", drinks: s.drinks ?? "",
      games: s.games ?? "", costuming: s.costuming ?? "",
      startDate: s.startDate ?? "",
      dates: s.dates ?? [],
    });
    setPreviewDates(null);
    setGenEndDate("2026-08-31");
  };

  const saveSeries = async () => {
    if (!editingSeries) return;
    setSeriesSaving(true);
    try {
      const payload = { ...seriesForm };
      if (previewDates !== null) payload.dates = previewDates;
      await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingSeries.id, kind: "series", ...payload }),
      });
      setEditingSeries(null);
      setSeriesForm(emptySeriesForm());
      setPreviewDates(null);
      await load();
    } finally { setSeriesSaving(false); }
  };

  const editOneOff = (e: OneOffEvent) => { setForm(e); setEditing(e.id); setShowForm(true); };

  const { oneOffs = [], series = [] } = data;
  const sortedOneOffs = [...oneOffs].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });
  const sortedSeries = [...series].sort((a, b) => {
    const aDate = a.startDate || "9999";
    const bDate = b.startDate || "9999";
    return aDate.localeCompare(bDate);
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>📅 Event Schedule</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>The Torch Boise weekly themes, monthly events, and yearly specials</p>
        </div>
      </div>

      {/* ── Recurring Series ── */}
      {sortedSeries.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <button
            onClick={() => setSeriesSectionOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              background: "none", border: "none", padding: 0, margin: "0 0 12px",
              cursor: "pointer", color: "var(--muted)", textAlign: "left",
            }}
            aria-expanded={seriesSectionOpen}
          >
            <span style={{
              display: "inline-block", transform: seriesSectionOpen ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s", fontSize: "0.8rem", color: "var(--muted)",
            }}>▶</span>
            <h2 style={{
              fontSize: "1rem", fontWeight: 600, color: "var(--muted)",
              textTransform: "uppercase", letterSpacing: "0.05em", margin: 0,
            }}>
              Recurring Series
              <span style={{ marginLeft: 8, fontSize: "0.85rem", fontWeight: 500, opacity: 0.7 }}>
                ({sortedSeries.length})
              </span>
            </h2>
          </button>
          {seriesSectionOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sortedSeries.map((s) => {
              const sortedDates = [...(s.dates || [])].sort();
              const next = sortedDates.length > 0 ? sortedDates.find((d) => d >= new Date().toISOString().split("T")[0]) ?? sortedDates[0] : null;
              const hasInfo = s.who || s.format || s.drinks || s.games || s.costuming;
              const isOpen = openSeriesId === s.id;
              return (
                <div key={s.id} style={CARD}>
                  <div
                    onClick={() => setOpenSeriesId(isOpen ? null : s.id)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: 4, cursor: "pointer" }}
                  >
                    <span style={{
                      display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s", color: "var(--muted)", fontSize: "0.8rem",
                    }}>▶</span>
                    <span style={{ fontSize: "1.1rem" }}>{s.icon || "📁"}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>{s.name}</span>
                      {s.startDate && (
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", marginTop: 4, lineHeight: 1.2 }}>
                          {fmtDate(s.startDate)}
                        </div>
                      )}
                      {sortedDates.length > 0 && <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 2 }}>{sortedDates.length} dates{next ? ` · next: ${fmtDate(next)}` : ""}</div>}
                    </div>
                    <span style={{ marginLeft: "auto" }}><StatusPill status={s.status} /></span>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditSeries(s); }}
                      style={{ background: "none", border: "1px solid var(--accent2)", color: "var(--accent2)", borderRadius: 6, padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer" }}>
                      Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); delSeries(s.id, s.name); }}
                      style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 6, padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer" }}>
                      Del
                    </button>
                  </div>
                  {isOpen && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    {hasInfo && (
                      <div style={{ marginBottom: 16 }}>
                        {s.who && <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)" }}><strong>Target Audience:</strong> {s.who}</p>}
                        {s.format && <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}><strong>Format:</strong> {s.format}</p>}
                        {s.drinks && <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)" }}><strong>Signature Drinks:</strong> {s.drinks}</p>}
                        {s.games && <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)" }}><strong>Games & Activities:</strong> {s.games}</p>}
                        {s.costuming && <p style={{ margin: "0", fontSize: "0.85rem", color: "var(--muted)" }}><strong>Costuming:</strong> {s.costuming}</p>}
                      </div>
                    )}
                    {s.shows && s.shows.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <p style={{ margin: "0 0 8px", fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>Lineup</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {s.shows.map((sh, i) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: sh.time ? "80px 1fr 1fr 1fr" : "160px 1fr 1fr", gap: 12, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: "0.85rem", alignItems: "center" }}>
                              {sh.time && <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.9rem" }}>{sh.time}</span>}
                              <span style={{ color: "var(--muted)", fontWeight: 500 }}>{sh.dates.map(fmtDate).join(" & ")}</span>
                              <span style={{ fontWeight: 600, color: "var(--text)" }}>{sh.entertainer}</span>
                              <span style={{ color: "var(--accent2)", fontStyle: "italic" }}>{sh.showName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!s.shows || s.shows.length === 0) && sortedDates.length > 0 && (
                      <div>
                        <p style={{ margin: "8px 0", fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>Scheduled Dates</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                          {sortedDates.map((d) => (
                            <div key={d} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: "0.85rem", textAlign: "center" }}>
                              {fmtDate(d)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {sortedDates.length === 0 && (
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)", fontStyle: "italic" }}>Dates to be filled in...</p>
                    )}
                  </div>
                )}
                </div>
              );
            })}
          </div>
          )}
        </section>
      )}

      {/* ── One-Off Events ── */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button
            onClick={() => setOneOffSectionOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "none", border: "none", padding: 0, margin: 0,
              cursor: "pointer", color: "var(--muted)", textAlign: "left",
            }}
            aria-expanded={oneOffSectionOpen}
          >
            <span style={{
              display: "inline-block", transform: oneOffSectionOpen ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s", fontSize: "0.8rem", color: "var(--muted)",
            }}>▶</span>
            <h2 style={{
              fontSize: "1rem", fontWeight: 600, color: "var(--muted)",
              textTransform: "uppercase", letterSpacing: "0.05em", margin: 0,
            }}>
              One-Off Events
              <span style={{ marginLeft: 8, fontSize: "0.85rem", fontWeight: 500, opacity: 0.7 }}>
                ({sortedOneOffs.length})
              </span>
            </h2>
          </button>
          <button
            onClick={() => { setForm(emptyOneOff); setEditing(null); setShowForm(true); }}
            style={{ background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
            + Add Event
          </button>
        </div>

        {sortedOneOffs.length === 0 && oneOffSectionOpen && (
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", fontStyle: "italic" }}>No events scheduled yet.</p>
        )}

        {oneOffSectionOpen && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sortedOneOffs.map((e) => {
            const hasInfo = e.who || e.format || e.drinks || e.games || e.costuming || (e.shows && e.shows.length > 0);
            const isOpen = openOneOffId === e.id;
            return (
              <div key={e.id} style={CARD}>
                <div
                  onClick={() => setOpenOneOffId(isOpen ? null : e.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: 4, cursor: "pointer" }}
                >
                  <span style={{
                    display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s", color: "var(--muted)", fontSize: "0.8rem",
                  }}>▶</span>
                  <span style={{ fontSize: "1.1rem" }}>{e.icon || "📅"}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>{e.name}</span>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4, lineHeight: 1.2, color: e.date ? "var(--text)" : "var(--muted)" }}>
                      {e.date ? fmtDate(e.date) : "No date set"}
                    </div>
                  </div>
                  <span style={{ marginLeft: "auto" }}><StatusPill status={e.status} /></span>
                  <button onClick={(ev) => { ev.stopPropagation(); editOneOff(e); }}
                    style={{ background: "none", border: "1px solid var(--accent2)", color: "var(--accent2)", borderRadius: 6, padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer" }}>
                    Edit
                  </button>
                  <button onClick={(ev) => { ev.stopPropagation(); del(e.id); }}
                    style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 6, padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer" }}>
                    Del
                  </button>
                </div>
                {isOpen && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  {hasInfo ? (
                    <div>
                      {e.who && <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)" }}><strong>Target Audience:</strong> {e.who}</p>}
                      {e.theme && <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)" }}><strong>Theme:</strong> {e.theme}</p>}
                      {e.format && <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}><strong>Format:</strong> {e.format}</p>}
                      {e.drinks && <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)" }}><strong>Signature Drinks:</strong> {e.drinks}</p>}
                      {e.games && <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)" }}><strong>Games & Activities:</strong> {e.games}</p>}
                      {e.costuming && <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}><strong>Costuming:</strong> {e.costuming}</p>}
                      {e.shows && e.shows.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <p style={{ margin: "0 0 8px", fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>🎭 Featured Entertainment</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {e.shows.map((sh, i) => (
                              <div key={i} style={{ display: "grid", gridTemplateColumns: sh.time ? "80px 1fr 1fr 1fr" : "160px 1fr 1fr", gap: 12, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: "0.85rem", alignItems: "center" }}>
                                {sh.time && <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.9rem" }}>{sh.time}</span>}
                                <span style={{ color: "var(--muted)", fontWeight: 500 }}>{sh.dates.map(fmtDate).join(" & ")}</span>
                                <span style={{ fontWeight: 600, color: "var(--text)" }}>{sh.entertainer}</span>
                                <span style={{ color: "var(--accent2)", fontStyle: "italic" }}>{sh.showName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)", fontStyle: "italic" }}>No details set.</p>
                  )}
                </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </section>

      {/* ── One-Off Event Form Modal ── */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", fontWeight: 700 }}>{editing ? "Edit Event" : "Add One-Off Event"}</h3>
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
              <button onClick={save} disabled={loading} style={{ flex: 1, background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, cursor: "pointer" }}>
                {loading ? "Saving…" : editing ? "Save Changes" : "Add Event"}
              </button>
              <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyOneOff); }}
                style={{ flex: 1, background: "none", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "10px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Series Edit Modal ── */}
      {editingSeries && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", fontWeight: 700 }}>Edit Series: {editingSeries.name}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={LABEL_STYLE}>Icon</label><input value={seriesForm.icon ?? ""} onChange={(e) => { setSeriesForm(f => ({ ...f, icon: e.target.value })); setPreviewDates(null); }} style={INPUT_STYLE} placeholder="e.g. 🎉" /></div>
                <div><label style={LABEL_STYLE}>Day</label><input value={seriesForm.day ?? ""} onChange={(e) => { setSeriesForm(f => ({ ...f, day: e.target.value })); setPreviewDates(null); }} style={INPUT_STYLE} placeholder="e.g. Thursday" /></div>
              </div>
              <div><label style={LABEL_STYLE}>Series Name</label><input value={seriesForm.name ?? ""} onChange={(e) => setSeriesForm(f => ({ ...f, name: e.target.value }))} style={INPUT_STYLE} /></div>
              <div><label style={LABEL_STYLE}>Theme</label><input value={seriesForm.theme ?? ""} onChange={(e) => setSeriesForm(f => ({ ...f, theme: e.target.value }))} style={INPUT_STYLE} /></div>
              <div>
                <label style={LABEL_STYLE}>Status</label>
                <select value={seriesForm.status ?? "Planned"} onChange={(e) => setSeriesForm(f => ({ ...f, status: e.target.value as SRBStatus }))} style={INPUT_STYLE}>
                  <option>Planned</option><option>Confirmed</option><option>Cancelled</option>
                </select>
              </div>
              <div><label style={LABEL_STYLE}>Target Audience</label><input value={seriesForm.who ?? ""} onChange={(e) => setSeriesForm(f => ({ ...f, who: e.target.value }))} style={INPUT_STYLE} /></div>
              <div><label style={LABEL_STYLE}>Format</label><textarea value={seriesForm.format ?? ""} onChange={(e) => setSeriesForm(f => ({ ...f, format: e.target.value }))} style={{ ...INPUT_STYLE, minHeight: 72, resize: "vertical" }} /></div>
              <div><label style={LABEL_STYLE}>Signature Drinks</label><input value={seriesForm.drinks ?? ""} onChange={(e) => setSeriesForm(f => ({ ...f, drinks: e.target.value }))} style={INPUT_STYLE} /></div>
              <div><label style={LABEL_STYLE}>Games & Activities</label><input value={seriesForm.games ?? ""} onChange={(e) => setSeriesForm(f => ({ ...f, games: e.target.value }))} style={INPUT_STYLE} /></div>
              <div><label style={LABEL_STYLE}>Costuming</label><input value={seriesForm.costuming ?? ""} onChange={(e) => setSeriesForm(f => ({ ...f, costuming: e.target.value }))} style={INPUT_STYLE} /></div>

              {/* ── Weekly Date Generator ── */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 4 }}>
                <p style={{ margin: "0 0 12px", fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>📅 Weekly Date Generator</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={LABEL_STYLE}>Start Date</label>
                    <input type="date" value={seriesForm.startDate ?? ""}
                      onChange={(e) => { setSeriesForm(f => ({ ...f, startDate: e.target.value })); setPreviewDates(null); }}
                      style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Generate Through</label>
                    <input type="date" value={genEndDate}
                      onChange={(e) => { setGenEndDate(e.target.value); setPreviewDates(null); }}
                      style={INPUT_STYLE} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const dates = generateWeeklyDates(seriesForm.startDate ?? "", seriesForm.day ?? "", genEndDate);
                    setPreviewDates(dates);
                  }}
                  style={{ background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>
                  Generate Weekly Dates
                </button>
                {previewDates !== null && (
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: "0.78rem", color: "var(--muted)" }}>
                      {previewDates.length > 0 ? `${previewDates.length} dates generated — will replace existing dates on save:` : "⚠️ No dates generated — check Start Date and Day fields."}
                    </p>
                    {previewDates.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {previewDates.map(d => (
                          <span key={d} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem" }}>{fmtDate(d)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {previewDates === null && (seriesForm.dates?.length ?? 0) > 0 && (
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted)" }}>
                    Currently has {seriesForm.dates?.length} date(s). Generate new dates to replace them.
                  </p>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={saveSeries} disabled={seriesSaving}
                style={{ flex: 1, background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, cursor: "pointer" }}>
                {seriesSaving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => { setEditingSeries(null); setSeriesForm(emptySeriesForm()); }}
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
