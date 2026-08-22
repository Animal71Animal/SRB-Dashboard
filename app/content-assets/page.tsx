"use client";

import { useEffect, useState } from "react";
import { useVenue } from "@/components/VenueSwitcher";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };
const TYPE_ICONS: Record<string, string> = { Audio: "🎶", Flyer: "🖼️", Logo: "✏️", Video: "🎥", Photo: "📸" };

interface ContentAsset {
  id: string; name: string; type: string; dateCreated: string; description: string; link: string; venue?: string;
}

const empty: Partial<ContentAsset> = { name: "", type: "Flyer", dateCreated: "", description: "", link: "" };

export default function ContentAssetsPage() {
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [form, setForm] = useState<Partial<ContentAsset>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const venue = useVenue();

  const load = () => fetch(`/api/content-assets?venue=${venue}`).then((r) => r.json()).then(setAssets).catch(() => {});
  useEffect(() => { load(); }, [venue]);

  const save = async () => {
    if (!form.name) { alert("Asset name required"); return; }
    setLoading(true);
    try {
      await fetch("/api/content-assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, venue: form.venue ?? venue }) });
      setForm(empty); setShowForm(false); await load();
    } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete asset?")) return;
    await fetch(`/api/content-assets?id=${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>🎨 Content Assets</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>Flyer archive, logos, and asset links</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: "0.875rem", fontWeight: 600 }}>
          {showForm ? "Cancel" : "+ Add Asset"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...CARD, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>New Asset</h3>
          <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input placeholder="Asset Name" value={form.name ?? ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} style={{ gridColumn: "1 / -1" }} />
            <select value={form.type ?? "Flyer"} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              {["Audio","Flyer","Logo","Video","Photo"].sort().map((t) => <option key={t}>{t}</option>)}
            </select>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Date Created</label>
              <input type="date" value={form.dateCreated ?? ""} onChange={(e) => setForm((p) => ({ ...p, dateCreated: e.target.value }))} style={{ width: "100%", marginTop: 4 }} />
            </div>
            <textarea placeholder="Description" value={form.description ?? ""} rows={2} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={{ gridColumn: "1 / -1", resize: "vertical" }} />
            <input placeholder="Link / URL (optional)" value={form.link ?? ""} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} style={{ gridColumn: "1 / -1" }} />
          </div>
          <button onClick={save} disabled={loading}
            style={{ marginTop: 16, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600 }}>
            {loading ? "Saving..." : "Add Asset"}
          </button>
        </div>
      )}

      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {assets.length === 0 && (
          <div style={{ ...CARD, color: "var(--muted)", textAlign: "center", padding: 48, gridColumn: "1/-1" }}>No assets yet.</div>
        )}
        {assets.map((a) => (
          <div key={a.id} style={CARD}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ fontSize: "1.75rem" }}>{TYPE_ICONS[a.type] || "📄"}</div>
              <span style={{ background: "rgba(201,0,43,0.1)", color: "var(--accent)", padding: "3px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600 }}>
                {a.type}
              </span>
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 4 }}>{a.name}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 8 }}>{a.dateCreated}</div>
            <p style={{ fontSize: "0.8rem", color: "var(--text)", lineHeight: 1.5, marginBottom: 12 }}>{a.description}</p>
            {a.link && (
              <a href={a.link} target="_blank" rel="noreferrer"
                style={{ fontSize: "0.8rem", color: "var(--accent2)", wordBreak: "break-all" }}>
                🔗 {a.link}
              </a>
            )}
            <div style={{ marginTop: 12 }}>
              <button onClick={() => del(a.id)} style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 6, padding: "5px 14px", fontSize: "0.8rem" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
