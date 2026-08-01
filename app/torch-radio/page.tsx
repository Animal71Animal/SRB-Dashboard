"use client";

export default function RhinoRadioPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: "2rem" }}>📻</span>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--accent)" }}>Torch Radio</h1>
            <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Broadcast Hub</div>
          </div>
        </div>
      </div>

      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "48px 24px",
        textAlign: "center",
        color: "var(--muted)",
      }}>
        <div style={{ fontSize: "0.875rem" }}>No content yet.</div>
      </div>
    </div>
  );
}