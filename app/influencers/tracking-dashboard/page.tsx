"use client";

import { useState } from "react";
import Link from "next/link";

interface LaunchMetrics {
  influencerSourced: number;
  streetTeam: number;
  walkins: number;
  repeatCustomers: number;
  totalNew: number;
  coverCharges: number;
  foodSales: number;
  dancerRoomSales: number;
}

interface OutreachMetrics {
  identified: number;
  sent: number;
  responses: number;
  committed: number;
}

export default function TrackingDashboardPage() {
  const [outreach, setOutreach] = useState<OutreachMetrics>({ identified: 0, sent: 0, responses: 0, committed: 0 });
  const [launch, setLaunch] = useState<LaunchMetrics>({ influencerSourced: 0, streetTeam: 0, walkins: 0, repeatCustomers: 0, totalNew: 0, coverCharges: 0, foodSales: 0, dancerRoomSales: 0 });

  const updateOutreach = (field: keyof OutreachMetrics, value: number) => {
    setOutreach({ ...outreach, [field]: value });
  };

  const updateLaunch = (field: keyof LaunchMetrics, value: number) => {
    setLaunch({ ...launch, [field]: value });
  };

  const totalRevenue = launch.coverCharges + launch.foodSales + launch.dancerRoomSales;
  const responseRate = outreach.sent > 0 ? Math.round((outreach.responses / outreach.sent) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="toc-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "clamp(1.25rem, 4.5vw, 1.8rem)", fontWeight: 700, margin: 0, background: "linear-gradient(135deg, #9b5de5, #c77dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📊 Tracking Dashboard
          </h1>
          <Link href="/influencers" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>← Back</Link>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Live metrics from May 15 through June onwards
        </p>
      </div>

      {/* Outreach Metrics */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 16px", color: "var(--text)" }}>📬 Outreach Metrics</h2>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {([
            ["Identified", "identified", "target: 20-30"],
            ["Sent", "sent", ""],
            ["Responses", "responses", "75%+ target"],
            ["Committed", "committed", "50%+ target"],
          ] as [string, keyof OutreachMetrics, string][]).map(([label, field, note]) => (
            <div key={field} style={{ background: "rgba(155,93,229,0.08)", border: "1px solid rgba(155,93,229,0.2)", borderRadius: 10, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 8 }}>{label}</div>
              <input
                type="number"
                value={outreach[field]}
                onChange={(e) => updateOutreach(field, parseInt(e.target.value) || 0)}
                style={{ width: "80px", padding: "8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1.2rem", fontWeight: 700, textAlign: "center" }}
              />
              {note && <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 4 }}>{note}</div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 700, color: responseRate >= 75 ? "#00c87c" : "#f59e0b" }}>{responseRate}%</span>
          <span style={{ fontSize: "0.9rem", color: "var(--muted)", marginLeft: 8 }}>Response Rate</span>
        </div>
      </div>

      {/* Launch Night Attribution */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 16px", color: "var(--text)" }}>🎉 June 6 Launch Night Attribution</h2>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
          {([
            ["Influencer Sourced", "influencerSourced", "#"],
            ["Street Team", "streetTeam", "#"],
            ["Walk-ins", "walkins", "#"],
            ["Repeat Customers", "repeatCustomers", "#"],
          ] as [string, keyof LaunchMetrics, string][]).map(([label, field, unit]) => (
            <div key={field} style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 8 }}>{label}</div>
              <input
                type="number"
                value={launch[field]}
                onChange={(e) => updateLaunch(field, parseInt(e.target.value) || 0)}
                style={{ width: "80px", padding: "8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1.2rem", fontWeight: 700, textAlign: "center" }}
              />
              <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 4 }}>target: 50-100 total</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: "0.9rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>Revenue</h3>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Cover Charges</div>
            <input type="number" value={launch.coverCharges} onChange={(e) => updateLaunch("coverCharges", parseInt(e.target.value) || 0)} placeholder="$0" style={{ width: "100%", padding: "8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Food Sales</div>
            <input type="number" value={launch.foodSales} onChange={(e) => updateLaunch("foodSales", parseInt(e.target.value) || 0)} placeholder="$0" style={{ width: "100%", padding: "8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Dancer Room</div>
            <input type="number" value={launch.dancerRoomSales} onChange={(e) => updateLaunch("dancerRoomSales", parseInt(e.target.value) || 0)} placeholder="$0" style={{ width: "100%", padding: "8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "1rem" }} />
          </div>
        </div>
        <div style={{ textAlign: "center", padding: 16, background: "rgba(201,168,76,0.1)", borderRadius: 10 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Total Revenue</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#e8d5b0" }}>${totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Long-Term Targets */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>🎯 Long-Term Targets</h2>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <div style={{ padding: 12, background: "rgba(0,200,124,0.08)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>By July 6</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text)", marginTop: 4 }}>Repeat rate from June 6 newcomers, Week-of revenue trend, Podcast listenership</div>
          </div>
          <div style={{ padding: 12, background: "rgba(245,158,11,0.08)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>By August 6</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text)", marginTop: 4 }}>Month-over-month growth, New market penetration, Guest DJ relationships</div>
          </div>
          <div style={{ padding: 12, background: "rgba(155,93,229,0.08)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>By September 6</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text)", marginTop: 4 }}>Expand to other nights?, Influencer ROI confirmed, Pivot or double down</div>
          </div>
        </div>
      </div>
    </div>
  );
}