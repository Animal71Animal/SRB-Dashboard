"use client";

import { useState, useEffect } from "react";

const IGNITE_BASE_URL = "https://ignite.abacusai.cloud";

/**
 * Renders the embedded Ignite app in an iframe with a per-mount cache-busting
 * query param. The `?cb=<Date.now()>` value is computed on the client on mount,
 * so every fresh load of the dashboard fetches Ignite's index.html anew (which
 * in turn references the current app.js?v=NN) instead of a stale cached frame.
 * Ignite is an SPA that ignores unknown query params, so this is safe.
 */
export default function IgniteFrame() {
  // Empty on the server / first paint so SSR markup matches; filled on mount.
  // We only render the iframe once we have the cache-busted URL, so the browser
  // fetches Ignite exactly once (fresh) instead of loading the base URL first.
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    setSrc(`${IGNITE_BASE_URL}/?cb=${Date.now()}`);
  }, []);

  if (!src) {
    // Keep the panel from collapsing before the iframe mounts.
    return <div style={{ width: "100%", height: "82vh" }} aria-hidden="true" />;
  }

  return (
    <iframe
      src={src}
      title="Ignite App"
      allow="clipboard-write; fullscreen; web-share"
      style={{ width: "100%", height: "82vh", border: 0, display: "block" }}
    />
  );
}
