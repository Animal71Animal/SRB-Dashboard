"use client";

import { useEffect, useState } from "react";
import { useVenue } from "@/components/VenueSwitcher";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };
const STATUS_COLORS: Record<string, string> = { Draft: "var(--muted)", Scheduled: "var(--accent2)", Posted: "#00a86b" };
const PLATFORM_ICONS: Record<string, string> = { Instagram: "📸", TikTok: "🎵", Facebook: "👥" };

interface SocialPost {
  id: string; platform: string; postType: string; captionPreview: string;
  scheduledDate: string; scheduledTime: string; status: string; venue?: string;
}

const empty: Partial<SocialPost> = { platform: "Instagram", postType: "Post", captionPreview: "", scheduledDate: "", scheduledTime: "", status: "Draft" };

export default function SocialCalendarPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [form, setForm] = useState<Partial<SocialPost>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const venue = useVenue();

  const load = () => fetch(`/api/social-calendar?venue=${venue}`).then((r) => r.json()).then(setPosts).catch(() => {});
  useEffect(() => { load(); }, [venue]);

  const save = async () => {
    setLoading(true);
    try {
      await fetch("/api/social-calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, venue: form.venue ?? venue }) });
      setForm(empty); setShowForm(false); await load();
    } finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/social-calendar", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    await load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/social-calendar?id=${id}`, { method: "DELETE" });
    await load();
  };

  const sorted = [...posts].sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>📱 Social Media Calendar</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>Weekly post schedule across platforms</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: "0.875rem", fontWeight: 600 }}>
          {showForm ? "Cancel" : "+ Schedule Post"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...CARD, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>New Post</h3>
          <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <select value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}>
              {["Instagram","TikTok","Facebook"].map((pl) => <option key={pl}>{pl}</option>)}
            </select>
            <select value={form.postType} onChange={(e) => setForm((p) => ({ ...p, postType: e.target.value }))}>
              {["Post","Story","Reel","Video"].map((t) => <option key={t}>{t}</option>)}
            </select>
            <textarea placeholder="Caption preview..." value={form.captionPreview ?? ""} rows={2} onChange={(e) => setForm((p) => ({ ...p, captionPreview: e.target.value }))} style={{ gridColumn: "1 / -1", resize: "vertical" }} />
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Date</label>
              <input type="date" value={form.scheduledDate ?? ""} onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))} style={{ width: "100%", marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Time</label>
              <input type="time" value={form.scheduledTime ?? ""} onChange={(e) => setForm((p) => ({ ...p, scheduledTime: e.target.value }))} style={{ width: "100%", marginTop: 4 }} />
            </div>
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <option>Draft</option><option>Scheduled</option><option>Posted</option>
            </select>
          </div>
          <button onClick={save} disabled={loading}
            style={{ marginTop: 16, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600 }}>
            {loading ? "Saving..." : "Schedule"}
          </button>
        </div>
      )}

      <div className="responsive-grid" style={{ display: "grid", gap: 12 }}>
        {sorted.length === 0 && (
          <div style={{ ...CARD, color: "var(--muted)", textAlign: "center", padding: 48 }}>No posts scheduled.</div>
        )}
        {sorted.map((p) => (
          <div key={p.id} style={{ ...CARD, display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ fontSize: "1.5rem" }}>{PLATFORM_ICONS[p.platform] || "📲"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.platform}</span>
                <span style={{ background: "var(--border)", color: "var(--muted)", padding: "2px 8px", borderRadius: 8, fontSize: "0.75rem" }}>{p.postType}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{p.scheduledDate} {p.scheduledTime}</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text)", lineHeight: 1.5 }}>{p.captionPreview}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)}
                style={{ fontSize: "0.8rem", padding: "4px 8px", background: (STATUS_COLORS[p.status] || "var(--muted)") + "22", color: STATUS_COLORS[p.status] || "var(--muted)", border: `1px solid ${STATUS_COLORS[p.status] || "var(--muted)"}`, borderRadius: 6 }}>
                <option>Draft</option><option>Scheduled</option><option>Posted</option>
              </select>
              <button onClick={() => del(p.id)} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.8rem", cursor: "pointer" }}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
