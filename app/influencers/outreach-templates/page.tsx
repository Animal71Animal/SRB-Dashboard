"use client";

import { useState } from "react";
import Link from "next/link";

const templates = [
  {
    id: "instagram-dm",
    name: "Instagram DM Template",
    icon: "📸",
    category: "DM",
    content: `Hey [Name]! 👋

Saw your post about [specific thing they posted about] — love the vibe you bring to [Boise party scene / downtown / etc.].

We're launching something new Saturdays at The Torch starting June 6th — think high-energy late-night party with amazing music, food, and entertainment. Our whole angle is creating a space where everyone feels welcome.

**We'd love to have you + a couple friends as our guest.** Free admission, plus a feature on our new podcast if you're interested.

Quick question: You ever make it to late-night spots when downtown closes out? Would love to show you what we're building.

Let me know if you're curious — [PHONE or DM link]

[Your name]`,
  },
  {
    id: "email",
    name: "Email Template",
    icon: "📧",
    category: "Email",
    content: `Subject: New Late-Night Event in Boise — Collab Opportunity

Hi [Name],

[Personalized intro about them + reference to their content]

We're launching a new Saturday late-night experience at The Torch (Boise) starting June 6th. The vibe: high-energy music, entertainment, and food — a genuine party destination for people looking for something to do when everywhere else closes.

**We think you'd be perfect to experience it firsthand and possibly help spread the word.**

**What we're offering:**
- Free admission + up to 3 guest passes for launch week
- Feature interview on our podcast (we're launching concurrent with the event)
- First look at our weekly entertainment schedule

**What we're asking:**
Just show up, experience it, and share with your community if you genuinely vibe with it. No forced posts required.

Interested? Reply with your availability for June 6th or let's chat about timing.

Looking forward,
[Your name]
[Phone]`,
  },
  {
    id: "tiktok-comment",
    name: "TikTok/IG Comment Template",
    icon: "💬",
    category: "Comment",
    content: `Love this energy! 🔥 We're launching something similar Saturdays at The Torch starting June 6th — high-energy late-night parties with amazing music and food. Would love to have you check it out + bring friends. DM us? We'd hook you up.`,
  },
  {
    id: "followup-1",
    name: "First Follow-Up (3-5 days)",
    icon: "⏰",
    category: "Follow-Up",
    content: `Hey [Name]! Just wanted to follow up on the message I sent earlier. No pressure — just didn't want it to get lost in the noise.

If you're curious about the late-night event we're launching, let me know. Would be awesome to have you there.

[Phone]`,
  },
  {
    id: "followup-2",
    name: "Second Follow-Up (2 weeks before)",
    icon: "📅",
    category: "Follow-Up",
    content: `[Name] — last reminder! We're launching June 6th and would love to have you at the first one. Still have spots reserved for you + your crew.

Let me know if you're in, or feel free to just show up that Saturday.

Cheers,
[Your name]`,
  },
];

export default function OutreachTemplatesPage() {
  const [selected, setSelected] = useState(templates[0]);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selected.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, background: "linear-gradient(135deg, #9b5de5, #c77dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📝 Outreach Templates
          </h1>
          <Link href="/influencers" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>← Back</Link>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Personalize with their name and recent post reference before sending
        </p>
      </div>

      {/* Cadence */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>📅 Outreach Cadence</h2>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <div style={{ padding: 12, background: "rgba(155,93,229,0.1)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Initial Outreach</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>May 15-22</div>
          </div>
          <div style={{ padding: 12, background: "rgba(245,158,11,0.1)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>First Follow-Up</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f59e0b" }}>May 18-25</div>
          </div>
          <div style={{ padding: 12, background: "rgba(0,200,124,0.1)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Second Follow-Up</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#00c87c" }}>May 27 - June 2</div>
          </div>
          <div style={{ padding: 12, background: "rgba(201,168,76,0.1)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Event Launch</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e8d5b0" }}>June 6</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>💡 Personalization Tips</h2>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.8 }}>
          <li>Reference a specific recent post — Shows you actually follow them</li>
          <li>Mention downtown/Boise scene — Localize it</li>
          <li>Lead with vibe, not strip club — Frame as "party venue" and "entertainment"</li>
          <li>Keep it short — 3-4 sentences max for DM</li>
          <li>Use their tone — If they're casual, be casual. If professional, be professional</li>
          <li>Add urgency (softly) — "Starting June 6th" creates a deadline</li>
        </ul>
      </div>

      {/* Template Selector */}
      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>Templates</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                style={{
                  padding: "12px 14px",
                  background: selected.id === t.id ? "linear-gradient(135deg, #9b5de5, #c77dff)" : "var(--card)",
                  border: "1px solid " + (selected.id === t.id ? "transparent" : "var(--border)"),
                  borderRadius: 8,
                  color: selected.id === t.id ? "#fff" : "var(--text)",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {t.icon} {t.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>{selected.icon} {selected.name}</h2>
            <button
              onClick={copyToClipboard}
              style={{
                padding: "8px 16px",
                background: copied ? "rgba(0,200,124,0.2)" : "linear-gradient(135deg, #9b5de5, #c77dff)",
                border: "none",
                borderRadius: 8,
                color: copied ? "#00c87c" : "#fff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: "0.9rem", color: "var(--text)", fontFamily: "inherit", lineHeight: 1.7 }}>
              {selected.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}