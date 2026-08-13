export type Role = "SuperAdmin" | "Manager" | "DJ" | "Employee";

export interface Permissions {
  view: string[];      // Module hrefs allowed to view
  edit: string[];      // Module hrefs allowed to edit
  special?: string[];  // Special flags like "admin-console"
}

export const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  SuperAdmin: {
    view: ["*"],
    edit: ["*"],
    special: ["admin-console"]
  },
  Manager: {
    view: ["*"],
    edit: ["/events"],
    special: ["admin-console"]
  },
  DJ: {
    view: ["/events", "/torchtv"],
    edit: ["/torchtv"],
    special: ["admin-console"]
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
