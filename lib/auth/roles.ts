export type Role = "SuperAdmin" | "Admin" | "Manager" | "DJ" | "Employee";

export interface User {
  email: string;
  role: Role;
  name?: string; // Assigned name for referencing instead of email
}

export interface Permissions {
  view: string[];      // Module hrefs allowed to view
  edit: string[];      // Module hrefs allowed to edit
  special?: string[];  // Special flags like "admin-console"
}

export const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  SuperAdmin: {
    view: ["*"],
    edit: ["*"],
    special: ["admin-console", "builder", "role-preview"]
  },
  Admin: {
    view: ["*"],
    edit: ["*"],
    special: ["builder", "role-preview"]
  },
  Manager: {
    view: ["/events", "/promotional-ideas", "/promo-campaigns", "/feature-shows", "/content-assets", "/influencers", "/attendance", "/analytics", "/torch-radio", "/torchtv", "/staff-notes", "/dj-mc-communications", "/dj-mc-communications/schedules", "/dj-mc-communications/promotional-materials", "/dj-mc-communications/stage-announcement-ideas", "/dj-mc-communications/messaging", "/dj-mc-communications/equipment-reports", "/dj-mc-communications/passwords", "/dj-mc-communications/scheduling"],
    edit: ["/events", "/torchtv"],
    special: []
  },
  DJ: {
    view: ["/events", "/torchtv", "/torch-radio", "/dj-mc-communications", "/dj-mc-communications/schedules", "/dj-mc-communications/promotional-materials", "/dj-mc-communications/stage-announcement-ideas", "/dj-mc-communications/messaging", "/dj-mc-communications/equipment-reports", "/dj-mc-communications/passwords", "/dj-mc-communications/scheduling"],
    edit: ["/torchtv"],
    special: []
  },
  Employee: {
    view: ["/events", "/torchtv"],
    edit: [],
    special: []
  },
};

export function hasPermission(role: Role, action: "view" | "edit" | "special", href: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  
  if (action === "special") return (perms.special || []).includes(href);

  const list = perms[action];
  if (list.includes("*")) return true;
  return list.includes(href);
}
