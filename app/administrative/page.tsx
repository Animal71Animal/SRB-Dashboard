"use client";

import Link from "next/link";
import { type Role, hasPermission, resolveClientRole } from "@/lib/auth/roles";
import { useEffect, useState } from "react";

export default function AdministrativePage() {
  const [role, setRole] = useState<Role>("Employee");

  useEffect(() => {
    const checkRole = async () => {
      try {
        const resolved = await resolveClientRole();
        setRole(resolved);
      } catch (err) {
        console.error("Role check failed:", err);
        setRole("Employee");
      }
    };
    checkRole();

    window.addEventListener("venue-changed", checkRole);
    window.addEventListener("storage", checkRole);
    return () => {
      window.removeEventListener("venue-changed", checkRole);
      window.removeEventListener("storage", checkRole);
    };
  }, []);

  const tools = [
    { href: "/comp-codes", title: "Comp Codes", desc: "Issue and track complimentary entry codes for VIPs and promoters.", icon: "🎟️" },
    { href: "/staff-notes", title: "Staff Notes", desc: "Internal-only notes and communications for managers and admins.", icon: "📝" },
    { href: "/builder", title: "Permissions", desc: "Manage staff emails and role-based permissions (SuperAdmin only).", icon: "🛡️" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 1.75rem)", fontWeight: 700, margin: 0 }}>Administrative</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: 4 }}>Internal Tools · Comp Codes, Staff Notes &amp; Permissions</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(clamp(250px, 100%, 300px), 1fr))",
        gap: 16
      }}>
        {tools.filter(t => hasPermission(role, "view", t.href)).map((tool) => (
          <Link key={tool.href} href={tool.href} style={{ textDecoration: "none" }}>
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
              <div style={{ fontSize: "2rem" }}>{tool.icon}</div>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{tool.title}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>{tool.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}