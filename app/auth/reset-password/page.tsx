"use client";

import { useEffect, useState } from "react";

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgKind, setMsgKind] = useState<"error" | "info">("info");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("srb-session-email") : null;
    setEmail(stored);
    setReady(true);
  }, []);

  const trimmedPassword = password.trim();
  const trimmedConfirm = confirm.trim();
  const tooShort = trimmedPassword.length > 0 && trimmedPassword.length < MIN_PASSWORD_LENGTH;
  const mismatch = trimmedPassword !== trimmedConfirm;
  const canSubmit =
    !!email &&
    trimmedPassword.length >= MIN_PASSWORD_LENGTH &&
    !mismatch &&
    !saving;

  const handleReset = async () => {
    setMsg("");
    if (!email) {
      setMsgKind("error");
      setMsg("No active session found. Please log in first, then return here to set your password.");
      return;
    }
    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      setMsgKind("error");
      setMsg(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (mismatch) {
      setMsgKind("error");
      setMsg("Passwords must match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-password", email, password: trimmedPassword }),
      });
      if (!res.ok) {
        setMsgKind("error");
        setMsg("Failed to reset password. Please try again.");
        setSaving(false);
        return;
      }
      setMsgKind("info");
      setMsg("Password saved. Redirecting...");
      window.location.href = "/";
    } catch {
      setMsgKind("error");
      setMsg("Connection error while saving.");
      setSaving(false);
    }
  };

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 24, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>Set New Password</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: 24 }}>
        Welcome to the TOC! Please set a unique password for your staff account
        {email ? ` (${email})` : ""}.
      </p>

      {!email && (
        <div style={{ marginBottom: 16, padding: 12, background: "rgba(255,51,102,0.1)", border: "1px solid rgba(255,51,102,0.4)", borderRadius: 6, fontSize: "0.8rem" }}>
          No active session. <a href="/" style={{ color: "var(--accent)", fontWeight: 600 }}>Return to login</a>.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>New Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px", color: "var(--text)" }}
          />
          {tooShort && (
            <div style={{ fontSize: "0.7rem", color: "#ff3366", marginTop: 4 }}>
              Must be at least {MIN_PASSWORD_LENGTH} characters.
            </div>
          )}
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
            style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px", color: "var(--text)" }}
          />
          {confirm.length > 0 && mismatch && (
            <div style={{ fontSize: "0.7rem", color: "#ff3366", marginTop: 4 }}>
              Passwords do not match.
            </div>
          )}
        </div>

        {msg && (
          <div
            style={{
              color: msgKind === "error" ? "#ff3366" : "var(--accent)",
              fontSize: "0.8rem",
            }}
          >
            {msg}
          </div>
        )}

        <button
          onClick={handleReset}
          disabled={!canSubmit}
          style={{
            background: "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "12px",
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.5,
          }}
        >
          {saving ? "SAVING..." : "ACTIVATE ACCOUNT 🔒"}
        </button>
      </div>
    </div>
  );
}