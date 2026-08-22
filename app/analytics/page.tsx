"use client";

import { useEffect, useState } from "react";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };

function MetricBox({ label, value, sub, color = "var(--accent2)" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={CARD}>
      <div style={{ fontSize: "2rem", fontWeight: 700, color, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [compCodes, setCompCodes] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/attendance").then((r) => r.json()).then(setAttendance).catch(() => {});
    fetch("/api/campaigns").then((r) => r.json()).then(setCampaigns).catch(() => {});
    fetch("/api/comp-codes").then((r) => r.json()).then(setCompCodes).catch(() => {});
    fetch("/api/events").then((r) => r.json()).then((d) => {
      const oneOffs = (d?.oneOffs ?? []).map((e: any) => ({ ...e, _kind: "oneoff" }));
      const seriesDates = (d?.series ?? []).flatMap((s: any) => (s.dates ?? []).map((date: string) => ({ id: s.id, date, name: s.name, theme: s.theme, status: s.status, _kind: "series" })));
      setEvents([...oneOffs, ...seriesDates]);
    }).catch(() => {});
  }, []);

  // Calculate metrics
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const thisMonthEvents = events.filter((e) => e.date >= monthStart).length;
  const avgAttendance = attendance.length ? Math.round(attendance.reduce((s, e) => s + (e.headcount || 0), 0) / attendance.length) : 0;
  const activeCampaigns = campaigns.filter((c) => c.status === "Active");
  const topCampaign = activeCampaigns[0]?.name || "N/A";
  const socialReach = "~180K est.";
  const codesIssued = compCodes.length;
  const codesUsed = compCodes.filter((c) => c.used).length;
  const codeRatio = codesIssued > 0 ? `${codesUsed}/${codesIssued} (${Math.round((codesUsed / codesIssued) * 100)}%)` : "0/0";
  const bestNight = attendance.length ? Math.max(...attendance.map((e) => e.headcount || 0)) : 0;
  const totalRevenue = attendance.reduce((s, e) => {
    const n = parseFloat((e.coverRevenue || "").replace(/[^0-9.]/g, ""));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>📊 Campaign Analytics</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>Performance summaries from live data</p>
      </div>

      <h2 style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 12 }}>
        This Month
      </h2>
      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <MetricBox label="Events This Month" value={thisMonthEvents} sub="Confirmed + Planned" />
        <MetricBox label="Avg Nightly Attendance" value={avgAttendance} sub={`Based on ${attendance.length} entries`} />
        <MetricBox label="Best Night" value={bestNight.toLocaleString()} sub="Peak headcount" color="var(--accent)" />
        <MetricBox label="Total Cover Revenue" value={`$${totalRevenue.toLocaleString()}`} sub={`Across ${attendance.length} logged nights`} color="#00a86b" />
      </div>

      <h2 style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 12 }}>
        Campaigns & Outreach
      </h2>
      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <MetricBox label="Active Campaigns" value={activeCampaigns.length} />
        <MetricBox label="Top Campaign" value={topCampaign} sub="Currently active" />
        <MetricBox label="Social Reach Est." value={socialReach} sub="Cross-platform estimate" />
        <MetricBox label="Comp Codes Used" value={codeRatio} sub="Issued vs redeemed" />
      </div>

      {/* Attendance breakdown */}
      {attendance.length > 0 && (
        <>
          <h2 style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 12 }}>
            Recent Attendance
          </h2>
          <div style={CARD}>
            {attendance.slice(0, 8).map((e) => {
              const pct = bestNight > 0 ? Math.round((e.headcount / bestNight) * 100) : 0;
              return (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 90, fontSize: "0.8rem", color: "var(--muted)", flexShrink: 0 }}>{e.date}</div>
                  <div style={{ flex: 1, fontSize: "0.875rem" }}>{e.eventTheme}</div>
                  <div style={{ width: 120 }}>
                    <div style={{ background: "var(--border)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                  </div>
                  <div style={{ width: 60, textAlign: "right", fontSize: "0.875rem", fontWeight: 600 }}>{e.headcount?.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
