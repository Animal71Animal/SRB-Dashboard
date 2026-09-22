export type ModuleGroup = "administrative" | "promotions" | "social" | "operations" | "djmc" | "tvrouting";

export interface Module {
  href: string;
  icon: string;
  title: string;
  desc: string;
  group: ModuleGroup;
  children?: Module[];
}

export const groupModules: Record<ModuleGroup, Module[]> = {
  tvrouting: [
    { href: "/tv-routing", icon: "📡", title: "TV Routing", desc: "Manage TV signal routing and source switching.", group: "tvrouting" },
  ],
  administrative: [
    { href: "/builder", icon: "🛡️", title: "Permissions", desc: "Manage staff emails and role-based permissions.", group: "administrative" },
    { href: "/analytics", icon: "📊", title: "Analytics", desc: "Data, tracking & internal ops tools.", group: "administrative" },
    { href: "/entertainer-auditions", icon: "🎤", title: "Entertainer Auditions", desc: "Log auditions for entertainers — Sundays & Mondays, 8 PM – 10:30 PM.", group: "administrative" },
    { href: "/dj-security-interviews", icon: "🎧", title: "DJ/Security Interviews", desc: "Log interviews for DJs and security — Wed/Sun/Mon, 8 PM – 10:30 PM.", group: "administrative" },
  ],
  promotions: [
    { href: "/events", icon: "📅", title: "Event Calendar", desc: "Upcoming Torch events by date.", group: "promotions" },
    { href: "/promotional-ideas", icon: "💡", title: "Promotional Ideas", desc: "Marketing strategies and promotional concepts.", group: "promotions" },
    { href: "/promo-campaigns", icon: "📢", title: "Promo Campaigns", desc: "Active and past campaign tracker.", group: "promotions" },
    { href: "/feature-shows", icon: "🎭", title: "Feature Shows", desc: "Themed experiences and special-event portals for The Torch.", group: "promotions" },
    { href: "/content-assets", icon: "🎨", title: "Content Assets", desc: "Flyer archive and asset links.", group: "promotions" },
  ],
  social: [
    { href: "/influencers", icon: "📣", title: "Influencers", desc: "Top 10 Boise influencers + outreach tracker.", group: "social" },
  ],
  operations: [
    { href: "/torch-radio", icon: "📻", title: "Torch Radio", desc: "Broadcast hub and show schedule.", group: "operations" },
    { href: "/torchtv", icon: "📺", title: "TorchTV Broadcast", desc: "Live feed and Studio broadcast hub.", group: "operations" },
    { href: "/logged-hours", icon: "⏱️", title: "ANiMAL's Hours", desc: "Off-site Torch work — live timer + manual log.", group: "operations" },
  ],
  djmc: [
    { href: "/dj-mc-communications/messaging", icon: "💬", title: "Messaging", desc: "Internal board for staff updates.", group: "djmc" },
    { href: "/dj-mc-communications/schedules", icon: "📅", title: "Schedules", desc: "View upcoming shift rotations.", group: "djmc" },
    { href: "/dj-mc-communications/promotional-materials", icon: "📣", title: "Promotional Materials", desc: "Standardized marketing feeds.", group: "djmc" },
    { href: "/dj-mc-communications/stage-announcement-ideas", icon: "🎙️", title: "Stage Announcement Ideas", desc: "Master MC compendium and dancer announcements.", group: "djmc" },
    { href: "/dj-mc-communications/equipment-reports", icon: "🛠️", title: "Equipment Reports", desc: "Maintenance logs.", group: "djmc" },
    { href: "/dj-mc-communications/passwords", icon: "🔑", title: "Passwords", desc: "Credential Vault.", group: "djmc" },
    { href: "/director-admin", icon: "🔥", title: "Ignite App", desc: "Ignite — booth, review queue, feed & more.", group: "djmc" },
  ],
};

// Sub-tabs that appear under a parent tab in the sidebar (and in the hub page)
export const subTabs: Record<string, Module[]> = {
  "/analytics": [
    { href: "/attendance", icon: "👥", title: "Attendance Tracker", desc: "Track staff attendance.", group: "administrative" },
    { href: "/campaign-analytics", icon: "📊", title: "Campaign Analytics", desc: "Campaign performance metrics.", group: "administrative" },
    { href: "/comp-codes", icon: "🎟️", title: "Comp Codes", desc: "Complimentary entry codes.", group: "administrative" },
    { href: "/staff-notes", icon: "📝", title: "Staff Notes", desc: "Internal staff notes.", group: "administrative" },
  ],
  "/influencers": [
    { href: "/influencers/outreach-templates", icon: "📧", title: "Outreach Templates", desc: "DM and email templates.", group: "social" },
    { href: "/influencers/weekly-report", icon: "📄", title: "Weekly Report", desc: "Weekly influencer summary.", group: "social" },
  ],
  "/dj-mc-communications/stage-announcement-ideas": [
    { href: "/dj-mc-communications/stage-announcement-ideas/adjectives", icon: "✨", title: "Adjectives", desc: "Stage Entertainer Adjective Compendium A to Z.", group: "djmc" },
  ],
};

// Flat modules array for backward compatibility (Sidebar, etc.)
export const modules: Module[] = [
  ...groupModules.administrative,
  ...groupModules.promotions,
  ...groupModules.social,
  ...groupModules.operations,
  ...groupModules.djmc,
  ...groupModules.tvrouting,
];

export const groupLabels: Record<ModuleGroup, string> = {
  administrative: "Administrative",
  promotions: "Events & Promotions",
  social: "Social & Influencers",
  operations: "Operations",
  djmc: "DJ/MC Communications",
  tvrouting: "TV Routing",
};

export const groupOrder: ModuleGroup[] = ["administrative", "promotions", "social", "operations", "djmc", "tvrouting"];