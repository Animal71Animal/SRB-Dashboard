"use client";

import { useEffect, useMemo, useState } from "react";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };

interface Audition {
  id: string;
  entertainerName: string;
  date: string;
  time: string;
  notes: string;
  venue?: string;
  createdAt: string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAY_NAMES[date.getDay()]} ${MONTH_ABBR[m - 1]} ${d}${ordinal(d)}`;
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function generateDateOptions(): { value: string; label: string }[] {
  // Sept 1, 2026 → Dec 31, 2026, Sundays and Mondays only, past dates excluded
  const start = new Date(2026, 8, 1);
  const end = new Date(2026, 11, 31);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const options: { value: string; label: string }[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const dow = cursor.getDay();
    if ((dow === 0 || dow === 1) && cursor >= today) {
      const iso = toISO(cursor);
      options.push({ value: iso, label: formatDateLabel(iso) });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return options;
}

const TIME_OPTIONS: { value: string; label: string }[] = [
  { value: "20:00", label: "8:00 PM" },
  { value: "20:30", label: "8:30 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "21:30", label: "9:30 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "22:30", label: "10:30 PM" },
];

const TIME_LABEL = new Map(TIME_OPTIONS.map((t) => [t.value, t.label]));

export default function EntertainerAuditionsPage() {
  const [items, setItems] = useState<Audition[]>([]);
  const [form, setForm] = useState<{ entertainerName: string; date: string; time: string; notes: string; venue: string }>({
    entertainerName: "",
    date: "",
    time: "",
    notes: "",
    venue: "Torch 1",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recompute date options on each render so past dates fall off as time passes
  const dateOptions = useMemo(() => generateDateOptions(), []);

  const load = () =>
    fetch("/api/entertainer-auditions")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {});

  useEffect(() => { load(); }, []);

  const add = async () => {
    setError(null);
    if (!form.entertainerName.trim() || !form.date || !form.time) {
      setError("Entertainer name, date, and time are all required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/entertainer-auditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Failed to log audition");
        return;
      }
      setForm({ entertainerName: "", date: "", time: "", notes: "", venue: "Torch 1" });
      await load();
    } finally {
      setLoading(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this audition?")) return;
    await fetch(`/api/entertainer-auditions?id=${id}`, { method: "DELETE" });
    await load();
  };

  // Sort: upcoming first (by date asc), then past (by date desc)
  const sorted = useMemo(() => {
    const todayISO = toISO(new Date());
    const upcoming = items.filter((a) => a.date >= todayISO).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    const past = items.filter((a) => a.date < todayISO).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
    return [...upcoming, ...past];
  }, [items]);

  return (
    <div>
      <div className="toc-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>🎤 Entertainer Auditions</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>
            Log auditions for entertainers — Sundays &amp; Mondays, 8:00 PM – 10:30 PM
          </p>
        </div>
        <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
          {items.length} logged
        </div>
      </div>

      {/* Add Form */}
      <div style={{ ...CARD, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Log New Audition</h3>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Entertainer Name *</label>
            <input
              placeholder="Stage name"
              value={form.entertainerName}
              onChange={(e) => setForm((p) => ({ ...p, entertainerName: e.target.value }))}
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Venue *</label>
            <select
              value={form.venue}
              onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
              style={{ width: "100%", marginTop: 4 }}
            >
              <option value="Torch 1">Torch 1</option>
              <option value="Torch 2">Torch 2</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Audition Date *</label>
            <select
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              style={{ width: "100%", marginTop: 4 }}
            >
              <option value="">Select a Sunday or Monday</option>
              {dateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {dateOptions.length === 0 && (
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
                No upcoming Sun/Mon dates in range.
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Time *</label>
            <select
              value={form.time}
              onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              style={{ width: "100%", marginTop: 4 }}
            >
              <option value="">Select time</option>
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Notes (optional)</label>
            <input
              placeholder="Any additional notes"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              style={{ width: "100%", marginTop: 4 }}
            />
          </div>
        </div>
        {error && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(201,0,43,0.1)", border: "1px solid var(--accent)", borderRadius: 6, color: "var(--accent)", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}
        <button
          onClick={add}
          disabled={loading}
          style={{ marginTop: 16, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, cursor: loading ? "wait" : "pointer" }}
        >
          {loading ? "Saving…" : "Log Audition"}
        </button>
      </div>

      {/* Existing Auditions */}
      <div style={CARD} className="table-wrap">
        <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Logged Auditions</h3>
        <table>
          <thead>
            <tr>
              <th>Entertainer</th>
              <th>Venue</th>
              <th>Date</th>
              <th>Time</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: "var(--muted)", textAlign: "center", padding: 32 }}>
                  No auditions logged yet. Use the form above.
                </td>
              </tr>
            )}
            {sorted.map((a) => {
              const isPast = a.date < toISO(new Date());
              return (
                <tr key={a.id} style={{ opacity: isPast ? 0.55 : 1 }}>
                  <td style={{ fontWeight: 600 }}>{a.entertainerName}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{a.venue ?? "—"}</td>
                  <td>{formatDateLabel(a.date)}</td>
                  <td>{TIME_LABEL.get(a.time) ?? a.time}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{a.notes || "—"}</td>
                  <td>
                    <button
                      onClick={() => del(a.id)}
                      style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 6, padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer" }}
                    >
                      Del
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}