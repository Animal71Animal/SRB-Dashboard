"use client";

import { useEffect, useState } from "react";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };

interface StaffNote {
  id: string; date: string; title: string; content: string;
}

export default function StaffNotesPage() {
  const [notes, setNotes] = useState<StaffNote[]>([]);
  const [form, setForm] = useState({ title: "", content: "", date: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const load = () => fetch("/api/staff-notes").then((r) => r.json()).then(setNotes).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) { alert("Title required"); return; }
    setLoading(true);
    try {
      if (editing) {
        await fetch("/api/staff-notes", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing, ...form }),
        });
      } else {
        await fetch("/api/staff-notes", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, date: form.date || today }),
        });
      }
      setForm({ title: "", content: "", date: "" }); setEditing(null); setShowForm(false); await load();
    } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete note?")) return;
    await fetch(`/api/staff-notes?id=${id}`, { method: "DELETE" });
    await load();
  };

  const editNote = (n: StaffNote) => {
    setForm({ title: n.title, content: n.content, date: n.date });
    setEditing(n.id); setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>📝 Staff Notes</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>Internal notes and memos</p>
        </div>
        <button onClick={() => { setForm({ title: "", content: "", date: "" }); setEditing(null); setShowForm(!showForm); }}
          style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: "0.875rem", fontWeight: 600 }}>
          {showForm ? "Cancel" : "+ New Note"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...CARD, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>{editing ? "Edit Note" : "New Note"}</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Date</label>
              <input type="date" value={form.date || today} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} style={{ width: "100%", marginTop: 4 }} />
            </div>
            <textarea
              placeholder="Note content (markdown supported)..."
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              rows={8}
              style={{ resize: "vertical", fontFamily: "monospace", fontSize: "0.875rem" }}
            />
          </div>
          <button onClick={save} disabled={loading}
            style={{ marginTop: 16, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600 }}>
            {loading ? "Saving..." : editing ? "Update" : "Save Note"}
          </button>
        </div>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {notes.length === 0 && (
          <div style={{ ...CARD, color: "var(--muted)", textAlign: "center", padding: 48 }}>No notes yet.</div>
        )}
        {notes.map((n) => (
          <div key={n.id} style={CARD}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>{n.title}</h3>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{n.date}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => editNote(n)}
                  style={{ background: "var(--border)", border: "none", color: "var(--text)", borderRadius: 6, padding: "5px 14px", fontSize: "0.8rem" }}>Edit</button>
                <button onClick={() => del(n.id)}
                  style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 6, padding: "5px 14px", fontSize: "0.8rem" }}>Del</button>
              </div>
            </div>
            <div style={{ fontSize: "0.875rem", lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text)" }}>
              {n.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
