"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useVenue } from "@/components/VenueSwitcher";

interface SocialProfile {
  handle: string;
  followers: string;
}

interface Influencer {
  id: string;
  name: string;
  instagram?: SocialProfile;
  tiktok?: SocialProfile;
  twitter?: SocialProfile;
  youtube?: SocialProfile;
  facebook?: SocialProfile;
  status: "active" | "contacted" | "pending" | "passed";
  notes: string;
  venue?: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#00c87c",
  contacted: "#f59e0b",
  pending: "#6b7280",
  passed: "#ef4444",
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  twitter: "🐦",
  youtube: "▶️",
  facebook: "👤",
};

const blankForm = () => ({
  name: "",
  instagram: { handle: "", followers: "" },
  tiktok: { handle: "", followers: "" },
  twitter: { handle: "", followers: "" },
  youtube: { handle: "", followers: "" },
  facebook: { handle: "", followers: "" },
  notes: "",
});

export default function InfluencerMasterListPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ReturnType<typeof blankForm>>(blankForm());
  const [editId, setEditId] = useState<string | null>(null);
  const venue = useVenue();

  useEffect(() => {
    fetch(`/api/influencers?venue=${venue}`)
      .then((r) => r.json())
      .then((data) => {
        setInfluencers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setInfluencers([]);
        setLoading(false);
      });
  }, [venue]);

  const setInfluencerList = (list: Influencer[]) => {
    setInfluencers(list);
    fetch("/api/influencers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(list),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editId) {
      setInfluencerList(influencers.map((i) => (i.id === editId ? { ...i, ...form, status: "pending" as const } : i)));
      setEditId(null);
    } else {
      const newInfluencer: Influencer = {
        id: Date.now().toString(),
        ...form,
        status: "pending",
        venue,
      };
      setInfluencerList([...influencers, newInfluencer]);
    }
    setForm(blankForm());
    setShowForm(false);
  };

  const deleteInfluencer = (id: string) => {
    if (confirm("Remove this influencer?")) {
      setInfluencerList(influencers.filter((i) => i.id !== id));
    }
  };

  const editInfluencer = (inf: Influencer) => {
    setForm({
      name: inf.name,
      instagram: inf.instagram || { handle: "", followers: "" },
      tiktok: inf.tiktok || { handle: "", followers: "" },
      twitter: inf.twitter || { handle: "", followers: "" },
      youtube: inf.youtube || { handle: "", followers: "" },
      facebook: inf.facebook || { handle: "", followers: "" },
      notes: inf.notes,
    });
    setEditId(inf.id);
    setShowForm(true);
  };

  const updateStatus = (id: string, status: Influencer["status"]) => {
    setInfluencerList(influencers.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>📋 Influencer Master List</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, background: "linear-gradient(135deg, #9b5de5, #c77dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📋 Influencer Master List
          </h1>
          <Link href="/promotional-ideas" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>← Back</Link>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Late Night Campaign — June 6 Launch • Target: 20-30 influencers by May 15
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text)" }}>{influencers.length}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Total</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f59e0b" }}>{influencers.filter(i => i.status === "contacted").length}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Contacted</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#00c87c" }}>{influencers.filter(i => i.status === "active").length}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Active</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#ef4444" }}>{influencers.filter(i => i.status === "passed").length}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Passed</div>
        </div>
      </div>

      {/* Discovery Sources */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>🔍 Discovery Sources</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["#BoiseNightlife", "#BoiseParty", "#BoisePartyScene", "#DowntownBoise", "#BoiseBar", "#BoiseDJScene", "#BoiseTok", "#NightlifeVibes"].map(tag => (
            <span key={tag} style={{ background: "rgba(155,93,229,0.15)", color: "var(--accent2)", padding: "4px 10px", borderRadius: 20, fontSize: "0.8rem" }}>{tag}</span>
          ))}
        </div>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 600, margin: "16px 0 8px", color: "var(--text)" }}>Follower Tiers</h3>
        <div style={{ display: "flex", gap: 16, fontSize: "0.85rem", color: "var(--muted)" }}>
          <span>Micro (5K-15K) — Highest engagement</span>
          <span>Mid (15K-50K) — Good reach</span>
          <span>Macro (50K+) — Low priority</span>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => { setShowForm(!showForm); setEditId(null); setForm(blankForm()); }}
        style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #9b5de5, #c77dff)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, cursor: "pointer", marginBottom: 16 }}
      >
        {showForm ? "Cancel" : "+ Add Influencer"}
      </button>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Instagram Handle</label>
              <input value={form.instagram.handle} onChange={(e) => setForm({ ...form, instagram: { ...form.instagram, handle: e.target.value } })} placeholder="@username" style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>IG Followers</label>
              <input value={form.instagram.followers} onChange={(e) => setForm({ ...form, instagram: { ...form.instagram, followers: e.target.value } })} placeholder="12.5K" style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>TikTok Handle</label>
              <input value={form.tiktok.handle} onChange={(e) => setForm({ ...form, tiktok: { ...form.tiktok, handle: e.target.value } })} placeholder="@username" style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>TikTok Followers</label>
              <input value={form.tiktok.followers} onChange={(e) => setForm({ ...form, tiktok: { ...form.tiktok, followers: e.target.value } })} placeholder="8.2K" style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem" }} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem", resize: "vertical" }} placeholder="Niche, discovery source, pitch notes..." />
          </div>
          <button type="submit" style={{ width: "100%", padding: 12, background: "linear-gradient(135deg, #00c87c, #00a865)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            {editId ? "Update Influencer" : "Add Influencer"}
          </button>
        </form>
      )}

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {influencers.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "var(--muted)", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}>
            No influencers yet. Add your first one above.
          </div>
        )}
        {influencers.map((inf) => (
          <div key={inf.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>{inf.name}</h3>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  {inf.instagram?.handle && <span style={{ fontSize: "0.8rem", color: "var(--accent2)" }}>📸 {inf.instagram.handle} ({inf.instagram.followers})</span>}
                  {inf.tiktok?.handle && <span style={{ fontSize: "0.8rem", color: "var(--accent2)" }}>🎵 {inf.tiktok.handle} ({inf.tiktok.followers})</span>}
                </div>
              </div>
              <select
                value={inf.status}
                onChange={(e) => updateStatus(inf.id, e.target.value as Influencer["status"])}
                style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: STATUS_COLORS[inf.status], fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
              >
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="active">Active</option>
                <option value="passed">Passed</option>
              </select>
            </div>
            {inf.notes && <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>{inf.notes}</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => editInfluencer(inf)} style={{ padding: "4px 10px", background: "rgba(155,93,229,0.2)", border: "none", borderRadius: 6, color: "var(--accent2)", fontSize: "0.75rem", cursor: "pointer" }}>Edit</button>
              <button onClick={() => deleteInfluencer(inf.id)} style={{ padding: "4px 10px", background: "rgba(239,68,68,0.2)", border: "none", borderRadius: 6, color: "#ef4444", fontSize: "0.75rem", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}