"use client";

import { useEffect, useState } from "react";
import { useVenue } from "@/components/VenueSwitcher";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };

interface CompCode {
  id: string; code: string; recipientName: string; issuedDate: string; expiryDate: string; used: boolean; notes: string; venue?: string;
}

const empty: Partial<CompCode> = { code: "", recipientName: "", issuedDate: "", expiryDate: "", used: false, notes: "" };

function genCode() {
  return "RH-" + Math.random().toString(36).toUpperCase().slice(2, 8);
}

export default function CompCodesPage() {
  const [items, setItems] = useState<CompCode[]>([]);
  const [form, setForm] = useState<Partial<CompCode>>(empty);
  const [loading, setLoading] = useState(false);
  const venue = useVenue();

  const load = () => fetch(`/api/comp-codes?venue=${venue}`).then((r) => r.json()).then(setItems).catch(() => {});
  useEffect(() => { load(); }, [venue]);

  const add = async () => {
    if (!form.recipientName) { alert("Recipient name required"); return; }
    setLoading(true);
    try {
      const code = form.code || genCode();
      await fetch("/api/comp-codes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, code, venue: form.venue ?? venue }),
      });
      setForm(empty); await load();
    } finally { setLoading(false); }
  };

  const toggleUsed = async (id: string, used: boolean) => {
    await fetch("/api/comp-codes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, used: !used }) });
    await load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this code?")) return;
    await fetch(`/api/comp-codes?id=${id}`, { method: "DELETE" });
    await load();
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>🎟️ Comp Codes</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>Complimentary entry code management</p>
        </div>
        <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
          {items.filter((c) => c.used).length}/{items.length} used
        </div>
      </div>

      {/* Add Form */}
      <div style={{ ...CARD, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Issue New Code</h3>
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Code (auto-generated if blank)</label>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <input placeholder="RH-XXXXXX" value={form.code ?? ""} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} style={{ flex: 1, minWidth: 0 }} />
              <button onClick={() => setForm((p) => ({ ...p, code: genCode() }))}
                style={{ background: "var(--border)", border: "none", color: "var(--text)", borderRadius: 6, padding: "0 10px", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                🔀
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Recipient Name *</label>
            <input placeholder="John Doe" value={form.recipientName ?? ""} onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))} style={{ width: "100%", marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Date Issued</label>
            <input type="date" value={form.issuedDate ?? today} onChange={(e) => setForm((p) => ({ ...p, issuedDate: e.target.value }))} style={{ width: "100%", marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Expiry Date</label>
            <input type="date" value={form.expiryDate ?? ""} onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))} style={{ width: "100%", marginTop: 4 }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Notes</label>
            <input placeholder="Optional notes" value={form.notes ?? ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} style={{ width: "100%", marginTop: 4 }} />
          </div>
        </div>
        <button onClick={add} disabled={loading}
          style={{ marginTop: 16, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600 }}>
          {loading ? "Saving..." : "Issue Code"}
        </button>
      </div>

      <div style={CARD}>
        <table>
          <thead>
            <tr><th>Code</th><th>Recipient</th><th>Issued</th><th>Expires</th><th>Used</th><th>Notes</th><th></th></tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={7} style={{ color: "var(--muted)", textAlign: "center", padding: 32 }}>No codes yet. Issue one above.</td></tr>
            )}
            {items.map((c) => (
              <tr key={c.id} style={{ opacity: c.used ? 0.6 : 1 }}>
                <td><code style={{ background: "var(--border)", padding: "2px 8px", borderRadius: 4, fontSize: "0.85rem" }}>{c.code}</code></td>
                <td>{c.recipientName}</td>
                <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{c.issuedDate}</td>
                <td style={{ color: c.expiryDate < today ? "var(--accent)" : "var(--muted)", fontSize: "0.85rem" }}>{c.expiryDate || "—"}</td>
                <td>
                  <button onClick={() => toggleUsed(c.id, c.used)}
                    style={{ background: c.used ? "rgba(0,168,107,0.2)" : "var(--border)", color: c.used ? "#00a86b" : "var(--muted)", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: "0.8rem", cursor: "pointer" }}>
                    {c.used ? "✓ Used" : "Mark Used"}
                  </button>
                </td>
                <td style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{c.notes}</td>
                <td>
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
