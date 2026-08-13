"use client";

import { useState, useEffect } from "react";
import { type Role } from "@/lib/auth/roles";

const CARD = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" };
const INPUT = { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px", borderRadius: 8, width: "100%", fontSize: "0.9rem" };

export default function BuilderPage() {
  const [users, setUsers] = useState<{ email: string; role: Role; name?: string }[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Employee");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/users");
    const d = await res.json();
    setUsers(d.users || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!email) return;
    setLoading(true);
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: email.toLowerCase().trim(), 
        role, 
        name: name.trim() || undefined 
      }),
    });
    setEmail("");
    setName("");
    setRole("Employee");
    await load();
    setLoading(false);
  };

  const remove = async (targetEmail: string) => {
    if (!confirm(`Remove ${targetEmail}?`)) return;
    await fetch(`/api/users?email=${targetEmail}`, { method: "DELETE" });
    await load();
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Permissions Dashboard</h1>
      <p style={{ color: "var(--muted)", marginBottom: 32 }}>Manage user roles and dashboard access levels.</p>

      <div style={{ ...CARD, marginBottom: 32 }}>
        <h3 style={{ margin: "0 0 20px", fontWeight: 700 }}>Add / Update User</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Email Address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} style={INPUT} placeholder="user@example.com" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={INPUT} placeholder="e.g. DJ Khaleed" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Assigned Role</label>
            <select value={role} onChange={e => setRole(e.target.value as Role)} style={INPUT}>
              <option>SuperSuperAdmin</option>
              <option>SuperAdmin</option>
              <option>Manager</option>
              <option>DJ</option>
              <option>Employee</option>
            </select>
          </div>
          <button onClick={save} disabled={loading} style={{ background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, cursor: "pointer", height: 42 }}>
            {loading ? "..." : "Set Access"}
          </button>
        </div>
      </div>

      <div style={CARD}>
        <h3 style={{ margin: "0 0 20px", fontWeight: 700 }}>Active Registry</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 100px", padding: "12px", background: "var(--bg)", borderRadius: "8px 8px 0 0", fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
            <span>Email</span>
            <span>Name</span>
            <span>Role</span>
            <span>Action</span>
          </div>
          {users.map((u, i) => (
            <div key={u.email} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 100px", padding: "16px 12px", borderTop: "1px solid var(--border)", alignItems: "center", fontSize: "0.9rem" }}>
              <span style={{ fontWeight: 600 }}>{u.email}</span>
              <span>
                <input 
                  defaultValue={u.name || ""} 
                  onBlur={async (e) => {
                    const newName = e.target.value.trim();
                    if (newName === (u.name || "")) return;
                    setLoading(true);
                    await fetch("/api/users", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: u.email, role: u.role, name: newName }),
                    });
                    await load();
                    setLoading(false);
                  }}
                  placeholder="Set name..."
                  style={{ ...INPUT, padding: "4px 8px", fontSize: "0.8rem", width: "90%" }}
                />
              </span>
              <span>
                <span style={{
                  padding: "2px 8px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 700,
                  background: u.role === "SuperSuperAdmin" ? "#000" : (u.role === "SuperAdmin" ? "#dc2626" : u.role === "Manager" ? "#fb923c" : u.role === "DJ" ? "#facc15" : "var(--border)"),
                  color: (u.role === "DJ" || u.role === "SuperSuperAdmin") ? "inherit" : "#fff",
                  boxShadow: u.role === "SuperSuperAdmin" ? "0 0 0 1px #fff" : "none"
                }}>
                  {u.role}
                </span>
              </span>
              <button onClick={() => remove(u.email)} style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 6, padding: "4px 8px", fontSize: "0.75rem", cursor: "pointer", width: "fit-content" }}>Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
