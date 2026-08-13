"use client";

import { useState, useEffect } from "react";

export type Venue = "torch1" | "torch2" | "combined";

const VENUE_STORAGE_KEY = "torch-active-venue";

const venues: { key: Venue; label: string; short: string }[] = [
  { key: "torch1", label: "Torch 1 — Boise", short: "Torch 1" },
  { key: "torch2", label: "Torch 2 — Coming Soon", short: "Torch 2" },
  { key: "combined", label: "Combined Executive View", short: "Combined" },
];

export function getActiveVenue(): Venue {
  if (typeof window === "undefined") return "combined";
  return (localStorage.getItem(VENUE_STORAGE_KEY) as Venue) || "combined";
}

export function useVenue(): Venue {
  const [venue, setVenue] = useState<Venue>("combined");
  useEffect(() => {
    setVenue(getActiveVenue());
    const handler = () => setVenue(getActiveVenue());
    window.addEventListener("venue-changed", handler);
    return () => window.removeEventListener("venue-changed", handler);
  }, []);
  return venue;
}

export default function VenueSwitcher() {
  const [active, setActive] = useState<Venue>("combined");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setActive(getActiveVenue());
  }, []);

  const switchTo = (v: Venue) => {
    setActive(v);
    setOpen(false);
    localStorage.setItem(VENUE_STORAGE_KEY, v);
    window.dispatchEvent(new Event("venue-changed"));
  };

  const activeVenue = venues.find((v) => v.key === active)!;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: "var(--card)", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "6px 16px", gap: 8,
    }}>
      <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Venue
      </span>
      <button onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "4px 12px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 600,
          border: "1px solid var(--border)", background: "var(--bg)",
          color: "var(--text)", cursor: "pointer",
        }}>
        <span style={{
          width: 10, height: 10, borderRadius: "50%",
          background: active === "torch1" ? "#fb923c" : active === "torch2" ? "#facc15" : "#dc2626",
          border: active === "torch2" ? "1px solid rgba(0,0,0,0.2)" : "none",
          display: "inline-block",
        }} />
        {activeVenue.short}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: -1 }} />
          <div style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            marginTop: 4, background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 10, padding: 6, boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            display: "flex", flexDirection: "column", gap: 2, minWidth: 200,
          }}>
            {venues.map((v) => (
              <button key={v.key} onClick={() => switchTo(v.key)}
                style={{
                  padding: "10px 14px", borderRadius: 6, fontSize: "0.85rem",
                  border: "none", background: active === v.key ? "rgba(201,0,43,0.1)" : "transparent",
                  color: active === v.key ? "var(--accent)" : "var(--text)",
                  cursor: "pointer", textAlign: "left", fontWeight: active === v.key ? 600 : 400,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                <span style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: v.key === "torch1" ? "#fb923c" : v.key === "torch2" ? "#facc15" : "#dc2626",
                  border: v.key === "torch2" ? "1px solid rgba(0,0,0,0.2)" : "none",
                  display: "inline-block", flexShrink: 0,
                }} />
                {v.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
