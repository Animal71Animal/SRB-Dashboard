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
  { id: "src-1", label: "🎵 DJ Booth", color: "#8b5cf6" },
  { id: "src-2", label: "📺 Cable TV", color: "#3b82f6" },
  { id: "src-3", label: "🎬 Media Player", color: "#10b981" },
  { id: "src-4", label: "📹 Security Cam", color: "#f59e0b" },
];

const OUTPUTS = [
  { id: "out-1", label: "Main Bar TV", color: "#ef4444" },
  { id: "out-2", label: "VIP Lounge TV", color: "#ec4899" },
  { id: "out-3", label: "Stage Monitor", color: "#f97316" },
  { id: "out-4", label: "Lobby Display", color: "#06b6d4" },
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

      {/* Channel Controls */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
        padding: 24, marginBottom: 24
      }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Channel Controls</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {channels.map(ch => (
            <div key={ch.id} style={{
              border: `2px solid ${ch.color}`, borderRadius: 10, padding: 16,
              background: `${ch.color}10`
            }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 12, color: ch.color }}>
                {ch.name}
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Source</label>
                <select
                  value={ch.source}
                  onChange={(e) => setSource(ch.id, e.target.value)}
                  style={{ width: "100%", marginTop: 4, background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px" }}
                >
                  {SOURCES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Output</label>
                <select
                  value={ch.output || ""}
                  onChange={(e) => setOutput(ch.id, e.target.value || null)}
                  style={{ width: "100%", marginTop: 4, background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px" }}
                >
                  <option value="">— Unassigned —</option>
                  {OUTPUTS.map(o => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--muted)" }}>
                {getSourceLabel(ch.source)} → {getOutputLabel(ch.output)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Output Status */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
        padding: 24
      }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "1rem" }}>Output Status</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {OUTPUTS.map(out => {
            const activeCh = channels.find(ch => ch.output === out.id);
            return (
              <div key={out.id} style={{
                border: `2px solid ${activeCh ? activeCh.color : "var(--border)"}`,
                borderRadius: 8, padding: 12,
                background: activeCh ? `${activeCh.color}10` : "transparent"
              }}>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: out.color }}>
                  {out.label}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>
                  {activeCh ? (
                    <span style={{ color: activeCh.color }}>● {getSourceLabel(activeCh.source)}</span>
                  ) : (
                    <span>○ No signal</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
