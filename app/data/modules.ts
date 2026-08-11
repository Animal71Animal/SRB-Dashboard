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
  { href: "/events", icon: "📅", title: "Event Schedule", desc: "Upcoming Torch events by date.", group: "promotions" },
  { href: "/promotional-ideas", icon: "💡", title: "Promotional Ideas", desc: "Marketing strategies and promotional concepts.", group: "promotions" },
  { href: "/promo-campaigns", icon: "📢", title: "Promo Campaigns", desc: "Active and past campaign tracker.", group: "promotions" },
  { href: "/comp-codes", icon: "🎟️", title: "Comp Codes", desc: "Complimentary entry code management.", group: "promotions" },
  { href: "/feature-shows", icon: "🎭", title: "Feature Shows", desc: "Themed experiences and special-event portals for The Torch.", group: "promotions" },
  // Social & Influencers
  { href: "/social-calendar", icon: "📱", title: "Social Calendar", desc: "Weekly social media post schedule.", group: "social" },
  { href: "/influencers", icon: "⭐", title: "Influencers", desc: "Influencer database with stats.", group: "social" },
  { href: "/content-assets", icon: "🎨", title: "Content Assets", desc: "Flyer archive and asset links.", group: "social" },
  // Analytics
  { href: "/attendance", icon: "👥", title: "Attendance Tracker", desc: "Nightly headcount log.", group: "analytics" },
  { href: "/analytics", icon: "📊", title: "Campaign Analytics", desc: "Performance summaries.", group: "analytics" },
  // Operations
  { href: "/torch-radio", icon: "📻", title: "Torch Radio", desc: "Broadcast hub and show schedule.", group: "operations" },
  { href: "/torchtv", icon: "📺", title: "TorchTV Broadcast", desc: "Live feed and Studio admin center.", group: "operations" },
  { href: "https://12b0afb612.abacusai.cloud/admin", icon: "⚙️", title: "Studio Console", desc: "Manage playlists and uploads.", group: "operations" },
  { href: "/staff-notes", icon: "📝", title: "Staff Notes", desc: "Internal notes and memos.", group: "operations" },
  { href: "/logged-hours", icon: "⏱️", title: "Logged Hours", desc: "Off-site Torch work — live timer + manual log.", group: "operations" },
];

export const groupLabels: Record<ModuleGroup, string> = {
  promotions: "Events & Promotions",
  social: "Social & Influencers",
  analytics: "Analytics",
  operations: "Operations",
};

export const groupOrder: ModuleGroup[] = ["promotions", "social", "analytics", "operations"];
