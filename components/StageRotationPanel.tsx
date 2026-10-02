"use client";

import { useEffect, useMemo, useState } from "react";

type Venue = "TORCH_1" | "TORCH_2";

const STATE_URL = "https://torchrotation.abacusai.app/api/display/state?source=board";
const PANEL_WIDTH = "33.333%";
const MAIN_WIDTH = "66.667%";

export default function StageRotationPanel() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ venue?: Venue }>).detail;
      const nextVenue = detail?.venue;
      if (!nextVenue) return;

      setVenue((current) => {
        if (current === nextVenue) {
          setActive(false);
          return null;
        }
        setActive(false);
        return nextVenue;
      });
    };

    window.addEventListener("torch-stage-rotation-toggle", handler);
    return () => window.removeEventListener("torch-stage-rotation-toggle", handler);
  }, []);

  useEffect(() => {
    if (!venue) return;

    let cancelled = false;
    const checkState = async () => {
      try {
        const res = await fetch(STATE_URL, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setActive(!!data.active);
      } catch (err) {
        console.error("Stage rotation state check failed:", err);
        if (!cancelled) setActive(false);
      }
    };

    checkState();
    const interval = window.setInterval(checkState, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [venue]);

  useEffect(() => {
    const main = document.querySelector<HTMLElement>(".toc-main");
    if (!main) return;

    main.style.transition = "width 0.4s ease, max-width 0.4s ease, padding-right 0.4s ease";
    if (venue && active) {
      main.style.width = MAIN_WIDTH;
      main.style.maxWidth = MAIN_WIDTH;
      main.style.flex = "0 0 66.667%";
      main.style.paddingRight = "18px";
    } else {
      main.style.width = "";
      main.style.maxWidth = "";
      main.style.flex = "";
      main.style.paddingRight = "";
    }

    return () => {
      main.style.width = "";
      main.style.maxWidth = "";
      main.style.flex = "";
      main.style.paddingRight = "";
    };
  }, [venue, active]);

  const src = useMemo(() => {
    if (!venue) return "about:blank";
    return `https://torchrotation.abacusai.app/display?venue=${venue}&embed=1`;
  }, [venue]);

  return (
    <iframe
      title="Stage Rotation"
      src={venue && active ? src : "about:blank"}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: PANEL_WIDTH,
        height: "100vh",
        border: 0,
        background: "transparent",
        zIndex: 45,
        display: venue && active ? "block" : "none",
      }}
      allowTransparency
    />
  );
}
