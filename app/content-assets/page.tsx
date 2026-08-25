"use client";

import { useEffect, useState, useCallback } from "react";
import { useVenue } from "@/components/VenueSwitcher";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };
const TYPE_ICONS: Record<string, string> = { Audio: "🎶", Flyer: "🖼️", Logo: "✏️", Video: "🎥", Photo: "📸" };

interface ContentAsset {
  id: string;
  name: string;
  type: string;
  dateCreated: string;
  description: string;
  link: string;
  venue: string; // "torch1" | "torch2" | "torch12"
}

const empty: Partial<ContentAsset> = { name: "", type: "Flyer", dateCreated: "", description: "", link: "", venue: "" };

export default function ContentAssetsPage() {
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [form, setForm] = useState<Partial<ContentAsset>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const venue = useVenue();

  // Explicit states to force re-render on selection
  const [isT1, setIsT1] = useState(false);
  const [isT2, setIsT2] = useState(false);

  const load = useCallback(() => {
    const url = venue === "combined" ? "/api/content-assets" : `/api/content-assets?venue=${venue}&includeShared=true`;
    fetch(url).then((r) => r.json()).then(setAssets).catch(() => {});
  }, [venue]);

  useEffect(() => { load(); }, [load]);

  // Update T1/T2 booleans whenever form.venue changes
  useEffect(() => {
    setIsT1(form.venue === "torch1" || form.venue === "torch12");
    setIsT2(form.venue === "torch2" || form.venue === "torch12");
  }, [form.venue]);

  useEffect(() => {
    if (!editingId && !form.venue && venue !== "combined") {
      setForm(p => ({ ...p, venue }));
    }
  }, [venue, editingId, form.venue]);

  const save = async () => {
    if (!form.name) { alert("Asset name required"); return; }
    if (!form.venue) { alert("Please assign at least one venue"); return; }
    setLoading(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const response = await fetch("/api/content-assets", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...form, id: editingId } : form)
      });
      if (!response.ok) throw new Error("Unable to save asset");
      setForm(empty);
      setShowForm(false);
      setEditingId(null);
      await load();
    } finally { setLoading(false); }
  };

  const startEdit = (asset: ContentAsset) => {
    setForm(asset);
    setEditingId(asset.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (id: string) => {
    if (!confirm("Delete asset?")) return;
    await fetch(`/api/content-assets?id=${id}`, { method: "DELETE" });
    if (editingId === id) {
        setForm(empty);
        setShowForm(false);
        setEditingId(null);
    }
    await load();
  };

  const cancelEdit = () => {
    setForm(empty);
    setShowForm(false);
    setEditingId(null);
  };

  const selectT1 = () => {
    const newT1 = !isT1;
    let next = "";
    if (newT1 && isT2) next = "torch12";
    else if (newT1) next = "torch1";
    else if (isT2) next = "torch2";
    setForm(p => ({ ...p, venue: next }));
  };

  const selectT2 = () => {
    const newT2 = !isT2;
    let next = "";
    if (isT1 && newT2) next = "torch12";
    else if (isT1) next = "torch1";
    else if (newT2) next = "torch2";
    setForm(p => ({ ...p, venue: next }));
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>🎨 Content Assets</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>Flyer archive, logos, and asset links</p>
        </div>
        <button onClick={() => showForm ? cancelEdit() : setShowForm(true)}
          style={{ background: showForm ? "var(--border)" : "var(--accent)", color: showForm ? "var(--text)" : "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: "0.875rem", fontWeight: 600 }}>
          {showForm ? "Cancel" : "+ Add Asset"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...CARD, marginBottom: 24, border: editingId ? "1px solid var(--accent)" : "1px solid var(--border)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>{editingId ? "Edit Asset" : "New Asset"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 8, display: "block" }}>Assign Venue (Select one or both)</label>
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  onClick={selectT1}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 8, textAlign: 'center',
                    border: isT1 ? "2px solid var(--accent)" : "1px solid var(--border)",
                    background: isT1 ? "rgba(201,0,43,0.1)" : "transparent",
                    color: isT1 ? "var(--accent)" : "var(--text)",
                    fontWeight: 700, cursor: "pointer", userSelect: "none"
                  }}
                >Torch 1</div>
                <div
                  onClick={selectT2}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 8, textAlign: 'center',
                    border: isT2 ? "2px solid #0078ff" : "1px solid var(--border)",
                    background: isT2 ? "rgba(0,120,255,0.1)" : "transparent",
                    color: isT2 ? "#0078ff" : "var(--text)",
                    fontWeight: 700, cursor: "pointer", userSelect: "none"
                  }}
                >Torch 2</div>
              </div>
              {form.venue === "torch12" && (
                <div style={{ fontSize: "0.7rem", color: "var(--accent2)", marginTop: 8, textAlign: "center", fontWeight: 600 }}>
                  ✓ SHARED: Assigned to both Torch 1 and Torch 2
                </div>
              )}
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4, display: "block" }}>Asset Name</label>
              <input placeholder="Short identifying name" value={form.name ?? ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} style={{ width: "100%" }} />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4, display: "block" }}>Asset Type</label>
              <select value={form.type ?? "Flyer"} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} style={{ width: "100%" }}>
                {["Flyer","Logo","Video","Photo"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4, display: "block" }}>Date Created</label>
              <input type="date" value={form.dateCreated ?? ""} onChange={(e) => setForm((p) => ({ ...p, dateCreated: e.target.value }))} style={{ width: "100%" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4, display: "block" }}>Description</label>
              <textarea placeholder="Details about this asset..." value={form.description ?? ""} rows={2} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={{ width: "100%", resize: "vertical" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4, display: "block" }}>Link / URL</label>
              <input placeholder="https://..." value={form.link ?? ""} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} style={{ width: "100%" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={save} disabled={loading}
              style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600 }}>
              {loading ? "Saving..." : (editingId ? "Update Asset" : "Add Asset")}
            </button>
            {editingId && (
              <button onClick={cancelEdit}
                style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 24px", fontWeight: 600 }}>
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {assets.length === 0 && (
          <div style={{ ...CARD, color: "var(--muted)", textAlign: "center", padding: 48, gridColumn: "1/-1" }}>No assets found for this venue selection.</div>
        )}
        {assets.map((a) => (
          <div key={a.id} style={{ ...CARD, display: "flex", flexDirection: "column", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ fontSize: "2rem" }}>{TYPE_ICONS[a.type] || "📄"}</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{ background: "rgba(201,0,43,0.1)", color: "var(--accent)", padding: "4px 12px", borderRadius: 12, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                  {a.type}
                </span>
                <span style={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    color: a.venue === "torch2" ? "#0078ff" : a.venue === "torch12" ? "var(--accent2)" : "var(--accent)",
                    background: a.venue === "torch2" ? "rgba(0,120,255,0.1)" : a.venue === "torch12" ? "rgba(255,255,255,0.05)" : "rgba(201,0,43,0.05)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    border: `1px solid ${a.venue === "torch2" ? "rgba(0,120,255,0.2)" : a.venue === "torch12" ? "rgba(255,255,255,0.2)" : "rgba(201,0,43,0.2)"}`
                }}>
                  {a.venue === "torch2" ? "TORCH 2" : a.venue === "torch12" ? "SHARED: T1 & T2" : "TORCH 1"}
                </span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 4, letterSpacing: "-0.01em" }}>{a.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 12 }}>
                    📅 {a.dateCreated}
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.5, marginBottom: 16, minHeight: "3em" }}>{a.description}</p>
            </div>

            {a.link && (
              <div style={{ marginBottom: 20 }}>
                <a href={a.link} target="_blank" rel="noreferrer"
                    style={{ fontSize: "0.8rem", color: "var(--accent2)", wordBreak: "break-all", textDecoration: "none", borderBottom: "1px dashed var(--accent2)" }}>
                    🔗 Open Resource
                </a>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <button onClick={() => startEdit(a)}
                style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, padding: "8px 0", fontSize: "0.8rem", fontWeight: 600 }}>
                Edit
              </button>
              <button onClick={() => del(a.id)}
                style={{ background: "none", border: "1px solid rgba(201,0,43,0.3)", color: "var(--accent)", borderRadius: 6, padding: "8px 14px", fontSize: "0.8rem" }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
