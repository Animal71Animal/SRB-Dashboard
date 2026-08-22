"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useVenue } from "@/components/VenueSwitcher";
import { modules } from "./data/modules";
import { type Role, hasPermission } from "@/lib/auth/roles";

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

function ModuleCard({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
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

export default function OverviewPage() {
  const [role, setRole] = useState<Role>("Employee");
  const [events, setEvents] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const venue = useVenue();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const preview = sessionStorage.getItem("srb-role-preview");
        if (preview) {
          setRole(preview as Role);
          return;
        }

        const currentEmail = sessionStorage.getItem("srb-session-email");
        if (!currentEmail) return;

        const res = await fetch("/api/users");
        if (!res.ok) return;
        const d = await res.json();
        const matched = (d.users || []).find((u: any) => u.email.toLowerCase() === currentEmail.toLowerCase());
        if (matched) setRole(matched.role);
      } catch {}
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
      // Flatten events
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

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
        <img src="/images/torch-logo.png" alt="The Torch" style={{ width: 56, height: 56, objectFit: "contain" }} />
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
            The Torch Operations Center
          </h1>
          <div style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: 4 }}>{dateStr}</div>
        </div>
      </div>

      {/* KPI Cards */}
      {(role === "SuperAdmin" || role === "Admin") && (
        <div className="responsive-grid" className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
          <KpiCard label="Upcoming Events This Week" value={thisWeekEvents} icon="📅" />
          <KpiCard label="Active Promo Campaigns" value={activeCampaigns} icon="📢" />
          <KpiCard label="Influencer Partners" value={activeInfluencers} icon="⭐" />
          <KpiCard label="Social Posts Scheduled" value={scheduledPosts} icon="📱" />
        </div>
      )}

      {role === "Employee" && (
        <div className="responsive-grid" className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
          <Link href="/dj-mc-communications/schedules" style={{ textDecoration: "none" }}>
            <KpiCard label="View DJ Schedule" value="LIVE" icon="📅" />
          </Link>
        </div>
      )}

      {/* Module Grid */}
      <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
        Quick Access
      </h2>
      <div className="responsive-grid" className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {hasPermission(role, "special", "builder") && (
          <ModuleCard href="/builder" icon="🛡️" title="Permissions" desc="Manage staff emails and role-based permissions." />
        )}
        {modules.filter(m => hasPermission(role, "view", m.href)).map((m) => (
          <div key={m.href} onClick={() => {
            if (m.href === "/dj-mc-communications") {
              window.dispatchEvent(new CustomEvent("expand-dj-mc"));
            }
          }}>
            <ModuleCard href={m.href} icon={m.icon} title={m.title} desc={m.desc} />
          </div>
        ))}
      </div>
    </div>
  );
}
