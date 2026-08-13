export type Role = "SuperSuperAdmin" | "SuperAdmin" | "Manager" | "DJ" | "Employee";

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
  SuperSuperAdmin: {
    view: ["*"],
    edit: ["*"],
    special: ["admin-console", "builder"]
  },
  SuperAdmin: {
    view: ["*"],
    edit: ["*"],
    special: ["admin-console"]
  },
  Manager: {
    view: ["/events", "/promotional-ideas", "/promo-campaigns", "/feature-shows", "/content-assets", "/influencers", "/attendance", "/analytics", "/torch-radio", "/torchtv", "/staff-notes", "/dj-mc-communications", "/dj-mc-communications/scheduling"],
    edit: ["/events", "/torchtv"],
    special: ["admin-console"]
  },
  DJ: {
    view: ["/events", "/torchtv", "/torch-radio", "/dj-mc-communications", "/dj-mc-communications/scheduling"],
    edit: ["/torchtv"],
    special: ["admin-console"]
  },
  Employee: {
    view: ["/events", "/torchtv", "/staff-notes", "/dj-mc-communications/scheduling"],
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
