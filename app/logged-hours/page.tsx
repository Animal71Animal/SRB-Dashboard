"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };

interface HoursLog {
  id: string;
  date: string;        // YYYY-MM-DD
  clockIn: string;     // ISO
  clockOut: string;    // ISO
  hours: number;
  note: string;
  mode: "timer" | "manual";
}


function fmtClock(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
    hour12: true,
  });
}

function fmtDuration(h: number): string {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${hh}h ${String(mm).padStart(2, "0")}m`;
}

function toLocalInput(iso: string): string {
  // <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in LOCAL time
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

function nowLocalInput(): string {
  return toLocalInput(new Date().toISOString());
}

export default function LoggedHoursPage() {
  const [logs, setLogs] = useState<HoursLog[]>([]);
  const [mode, setMode] = useState<"timer" | "manual">("timer");
  const [loading, setLoading] = useState(false);

  // ----- Timer state -----
  const [timerTask, setTimerTask] = useState("");
  const [tick, setTick] = useState(0);
  const [runStartedAt, setRunStartedAt] = useState<string | null>(null); // ISO
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ----- Manual state -----
  const today = new Date().toISOString().split("T")[0];
  const [manualInDate, setManualInDate] = useState(today);
  const [manualInTime, setManualInTime] = useState("");
  const [manualOutDate, setManualOutDate] = useState(today);
  const [manualOutTime, setManualOutTime] = useState("");
  const [manualTask, setManualTask] = useState("");

  // ----- Edit modal -----
  const [editing, setEditing] = useState<HoursLog | null>(null);
  const [editIn, setEditIn] = useState("");
  const [editOut, setEditOut] = useState("");
  const [editNote, setEditNote] = useState("");

  const load = () => fetch("/api/hours").then((r) => r.json()).then((data) => setLogs(data.sort((a: HoursLog, b: HoursLog) => new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime()))).catch(() => {});
  useEffect(() => { load(); }, []);

  const periods = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    const months = [
      { year: currentYear, month: currentMonth }, // Current
      { year: currentMonth === 11 ? currentYear + 1 : currentYear, month: (currentMonth + 1) % 12 } // Next
    ];

    return months.flatMap(({ year, month }) => {
      const p1Start = new Date(year, month, 1).getTime();
      const p1End = new Date(year, month, 15, 23, 59, 59, 999).getTime();
      const p2Start = new Date(year, month, 16).getTime();
      const p2End = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

      const monthName = new Date(year, month).toLocaleString("en-US", { month: "short" });
      const isCurrentMonth = year === currentYear && month === currentMonth;

      return [
        {
          label: `${monthName} 1st–15th`,
          hours: logs.reduce((s, l) => {
            const ts = new Date(l.clockIn || l.date).getTime();
            return (ts >= p1Start && ts <= p1End) ? s + (l.hours || 0) : s;
          }, 0),
          isCurrent: isCurrentMonth && currentDay <= 15
        },
        {
          label: `${monthName} 16th–EOM`,
          hours: logs.reduce((s, l) => {
            const ts = new Date(l.clockIn || l.date).getTime();
            return (ts >= p2Start && ts <= p2End) ? s + (l.hours || 0) : s;
          }, 0),
          isCurrent: isCurrentMonth && currentDay >= 16
        }
      ];
    });
  }, [logs]);
  const allTimeTotal = useMemo(() => logs.reduce((s, l) => s + (l.hours || 0), 0), [logs]);

  const elapsedMs = runStartedAt ? Date.now() - new Date(runStartedAt).getTime() : 0;

  // ----- Timer -----
  const toggleTimer = async () => {
    if (!runStartedAt) {
      // START
      const iso = new Date().toISOString();
      setRunStartedAt(iso);
      intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000);
      setTick((t) => t + 1);
      return;
    }
    // STOP & SAVE
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    const clockOutIso = new Date().toISOString();
    const hrs = (new Date(clockOutIso).getTime() - new Date(runStartedAt).getTime()) / (1000 * 60 * 60);
    if (hrs > 0.001) {
      setLoading(true);
      try {
        await fetch("/api/hours", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clockIn: runStartedAt,
            clockOut: clockOutIso,
            note: timerTask.trim() || "Off-Site Work",
            mode: "timer",
          }),
        });
        setTimerTask("");
        await load();
      } finally { setLoading(false); }
    }
    setRunStartedAt(null);
    setTick((t) => t + 1);
  };

  const cancelTimer = () => {
    if (!runStartedAt) return;
    if (!confirm("Cancel current timer without saving?")) return;
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setRunStartedAt(null);
    setTick((t) => t + 1);
  };

  // ----- Manual -----
  const addManual = async () => {
    if (!manualInDate || !manualInTime || !manualOutDate || !manualOutTime) {
      alert("Clock-in date/time and clock-out date/time are all required.");
      return;
    }
    const clockInIso = new Date(manualInDate + "T" + manualInTime + ":00").toISOString();
    const clockOutIso = new Date(manualOutDate + "T" + manualOutTime + ":00").toISOString();
    if (new Date(clockOutIso).getTime() <= new Date(clockInIso).getTime()) {
      alert("Clock-out must be after clock-in.");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/hours", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clockIn: clockInIso,
          clockOut: clockOutIso,
          note: manualTask.trim() || "Off-Site Work",
          mode: "manual",
        }),
      });
      setManualInTime(""); setManualOutTime(""); setManualTask("");
      await load();
    } finally { setLoading(false); }
  };

  // ----- Edit / Delete -----
  const openEdit = (l: HoursLog) => {
    setEditing(l);
    setEditIn(toLocalInput(l.clockIn));
    setEditOut(toLocalInput(l.clockOut));
    setEditNote(l.note);
  };
  const saveEdit = async () => {
    if (!editing) return;
    const clockInIso = new Date(editIn).toISOString();
    const clockOutIso = new Date(editOut).toISOString();
    if (new Date(clockOutIso).getTime() <= new Date(clockInIso).getTime()) {
      alert("Clock-out must be after clock-in.");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/hours", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          clockIn: clockInIso,
          clockOut: clockOutIso,
          note: editNote.trim() || "Off-Site Work",
        }),
      });
      setEditing(null);
      await load();
    } finally { setLoading(false); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this log?")) return;
    await fetch(`/api/hours?id=${id}`, { method: "DELETE" });
    await load();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 6,
    border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)",
    fontSize: "0.9rem", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4, display: "block",
    textTransform: "uppercase", letterSpacing: "0.05em",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "2rem" }}>⏱️</span>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--accent)" }}>ANiMAL's Hours</h1>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>
              Off-site Torch work — clock in/out + manual entry
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {periods.map((p, i) => (
          <div key={i} style={CARD}>
            <div style={labelStyle}>{p.label}</div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>{fmtDuration(p.hours)}</div>
            {p.isCurrent && (
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>Current pay period</div>
            )}
          </div>
        ))}
        <div style={CARD}>
          <div style={labelStyle}>All Time</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent2)" }}>{fmtDuration(allTimeTotal)}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>{logs.length} entries</div>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {([["timer", "Live Timer"], ["manual", "Manual Log"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setMode(key)}
            style={{
              padding: "10px 18px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600,
              border: `1px solid ${mode === key ? "var(--accent)" : "var(--border)"}`,
              background: mode === key ? "var(--accent)" : "transparent",
              color: mode === key ? "#fff" : "var(--muted)",
              cursor: "pointer",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Live Timer */}
      {mode === "timer" && (
        <div style={CARD}>
          <label style={labelStyle}>Activity</label>
          <input style={{ ...inputStyle, marginBottom: 14 }} placeholder="Activity (e.g. Content prep, Meetings)..."
            value={timerTask} onChange={(e) => setTimerTask(e.target.value)} disabled={!!runStartedAt} />

          <div style={{
            textAlign: "center", padding: "28px 12px", background: "var(--bg)",
            border: `1px solid ${runStartedAt ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 8, marginBottom: 16,
          }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 6 }}>
              {runStartedAt ? "Running" : "Ready"}
            </div>
            <div style={{ fontSize: "2.6rem", fontWeight: 700, fontFamily: "monospace", color: "var(--accent)" }}>
              {fmtDuration(elapsedMs / (1000 * 60 * 60))}
            </div>
            {runStartedAt && (
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 8 }}>
                Started {fmtClock(runStartedAt)}
              </div>
            )}
            <span style={{ display: "none" }}>{tick}</span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={toggleTimer} disabled={loading}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 8, fontSize: "0.9rem", fontWeight: 700,
                border: "none", cursor: "pointer",
                background: runStartedAt ? "#ff3333" : "var(--accent)",
                color: "#fff",
              }}>
              {loading ? "Saving…" : runStartedAt ? "Stop & Save" : "Start Timer"}
            </button>
            {runStartedAt && (
              <button onClick={cancelTimer}
                style={{
                  padding: "12px 18px", borderRadius: 8, fontSize: "0.9rem", fontWeight: 600,
                  border: "1px solid var(--border)", background: "transparent",
                  color: "var(--muted)", cursor: "pointer",
                }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manual Log */}
      {mode === "manual" && (
        <div style={CARD}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Clock In (Date + Time)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <input style={inputStyle} type="date" value={manualInDate} onChange={(e) => setManualInDate(e.target.value)} />
                <input style={inputStyle} type="time" value={manualInTime} onChange={(e) => setManualInTime(e.target.value)} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Clock Out (Date + Time)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <input style={inputStyle} type="date" value={manualOutDate} onChange={(e) => setManualOutDate(e.target.value)} />
                <input style={inputStyle} type="time" value={manualOutTime} onChange={(e) => setManualOutTime(e.target.value)} />
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Activity</label>
              <input style={inputStyle} placeholder="Activity description..."
                value={manualTask} onChange={(e) => setManualTask(e.target.value)} />
            </div>
          </div>
          <button onClick={addManual} disabled={loading}
            style={{
              marginTop: 16, padding: "10px 24px", borderRadius: 8, fontSize: "0.9rem", fontWeight: 600,
              border: "none", cursor: "pointer", background: "var(--accent)", color: "#fff",
            }}>
            {loading ? "Saving…" : "Add Log"}
          </button>
        </div>
      )}

      {/* Itemized Master List */}
      <div style={{ ...CARD, marginTop: 24, padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>
            Master List — Itemized Entries
          </h3>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            {logs.length} total · {fmtDuration(allTimeTotal)} logged
          </span>
        </div>

        {logs.length === 0 ? (
          <div style={{ color: "var(--muted)", textAlign: "center", padding: 32, fontSize: "0.875rem" }}>
            No logs yet. Start a timer or add a manual entry.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                <th style={{ textAlign: "left",  padding: "10px 24px", fontSize: "0.7rem", textTransform: "uppercase", color: "var(--muted)" }}>Activity</th>
                <th style={{ textAlign: "left",  padding: "10px 24px", fontSize: "0.7rem", textTransform: "uppercase", color: "var(--muted)" }}>Clock In</th>
                <th style={{ textAlign: "left",  padding: "10px 24px", fontSize: "0.7rem", textTransform: "uppercase", color: "var(--muted)" }}>Clock Out</th>
                <th style={{ textAlign: "left",  padding: "10px 24px", fontSize: "0.7rem", textTransform: "uppercase", color: "var(--muted)" }}>Mode</th>
                <th style={{ textAlign: "right", padding: "10px 24px", fontSize: "0.7rem", textTransform: "uppercase", color: "var(--muted)" }}>Hours</th>
                <th style={{ padding: "10px 24px" }}></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 24px", maxWidth: 240 }}>{l.note}</td>
                  <td style={{ padding: "12px 24px", color: "var(--muted)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    {fmtClock(l.clockIn)}
                  </td>
                  <td style={{ padding: "12px 24px", color: "var(--muted)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    {fmtClock(l.clockOut)}
                  </td>
                  <td style={{ padding: "12px 24px", fontSize: "0.75rem" }}>
                    <span style={{
                      padding: "3px 8px", borderRadius: 4, fontWeight: 600,
                      background: l.mode === "timer" ? "rgba(255,0,85,0.15)" : "rgba(232,160,32,0.15)",
                      color: l.mode === "timer" ? "var(--accent)" : "var(--accent2)",
                    }}>
                      {l.mode}
                    </span>
                  </td>
                  <td style={{ padding: "12px 24px", textAlign: "right", fontWeight: 700, color: "var(--accent)", whiteSpace: "nowrap" }}>
                    {fmtDuration(l.hours)}
                  </td>
                  <td style={{ padding: "12px 24px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={() => openEdit(l)}
                      style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--accent2)",
                        borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer", marginRight: 6 }}>
                      Edit
                    </button>
                    <button onClick={() => del(l.id)}
                      style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted)",
                        borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer" }}>
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={() => setEditing(null)}>
          <div style={{ ...CARD, maxWidth: 480, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Edit Entry</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Clock In</label>
                <input style={inputStyle} type="datetime-local" value={editIn} onChange={(e) => setEditIn(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Clock Out</label>
                <input style={inputStyle} type="datetime-local" value={editOut} onChange={(e) => setEditOut(e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Activity</label>
                <input style={inputStyle} value={editNote} onChange={(e) => setEditNote(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <button onClick={() => setEditing(null)}
                style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent",
                  color: "var(--muted)", cursor: "pointer", fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={saveEdit} disabled={loading}
                style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "var(--accent)",
                  color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                {loading ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
