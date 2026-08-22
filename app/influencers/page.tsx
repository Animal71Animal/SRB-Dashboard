"use client";

import Link from "next/link";

export default function InfluencersPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, background: "linear-gradient(135deg, #c9002b, #ff4d6d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          📊 Influencer Program
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Late Night Campaign — June 6 Launch
        </p>
      </div>

      {/* Campaign Overview */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>🎯 Campaign Overview</h2>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <div style={{ background: "rgba(201,0,43,0.1)", borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>June 6</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Launch Date</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.1)", borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#f59e0b" }}>May 15</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Outreach Start</div>
          </div>
          <div style={{ background: "rgba(0,168,107,0.1)", borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#00a86b" }}>20-30</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Target Influencers</div>
          </div>
          <div style={{ background: "rgba(155,93,229,0.1)", borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#9b5de5" }}>50-100</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Target New Guests</div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Link
          href="/influencers/master-list"
          style={{ display: "block", padding: 24, borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", textDecoration: "none", color: "inherit" }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>📋</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>Master List</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Track discovery, outreach, response, and attribution for local Boise influencers. Target: 20-30 by May 15.
          </p>
        </Link>

        <Link
          href="/influencers/outreach-templates"
          style={{ display: "block", padding: 24, borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", textDecoration: "none", color: "inherit" }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>📝</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>Outreach Templates</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            DM, Email, and Follow-up templates with personalization tips. Copy and paste.
          </p>
        </Link>

        <Link
          href="/influencers/tracking-dashboard"
          style={{ display: "block", padding: 24, borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", textDecoration: "none", color: "inherit" }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>📊</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>Tracking Dashboard</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Live outreach metrics, launch night attribution, and long-term ROI tracking.
          </p>
        </Link>

        <Link
          href="/influencers/weekly-report"
          style={{ display: "block", padding: 24, borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", textDecoration: "none", color: "inherit" }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>📝</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>Weekly Report</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Fill every Sunday after Saturday event. Track attendance, revenue, execution, and social metrics.
          </p>
        </Link>
      </div>

      {/* Qualification Criteria */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginTop: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>✓ Qualification Criteria</h2>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#00a86b", margin: "0 0 8px" }}>Must Have</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.8 }}>
              <li>5K+ followers</li>
              <li>Recent activity (last 2 weeks)</li>
              <li>Boise-based or frequent visitor</li>
              <li>Niche: Nightlife, music, party, entertainment, or food</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#9b5de5", margin: "0 0 8px" }}>Nice to Have</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.8 }}>
              <li>Existing Torch followers</li>
              <li>Downtown bar/club connections</li>
              <li>DJ or promoter status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
