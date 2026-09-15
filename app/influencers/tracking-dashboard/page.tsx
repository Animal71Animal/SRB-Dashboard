"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Status = "Not Contacted" | "DM Sent" | "Replied" | "Call / Meeting Scheduled" | "Deal Closed" | "Declined" | "On Hold";
type CollabType = "None" | "Post" | "Story / Reel" | "Event Coverage" | "Giveaway" | "Paid Partnership" | "VIP Night";
type Influencer = { rank: number; name: string; handle: string; platform: string; followers: number; niche: string; fit: string };
type Tracking = { status: Status; dateContacted: string; lastContact: string; collabType: CollabType; notes: string };

const INFLUENCERS: Influencer[] = [
  { rank: 1, name: "Caitlin Montoya", handle: "@boisesocialite", platform: "Instagram + TikTok", followers: 19000, niche: "Cocktails / Nightlife / Date Nights", fit: "⭐⭐⭐⭐⭐" },
  { rank: 2, name: "Lauren", handle: "@treasurevalley_treatsandeats", platform: "Instagram", followers: 38000, niche: "Food / Bars / Local Businesses", fit: "⭐⭐⭐⭐" },
  { rank: 3, name: "Heather Sharpe", handle: "@thatboisegirl", platform: "Instagram", followers: 19000, niche: "Food / Bars / Local Events", fit: "⭐⭐⭐⭐" },
  { rank: 4, name: "Melissa Tureaud", handle: "@blissfulinboise", platform: "Instagram", followers: 17700, niche: "Events / Food / Giveaways", fit: "⭐⭐⭐⭐" },
  { rank: 5, name: "(City Account)", handle: "@thisisboise", platform: "Instagram", followers: 122000, niche: "City Guide / Nightlife / Eats & Drinks", fit: "⭐⭐⭐" },
  { rank: 6, name: "(City Account)", handle: "@totallyboise", platform: "Instagram", followers: 61300, niche: "Culture / Events / Community", fit: "⭐⭐⭐" },
  { rank: 7, name: "Taylor Humby", handle: "@humbyart", platform: "Instagram", followers: 143000, niche: "Entertainment / Art", fit: "⭐⭐⭐ ⚡" },
  { rank: 8, name: "Kali", handle: "@tater_rater_boise", platform: "Instagram", followers: 12500, niche: "Food / Local Hidden Gems", fit: "⭐⭐⭐" },
  { rank: 9, name: "Shane & Natalie Plummer", handle: "@theboisebubble", platform: "Instagram + Podcast", followers: 12800, niche: "Entertainment / Podcast / Lifestyle", fit: "⭐⭐" },
  { rank: 10, name: "Tyler G", handle: "@tastefullytyler", platform: "Instagram", followers: 8900, niche: "Food / Dining", fit: "⭐⭐" },
];
const STATUSES: Status[] = ["Not Contacted", "DM Sent", "Replied", "Call / Meeting Scheduled", "Deal Closed", "Declined", "On Hold"];
const COLLABS: CollabType[] = ["None", "Post", "Story / Reel", "Event Coverage", "Giveaway", "Paid Partnership", "VIP Night"];
const KEY = "srb-influencer-outreach";
const COLORS: Record<Status, string> = { "Not Contacted": "#9a8a8a", "DM Sent": "#3b82f6", Replied: "#eab308", "Call / Meeting Scheduled": "#9b5de5", "Deal Closed": "#22c55e", Declined: "#ef4444", "On Hold": "#f59e0b" };
const empty = (): Tracking => ({ status: "Not Contacted", dateContacted: "", lastContact: "", collabType: "None", notes: "" });

export default function TrackingDashboardPage() {
  const [tracking, setTracking] = useState<Record<string, Tracking>>({});
  const [filter, setFilter] = useState<Status | "All">("All");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); try { const v = localStorage.getItem(KEY); if (v) setTracking(JSON.parse(v)); } catch {} }, []);
  useEffect(() => { if (mounted) localStorage.setItem(KEY, JSON.stringify(tracking)); }, [tracking, mounted]);
  const get = (handle: string) => tracking[handle] || empty();
  const counts = useMemo(() => STATUSES.reduce((a, s) => ({ ...a, [s]: INFLUENCERS.filter(i => get(i.handle).status === s).length }), {} as Record<Status, number>), [tracking]);
  const filtered = filter === "All" ? INFLUENCERS : INFLUENCERS.filter(i => get(i.handle).status === filter);
  const contacted = INFLUENCERS.filter(i => get(i.handle).status !== "Not Contacted").length;
  const active = INFLUENCERS.filter(i => ["DM Sent", "Replied", "Call / Meeting Scheduled"].includes(get(i.handle).status)).length;
  const committed = counts["Call / Meeting Scheduled"] + counts["Deal Closed"];
  const totalReach = INFLUENCERS.reduce((n, i) => n + i.followers, 0);
  const update = (handle: string, patch: Partial<Tracking>) => setTracking(p => ({ ...p, [handle]: { ...get(handle), ...patch } }));
  const card: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 };
  const badge = (status: Status) => ({ display: "inline-block", color: COLORS[status], background: `${COLORS[status]}20`, border: `1px solid ${COLORS[status]}`, borderRadius: 999, padding: "3px 9px", fontSize: ".72rem", fontWeight: 700 });

  return <div>
    <div className="toc-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 24 }}>
      <div><h1 style={{ margin: 0, fontSize: "clamp(1.3rem, 4.5vw, 1.8rem)", fontWeight: 800 }}>📊 Influencer Outreach Dashboard</h1><p style={{ color: "var(--muted)", margin: "6px 0 0", fontSize: ".9rem" }}>Live summary of the new Boise influencer list and outreach pipeline.</p></div>
      <Link href="/influencers" style={{ color: "var(--muted)", textDecoration: "none", fontSize: ".85rem" }}>← Tracker</Link>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
      {[ ["Influencers", INFLUENCERS.length, "#e8a020"], ["Contacted", contacted, "#3b82f6"], ["Active Pipeline", active, "#9b5de5"], ["Meetings / Closed", committed, "#22c55e"], ["Total Reach", totalReach.toLocaleString(), "#f59e0b"] ].map(([label, value, color]) => <div key={String(label)} style={card}><div style={{ color: "var(--muted)", fontSize: ".75rem" }}>{label}</div><div style={{ color: String(color), fontSize: "1.7rem", fontWeight: 800, marginTop: 6 }}>{value}</div></div>)}
    </div>

    <div style={{ ...card, marginBottom: 20 }}><h2 style={{ margin: "0 0 14px", fontSize: "1rem" }}>Pipeline by Status</h2><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{["All", ...STATUSES].map(s => <button key={s} onClick={() => setFilter(s as Status | "All")} style={{ border: `1px solid ${s === "All" ? "var(--accent2)" : COLORS[s as Status]}`, color: filter === s ? "#111" : s === "All" ? "var(--accent2)" : COLORS[s as Status], background: filter === s ? s === "All" ? "var(--accent2)" : COLORS[s as Status] : "transparent", borderRadius: 999, padding: "6px 12px", cursor: "pointer", fontSize: ".75rem", fontWeight: 700 }}>{s}{s !== "All" ? ` (${mounted ? counts[s as Status] : 0})` : ""}</button>)}</div></div>

    <div style={{ ...card, overflowX: "auto" }}><h2 style={{ margin: "0 0 14px", fontSize: "1rem" }}>{filter === "All" ? "All Influencers" : filter}</h2><table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse" }}><thead><tr>{["Influencer", "Reach", "Fit", "Status", "Collab", "Last Contact", "Notes"].map(h => <th key={h} style={{ textAlign: "left", padding: "9px 10px", color: "var(--accent2)", fontSize: ".7rem", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>)}</tr></thead><tbody>{filtered.map(i => { const t = get(i.handle); return <tr key={i.handle}><td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}><a href={`https://instagram.com/${i.handle.slice(1)}`} target="_blank" rel="noreferrer" style={{ color: "#ff8c1a", fontWeight: 700 }}>{i.name}</a><div style={{ color: "var(--muted)", fontSize: ".75rem" }}>{i.handle} · {i.niche}</div></td><td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>{i.followers.toLocaleString()}</td><td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}>{i.fit}</td><td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}><select value={t.status} onChange={e => update(i.handle, { status: e.target.value as Status })} style={{ ...badge(t.status), cursor: "pointer" }}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></td><td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}><select value={t.collabType} onChange={e => update(i.handle, { collabType: e.target.value as CollabType })} style={{ width: 135 }}><option value="None">None</option>{COLLABS.slice(1).map(c => <option key={c}>{c}</option>)}</select></td><td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}><input type="date" value={t.lastContact} onChange={e => update(i.handle, { lastContact: e.target.value })} /></td><td style={{ padding: "10px", borderBottom: "1px solid var(--border)" }}><input placeholder="Add note" value={t.notes} onChange={e => update(i.handle, { notes: e.target.value })} style={{ minWidth: 160 }} /></td></tr> })}</tbody></table></div>
  </div>;
}
