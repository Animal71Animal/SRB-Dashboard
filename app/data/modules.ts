export type ModuleGroup = "administrative" | "promotions" | "social" | "operations";

export interface Module {
  href: string;
  icon: string;
  title: string;
  desc: string;
  group: ModuleGroup;
  children?: Module[];
}

export const modules: Module[] = [
  // Administrative
  { href: "/builder", icon: "🛡️", title: "Permissions", desc: "Manage staff emails and role-based permissions.", group: "administrative" },
  { href: "/analytics", icon: "📊", title: "Analytics", desc: "Data, tracking & internal ops tools.", group: "administrative" },
  // Events & Promotions
  { href: "/events", icon: "📅", title: "Event Calendar", desc: "Upcoming Torch events by date.", group: "promotions" },
  { href: "/promotional-ideas", icon: "💡", title: "Promotional Ideas", desc: "Marketing strategies and promotional concepts.", group: "promotions" },
  { href: "/promo-campaigns", icon: "📢", title: "Promo Campaigns", desc: "Active and past campaign tracker.", group: "promotions" },
  { href: "/feature-shows", icon: "🎭", title: "Feature Shows", desc: "Themed experiences and special-event portals for The Torch.", group: "promotions" },
  { href: "/content-assets", icon: "🎨", title: "Content Assets", desc: "Flyer archive and asset links.", group: "promotions" },
  // Social & Influencers
  { href: "/influencers", icon: "⭐", title: "Influencers", desc: "Influencer database with stats.", group: "social" },
  // Operations
  { href: "/torch-radio", icon: "📻", title: "Torch Radio", desc: "Broadcast hub and show schedule.", group: "operations" },
  { href: "/torchtv", icon: "📺", title: "TorchTV Broadcast", desc: "Live feed and Studio broadcast hub.", group: "operations" },
  { href: "/dj-mc-communications", icon: "💬", title: "DJ/MC Communications", desc: "Internal messaging for DJs and MCs.", group: "operations", children: [
    { href: "/dj-mc-communications/schedules", icon: "📅", title: "Schedules", desc: "View upcoming shift rotations.", group: "operations" },
    { href: "/dj-mc-communications/promotional-materials", icon: "📣", title: "Promotional Materials", desc: "Standardized marketing feeds.", group: "operations" },
    { href: "/dj-mc-communications/stage-announcement-ideas", icon: "🎙️", title: "Stage Announcement Ideas", desc: "Master MC compendium and dancer announcements.", group: "operations" },
    { href: "/dj-mc-communications/messaging", icon: "💬", title: "Messaging", desc: "Internal board for staff updates.", group: "operations" },
    { href: "/dj-mc-communications/equipment-reports", icon: "🛠️", title: "Equipment Reports", desc: "Maintenance logs.", group: "operations" },
    { href: "/dj-mc-communications/passwords", icon: "🔑", title: "Passwords", desc: "Credential Vault.", group: "operations" },
  ] },
  { href: "/logged-hours", icon: "⏱️", title: "ANiMAL's Hours", desc: "Off-site Torch work — live timer + manual log.", group: "operations" },
];

export const groupLabels: Record<ModuleGroup, string> = {
  administrative: "Administrative",
  promotions: "Events & Promotions",
  social: "Social & Influencers",
  operations: "Operations",
};

export const groupOrder: ModuleGroup[] = ["administrative", "promotions", "social", "operations"];