"use client";

import AnimatedBackground from "@/components/AnimatedBackground";
import Link from "next/link";
import { type Role, hasPermission } from "@/lib/auth/roles";
import { useEffect, useState } from "react";

const KPI_CARD_STYLE = {
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(201,0,43,0.3)",
  borderRadius: "12px",
  padding: "24px",
  transition: "all 0.2s ease",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
  textDecoration: "none",
};

export default function DjMcCommunicationPage() {
  const [role, setRole] = useState<Role>("Employee");

  useEffect(() => {
    const checkRole = async () => {
      const preview = sessionStorage.getItem("srb-role-preview");
      if (preview) {
        setRole(preview as Role);
        return;
      }
      const email = sessionStorage.getItem("srb-session-email");
      if (!email) return;

      const res = await fetch("/api/users");
      const d = await res.json();
      const matched = (d.users || []).find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) setRole(matched.role);
    };
    checkRole();
  }, []);

  const tabs = [
    { href: "/dj-mc-communications/schedules", title: "Schedules", desc: "View upcoming DJ & MC shift rotations.", icon: "📅" },
    { href: "/dj-mc-communications/messaging", title: "Messaging", desc: "Secure internal board for staff communication.", icon: "💬" },
    { href: "/dj-mc-communications/equipment-reports", title: "Equipment Reports", desc: "Report issues or status of Torch equipment.", icon: "🛠️" },
    { href: "/dj-mc-communications/passwords", title: "Passwords", desc: "Access the TOC Credential Vault.", icon: "🔑" },
  ];

  return (
    <div className="relative min-h-screen p-8 text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div style={{ marginBottom: "32px" }}>
          <h1 className="text-4xl font-black tracking-tighter" style={{ color: "var(--accent)" }}>DJ/MC COMMUNICATIONS</h1>
          <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold">Torch Staff Operations Hub</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href} style={KPI_CARD_STYLE} 
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--accent2)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.background = "rgba(201,0,43,0.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(201,0,43,0.3)";
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.background = "rgba(0,0,0,0.6)";
              }}
            >
              <div style={{ fontSize: "2.5rem" }}>{tab.icon}</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent2)" }}>{tab.title}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.4 }}>{tab.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

