"use client";

import { useState } from "react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleReset = async () => {
    if (!password || password !== confirm) {
      setMsg("Passwords must match");
      return;
    }
    setSaving(true);
    const email = sessionStorage.getItem("srb-session-email");
    
    const res = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify({ action: "update-password", email, password })
    });

    if (res.ok) {
      window.location.href = "/";
    } else {
      setMsg("Failed to reset password");
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 24, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>Set New Password</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: 24 }}>Welcome to the TOC! Please set a unique password for your staff account.</p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px", color: "var(--text)" }} />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Confirm Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px", color: "var(--text)" }} />
        </div>
        
        {msg && <div style={{ color: "var(--accent)", fontSize: "0.8rem" }}>{msg}</div>}
        
        <button onClick={handleReset} disabled={saving}
          style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: 6, padding: "12px", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
          {saving ? "SAVING..." : "ACTIVATE ACCOUNT 🔒"}
        </button>
      </div>
    </div>
  );
}
