"use client";

import { useState } from "react";
import Link from "next/link";

interface AttendanceMetrics {
  total: number;
  newGuests: number;
  repeatCustomers: number;
  retention: number;
  streetTeam: number;
  influencerSourced: number;
  walkins: number;
  existing: number;
}

interface RevenueMetrics {
  coverCharges: number;
  foodSales: number;
  dancerRoomSales: number;
}

interface ExecutionMetrics {
  djEnergy: number;
  djNotes: string;
  guestDjEnergy: number;
  guestDjNotes: string;
  podcastRecorded: boolean;
  podcastNotes: string;
  audienceVibe: string;
  audienceNotes: string;
  repeatNotes: string;
  firstTimers: string;
  kitchenNotes: string;
  staffNotes: string;
  safetyNotes: string;
}

interface SocialMetrics {
  newFollowers: number;
  newTiktok: number;
  podcastDownloads: number;
  storyMentions: number;
}

export default function WeeklyReportPage() {
  const [weekOf, setWeekOf] = useState("");
  const [attendance, setAttendance] = useState<AttendanceMetrics>({ total: 0, newGuests: 0, repeatCustomers: 0, retention: 0, streetTeam: 0, influencerSourced: 0, walkins: 0, existing: 0 });
  const [revenue, setRevenue] = useState<RevenueMetrics>({ coverCharges: 0, foodSales: 0, dancerRoomSales: 0 });
  const [execution, setExecution] = useState<ExecutionMetrics>({ djEnergy: 5, djNotes: "", guestDjEnergy: 5, guestDjNotes: "", podcastRecorded: false, podcastNotes: "", audienceVibe: "", audienceNotes: "", repeatNotes: "", firstTimers: "", kitchenNotes: "", staffNotes: "", safetyNotes: "" });
  const [social, setSocial] = useState<SocialMetrics>({ newFollowers: 0, newTiktok: 0, podcastDownloads: 0, storyMentions: 0 });
  const [whatWorked, setWhatWorked] = useState("");
  const [didntWork, setDidntWork] = useState("");
  const [nextWeek, setNextWeek] = useState("");
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [saved, setSaved] = useState(false);

  const totalRevenue = revenue.coverCharges + revenue.foodSales + revenue.dancerRoomSales;

  const handleSave = () => {
    const report = { weekOf, attendance, revenue, execution, social, whatWorked, didntWork, nextWeek, notes, summary, savedAt: new Date().toISOString() };
    localStorage.setItem(`weekly-report-${weekOf}`, JSON.stringify(report));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="toc-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "clamp(1.25rem, 4.5vw, 1.8rem)", fontWeight: 700, margin: 0, background: "linear-gradient(135deg, #9b5de5, #c77dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📝 Weekly Report Template
          </h1>
          <Link href="/influencers" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>← Back</Link>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Fill every Sunday morning after Saturday night event
        </p>
      </div>

      {/* Week Selector */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>📅 Week Of</h2>
        <input
          type="text"
          value={weekOf}
          onChange={(e) => setWeekOf(e.target.value)}
          placeholder="e.g., June 6-12, 2026"
          style={{ width: "100%", padding: "12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "1rem" }}
        />
      </div>

      {/* Attendance */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 16px", color: "var(--text)" }}>📊 Attendance & Revenue</h2>
        
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Total Attendance</label>
            <input type="number" value={attendance.total} onChange={(e) => setAttendance({ ...attendance, total: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>New Guests</label>
            <input type="number" value={attendance.newGuests} onChange={(e) => setAttendance({ ...attendance, newGuests: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Repeat Customers</label>
            <input type="number" value={attendance.repeatCustomers} onChange={(e) => setAttendance({ ...attendance, repeatCustomers: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
        </div>

        <h3 style={{ fontSize: "0.9rem", fontWeight: 600, margin: "16px 0 12px", color: "var(--text)" }}>Traffic Source Attribution</h3>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Street Team</label>
            <input type="number" value={attendance.streetTeam} onChange={(e) => setAttendance({ ...attendance, streetTeam: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Influencer Sourced</label>
            <input type="number" value={attendance.influencerSourced} onChange={(e) => setAttendance({ ...attendance, influencerSourced: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Walk-ins/Organic</label>
            <input type="number" value={attendance.walkins} onChange={(e) => setAttendance({ ...attendance, walkins: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Existing Customers</label>
            <input type="number" value={attendance.existing} onChange={(e) => setAttendance({ ...attendance, existing: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
        </div>

        <h3 style={{ fontSize: "0.9rem", fontWeight: 600, margin: "16px 0 12px", color: "var(--text)" }}>Revenue</h3>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Cover Charges</label>
            <input type="number" value={revenue.coverCharges} onChange={(e) => setRevenue({ ...revenue, coverCharges: parseInt(e.target.value) || 0 })} placeholder="$" style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Food Sales</label>
            <input type="number" value={revenue.foodSales} onChange={(e) => setRevenue({ ...revenue, foodSales: parseInt(e.target.value) || 0 })} placeholder="$" style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Dancer Room</label>
            <input type="number" value={revenue.dancerRoomSales} onChange={(e) => setRevenue({ ...revenue, dancerRoomSales: parseInt(e.target.value) || 0 })} placeholder="$" style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
        </div>

        <div style={{ textAlign: "center", padding: 16, background: "rgba(201,168,76,0.1)", borderRadius: 10 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Total Revenue</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#e8d5b0" }}>${totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Execution Notes */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 16px", color: "var(--text)" }}>🎤 Execution Notes</h2>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "0.85rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>DJ Set Energy (1-10)</label>
          <input type="range" min="1" max="10" value={execution.djEnergy} onChange={(e) => setExecution({ ...execution, djEnergy: parseInt(e.target.value) })} style={{ width: "100%" }} />
          <div style={{ textAlign: "center", fontSize: "1.2rem", fontWeight: 700, color: "var(--accent2)" }}>{execution.djEnergy}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "0.85rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>DJ Notes</label>
          <textarea value={execution.djNotes} onChange={(e) => setExecution({ ...execution, djNotes: e.target.value })} rows={2} placeholder="What worked? What didn't?" style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.9rem", resize: "vertical" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "0.85rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Guest DJ Energy (1-10)</label>
          <input type="range" min="1" max="10" value={execution.guestDjEnergy} onChange={(e) => setExecution({ ...execution, guestDjEnergy: parseInt(e.target.value) })} style={{ width: "100%" }} />
          <div style={{ textAlign: "center", fontSize: "1.2rem", fontWeight: 700, color: "var(--accent2)" }}>{execution.guestDjEnergy}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "0.85rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Audience Vibe</label>
          <textarea value={execution.audienceVibe} onChange={(e) => setExecution({ ...execution, audienceVibe: e.target.value })} rows={2} placeholder="Girls/mixed groups comfortable? Notes?" style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.9rem", resize: "vertical" }} />
        </div>

        <div>
          <label style={{ fontSize: "0.85rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>First-Time Visitors Reaction</label>
          <textarea value={execution.firstTimers} onChange={(e) => setExecution({ ...execution, firstTimers: e.target.value })} rows={2} placeholder="Would they come back?" style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.9rem", resize: "vertical" }} />
        </div>
      </div>

      {/* Social */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 16px", color: "var(--text)" }}>📱 Social & Marketing</h2>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>New IG Followers</label>
            <input type="number" value={social.newFollowers} onChange={(e) => setSocial({ ...social, newFollowers: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>New TikTok</label>
            <input type="number" value={social.newTiktok} onChange={(e) => setSocial({ ...social, newTiktok: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Podcast Downloads</label>
            <input type="number" value={social.podcastDownloads} onChange={(e) => setSocial({ ...social, podcastDownloads: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Story Mentions</label>
            <input type="number" value={social.storyMentions} onChange={(e) => setSocial({ ...social, storyMentions: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
        </div>
      </div>

      {/* What Worked / Didn't */}
      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24, minWidth: 0 }}>
        <div style={{ background: "var(--card)", border: "1px solid rgba(0,200,124,0.3)", borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", color: "#00c87c" }}>✅ What Worked</h2>
          <textarea value={whatWorked} onChange={(e) => setWhatWorked(e.target.value)} rows={4} placeholder="Best performing traffic source, most engaged segment, revenue driver, unexpected win..." style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.9rem", resize: "vertical" }} />
        </div>
        <div style={{ background: "var(--card)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", color: "#ef4444" }}>❌ What Didn't Work</h2>
          <textarea value={didntWork} onChange={(e) => setDidntWork(e.target.value)} rows={4} placeholder="Flopped traffic source, operational issue, vibe killer, something to fix..." style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.9rem", resize: "vertical" }} />
        </div>
      </div>

      {/* Summary */}
      <div style={{ background: "var(--card)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", color: "#e8d5b0" }}>📋 Summary for Bob</h2>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="1-2 sentence recap for Bob..." style={{ width: "100%", padding: "10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.9rem", resize: "vertical" }} />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        style={{ width: "100%", padding: 16, background: saved ? "linear-gradient(135deg, #00c87c, #00a865)" : "linear-gradient(135deg, #9b5de5, #c77dff)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: "1rem", cursor: "pointer" }}
      >
        {saved ? "✓ Saved!" : "Save Report"}
      </button>
    </div>
  );
}