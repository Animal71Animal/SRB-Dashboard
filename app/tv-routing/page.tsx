"use client";

import Link from "next/link";

export default function TVRoutingHubPage() {
  return (
    <div style={{ padding: "12px 4px", maxWidth: 1000, margin: "0 auto" }}>
      <div className="toc-header" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          📡 TV Routing
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem", margin: "8px 0 0", lineHeight: 1.5 }}>
          Reference tool for the DJ booth. Select the venue you're working tonight to preview the current signal routing across all TVs.
          Each venue operates independently — what's set on Torch 1 never affects Torch 2.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <Link
          href="/tv-routing/torch-1"
          style={{
            textDecoration: "none",
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.04))",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "linear-gradient(135deg, #ef4444, #b91c1c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)"
            }}>
              🔥
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)" }}>Torch 1</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Main venue — original SRB</div>
            </div>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>
            Routing reference for the main bar — DirecTV 1/2, music videos, and TorchTV signal across Left/Right Bar TVs, DJ Booth, and Pool Table.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#ef4444", fontWeight: 700, marginTop: 4 }}>
            Open Torch 1 Routing →
          </div>
        </Link>

        <Link
          href="/tv-routing/torch-2"
          style={{
            textDecoration: "none",
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.04))",
            border: "1px solid rgba(59, 130, 246, 0.35)",
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)"
            }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)" }}>Torch 2</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>New venue — independent operations</div>
            </div>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>
            Routing reference for the new venue — same signal sources and TV destinations, fully independent of Torch 1 state. Use when running sound at the new location.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#3b82f6", fontWeight: 700, marginTop: 4 }}>
            Open Torch 2 Routing →
          </div>
        </Link>
      </div>

      <div style={{
        marginTop: 24,
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
        padding: 20
      }}>
        <h3 style={{ margin: "0 0 10px", fontSize: "0.95rem", fontWeight: 700 }}>ℹ️ How this works</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.7 }}>
          <li>These pages are <strong>reference only</strong> — they don't physically switch any TV signals.</li>
          <li>They document where the DJ is sending things on the physical switcher so staff can verify and troubleshoot.</li>
          <li>Each venue tracks its own routing state independently — flipping Torch 1 to Big Game mode does not affect Torch 2.</li>
          <li>Source codes: <strong>1</strong> = DirecTV 1, <strong>2</strong> = DirecTV 2, <strong>3</strong> = Music Videos/Ads, <strong>4</strong> = TorchTV/Stage Rotation.</li>
          <li>Destination codes: <strong>A</strong> = Left Bar, <strong>B</strong> = Right Bar, <strong>C</strong> = DJ Booth, <strong>D</strong> = Pool Table.</li>
        </ul>
      </div>
    </div>
  );
}
