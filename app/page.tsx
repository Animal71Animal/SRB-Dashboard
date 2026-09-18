"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useVenue } from "@/components/VenueSwitcher";
import { groupModules, groupLabels, groupOrder, type ModuleGroup, subTabs } from "./data/modules";
import { type Role, hasPermission, resolveClientRole } from "@/lib/auth/roles";

const CARD = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "20px 24px",
};

function KpiCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div style={{ ...CARD, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: "2rem" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--accent2)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

function ModuleCard({ href, icon, title, desc, onClick }: { href: string; icon: string; title: string; desc: string; onClick?: () => void }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }} onClick={onClick}>
      <div style={{
        ...CARD, cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
        minHeight: 100,
      }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(201,0,43,0.07)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLDivElement).style.background = "var(--card)";
        }}>
        <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{icon}</div>
        <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{desc}</div>
      </div>
    </Link>
  );
}

function SubModuleCard({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "12px 16px",
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
        minHeight: 80,
      }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(201,0,43,0.07)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLDivElement).style.background = "var(--card)";
        }}>
        <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{icon}</div>
        <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{desc}</div>
      </div>
    </Link>
  );
}

export default function OverviewPage() {
  const [role, setRole] = useState<Role>("Employee");
  const [events, setEvents] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<ModuleGroup | null>(null);
  const [notifPermission, setNotifPermission] = useState<string>("default");
  const venue = useVenue();

  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const triggerTestNotification = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }
    
    Notification.requestPermission().then((permission) => {
      setNotifPermission(permission);
      if (permission === "granted") {
        try {
          const notif = new Notification("Torch DJ's Message Board", {
            body: "Verification works! system alerts are fully configured.",
            icon: "/images/torch-logo.png",
            requireInteraction: true
          });
          
          notif.onclick = () => {
            window.focus();
          };
          
          notif.onerror = (e) => {
            console.error("Notification trigger onerror:", e);
            alert("Notification threw an error. This is usually caused by Operating System absolute blocks (Mac Do Not Disturb / Focus Mode, Windows Focus Assist, or Chrome system permission disabled).");
          };
        } catch (err) {
          console.error("Notification constructor threw directly:", err);
          alert("A standard browser API block was hit. If you're on a mobile device (iPhone/Android browser), native Web Notifications are restricted unless added as a PWA (Home Screen shortcut). On desktop, ensure system notifications are globally enabled.");
        }
      } else {
        alert(`Notification permission was: ${permission}. Check your browser settings to allow them.`);
      }
    });
  };

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

  useEffect(() => {
    const v = `?venue=${venue}`;
    Promise.all([
      fetch(`/api/events${v}`).then((r) => r.json()).catch(() => ({})),
      fetch(`/api/campaigns${v}`).then((r) => r.json()).catch(() => []),
      fetch(`/api/influencers${v}`).then((r) => r.json()).catch(() => []),
      fetch(`/api/social-calendar${v}`).then((r) => r.json()).catch(() => []),
    ]).then(([eventsData, campaignsData, influencersData, socialData]) => {
      const oneOffs = (eventsData?.oneOffs ?? []).map((e: any) => ({ ...e, _kind: "oneoff" }));
      const seriesDates = (eventsData?.series ?? []).flatMap((s: any) =>
        (s.dates ?? []).map((date: string) => ({ id: s.id, date, name: s.name, theme: s.theme, status: s.status, _kind: "series" }))
      );
      setEvents([...oneOffs, ...seriesDates]);
      setCampaigns(campaignsData);
      setInfluencers(influencersData);
      setSocialPosts(socialData);
      setLoading(false);
    });
  }, [venue]);

  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  const thisWeekEvents = events.filter((e) => e.date >= today && e.date <= nextWeek).length;
  const activeCampaigns = campaigns.filter((c) => c.status === "Active").length;
  const activeInfluencers = influencers.filter((i) => i.partnershipStatus === "Active").length;
  const scheduledPosts = socialPosts.filter((p) => p.status === "Scheduled").length;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Pick the representative module for each group (first one with view permission)
  const visibleGroups = groupOrder.map(g => {
    const items = groupModules[g].filter(m => {
      if (m.href === "/builder") return hasPermission(role, "special", "builder");
      if (m.href === "/director-admin") return hasPermission(role, "special", "director-admin");
      return hasPermission(role, "view", m.href);
    });
    return { group: g, items, label: groupLabels[g], first: items[0] };
  }).filter(g => g.items.length > 0 && g.first);

  // When a group is active, show its sub-tabs (modules in that group + any registered subTabs)
  const activeGroupData = activeGroup ? visibleGroups.find(g => g.group === activeGroup) : null;
  const activeSubTabs = activeGroupData ? [
    ...activeGroupData.items,
    ...(Object.entries(subTabs).flatMap(([parentHref, tabs]) =>
      activeGroupData.items.some(i => i.href === parentHref) ? tabs : []
    )),
  ].filter(m => hasPermission(role, "view", m.href)) : [];

  return (
    <div>
      {/* Header */}
      <div className="toc-header" style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
        <img src="/images/torch-logo.png" alt="The Torch" style={{ width: 56, height: 56, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: "clamp(1.25rem, 4.5vw, 1.75rem)", fontWeight: 700, color: "var(--accent)", margin: 0, lineHeight: 1.1 }}>
            The Torch Operations Center
          </h1>
          <div style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: 4 }}>{dateStr}</div>
        </div>
      </div>

      {/* KPI Cards */}
      {(role === "SuperAdmin" || role === "Admin") && (
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
          <KpiCard label="Upcoming Events This Week" value={thisWeekEvents} icon="📅" />
          <KpiCard label="Active Promo Campaigns" value={activeCampaigns} icon="📢" />
          <KpiCard label="Influencer Partners" value={activeInfluencers} icon="⭐" />
          <KpiCard label="Social Posts Scheduled" value={socialPosts.filter(p => p.status === "Scheduled").length} icon="📱" />
        </div>
      )}

      {/* Notification Debug Card */}
      <div style={{
        ...CARD,
        background: "rgba(147, 51, 234, 0.05)",
        border: "1px solid rgba(147, 51, 234, 0.2)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 16, marginBottom: 40
      }}>
        <div>
          <div style={{ fontWeight: 650, color: "rgba(147, 51, 234, 0.82)" }}>🚀 Notification Debugger</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
            Permission state: <strong style={{ textTransform: "uppercase" }}>{notifPermission}</strong>
          </div>
        </div>
        <button 
          onClick={triggerTestNotification}
          style={{
            background: "rgb(126, 34, 206)", color: "#fff", border: "none",
            borderRadius: 6, padding: "8px 16px", fontSize: "0.8rem", fontWeight: 700,
            cursor: "pointer"
          }}
        >
          Send Test Notification
        </button>
      </div>

      {role === "Employee" && (
        <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
          <Link href="/dj-mc-communications/schedules" style={{ textDecoration: "none" }}>
            <KpiCard label="View DJ Schedule" value="LIVE" icon="📅" />
          </Link>
        </div>
      )}

      {/* Breadcrumb / back button when inside a group */}
      {activeGroup && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setActiveGroup(null)}
            style={{
              background: "none", border: "none", color: "var(--accent)", cursor: "pointer",
              fontSize: "0.875rem", fontWeight: 600, padding: 0,
            }}
          >
            ← Back to Quick Access
          </button>
        </div>
      )}

      <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
        {activeGroup ? groupLabels[activeGroup] : "Quick Access"}
      </h2>

      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        {activeGroup ? (
          // Show all modules + sub-tabs within the selected group
          activeSubTabs.map((m) => (
            <SubModuleCard key={m.href} href={m.href} icon={m.icon} title={m.title} desc={m.desc} />
          ))
        ) : (
          // Show 5 group cards (Administrative, Events & Promotions, Social & Influencers, Operations, DJ/MC Communications)
          visibleGroups.map((g) => (
            <ModuleCard
              key={g.group}
              href={g.first!.href}
              icon={g.first!.icon}
              title={g.label}
              desc={`${g.items.length} module${g.items.length !== 1 ? "s" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveGroup(g.group);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
