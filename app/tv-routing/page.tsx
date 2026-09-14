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

      {/* Quick Presets */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
        padding: 24, marginBottom: 24
      }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Quick Presets</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { name: "All Sports", routes: [{s:"src-1",o:"out-1"},{s:"src-1",o:"out-2"},{s:"src-1",o:"out-3"},{s:"src-1",o:"out-4"}] },
            { name: "Split Games", routes: [{s:"src-1",o:"out-1"},{s:"src-2",o:"out-2"},{s:"src-1",o:"out-3"},{s:"src-2",o:"out-4"}] },
            { name: "Music Video Mode", routes: [{s:"src-3",o:"out-1"},{s:"src-3",o:"out-2"},{s:"src-3",o:"out-3"},{s:"src-3",o:"out-4"}] },
            { name: "TorchTV Everywhere", routes: [{s:"src-4",o:"out-1"},{s:"src-4",o:"out-2"},{s:"src-4",o:"out-3"},{s:"src-4",o:"out-4"}] },
            { name: "DJ Booth Only", routes: [{s:"src-3",o:"out-3"}] },
            { name: "Clear All", routes: [] },
          ].map(preset => (
            <button
              key={preset.name}
              onClick={() => {
                // Clear all first
                setChannels(prev => prev.map(ch => ({ ...ch, output: null })));
                // Apply preset routes
                preset.routes.forEach(r => {
                  const ch = channels.find(c => c.source === r.s);
                  if (ch) setOutput(ch.id, r.o);
                });
              }}
              style={{
                background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8,
                padding: "12px 16px", cursor: "pointer", color: "var(--text)",
                fontSize: "0.85rem", fontWeight: 600, textAlign: "left",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,0,43,0.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--bg)";
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Routing Summary */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
        padding: 24
      }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Active Routing</h3>
        {channels.filter(ch => ch.output).length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>No active routes — click the matrix or a preset above.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {channels.filter(ch => ch.output).map(ch => {
              const out = OUTPUTS.find(o => o.id === ch.output);
              const src = SOURCES.find(s => s.id === ch.source);
              return (
                <div key={ch.id} style={{
                  border: `2px solid ${ch.color}`, borderRadius: 8, padding: 12,
                  background: `${ch.color}10`, display: "flex", alignItems: "center", gap: 12
                }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: "50%", background: ch.color,
                    boxShadow: `0 0 8px ${ch.color}80`
                  }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", color: ch.color }}>
                      {src?.label}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      → {out?.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
