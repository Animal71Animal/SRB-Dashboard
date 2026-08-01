"use client";

import { useEffect, useState } from "react";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };

const STATUS_COLORS: Record<string, string> = {
  Active: "#00a86b", Completed: "var(--muted)", Paused: "var(--accent2)", Planned: "#5599ee",
};

interface Campaign {
  id: string; name: string; channel: string; budget: string;
  startDate: string; endDate: string; status: string; notes: string;
}

const empty: Partial<Campaign> = { name: "", channel: "Instagram", budget: "", startDate: "", endDate: "", status: "Planned", notes: "" };

export default function PromoCampaignsPage() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [form, setForm] = useState<Partial<Campaign>>(empty);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => fetch("/api/campaigns").then((r) => r.json()).then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true);
    try {
      if (editing) {
        await fetch("/api/campaigns", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing, ...form }) });
      } else {
        await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      }
      setForm(empty); setEditing(null); setShowForm(false); await load();
    } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete campaign?")) return;
    await fetch(`/api/campaigns?id=${id}`, { method: "DELETE" });
    await load();
  };

  const edit = (c: Campaign) => { setForm(c); setEditing(c.id); setShowForm(true); };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>📢 Promo Campaigns</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>Track active and past marketing campaigns</p>
        </div>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(!showForm); }}
          style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: "0.875rem", fontWeight: 600 }}>
          {showForm ? "Cancel" : "+ Add Campaign"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...CARD, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>{editing ? "Edit Campaign" : "New Campaign"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input placeholder="Campaign Name" value={form.name ?? ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} style={{ gridColumn: "1 / -1" }} />
            <select value={form.channel ?? "Instagram"} onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}>
              {["Instagram","TikTok","Facebook","Flyers","Radio","All"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Budget (e.g. $500)" value={form.budget ?? ""} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))} />
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Start Date</label>
              <input type="date" value={form.startDate ?? ""} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>End Date</label>
              <input type="date" value={form.endDate ?? ""} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} style={{ width: "100%" }} />
            </div>
            <select value={form.status ?? "Planned"} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              {["Planned","Active","Paused","Completed"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <textarea placeholder="Notes" value={form.notes ?? ""} rows={2} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} style={{ gridColumn: "1 / -1", resize: "vertical" }} />
          </div>
          <button onClick={save} disabled={loading}
            style={{ marginTop: 16, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600 }}>
            {loading ? "Saving..." : editing ? "Update" : "Add Campaign"}
          </button>
        </div>
      )}

      <div style={CARD}>
        <table>
          <thead>
            <tr><th>Campaign</th><th>Channel</th><th>Budget</th><th>Dates</th><th>Status</th><th>Notes</th><th></th></tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={7} style={{ color: "var(--muted)", textAlign: "center", padding: 32 }}>No campaigns yet.</td></tr>
            )}
            {items.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td>{c.channel}</td>
                <td>{c.budget}</td>
                <td style={{ fontSize: "0.8rem", color: "var(--muted)", whiteSpace: "nowrap" }}>{c.startDate} → {c.endDate}</td>
                <td>
                  <span style={{ background: (STATUS_COLORS[c.status] || "var(--muted)") + "22", color: STATUS_COLORS[c.status] || "var(--muted)", padding: "3px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600 }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ fontSize: "0.8rem", color: "var(--muted)", maxWidth: 200 }}>{c.notes}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button onClick={() => edit(c)} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, padding: "4px 10px", marginRight: 6, fontSize: "0.8rem" }}>Edit</button>
                  <button onClick={() => del(c.id)} style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 6, padding: "4px 10px", fontSize: "0.8rem" }}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
