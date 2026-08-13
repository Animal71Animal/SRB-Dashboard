export type Role = "SuperAdmin" | "Manager" | "DJ" | "Employee";

export interface Permissions {
  view: string[];      // Module hrefs allowed to view
  edit: string[];      // Module hrefs allowed to edit
  adminOnly?: boolean; // Access to full user management / dashboard settings
}

export const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  SuperAdmin: {
    view: ["*"], // Wildcard for all
    edit: ["*"],
    adminOnly: true,
  },
  Manager: {
    view: ["*"],
    edit: [
      "/events",
      "/promotional-ideas",
      "/promo-campaigns",
      "/comp-codes",
      "/feature-shows",
      "/social-calendar",
      "/influencers",
      "/content-assets",
      "/attendance",
      "/analytics",
      "/torch-radio",
      "/torchtv",
      "/staff-notes",
      "/logged-hours"
    ],
  },
  DJ: {
    view: [
      "/events",
      "/promotional-ideas",
      "/social-calendar",
      "/content-assets",
      "/torch-radio",
      "/torchtv",
      "/staff-notes",
      "/logged-hours"
    ],
    edit: [
      "/social-calendar", // DJs manage their own posts
      "/torch-radio",    // Radio schedule
      "/logged-hours"    // Their own hours
    ],
  },
  Employee: {
    view: [
      "/events",
      "/promotional-ideas",
      "/social-calendar",
      "/content-assets",
      "/staff-notes",
      "/logged-hours"
    ],
    edit: [
      "/logged-hours" // Only their own hours
    ],
  },
};

/**
 * Check if a role has permission for a specific action on a module.
 */
export function hasPermission(role: Role, action: "view" | "edit", href: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;

  const list = perms[action];
  if (list.includes("*")) return true;
  return list.includes(href);
}
