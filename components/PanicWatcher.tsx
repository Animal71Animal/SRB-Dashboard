"use client";

import { useEffect, useRef, useState } from "react";

// PanicWatcher — app-wide duress/panic alarm for the TOC.
//
// Runs on EVERY page (mounted in the root layout), independent of which tab the
// user is on. It polls the same-origin proxy (/api/ignite-panic/active), and
// when one or more panic alerts are active it draws a full-screen flashing red
// overlay + sounds a warbling siren, regardless of the current route.
//
// Access: runs for any logged-in TOC user (all roles). Login state is the
// presence of the "srb-session-email" session key that RootLayoutWrapper sets.

type PanicAlert = {
  id: number;
  entertainer_name?: string | null;
  venue_name?: string | null;
  venue_id?: number | null;
  created_at?: string | null;
};

const POLL_MS = 3500;

function fmtTime(ts?: string | null): string {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function PanicWatcher() {
  const [alerts, setAlerts] = useState<PanicAlert[]>([]);
  const [flashOn, setFlashOn] = useState(false);
  const [resolving, setResolving] = useState<Record<number, boolean>>({});

  // WebAudio siren refs
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const warbleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasAlerts = alerts.length > 0;

  // ---- polling loop (only while logged in) ----
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const loggedIn = () => {
      try {
        return !!sessionStorage.getItem("srb-session-email");
      } catch {
        return false;
      }
    };

    const poll = async () => {
      if (cancelled) return;
      if (!loggedIn()) {
        // Not logged in — make sure nothing is alarming, then re-check later.
        setAlerts((prev) => (prev.length ? [] : prev));
        timer = setTimeout(poll, POLL_MS);
        return;
      }
      try {
        const res = await fetch("/api/ignite-panic/active", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setAlerts(Array.isArray(data) ? data : []);
        }
      } catch {
        // transient — leave current state, try again next tick
      }
      if (!cancelled) timer = setTimeout(poll, POLL_MS);
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // ---- red flash animation ----
  useEffect(() => {
    if (!hasAlerts) {
      setFlashOn(false);
      return;
    }
    const iv = setInterval(() => setFlashOn((f) => !f), 500);
    return () => clearInterval(iv);
  }, [hasAlerts]);

  // ---- siren: warbling WebAudio oscillator while any alert is active ----
  useEffect(() => {
    function startSiren() {
      if (oscRef.current) return;
      try {
        const AudioCtor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtor) return;
        const ctx = ctxRef.current || new AudioCtor();
        ctxRef.current = ctx;
        if (ctx.state === "suspended") ctx.resume().catch(() => {});
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        gain.gain.value = 0.16;
        osc.connect(gain);
        gain.connect(ctx.destination);
        let hi = false;
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        warbleRef.current = setInterval(() => {
          hi = !hi;
          try {
            osc.frequency.setValueAtTime(hi ? 988 : 660, ctx.currentTime);
          } catch {
            /* ignore */
          }
        }, 450);
        osc.start();
        oscRef.current = osc;
      } catch {
        /* audio blocked — visual alarm still shows */
      }
    }
    function stopSiren() {
      if (warbleRef.current) {
        clearInterval(warbleRef.current);
        warbleRef.current = null;
      }
      if (oscRef.current) {
        try {
          oscRef.current.stop();
        } catch {
          /* ignore */
        }
        oscRef.current = null;
      }
    }

    if (hasAlerts) startSiren();
    else stopSiren();
    return () => {
      // On unmount, ensure siren is stopped.
      if (!hasAlerts) stopSiren();
    };
  }, [hasAlerts]);

  // Stop siren fully when component unmounts.
  useEffect(() => {
    return () => {
      if (warbleRef.current) clearInterval(warbleRef.current);
      if (oscRef.current) {
        try {
          oscRef.current.stop();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  async function resolve(id: number) {
    setResolving((r) => ({ ...r, [id]: true }));
    try {
      await fetch("/api/ignite-panic/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      /* ignore — next poll will reflect reality */
    }
    // Optimistically drop it; the poll will confirm.
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setResolving((r) => {
      const n = { ...r };
      delete n[id];
      return n;
    });
  }

  if (!hasAlerts) return null;

  return (
    <div
      role="alertdialog"
      aria-label="Emergency panic alert"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: flashOn ? "rgba(180,0,0,0.92)" : "rgba(80,0,0,0.88)",
        transition: "background 180ms linear",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          textAlign: "center",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "clamp(1.8rem, 6vw, 3rem)",
            fontWeight: 900,
            letterSpacing: "0.04em",
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            marginBottom: 6,
          }}
        >
          🚨 EMERGENCY ALERT
        </div>
        <div
          style={{
            fontSize: "clamp(1rem, 3vw, 1.25rem)",
            fontWeight: 700,
            marginBottom: 22,
            opacity: 0.95,
          }}
        >
          {alerts.length > 1
            ? `${alerts.length} entertainers need help`
            : "An entertainer needs help right now"}
        </div>

        {alerts.map((a) => (
          <div
            key={a.id}
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: 16,
              padding: "18px 20px",
              marginBottom: 16,
              boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(1.2rem, 4vw, 1.6rem)",
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              🚨 {a.entertainer_name || "An entertainer"} needs help
            </div>
            <div
              style={{
                fontSize: "0.95rem",
                opacity: 0.9,
                marginBottom: 16,
              }}
            >
              📍 {a.venue_name || "Location unknown"}
              {a.created_at ? ` · ${fmtTime(a.created_at)}` : ""}
            </div>
            <button
              onClick={() => resolve(a.id)}
              disabled={!!resolving[a.id]}
              style={{
                width: "100%",
                padding: "14px 18px",
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "#7f1d1d",
                background: "#fff",
                border: "none",
                borderRadius: 12,
                cursor: resolving[a.id] ? "default" : "pointer",
                opacity: resolving[a.id] ? 0.7 : 1,
              }}
            >
              {resolving[a.id] ? "Resolving…" : "✓ Acknowledge & Resolve"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
