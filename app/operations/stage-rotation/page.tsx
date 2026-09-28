"use client";

import { useEffect, useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { type Role, resolveClientRole } from "@/lib/auth/roles";

const CARD = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "20px 24px",
};

interface SelectionTileProps {
  title: string;
  icon: string;
  desc: string;
  url: string;
}

function SelectionTile({ title, icon, desc, url }: SelectionTileProps) {
  const handleOpen = () => {
    window.open(url, "torch-rotation", "popup=yes,width=520,height=900");
  };

  return (
    <div
      onClick={handleOpen}
      style={{
        ...CARD,
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
        minHeight: 110,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
        (e.currentTarget as HTMLDivElement).style.background = "rgba(201,0,43,0.07)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.background = "var(--card)";
      }}
    >
      <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{desc}</div>
    </div>
  );
}

export default function StageRotationPage() {
  const [role, setRole] = useState<Role>("Employee");

  useEffect(() => {
    resolveClientRole().then(setRole).catch(() => setRole("Employee"));
  }, []);

  return (
    <div className="relative min-h-screen p-4 md:p-8 text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-4xl mx-auto">
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2.2rem)", fontWeight: 800, color: "var(--accent)", margin: 0 }}>
            💃 Stage Rotation
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "4px 0 0" }}>
            Open the live Stage Rotation manager panels in a separate companion window.
          </p>
        </div>

        {/* Selection Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <SelectionTile
            title="Torch 1 Rotation"
            icon="❶"
            desc="Open the live rotation controller for Torch 1"
            url="https://torchrotation.abacusai.app/?venue=TORCH_1"
          />
          <SelectionTile
            title="Torch 2 Rotation"
            icon="❷"
            desc="Open the live rotation controller for Torch 2"
            url="https://torchrotation.abacusai.app/?venue=TORCH_2"
          />
        </div>

      </div>
    </div>
  );
}
