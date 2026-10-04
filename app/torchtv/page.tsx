"use client";

import { useState, useEffect } from "react";

const TORCHTV_BASE = "https://12b0afb612.abacusai.cloud/watch";

function buildSrc(venue: string) {
  if (!venue) return TORCHTV_BASE;
  return `${TORCHTV_BASE}?venue=${encodeURIComponent(venue)}`;
}

export default function TorchTVPage() {
  // Empty string = no venue chosen yet this session → TorchTV loads full screen,
  // no rotation heartbeat active, split never triggers.
  const [venue, setVenue] = useState<string>("");

  useEffect(() => {
    // Restore venue if DJ already selected one earlier this session
    // (e.g. they opened Stage Rotation then navigated here).
    const saved = sessionStorage.getItem("torch-rotation-venue") || "";
    if (saved) setVenue(saved);

    // Live-update when the DJ clicks Torch 1 or Torch 2 in the sidebar
    // while already on this page (includes mid-session venue correction).
    const handler = (e: Event) => {
      const v = (e as CustomEvent<string>).detail || "";
      if (v) setVenue(v);
    };
    window.addEventListener("torch-rotation-venue-selected", handler);
    return () => window.removeEventListener("torch-rotation-venue-selected", handler);
  }, []);

  const iframeSrc = buildSrc(venue);

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="toc-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span style={{ fontSize: "2rem", flexShrink: 0 }}>📺</span>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--accent)" }}>
              TorchTV — Master Broadcast
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>
              {venue
                ? `Linked to ${venue === "TORCH_1" ? "🟠 Torch 1" : "🟡 Torch 2"} Stage Rotation`
                : "Open Stage Rotation in the sidebar to activate the split view"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Player Area */}
      <div style={{
        flex: 1,
        background: "#000",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--border)",
        position: "relative",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
      }}>
        {/* venue key forces iframe reload when venue changes */}
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
          allow="autoplay; fullscreen"
        />

        {/* Launch in New Window overlay */}
        <div style={{
          position: "absolute", bottom: 20, right: 20, zIndex: 10,
          background: "rgba(0,0,0,0.7)", padding: "10px 16px", borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(4px)"
        }}>
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fff", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
          >
            <span>Launch in New Window</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
