"use client";

import { useState } from "react";

interface Route {
  sourceId: string;
  outputId: string;
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
  { id: "out-4", label: "Pool Table", color: "#06b6d4" },
];

export default function TVRoutingPage() {
  const [routes, setRoutes] = useState<Route[]>([
    { sourceId: "src-1", outputId: "out-1" },
    { sourceId: "src-2", outputId: "out-2" },
    { sourceId: "src-3", outputId: "out-3" },
    { sourceId: "src-4", outputId: "out-4" },
  ]);

  const isActive = (srcId: string, outId: string) =>
    routes.some(r => r.sourceId === srcId && r.outputId === outId);

  const toggle = (srcId: string, outId: string) => {
    setRoutes(prev => {
      const exists = prev.some(r => r.sourceId === srcId && r.outputId === outId);
      if (exists) {
        return prev.filter(r => !(r.sourceId === srcId && r.outputId === outId));
      }
      return [...prev, { sourceId: srcId, outputId: outId }];
    });
  };

  const activeSourceForOutput = (outId: string) => {
    const r = routes.find(route => route.outputId === outId);
    return r ? SOURCES.find(s => s.id === r.sourceId) : null;
  };

  return (
    <div>
      <div className="toc-header" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "clamp(1.25rem, 5vw, 1.5rem)", fontWeight: 700, margin: 0 }}>📡 TV Routing</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>
          4×4 matrix — tap any cell to route. One source can feed multiple outputs.
        </p>
      </div>

      {/* Output Status Bar — shows what's on each screen right now */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
        padding: "14px 16px", marginBottom: 16
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {OUTPUTS.map(out => {
            const src = activeSourceForOutput(out.id);
            return (
              <div key={out.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px", borderRadius: 8,
                background: src ? `${src.color}15` : "transparent",
                border: src ? `1px solid ${src.color}40` : "1px dashed var(--border)",
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: src ? src.color : "var(--border)",
                  boxShadow: src ? `0 0 6px ${src.color}60` : "none",
                  flexShrink: 0
                }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: out.color, lineHeight: 1.2 }}>
                    {out.label}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: src ? src.color : "var(--muted)", lineHeight: 1.2, marginTop: 2 }}>
                    {src ? src.label : "No signal"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input / Output Reference */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
          padding: "14px 16px"
        }}>
          <h3 style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Inputs</h3>
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
          padding: "14px 16px"
        }}>
          <h3 style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Outputs</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {OUTPUTS.map((out, i) => (
              <div key={out.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", background: out.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 700, color: "#fff", flexShrink: 0
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: out.color, lineHeight: 1.2 }}>
                  {out.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matrix — 1:N routing, any source to any output */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
        padding: "14px 10px", overflowX: "auto"
      }}>
        <h3 style={{ margin: "0 0 10px 4px", fontSize: "0.9rem" }}>Live Routing Matrix</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(68px, 1fr))", gap: 5, minWidth: 340 }}>
          {/* Header row */}
          <div style={{ fontWeight: 700, fontSize: "0.6rem", color: "var(--muted)", textTransform: "uppercase", padding: "4px 2px" }}>Src \ Out</div>
          {OUTPUTS.map(out => (
            <div key={out.id} style={{
              fontWeight: 700, fontSize: "0.65rem", padding: "4px 2px",
              textAlign: "center", borderBottom: `2px solid ${out.color}`, color: out.color,
              lineHeight: 1.2, minHeight: 32, display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {out.label}
            </div>
          ))}

          {/* Rows */}
          {SOURCES.map(src => (
            <>
              <div key={`row-${src.id}`} style={{
                fontWeight: 600, fontSize: "0.7rem", padding: "6px 2px",
                display: "flex", alignItems: "center", gap: 4,
                borderRight: `2px solid ${src.color}`, color: src.color,
                lineHeight: 1.2
              }}>
                {src.label}
              </div>
              {OUTPUTS.map(out => {
                const active = isActive(src.id, out.id);
                return (
                  <div key={`cell-${src.id}-${out.id}`} style={{
                    padding: 6, display: "flex", alignItems: "center", justifyContent: "center",
                    background: active ? `${src.color}30` : "transparent",
                    border: active ? `2px solid ${src.color}` : "1px dashed var(--border)",
                    borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
                    minHeight: 36,
                  }}
                    onClick={() => toggle(src.id, out.id)}
                  >
                    {active ? (
                      <span style={{ fontSize: "0.9rem" }}>🔗</span>
                    ) : (
                      <span style={{ fontSize: "0.9rem", opacity: 0.3 }}>○</span>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: "0.7rem", color: "var(--muted)", paddingLeft: 4 }}>
          Tap cell to toggle. One source can feed multiple outputs. 🔗 = on, ○ = off.
        </div>
      </div>
    </div>
  );
}
