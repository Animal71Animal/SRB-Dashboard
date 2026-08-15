"use client";

import AnimatedBackground from "@/components/AnimatedBackground";
import Link from "next/link";
import { type Role, hasPermission } from "@/lib/auth/roles";
import { useEffect, useState } from "react";

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
    { href: "/dj-mc-communications/schedules", title: "Schedules", desc: "View upcoming shift rotations and floor coverage.", icon: "📅" },
    { href: "/dj-mc-communications/messaging", title: "Messaging", desc: "Internal board for staff updates and requests.", icon: "💬" },
    { href: "/dj-mc-communications/equipment-reports", title: "Equipment Reports", desc: "Status reports and maintenance logs.", icon: "🛠️" },
    { href: "/dj-mc-communications/passwords", title: "Passwords", desc: "Access the secure TOC Credential Vault.", icon: "🔑" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 1.75rem)", fontWeight: 700, margin: 0 }}>DJ/MC Communications</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: 4 }}>The Professional Standard · Your Daily Tools for Success</p>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(clamp(250px, 100%, 300px), 1fr))", 
        gap: 16 
      }}>
        {tabs.filter(t => hasPermission(role, "view", t.href)).map((tab) => (
          <Link key={tab.href} href={tab.href} style={{ textDecoration: "none" }}>
            <div 
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "24px",
                transition: "all 0.15s ease",
                cursor: "pointer",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.background = "rgba(201,0,43,0.07)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--card)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "2rem" }}>{tab.icon}</div>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{tab.title}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>{tab.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
