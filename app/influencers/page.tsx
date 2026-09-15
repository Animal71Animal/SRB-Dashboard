"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/* ──────────────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────────────────── */
type Status =
  | "Not Contacted"
  | "DM Sent"
  | "Replied"
  | "Call / Meeting Scheduled"
  | "Deal Closed"
  | "Declined"
  | "On Hold";

type CollabType =
  | "None"
  | "Post"
  | "Story / Reel"
  | "Event Coverage"
  | "Giveaway"
  | "Paid Partnership"
  | "VIP Night";

interface Influencer {
  rank: number;
  name: string;
  handle: string; // includes leading @
  platform: string;
  followers: number;
  niche: string;
  fit: string; // star string
}

interface Tracking {
  status: Status;
  dateContacted: string; // yyyy-mm-dd
  lastContact: string; // yyyy-mm-dd
  collabType: CollabType;
  notes: string;
}

/* ──────────────────────────────────────────────────────────────────────
   Static data — Top 10 Boise influencers
   ────────────────────────────────────────────────────────────────────── */
const INFLUENCERS: Influencer[] = [
  { rank: 1, name: "Caitlin Montoya", handle: "@boisesocialite", platform: "Instagram + TikTok", followers: 19000, niche: "Cocktails / Nightlife / Date Nights", fit: "⭐⭐⭐⭐⭐" },
  { rank: 2, name: "Lauren", handle: "@treasurevalley_treatsandeats", platform: "Instagram", followers: 38000, niche: "Food / Bars / Local Businesses", fit: "⭐⭐⭐⭐" },
  { rank: 3, name: "Heather Sharpe", handle: "@thatboisegirl", platform: "Instagram", followers: 19000, niche: "Food / Bars / Local Events", fit: "⭐⭐⭐⭐" },
  { rank: 4, name: "Melissa Tureaud", handle: "@blissfulinboise", platform: "Instagram", followers: 17700, niche: "Events / Food / Giveaways", fit: "⭐⭐⭐⭐" },
  { rank: 5, name: "(City Account)", handle: "@thisisboise", platform: "Instagram", followers: 122000, niche: "City Guide / Nightlife / Eats & Drinks", fit: "⭐⭐⭐" },
  { rank: 6, name: "(City Account)", handle: "@totallyboise", platform: "Instagram", followers: 61300, niche: "Culture / Events / Community", fit: "⭐⭐⭐" },
  { rank: 7, name: "Taylor Humby", handle: "@humbyart", platform: "Instagram", followers: 143000, niche: "Entertainment / Art (11.42% engagement)", fit: "⭐⭐⭐ ⚡" },
  { rank: 8, name: "Kali", handle: "@tater_rater_boise", platform: "Instagram", followers: 12500, niche: "Food / Local Hidden Gems", fit: "⭐⭐⭐" },
  { rank: 9, name: "Shane & Natalie Plummer", handle: "@theboisebubble", platform: "Instagram + Podcast", followers: 12800, niche: "Entertainment / Podcast / Lifestyle", fit: "⭐⭐" },
  { rank: 10, name: "Tyler G", handle: "@tastefullytyler", platform: "Instagram", followers: 8900, niche: "Food / Dining", fit: "⭐⭐" },
];

const STATUS_OPTIONS: Status[] = [
  "Not Contacted",
  "DM Sent",
  "Replied",
  "Call / Meeting Scheduled",
  "Deal Closed",
  "Declined",
  "On Hold",
];

const COLLAB_OPTIONS: CollabType[] = [
  "None",
  "Post",
  "Story / Reel",
  "Event Coverage",
  "Giveaway",
  "Paid Partnership",
  "VIP Night",
];

/* Color-coded status badge palette (bg tint + solid text/border) */
const STATUS_COLORS: Record<Status, { color: string; bg: string }> = {
  "Not Contacted": { color: "#9a8a8a", bg: "rgba(154,138,138,0.15)" },
  "DM Sent": { color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  "Replied": { color: "#eab308", bg: "rgba(234,179,8,0.15)" },
  "Call / Meeting Scheduled": { color: "#9b5de5", bg: "rgba(155,93,229,0.15)" },
  "Deal Closed": { color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  "Declined": { color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  "On Hold": { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
};

const STORAGE_KEY = "srb-influencer-outreach";

function defaultTracking(): Tracking {
  return { status: "Not Contacted", dateContacted: "", lastContact: "", collabType: "None", notes: "" };
}

function instagramUrl(handle: string): string {
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

function fmtFollowers(n: number): string {
  return n.toLocaleString("en-US");
}

function StatusBadge({ status }: { status: Status }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: "0.72rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.color}`,
      }}
    >
      {status}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────────────── */
export default function InfluencersPage() {
  const [mounted, setMounted] = useState(false);
  const [tracking, setTracking] = useState<Record<string, Tracking>>({});
  const [filter, setFilter] = useState<Status | "All">("All");
  const [editHandle, setEditHandle] = useState<string | null>(null);
  const [draft, setDraft] = useState<Tracking>(defaultTracking());

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTracking(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist to localStorage whenever tracking changes (after mount)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tracking));
    } catch {
      /* ignore */
    }
  }, [tracking, mounted]);

  const getTrack = (handle: string): Tracking => tracking[handle] ?? defaultTracking();

  const openEdit = (handle: string) => {
    setDraft(getTrack(handle));
    setEditHandle(handle);
  };

  const saveEdit = () => {
    if (!editHandle) return;
    setTracking((prev) => ({ ...prev, [editHandle]: draft }));
    setEditHandle(null);
  };

  // Counts per status (across all influencers, using default when untracked)
  const counts = useMemo(() => {
    const c: Record<Status, number> = {
      "Not Contacted": 0,
      "DM Sent": 0,
      "Replied": 0,
      "Call / Meeting Scheduled": 0,
      "Deal Closed": 0,
      "Declined": 0,
      "On Hold": 0,
    };
    for (const inf of INFLUENCERS) {
      const st = (tracking[inf.handle]?.status ?? "Not Contacted") as Status;
      c[st] += 1;
    }
    return c;
  }, [tracking]);

  const visible = useMemo(() => {
    if (filter === "All") return INFLUENCERS;
    return INFLUENCERS.filter((inf) => (tracking[inf.handle]?.status ?? "Not Contacted") === filter);
  }, [filter, tracking]);

  const editingInf = editHandle ? INFLUENCERS.find((i) => i.handle === editHandle) : null;

  const th: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--accent2)",
    borderBottom: "1px solid var(--border)",
    whiteSpace: "nowrap",
  };
  const td: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: "0.82rem",
    color: "var(--text)",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "middle",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            margin: 0,
            background: "linear-gradient(135deg, #e8a020, #ff8c1a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          📣 Influencers — Outreach Tracker
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Top 10 Boise influencers for The Torch. Track outreach status, contact dates, collab type & notes —
          everything auto-saves to this browser.
        </p>
      </div>

      {/* Summary bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 20,
          padding: 16,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        {STATUS_OPTIONS.map((st) => (
          <div
            key={st}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 8,
              background: STATUS_COLORS[st].bg,
              border: `1px solid ${STATUS_COLORS[st].color}`,
            }}
          >
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: STATUS_COLORS[st].color }}>
              {mounted ? counts[st] : "–"}
            </span>
            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: STATUS_COLORS[st].color }}>{st}</span>
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {(["All", ...STATUS_OPTIONS] as const).map((f) => {
          const active = filter === f;
          const accent = f === "All" ? "var(--accent2)" : STATUS_COLORS[f as Status].color;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                color: active ? "#0d0a0a" : accent,
                background: active ? accent : "transparent",
                border: `1px solid ${accent}`,
                transition: "all 0.15s",
              }}
            >
              {f}
              {f !== "All" && mounted ? ` (${counts[f as Status]})` : ""}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
          <thead>
            <tr>
              <th style={th}>Rank</th>
              <th style={th}>Name</th>
              <th style={th}>Handle</th>
              <th style={th}>Platform</th>
              <th style={{ ...th, textAlign: "right" }}>Followers</th>
              <th style={th}>Niche</th>
              <th style={th}>Fit</th>
              <th style={th}>Status</th>
              <th style={th}>Date Contacted</th>
              <th style={th}>Last Contact</th>
              <th style={th}>Collab Type</th>
              <th style={th}>Notes</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((inf) => {
              const t = getTrack(inf.handle);
              return (
                <tr key={inf.handle}>
                  <td style={{ ...td, fontWeight: 700, color: "var(--accent2)" }}>#{inf.rank}</td>
                  <td style={{ ...td, whiteSpace: "nowrap", fontWeight: 600 }}>{inf.name}</td>
                  <td style={td}>
                    <a
                      href={instagramUrl(inf.handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#ff8c1a", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                      {inf.handle} ↗
                    </a>
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap", color: "var(--muted)" }}>{inf.platform}</td>
                  <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {fmtFollowers(inf.followers)}
                  </td>
                  <td style={{ ...td, minWidth: 200 }}>{inf.niche}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{inf.fit}</td>
                  <td style={td}>{mounted ? <StatusBadge status={t.status} /> : <StatusBadge status="Not Contacted" />}</td>
                  <td style={{ ...td, whiteSpace: "nowrap", color: t.dateContacted ? "var(--text)" : "var(--muted)" }}>
                    {mounted && t.dateContacted ? t.dateContacted : "—"}
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap", color: t.lastContact ? "var(--text)" : "var(--muted)" }}>
                    {mounted && t.lastContact ? t.lastContact : "—"}
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap", color: t.collabType !== "None" ? "var(--text)" : "var(--muted)" }}>
                    {mounted ? t.collabType : "None"}
                  </td>
                  <td style={{ ...td, maxWidth: 240, color: t.notes ? "var(--text)" : "var(--muted)" }}>
                    <span
                      style={{
                        display: "block",
                        maxWidth: 240,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={mounted ? t.notes : ""}
                    >
                      {mounted && t.notes ? t.notes : "—"}
                    </span>
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => openEdit(inf.handle)}
                      style={{
                        padding: "5px 14px",
                        borderRadius: 6,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#0d0a0a",
                        background: "var(--accent2)",
                        border: "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={13} style={{ ...td, textAlign: "center", color: "var(--muted)", padding: 32 }}>
                  No influencers with status “{filter}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sub-page links (existing influencer resources) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
        {[
          { href: "/influencers/outreach-templates", icon: "📧", title: "Outreach Templates" },
          { href: "/influencers/tracking-dashboard", icon: "📈", title: "Tracking Dashboard" },
          { href: "/influencers/weekly-report", icon: "📄", title: "Weekly Report" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--text)",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            <span>{l.icon}</span>
            {l.title}
          </Link>
        ))}
      </div>

      {/* Edit modal */}
      {editHandle && editingInf && (
        <div
          onClick={() => setEditHandle(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--card)",
              border: "1px solid var(--accent2)",
              borderRadius: 14,
              padding: 24,
              boxShadow: "0 0 40px rgba(232,160,32,0.2)",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--accent2)" }}>
                Edit Outreach — {editingInf.name}
              </h2>
              <a
                href={instagramUrl(editingInf.handle)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ff8c1a", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600 }}
              >
                {editingInf.handle} ↗
              </a>
            </div>

            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
                Status
              </span>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })}
                style={{ width: "100%" }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <label style={{ flex: "1 1 160px" }}>
                <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
                  Date Contacted
                </span>
                <input
                  type="date"
                  value={draft.dateContacted}
                  onChange={(e) => setDraft({ ...draft, dateContacted: e.target.value })}
                  style={{ width: "100%" }}
                />
              </label>
              <label style={{ flex: "1 1 160px" }}>
                <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
                  Last Contact
                </span>
                <input
                  type="date"
                  value={draft.lastContact}
                  onChange={(e) => setDraft({ ...draft, lastContact: e.target.value })}
                  style={{ width: "100%" }}
                />
              </label>
            </div>

            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
                Collab Type
              </span>
              <select
                value={draft.collabType}
                onChange={(e) => setDraft({ ...draft, collabType: e.target.value as CollabType })}
                style={{ width: "100%" }}
              >
                {COLLAB_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", marginBottom: 20 }}>
              <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
                Notes
              </span>
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                rows={4}
                placeholder="Conversation notes, follow-up reminders, deal terms…"
                style={{ width: "100%", resize: "vertical" }}
              />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setEditHandle(null)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#0d0a0a",
                  background: "var(--accent2)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
