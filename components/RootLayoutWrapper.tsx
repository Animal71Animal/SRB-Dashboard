"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import type { Role } from "@/lib/auth/roles";
import { ROLE_PREVIEW_KEY } from "@/lib/auth/roles";
import VenueSwitcher from "@/components/VenueSwitcher";

function LoginPage({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/users");
      if (!res.ok) {
        setError("System error. Try again later.");
        return;
      }
      const data = await res.json();
      const users = data.users || [];
      const normalizedEmail = email.toLowerCase().trim();
      const matched = users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
      const normalizedPassword = password.trim();
      
      if (matched && (matched.password === normalizedPassword || matched.password === password)) {
        onLogin(normalizedEmail);
      } else {
        setError("Invalid email or password.");
      }
    } catch {
      setError("Connection error.");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <form onSubmit={handleSubmit} style={{ background: "var(--card)", padding: 40, borderRadius: 16, border: "1px solid var(--border)", width: "100%", maxWidth: 400, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 8, textAlign: "center" }}>TOC Secure Login</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", marginBottom: 32 }}>Enter your credentials to continue.</p>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Email Address</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px", borderRadius: 8, width: "100%" }} 
            placeholder="user@example.com"
          />
        </div>
        
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Password</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "12px", borderRadius: 8, width: "100%" }} 
          />
        </div>

        {error && <p style={{ color: "#ff3366", fontSize: "0.8rem", marginBottom: 16, fontWeight: 600 }}>{error}</p>}
        
        <button type="submit" style={{ background: "var(--accent2)", color: "#fff", border: "none", borderRadius: 8, padding: "14px", fontWeight: 700, cursor: "pointer", width: "100%", fontSize: "1rem" }}>
          Login 🔒
        </button>
      </form>
    </div>
  );
}

export default function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ email: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // sessionStorage persists only for the tab session.
    // When the tab is closed, the data is wiped.
    const saved = sessionStorage.getItem("srb-session-email");
    if (saved) setSession({ email: saved });
    setReady(true);
  }, []);

  const handleLogin = (email: string) => {
    // Defense in depth: purge any stale role-preview left by a previous
    // session BEFORE recording the new identity. Otherwise a DJ who logs
    // in on the same tab after a SuperAdmin previewed another role would
    // briefly inherit elevated access before the per-page resolvers catch
    // up. This is the first line of defense; the per-page resolvers are
    // the second.
    try {
      sessionStorage.removeItem(ROLE_PREVIEW_KEY);
    } catch {
      /* noop */
    }
    sessionStorage.setItem("srb-session-email", email);
    setSession({ email });
    window.location.href = "/"; // Force full reload to Overview to reset all state
  };

  const handleLogout = () => {
    // Clear BOTH the session email and any role-preview. Leaving a preview
    // behind would let the next person to log in on this tab inherit it
    // before any per-page resolver runs.
    try {
      sessionStorage.removeItem(ROLE_PREVIEW_KEY);
    } catch {
      /* noop */
    }
    sessionStorage.removeItem("srb-session-email");
    setSession(null);
    window.location.href = "/"; // Send to home and allow LoginPage to take over
  };

  if (!ready) return null;
  if (!session) return <LoginPage onLogin={handleLogin} />;

  return (
    <>
      <VenueSwitcher />
      <Sidebar onLogout={handleLogout} />
      {children}
    </>
  );
}
