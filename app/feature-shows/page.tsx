"use client";

import { useState } from "react";

interface Show {
  key: string;
  label: string;
  icon: string;
  url?: string;
  height?: number;
}

const SHOWS: Show[] = [];

export default function FeatureShowsPage() {
  const [activeShow, setActiveShow] = useState<string>(SHOWS[0]?.key ?? "");
  const show = SHOWS.find((s) => s.key === activeShow);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--accent)" }}>🎭 Feature Shows</h1>
        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: "0.85rem" }}>Themed experiences and special-event portals for The Torch.</p>
      </div>

      {/* Feature Shows Subtab Nav */}
      <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid var(--border)" }}>
        {SHOWS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveShow(s.key)}
            style={{
              padding: "10px 22px",
              background: "transparent",
              border: "none",
              borderBottom: activeShow === s.key ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeShow === s.key ? "var(--accent2)" : "var(--muted)",
              fontWeight: activeShow === s.key ? 700 : 400,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Active Show Content */}
      {show?.url ? (
        <div>
          <div style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
              {show.icon} {show.label}
            </h2>
            <p style={{ color: "var(--muted)", marginTop: 4, fontSize: "0.8rem" }}>
              Embedded experience — <a href={show.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent2)" }}>{show.url}</a>
            </p>
          </div>
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <iframe
              src={show.url}
              title={show.label}
              style={{
                width: "100%",
                minHeight: `${show.height ?? 800}px`,
                border: "none",
                display: "block",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <p style={{ color: "var(--muted)" }}>Select a feature show above.</p>
      )}
    </div>
  );
}