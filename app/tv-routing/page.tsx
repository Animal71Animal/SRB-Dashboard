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
  { id: "src-4", label: "TorchTV", color: "#f59e0b" },
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

  const setSource = (chId: string, srcId: string) => {
    const src = SOURCES.find(s => s.id === srcId);
    setChannels(prev => prev.map(ch =>
      ch.id === chId ? { ...ch, source: srcId, color: src?.color || ch.color } : ch
    ));
  };

  const setOutput = (chId: string, outId: string | null) => {
    setChannels(prev => prev.map(ch =>
      ch.id === chId ? { ...ch, output: outId } : ch
    ));
  };

  const getSourceLabel = (id: string) => SOURCES.find(s => s.id === id)?.label || id;
  const getOutputLabel = (id: string | null) => OUTPUTS.find(o => o.id === id)?.label || "—";

  return (
    <div>
      <div className="toc-header" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>📡 TV Routing</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>
          4×4 matrix — assign any source to any output
        </p>
      </div>

      {/* Matrix Diagram */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
        padding: 24, marginBottom: 24, overflowX: "auto"
      }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Live Routing Matrix</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(140px, 1fr))", gap: 8, minWidth: 700 }}>
          {/* Header row */}
          <div style={{ fontWeight: 700, fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", padding: "8px 4px" }}>Source \ Output</div>
          {OUTPUTS.map(out => (
            <div key={out.id} style={{
              fontWeight: 700, fontSize: "0.8rem", padding: "8px 4px",
              textAlign: "center", borderBottom: `2px solid ${out.color}`, color: out.color
            }}>
              {out.label}
            </div>
          ))}

          {/* Rows */}
          {SOURCES.map(src => (
            <>
              <div key={`row-${src.id}`} style={{
                fontWeight: 600, fontSize: "0.85rem", padding: "12px 4px",
                display: "flex", alignItems: "center", gap: 8,
                borderRight: `2px solid ${src.color}`, color: src.color
              }}>
                {src.label}
              </div>
              {OUTPUTS.map(out => {
                const active = channels.some(ch => ch.source === src.id && ch.output === out.id);
                return (
                  <div key={`cell-${src.id}-${out.id}`} style={{
                    padding: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    background: active ? `${src.color}20` : "transparent",
                    border: active ? `2px solid ${src.color}` : "1px dashed var(--border)",
                    borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                  }}
                    onClick={() => {
                      const ch = channels.find(c => c.source === src.id);
                      if (ch) setOutput(ch.id, active ? null : out.id);
                    }}
                  >
                    {active ? (
                      <span style={{ fontSize: "1.2rem" }}>🔗</span>
                    ) : (
                      <span style={{ fontSize: "1.2rem", opacity: 0.3 }}>○</span>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: "0.75rem", color: "var(--muted)" }}>
          Click any cell to toggle connection. 🔗 = active, ○ = inactive.
        </div>
      </div>

      {/* Input / Output Reference */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
          padding: 24
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Inputs (Sources)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SOURCES.map((src, i) => (
              <div key={src.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", background: src.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: src.color }}>
                    {src.label}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    Input {i + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
          padding: 24
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Outputs (Displays)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {OUTPUTS.map((out, i) => (
              <div key={out.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", background: out.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: out.color }}>
                    {out.label}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    Output {i + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
