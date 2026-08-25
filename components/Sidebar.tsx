"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { modules, groupLabels, groupOrder } from "../app/data/modules";
import type { ModuleGroup } from "../app/data/modules";
import { type Role, hasPermission, resolveClientRole, canUseRolePreview, clearRolePreview, ROLE_PREVIEW_KEY } from "@/lib/auth/roles";

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

export default function Sidebar({ onLogout }: { onLogout?: () => void }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<Role>("Employee");
  const [actualRole, setActualRole] = useState<Role>("Employee");
  const [isSuper, setIsSuper] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<ModuleGroup, boolean>>({
    promotions: true, social: true, analytics: true, operations: true,
  });
  const [djMcExpanded, setDjMcExpanded] = useState(false);

  useEffect(() => {
    // Expand DJ/MC if current path is a sub-route
    if (pathname.startsWith("/dj-mc-communications/")) {
      setDjMcExpanded(true);
    }

    const handleExpand = () => setDjMcExpanded(true);
    window.addEventListener("expand-dj-mc", handleExpand);
    return () => window.removeEventListener("expand-dj-mc", handleExpand);
  }, [pathname]);

  useEffect(() => {
    // Resolve role through the central helper. This validates any stored
    // role-preview against the actual authenticated user — non-SuperAdmins
    // never inherit an elevated preview.
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

    window.addEventListener("storage", checkRole);
    window.addEventListener("venue-changed", checkRole);
    return () => {
      window.removeEventListener("storage", checkRole);
      window.removeEventListener("venue-changed", checkRole);
    };
  }, [pathname]);

  // Filter modules based on viewing permissions
  const allowedGroupedModules = groupOrder.reduce((acc, group) => {
    acc[group] = modules.filter((m) => m.group === group && hasPermission(role, "view", m.href));
    return acc;
  }, {} as Record<ModuleGroup, typeof modules>);

  // Only show groups that have at least one allowed module
  const visibleGroups = groupOrder.filter(group => (allowedGroupedModules[group]?.length || 0) > 0);

  const preview = typeof window !== "undefined" ? sessionStorage.getItem(ROLE_PREVIEW_KEY) : null;

  // Real role check for admin tools visibility — uses the central helper so
  // the preview UI is only exposed to actual SuperAdmins.
  useEffect(() => {
    const checkActual = async () => {
      const ok = await canUseRolePreview();
      if (!ok) {
        setActualRole("Employee");
        setIsSuper(false);
        // Purge any stale preview left by a previous session.
        clearRolePreview();
        return;
      }
      // It's a SuperAdmin — fetch actual role for the badge/label.
      const res = await fetch("/api/users");
      const d = await res.json();
      const email = sessionStorage.getItem("srb-session-email");
      const matched = email
        ? (d.users || []).find((u: any) => u.email.toLowerCase() === email.toLowerCase())
        : null;
      setActualRole(matched?.role ?? "Employee");
      setIsSuper(true);
    };
    checkActual();
  }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("torch-sidebar-groups") : null;
    if (saved) {
      try { setExpandedGroups((prev) => ({ ...prev, ...JSON.parse(saved) })); } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("torch-sidebar-groups", JSON.stringify(expandedGroups));
    }
  }, [expandedGroups]);

  const toggleGroup = (group: ModuleGroup) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const isOverviewActive = pathname === "/";

  // Role Preview logic — only functional when the actual user is SuperAdmin.
  const handleRolePreview = (pRole: Role) => {
    if (!isSuper) return; // Hard guard: never let a non-SuperAdmin set a preview.
    sessionStorage.setItem(ROLE_PREVIEW_KEY, pRole);
    window.dispatchEvent(new Event("venue-changed"));
    window.dispatchEvent(new Event("storage")); // Trigger role update in components
    setMobileOpen(false);
    window.location.href = "/";
  };

  const handleClearRolePreview = () => {
    clearRolePreview();
  };

  const activeRole = typeof window !== "undefined" ? sessionStorage.getItem(ROLE_PREVIEW_KEY) : null;

  return (
    <>
      {/* Mobile Menu Button — sits below the VenueSwitcher (header height).
          Uses a fixed offset that adapts at the 768px breakpoint via
          globals.css .mobile-menu-btn. */}
      <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn"
        aria-label="Open navigation"
        style={{
          position: "fixed",
          top: "calc(var(--header-height) + 6px)",
          left: 12, zIndex: 60,
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "8px 12px", color: "var(--text)",
          fontSize: "1.1rem", cursor: "pointer", display: "none",
          lineHeight: 1,
        }}>
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}
        style={{
          width: "220px", height: "100vh", background: "var(--card)",
          borderRight: "1px solid var(--border)", padding: "16px 0",
          display: "flex", flexDirection: "column", flexShrink: 0,
          position: "fixed", left: 0, top: 0, zIndex: 50,
          overflow: "hidden",
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
        <nav style={{ flex: 1, minHeight: 0, padding: "10px 0", overflowY: "auto", overflowX: "hidden" }}>
          {/* Overview */}
          <Link href="/" onClick={() => setMobileOpen(false)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "7px 16px", fontSize: "0.78rem",
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
                      {item.href === "/dj-mc-communications" ? (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setDjMcExpanded(!djMcExpanded);
                          }}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            width: "101%", padding: "7px 16px", fontSize: "0.78rem",
                            color: pathname.startsWith("/dj-mc-communications") ? "var(--accent2)" : "var(--text)",
                            background: pathname.startsWith("/dj-mc-communications") ? "rgba(201,0,43,0.1)" : "transparent",
                            borderLeft: pathname.startsWith("/dj-mc-communications") ? "2px solid var(--accent)" : "2px solid transparent",
                            textDecoration: "none", transition: "all 0.15s", border: "none", cursor: "pointer", textAlign: "left"
                          }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                            {item.title}
                          </div>
                          <ChevronIcon expanded={djMcExpanded} />
                        </button>
                      ) : (
                        <Link href={item.href} onClick={() => setMobileOpen(false)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "7px 16px", fontSize: "0.78rem",
                            color: active ? "var(--accent2)" : "var(--text)",
                            background: active ? "rgba(201,0,43,0.1)" : "transparent",
                            borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                            textDecoration: "none", transition: "all 0.15s",
                          }}>
                          <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                          {item.title}
                        </Link>
                      )}

                      {/* Admin Console Sub-tab */}
                      {item.href === "/torchtv" && hasPermission(role, "special", "admin-console") && (
                        <a href="https://12b0afb612.abacusai.cloud/admin" target="_blank" rel="noopener noreferrer"
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "5px 16px 5px 36px", fontSize: "0.68rem",
                            color: "var(--muted)", textDecoration: "none", transition: "all 0.15s",
                          }}>
                          <span style={{ fontSize: "0.8rem" }}>⚙️</span>
                          Admin Console ↗
                        </a>
                      )}

                      {/* Sub-tabs for DJ/MC Communications */}
                      {item.href === "/dj-mc-communications" && (
                        <div style={{
                          maxHeight: djMcExpanded ? "500px" : "0",
                          overflow: "hidden", transition: "max-height 0.2s ease",
                          display: "flex", flexDirection: "column"
                        }}>
                          {[
                            { href: "/dj-mc-communications/schedules", title: "Schedules", icon: "📅" },
                            { href: "/dj-mc-communications/promotional-materials", title: "Promotional Materials", icon: "📣" },
                            { href: "/dj-mc-communications/stage-announcement-ideas", title: "Stage Announcement Ideas", icon: "🎙️" },
                            { href: "/dj-mc-communications/messaging", title: "Messaging", icon: "💬" },
                            { href: "/dj-mc-communications/equipment-reports", title: "Equipment Reports", icon: "🛠️" },
                            { href: "/dj-mc-communications/passwords", title: "Passwords", icon: "🔑" },
                          ].map(sub => (
                            <Link key={sub.href} href={sub.href} onClick={() => setMobileOpen(false)}
                              style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "5px 16px 5px 36px", fontSize: "0.68rem",
                                color: pathname === sub.href ? "var(--accent2)" : "var(--muted)",
                                background: pathname === sub.href ? "rgba(201,0,43,0.1)" : "transparent",
                                textDecoration: "none", transition: "all 0.15s",
                              }}>
                              <span style={{ fontSize: "0.75rem" }}>{sub.icon}</span>
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Role Preview - Admin Only Tool */}
        {isSuper && (
          <div style={{ padding: "8px 20px", borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>
              Role Preview {preview ? `(${preview})` : ""}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {(["SuperAdmin", "Admin", "Manager", "DJ", "Employee"] as Role[]).map(r => (
                <button 
                  key={r}
                  onClick={() => handleRolePreview(r)}
                  style={{
                    fontSize: "0.6rem", padding: "4px", borderRadius: 4, border: "1px solid var(--border)",
                    background: preview === r ? "var(--accent2)" : "var(--bg)",
                    color: preview === r ? "#fff" : "var(--text)", cursor: "pointer"
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", fontSize: "0.65rem", color: "var(--muted)", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          {onLogout && (
            <button 
              onClick={onLogout}
              style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 700, padding: 0 }}
            >
              Logout
            </button>
          )}
        </div>
      </aside>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="mobile-overlay"
          role="presentation"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 40, display: "none" }} />
      )}
    </>
  );
}
