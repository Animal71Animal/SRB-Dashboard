"use client";

import { useState } from "react";

interface Channel {
  id: string;
  name: string;
  source: string;
  output: string | null;
  color: string;
}

const SOURCES = [
  { id: "src-1", label: "DirecTV 1", color: "#8b5cf6" },
  { id: "src-2", label: "DirecTV 2", color: "#3b82f6" },
  { id: "src-3", label: "Music Videos", color: "#10b981" },
  { id: "src-4", label: "TorchTV/Rotation", color: "#f59e0b" },
];

const OUTPUTS = [
  { id: "out-1", label: "Main Bar L", color: "#ef4444" },
  { id: "out-2", label: "Main Bar R", color: "#ec4899" },
  { id: "out-3", label: "DJ Booth", color: "#f97316" },
  { id: "out-4", label: "Far Room", color: "#06b6d4" },
];

export default function TVRoutingPage() {
  const [channels, setChannels] = useState<Channel[]>([
    { id: "ch-1", name: "Channel 1", source: "src-1", output: "out-1", color: "#8b5cf6" },
    { id: "ch-2", name: "Channel 2", source: "src-2", output: "out-2", color: "#3b82f6" },
    { id: "ch-3", name: "Channel 3", source: "src-3", output: "out-3", color: "#10b981" },
    { id: "ch-4", name: "Channel 4", source: "src-4", output: "out-4", color: "#f59e0b" },
  ]);

  const setOutput = (chId: string, outId: string | null) => {
    setChannels(prev => prev.map(ch =>
      ch.id === chId ? { ...ch, output: outId } : ch
    ));
  };

  return (
    <div>
      <div className="toc-header" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "clamp(1.25rem, 5vw, 1.5rem)", fontWeight: 700, margin: 0 }}>📡 TV Routing</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>
          4×4 matrix — tap any cell to route
        </p>
      </div>

      {/* Input / Output Reference — stacked on mobile, side-by-side on desktop */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
          padding: "16px 20px"
        }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "0.9rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Inputs</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SOURCES.map((src, i) => (
              <div key={src.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", background: src.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 700, color: "#fff", flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: src.color, lineHeight: 1.2 }}>
                  {src.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
          padding: "16px 20px"
        }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "0.9rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Outputs</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {OUTPUTS.map((out, i) => (
              <div key={out.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", background: out.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 700, color: "#fff", flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: out.color, lineHeight: 1.2 }}>
                  {out.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matrix — full-width scrollable on mobile */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
        padding: "16px 12px", overflowX: "auto"
      }}>
        <h3 style={{ margin: "0 0 12px 4px", fontSize: "0.9rem" }}>Live Routing Matrix</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(72px, 1fr))", gap: 6, minWidth: 360 }}>
          {/* Header row */}
          <div style={{ fontWeight: 700, fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", padding: "6px 2px" }}>Src \ Out</div>
          {OUTPUTS.map(out => (
            <div key={out.id} style={{
              fontWeight: 700, fontSize: "0.7rem", padding: "6px 2px",
              textAlign: "center", borderBottom: `2px solid ${out.color}`, color: out.color,
              lineHeight: 1.2, minHeight: 36, display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {out.label}
            </div>
          ))}

          {/* Rows */}
          {SOURCES.map(src => (
            <>
              <div key={`row-${src.id}`} style={{
                fontWeight: 600, fontSize: "0.75rem", padding: "8px 2px",
                display: "flex", alignItems: "center", gap: 6,
                borderRight: `2px solid ${src.color}`, color: src.color,
                lineHeight: 1.2
              }}>
                {src.label}
              </div>
              {OUTPUTS.map(out => {
                const active = channels.some(ch => ch.source === src.id && ch.output === out.id);
                return (
                  <div key={`cell-${src.id}-${out.id}`} style={{
                    padding: 8, display: "flex", alignItems: "center", justifyContent: "center",
                    background: active ? `${src.color}25` : "transparent",
                    border: active ? `2px solid ${src.color}` : "1px dashed var(--border)",
                    borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
                    minHeight: 40,
                  }}
                    onClick={() => {
                      const ch = channels.find(c => c.source === src.id);
                      if (ch) setOutput(ch.id, active ? null : out.id);
                    }}
                  >
                    {active ? (
                      <span style={{ fontSize: "1rem" }}>🔗</span>
                    ) : (
                      <span style={{ fontSize: "1rem", opacity: 0.3 }}>○</span>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: "0.7rem", color: "var(--muted)", paddingLeft: 4 }}>
          Tap cell to toggle. 🔗 = on, ○ = off.
        </div>
      </div>
    </div>
  );
}
