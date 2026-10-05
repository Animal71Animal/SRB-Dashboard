"use client";

import { useState } from "react";

interface Route {
  sourceId: string;
  outputId: string;
}

const SOURCES = [
  { id: "src-1", num: "1", label: "DirecTV 1", desc: "Main sports receiver", color: "#ef4444" },
  { id: "src-2", num: "2", label: "DirecTV 2", desc: "Auxiliary sports receiver", color: "#f97316" },
  { id: "src-3", num: "3", label: "Music Videos / Ads", desc: "Computer 1 standard feed", color: "#f59e0b" },
  { id: "src-4", num: "4", label: "TorchTV / Stage Rotation App", desc: "Computer 2 visualization feed", color: "#10b981" },
];

const OUTPUTS = [
  { id: "out-1", letter: "A", label: "Left Bar TV", color: "#ef4444" },
  { id: "out-2", letter: "B", label: "Right Bar TV", color: "#ec4899" },
  { id: "out-3", letter: "C", label: "DJ Booth TV", color: "#3b82f6" },
  { id: "out-4", letter: "D", label: "Pool Table TV", color: "#06b6d4" },
];

export default function TVRoutingPage() {
  const [routes, setRoutes] = useState<Route[]>([
    { sourceId: "src-1", outputId: "out-1" }, // A1
    { sourceId: "src-2", outputId: "out-2" }, // B2
    { sourceId: "src-3", outputId: "out-4" }, // D3
    { sourceId: "src-4", outputId: "out-3" }, // C4
  ]);

  const setRoute = (srcId: string, outId: string) => {
    setRoutes(prev => [
      ...prev.filter(r => r.outputId !== outId),
      { sourceId: srcId, outputId: outId }
    ]);
  };

  const getSourceForOutput = (outId: string) => {
    const r = routes.find(route => route.outputId === outId);
    return r ? SOURCES.find(s => s.id === r.sourceId) : null;
  };

  const applyMostOfTheTime = () => {
    // Keep C (DJ Booth) on Computer 2 (src-4) and D (Pool Table) on Computer 1 (src-3)
    setRoutes(prev => [
      ...prev.filter(r => r.outputId !== "out-3" && r.outputId !== "out-4"),
      { sourceId: "src-4", outputId: "out-3" }, // C4
      { sourceId: "src-3", outputId: "out-4" }, // D3
    ]);
  };

  const applyBigGameOverride = (srcId: string) => {
    // Send every TV to that source
    setRoutes(
      OUTPUTS.map(out => ({ sourceId: srcId, outputId: out.id }))
    );
  };

  return (
    <div style={{ padding: "12px 4px", maxWidth: 1000, margin: "0 auto" }}>
      {/* Header section with instructions summary */}
      <div className="toc-header" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          📡 4×4 TV Routing System
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem", margin: "8px 0 0", lineHeight: 1.5 }}>
          Pick a TV then pick its source. Two steps, every time. A destination letter gets a source number (e.g., <strong style={{ color: "var(--text)" }}>D + 3 = D3</strong>).
        </p>
      </div>

      {/* Grid Layout for Configuration Presets and Diagnostic Info */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 20 }}>
        {/* Preset Override Panel */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16,
          padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between"
        }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 700 }}>⚡ Quick Presets</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0 0 16px" }}>
              Instant configuration templates for typical shifts and events.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Most of the time */}
              <button
                onClick={applyMostOfTheTime}
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: 10, padding: "12px 14px", cursor: "pointer",
                  textAlign: "left", transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.18)"}
                onMouseOut={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)"}
              >
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text)", display: "flex", justifyContent: "space-between" }}>
                  <span>✨ Most of the Time Setup</span>
                  <span style={{ fontSize: "0.75rem", background: "var(--border)", padding: "2px 6px", borderRadius: 4 }}>C4 · D3</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
                  Default DJ Booth (C) to Computer 2 (TorchTV/Rotation) and Pool Table (D) to Computer 1 (Music Videos).
                </div>
              </button>

              {/* Big Game overrides */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => applyBigGameOverride("src-1")}
                  style={{
                    flex: 1, background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: 10, padding: "10px 12px", cursor: "pointer",
                    textAlign: "center", transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.18)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text)" }}>🏈 Big Game (DirecTV 1)</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>Route all TVs to 1</div>
                </button>

                <button
                  onClick={() => applyBigGameOverride("src-2")}
                  style={{
                    flex: 1, background: "rgba(249, 115, 22, 0.1)",
                    border: "1px solid rgba(249, 115, 22, 0.3)",
                    borderRadius: 10, padding: "10px 12px", cursor: "pointer",
                    textAlign: "center", transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(249, 115, 22, 0.18)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(249, 115, 22, 0.1)"}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text)" }}>🏀 Big Game (DirecTV 2)</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>Route all TVs to 2</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Guide Panel */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16,
          padding: 20
        }}>
          <h2 style={{ margin: "0 0 10px", fontSize: "1.1rem", fontWeight: 700 }}>🔧 Troubleshooting & Verification</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.8rem", lineHeight: 1.4 }}>
            <div>
              <strong style={{ color: "#ef4444" }}>Wrong TV changed?</strong>
              <div style={{ color: "var(--muted)" }}>Check you used the correct destination letter (A, B, C, or D).</div>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
              <strong style={{ color: "#f59e0b" }}>Right TV, wrong picture?</strong>
              <div style={{ color: "var(--muted)" }}>Remote: press the correct source number. Switcher: tap output letter repeatedly to cycle.</div>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
              <strong style={{ color: "#10b981" }}>Screen is blank?</strong>
              <div style={{ color: "var(--muted)" }}>Check the chosen source is powered on and awake (PC status).</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Workboard */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16,
        padding: 24, marginBottom: 20
      }}>
        <h2 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontWeight: 700 }}>👁️ Active Live Status & Interactive Routing Matrix</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: -12, marginBottom: 20 }}>
          The active layout of the venue. Tap any row to re-route that destination immediately.
        </p>

        {/* Main interactive grid representing the physical outlets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {OUTPUTS.map(out => {
            const currentSrc = getSourceForOutput(out.id);
            return (
              <div
                key={out.id}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: `1px solid ${currentSrc ? currentSrc.color : "var(--border)"}`,
                  borderRadius: 12, padding: "16px 20px",
                  boxShadow: currentSrc ? `0 0 12px ${currentSrc.color}10` : "none",
                  transition: "all 0.25s ease-in-out",
                }}
              >
                {/* Header row: TV Info on left, Active Source Indicator on right */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: out.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: "1rem", color: "#fff", boxShadow: `0 2px 8px ${out.color}40`
                    }}>
                      {out.letter}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{out.label}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Destination Code: <strong style={{ color: out.color }}>{out.letter}</strong></div>
                    </div>
                  </div>

                  {/* Active routing route bubble */}
                  {currentSrc && (
                    <div style={{
                      background: `${currentSrc.color}15`,
                      border: `1px solid ${currentSrc.color}40`,
                      borderRadius: 30, padding: "6px 14px",
                      display: "flex", alignItems: "center", gap: 8
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: currentSrc.color, boxShadow: `0 0 6px ${currentSrc.color}` }} />
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text)" }}>
                        ROUTE: {out.letter}{currentSrc.num}
                      </span>
                    </div>
                  )}
                </div>

                {/* Input selection buttons representing physical inputs for this exact output */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                  {SOURCES.map(src => {
                    const isSelected = currentSrc && currentSrc.id === src.id;
                    return (
                      <button
                        key={src.id}
                        onClick={() => setRoute(src.id, out.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                          background: isSelected ? src.color : "transparent",
                          border: `1px solid ${isSelected ? src.color : "var(--border)"}`,
                          color: isSelected ? "#fff" : "var(--text)",
                          textAlign: "left", transition: "all 0.15s ease",
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%",
                          background: isSelected ? "rgba(255,255,255,0.25)" : "var(--border)",
                          color: isSelected ? "#fff" : "var(--muted)",
                          display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
                          fontSize: "0.75rem", fontWeight: 700, flexShrink: 0
                        }}>
                          {src.num}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {src.label}
                          </div>
                          <div style={{ fontSize: "0.65rem", opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {src.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}