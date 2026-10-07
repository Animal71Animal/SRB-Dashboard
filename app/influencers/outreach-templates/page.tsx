"use client";

import { useState } from "react";
import Link from "next/link";

type CategoryType = "general" | "sneakerheads";

const generalTemplates = [
  {
    id: "instagram-dm",
    name: "Instagram DM Template",
    icon: "📸",
    category: "DM",
    content: `Hey [Name]! 👋

Saw your post about [specific thing they posted about] — love the vibe you bring to [Boise party scene / downtown / etc.].

We're launching something new Saturdays at The Torch starting November 12th — think high-energy late-night party with amazing music, food, and entertainment. Our whole angle is creating a space where everyone feels welcome.

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

We're launching a new Saturday late-night experience at The Torch (Boise) starting November 12th. The vibe: high-energy music, entertainment, and food — a genuine party destination for people looking for something to do when everywhere else closes.

**We think you'd be perfect to experience it firsthand and possibly help spread the word.**

**What we're offering:**
- Free admission + up to 3 guest passes for launch week
- Feature interview on our podcast (we're launching concurrent with the event)
- First look at our weekly entertainment schedule

**What we're asking:**
Just show up, experience it, and share with your community if you genuinely vibe with it. No forced posts required.

Interested? Reply with your availability for November 12th or let's chat about timing.

Looking forward,
[Your name]
[Phone]`,
  },
  {
    id: "tiktok-comment",
    name: "TikTok/IG Comment Template",
    icon: "💬",
    category: "Comment",
    content: `Love this energy! 🔥 We're launching something similar Saturdays at The Torch starting November 12th — high-energy late-night parties with amazing music and food. Would love to have you check it out + bring friends. DM us? We'd hook you up.`,
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
    content: `[Name] — last reminder! We're launching November 12th and would love to have you at the first one. Still have spots reserved for you + your crew.

Let me know if you're in, or feel free to just show up that Saturday.

Cheers,
[Your name]`,
  },
];

const sneakerheadTemplates = [
  {
    id: "instagram-dm-sneakers",
    name: "Sneakerhead DM Template",
    icon: "👟",
    category: "DM",
    content: `Hey [Name]! 👋

Saw your collection and content — definitely holding down the local shoe game in Boise. 

We are launching a dedicated sneaker culture night called **Chicks 'n' Kicks** on Thursdays at our new venue, **Torch 2**, kicking off on November 12th! 

We're bringing a high-energy pre-2010 throwback music format across all genres and partnering up with the most influential local shops. We'll have dedicated vendor tables where sneakerheads can showcase, buy, sell, and trade. 

**We'd love to host you + a couple friends as our VIP guest.** We'll set you up with free entry and want to hook you up with a feature spot on our new Rhino Radio podcast to talk shop and showcase your favorite pairs. 

Do you guys have any local sneaker drops lined up around mid-November? Let me know if you are curious to partner up!

Best,
[Your name]`,
  },
  {
    id: "email-sneakers",
    name: "Consignment/Shop Email Template",
    icon: "📧",
    category: "Email",
    content: `Subject: Local Sneaker Culture Night Partnership — Chicks 'n' Kicks

Hi [Name],

Saw the shop's content and setup — definitely Boise's premier destination for exclusive kicks and streetwear. 

We're launching a brand new weekly Thursday night event called **Chicks 'n' Kicks** starting November 12th at our new venue, **Torch 2** (Boise). The concept is built directly around sneakerhead culture—bringing throwbacks pre-2010 (across all genres) combined with a highly active buy/sell/trade environment.

We are selecting a different high-end local sneaker store/collector group each week to host a dedicated vendor table, promote their brand, and display/sell their inventory right inside the club. 

**What we're offering:**
- Complimentary premium VIP table/booth for your team + 3 guest passes for launch week
- Dedicated vendor footprint in the venue to sell, display, or trade your inventory
- Featured interview segment on our new Rhino Radio podcast
- Prime placement on our weekly promotional flyer and marketing feeds

**What we're asking:**
Help us get the word out! Let's co-promote via flyers in-store and share the launch naturally with your local community. No forced posts, just building the culture together.

Would you be open to coordinating a Thursday night slot to showcase the shop or take a walk-through of the venue to talk details?

Looking forward,
[Your name]
[Phone]`,
  },
  {
    id: "tiktok-comment-sneakers",
    name: "Hype / Reseller Comment Template",
    icon: "💬",
    category: "Comment",
    content: `Those pairs are crazy! 🔥 We are launching **Chicks 'n' Kicks** Thursdays at **Torch 2** starting November 12th — dedicated sneaker culture nights with pre-2010 throwbacks, buy/sell/trade vendor setups, and local collectors. DM us to get VIP entry + bring some friends!`,
  },
  {
    id: "followup-1-sneakers",
    name: "First Follow-Up (3-5 days)",
    icon: "⏰",
    category: "Follow-Up",
    content: `Hey [Name]! Just wanted to circle back about **Chicks 'n' Kicks** starting on November 12th at **Torch 2**. No pressure at all—just wanted to make sure it didn't get buried.

We'd love to secure a VIP spot or discuss setting up a booth for you to showcase. Let me know if you have any questions!

[Your name]`,
  },
  {
    id: "followup-2-sneakers",
    name: "Second Follow-Up (2 weeks out)",
    icon: "📅",
    category: "Follow-Up",
    content: `Hey [Name] — quick heads up! We are exactly two weeks out from our **Chicks 'n' Kicks** launch on November 12th at **Torch 2**. The response from the local scene has been incredible, and we're locking in VIP space/vendor tables this week.

Let me know if you and your crew are in, and we'll get everything set up for you.

Cheers,
[Your name]`,
  },
];

export default function OutreachTemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("general");
  const currentTemplates = activeCategory === "general" ? generalTemplates : sneakerheadTemplates;
  const [selected, setSelected] = useState(currentTemplates[0]);
  const [copied, setCopied] = useState(false);

  const handleCategoryChange = (cat: CategoryType) => {
    setActiveCategory(cat);
    const nextTemplates = cat === "general" ? generalTemplates : sneakerheadTemplates;
    setSelected(nextTemplates[0]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selected.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="toc-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "clamp(1.25rem, 4.5vw, 1.8rem)", fontWeight: 700, margin: 0, background: "linear-gradient(135deg, #9b5de5, #c77dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📝 Outreach Templates
          </h1>
          <Link href="/influencers" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>← Back</Link>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Personalize with their name and recent post reference before sending
        </p>
      </div>

      {/* Segment Switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
        <button
          onClick={() => handleCategoryChange("general")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            background: activeCategory === "general" ? "var(--accent)" : "transparent",
            color: activeCategory === "general" ? "#fff" : "var(--muted)",
            border: activeCategory === "general" ? "1px solid var(--accent)" : "1px solid var(--border)",
            transition: "all 0.15s",
          }}
        >
          ✨ Nightlife & Lifestyle Templates
        </button>
        <button
          onClick={() => handleCategoryChange("sneakerheads")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            background: activeCategory === "sneakerheads" ? "var(--accent2)" : "transparent",
            color: activeCategory === "sneakerheads" ? "#0d0a0a" : "var(--muted)",
            border: activeCategory === "sneakerheads" ? "1px solid var(--accent2)" : "1px solid var(--border)",
            transition: "all 0.15s",
          }}
        >
          👟 Sneakerhead: Chicks 'n' Kicks
        </button>
      </div>

      {/* Cadence */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>📅 Outreach Cadence</h2>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <div style={{ padding: 12, background: "rgba(155,93,229,0.1)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Initial Outreach</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>September 21</div>
          </div>
          <div style={{ padding: 12, background: "rgba(245,158,11,0.1)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>First Follow-Up</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f59e0b" }}>September 24-26</div>
          </div>
          <div style={{ padding: 12, background: "rgba(0,200,124,0.1)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Second Follow-Up</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#00c87c" }}>October 29 - November 5</div>
          </div>
          <div style={{ padding: 12, background: "rgba(201,168,76,0.1)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Event Launch</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e8d5b0" }}>November 12</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>💡 Personalization Tips</h2>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.8 }}>
          <li>Reference a specific recent post — Shows you actually follow them</li>
          <li>Mention downtown/Boise scene — Localize it</li>
          <li>Lead with vibe, brand-collaborations, or high-end sneaker culture — Frame as a curated throwback party</li>
          <li>Highlight options for vendor spacing — Let boutiques showcase their inventory</li>
          <li>Use their tone — If they're casual, be casual. If professional, be professional</li>
          <li>Add urgency (softly) — "Starting November 12th" creates a deadline</li>
        </ul>
      </div>

      {/* Template Selector */}
      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>Templates</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {currentTemplates.map((t) => (
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
                {t.icon || "📝"} {t.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>{selected.icon || "📝"} {selected.name}</h2>
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