"use client";

import { useEffect, useState } from "react";
import { useVenue } from "@/components/VenueSwitcher";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

interface AttendanceEntry {
  id: string; date: string; dayOfWeek: string; eventTheme: string;
  headcount: number; coverRevenue: string; notes: string; venue?: string;
}

const empty: Partial<AttendanceEntry> = { date: "", dayOfWeek: "", eventTheme: "", headcount: 0, coverRevenue: "", notes: "" };

function getDayOfWeek(dateStr: string): string {
  if (!dateStr) return "";
  return DAYS[new Date(dateStr + "T12:00:00").getDay()] || "";
}

export default function AttendancePage() {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [form, setForm] = useState<Partial<AttendanceEntry>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const venue = useVenue();

  const load = () => fetch(`/api/attendance?venue=${venue}`).then((r) => r.json()).then(setEntries).catch(() => {});
  useEffect(() => { load(); }, [venue]);

  const save = async () => {
    setLoading(true);
    try {
      const dayOfWeek = getDayOfWeek(form.date ?? "");
      await fetch("/api/attendance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, dayOfWeek, venue: form.venue ?? venue }),
      });
      setForm(empty); setShowForm(false); await load();
    } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete entry?")) return;
    await fetch(`/api/attendance?id=${id}`, { method: "DELETE" });
    await load();
  };

  const totalHeadcount = entries.reduce((s, e) => s + (e.headcount || 0), 0);
  const avgHeadcount = entries.length ? Math.round(totalHeadcount / entries.length) : 0;

  return (
    <div>
      <div className="toc-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>👥 Attendance Tracker</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>Nightly headcount log</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: "0.875rem", fontWeight: 600 }}>
          {showForm ? "Cancel" : "+ Log Night"}
        </button>
      </div>

      {/* Summary */}
      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Entries", value: entries.length, icon: "📋" },
          { label: "Total Headcount", value: totalHeadcount.toLocaleString(), icon: "👥" },
          { label: "Avg Per Night", value: avgHeadcount, icon: "📊" },
          { label: "Best Night", value: entries.length ? Math.max(...entries.map((e) => e.headcount)) : 0, icon: "🔥" },
        ].map((kpi) => (
          <div key={kpi.label} style={{ ...CARD, display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: "1.5rem" }}>{kpi.icon}</span>
            <div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent2)" }}>{kpi.value}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ ...CARD, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Log Night</h3>
          <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Date</label>
              <input type="date" value={form.date ?? ""} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} style={{ width: "100%", marginTop: 4 }} />
            </div>
            <input placeholder="Event / Theme" value={form.eventTheme ?? ""} onChange={(e) => setForm((p) => ({ ...p, eventTheme: e.target.value }))} />
            <input placeholder="Headcount" type="number" value={form.headcount ?? ""} onChange={(e) => setForm((p) => ({ ...p, headcount: Number(e.target.value) }))} />
            <input placeholder="Cover Revenue (e.g. $4,200)" value={form.coverRevenue ?? ""} onChange={(e) => setForm((p) => ({ ...p, coverRevenue: e.target.value }))} />
            <textarea placeholder="Notes" value={form.notes ?? ""} rows={2} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} style={{ gridColumn: "1 / -1", resize: "vertical" }} />
          </div>
          <button onClick={save} disabled={loading}
            style={{ marginTop: 16, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600 }}>
            {loading ? "Saving..." : "Log Night"}
          </button>
        </div>
      )}

      <div style={CARD} className="table-wrap">
        <table>
          <thead>
            <tr><th>Date</th><th>Day</th><th>Event / Theme</th><th>Headcount</th><th>Revenue</th><th>Notes</th><th></th></tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={7} style={{ color: "var(--muted)", textAlign: "center", padding: 32 }}>No entries yet.</td></tr>
            )}
            {entries.map((e) => (
              <tr key={e.id}>
                <td style={{ whiteSpace: "nowrap" }}>{e.date}</td>
                <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{e.dayOfWeek}</td>
                <td>{e.eventTheme}</td>
                <td style={{ fontWeight: 600, color: "var(--accent2)" }}>{e.headcount?.toLocaleString()}</td>
                <td>{e.coverRevenue}</td>
                <td style={{ fontSize: "0.8rem", color: "var(--muted)", maxWidth: 200 }}>{e.notes}</td>
                <td>
                  <button onClick={() => del(e.id)} style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 6, padding: "4px 10px", fontSize: "0.8rem" }}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
