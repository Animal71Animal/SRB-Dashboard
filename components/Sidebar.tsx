"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { modules, groupLabels, groupOrder } from "../app/data/modules";
import type { ModuleGroup } from "../app/data/modules";
import { type Role, hasPermission } from "@/lib/auth/roles";

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const groupedModules = groupOrder.reduce((acc, group) => {
  acc[group] = modules.filter((m) => m.group === group);
  return acc;
}, {} as Record<ModuleGroup, typeof modules>);

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<Role>("SuperAdmin");
  const [expandedGroups, setExpandedGroups] = useState<Record<ModuleGroup, boolean>>({
    promotions: true, social: true, analytics: true, operations: true,
  });

  useEffect(() => {
    const savedRole = localStorage.getItem("srb-user-role") as Role;
    if (savedRole) setRole(savedRole);
  }, []);

  // Filter modules based on viewing permissions
  const allowedGroupedModules = groupOrder.reduce((acc, group) => {
    acc[group] = modules.filter((m) => m.group === group && hasPermission(role, "view", m.href));
    return acc;
  }, {} as Record<ModuleGroup, typeof modules>);

  // Only show groups that have at least one allowed module
  const visibleGroups = groupOrder.filter(group => allowedGroupedModules[group].length > 0);

  useEffect(() => {
    const saved = localStorage.getItem("torch-sidebar-groups");
    if (saved) {
      try { setExpandedGroups((prev) => ({ ...prev, ...JSON.parse(saved) })); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("torch-sidebar-groups", JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  const toggleGroup = (group: ModuleGroup) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const isOverviewActive = pathname === "/";

  return (
    <>
      {/* Mobile Menu Button */}
      <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn"
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 100,
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "10px 12px", color: "var(--text)",
          fontSize: "1.2rem", cursor: "pointer", display: "none",
        }}>
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}
        style={{
          width: "220px", minHeight: "100vh", background: "var(--card)",
          borderRight: "1px solid var(--border)", padding: "24px 0",
          display: "flex", flexDirection: "column", flexShrink: 0,
          position: "fixed", left: 0, top: 40, zIndex: 50,
          transition: "transform 0.3s ease",
        }}>

        {/* Logo */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <img src="/images/torch-logo.png" alt="Torch 1" style={{ width: 30, height: 30, objectFit: "contain", borderRadius: 4 }} />
            <img src="/images/torch2-logo.png" alt="Torch 2" style={{ width: 30, height: 30, objectFit: "contain", borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.02em" }}>
            The Torch Operations Center
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 4 }}>
            The Torch Boise
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
          {/* Overview */}
          <Link href="/" onClick={() => setMobileOpen(false)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 20px", fontSize: "0.875rem",
              color: isOverviewActive ? "var(--accent2)" : "var(--text)",
              background: isOverviewActive ? "rgba(201,0,43,0.1)" : "transparent",
              borderLeft: isOverviewActive ? "2px solid var(--accent)" : "2px solid transparent",
              textDecoration: "none", transition: "all 0.15s",
            }}>
            <span style={{ fontSize: "1rem" }}>⚡</span>
            Overview
          </Link>

          {/* Groups */}
          {visibleGroups.map((group) => (
            <div key={group} style={{ marginTop: 16 }}>
              <button onClick={() => toggleGroup(group)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "6px 20px", fontSize: "0.7rem", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)",
                  background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                }}>
                <span>{groupLabels[group]}</span>
                <ChevronIcon expanded={expandedGroups[group]} />
              </button>

              <div style={{
                maxHeight: expandedGroups[group] ? "2000px" : "0",
                overflow: "hidden", transition: "max-height 0.25s ease, opacity 0.2s",
                opacity: expandedGroups[group] ? 1 : 0,
              }}>
                {allowedGroupedModules[group].map((item) => {
                  const active = pathname === item.href;
                  return (
                    <div key={item.href}>
                      <Link href={item.href} onClick={() => setMobileOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 20px", fontSize: "0.875rem",
                          color: active ? "var(--accent2)" : "var(--text)",
                          background: active ? "rgba(201,0,43,0.1)" : "transparent",
                          borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                          textDecoration: "none", transition: "all 0.15s",
                        }}>
                        <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                        {item.title}
                      </Link>

                      {/* Admin Console Sub-tab (always visible under Broadcast) */}
                      {item.href === "/torchtv" && (
                        <a href="https://12b0afb612.abacusai.cloud/admin" target="_blank" rel="noopener noreferrer"
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "6px 20px 6px 45px", fontSize: "0.75rem",
                            color: "var(--muted)", textDecoration: "none", transition: "all 0.15s",
                          }}>
                          <span style={{ fontSize: "0.8rem" }}>⚙️</span>
                          Admin Console ↗
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", fontSize: "0.7rem", color: "var(--muted)" }}>
          <div>PriScylla 🦞 online</div>
        </div>
      </aside>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="mobile-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, display: "none" }} />
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .sidebar { transform: translateX(-100%); }
          .sidebar.mobile-open { transform: translateX(0); }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </>
  );
}
