export type ModuleGroup = "promotions" | "social" | "analytics" | "operations";

export interface Module {
  href: string;
  icon: string;
  title: string;
  desc: string;
  group: ModuleGroup;
}

export const modules: Module[] = [
  // Events & Promotions
  { href: "/events", icon: "📅", title: "Event Calendar", desc: "Upcoming Torch events by date.", group: "promotions" },
  { href: "/promotional-ideas", icon: "💡", title: "Promotional Ideas", desc: "Marketing strategies and promotional concepts.", group: "promotions" },
  { href: "/promo-campaigns", icon: "📢", title: "Promo Campaigns", desc: "Active and past campaign tracker.", group: "promotions" },
  { href: "/feature-shows", icon: "🎭", title: "Feature Shows", desc: "Themed experiences and special-event portals for The Torch.", group: "promotions" },
  { href: "/content-assets", icon: "🎨", title: "Content Assets", desc: "Flyer archive and asset links.", group: "promotions" },
  // Social & Influencers
  { href: "/influencers", icon: "⭐", title: "Influencers", desc: "Influencer database with stats.", group: "social" },
  // Analytics
  { href: "/attendance", icon: "👥", title: "Attendance Tracker", desc: "Nightly headcount log.", group: "analytics" },
  { href: "/analytics", icon: "📊", title: "Campaign Analytics", desc: "Performance summaries.", group: "analytics" },
  // Operations
  { href: "/torch-radio", icon: "📻", title: "Torch Radio", desc: "Broadcast hub and show schedule.", group: "operations" },
  { href: "/torchtv", icon: "📺", title: "TorchTV Broadcast", desc: "Live feed and Studio broadcast hub.", group: "operations" },
  { href: "/dj-mc-communications", icon: "💬", title: "DJ/MC Communications", desc: "Internal messaging for DJs and MCs.", group: "operations" },
  { href: "/logged-hours", icon: "⏱️", title: "ANiMAL's Hours", desc: "Off-site Torch work — live timer + manual log.", group: "operations" },
];

export const groupLabels: Record<ModuleGroup, string> = {
  promotions: "Events & Promotions",
  social: "Social & Influencers",
  analytics: "Analytics",
  operations: "Operations",
};

export const groupOrder: ModuleGroup[] = ["promotions", "social", "analytics", "operations"];
