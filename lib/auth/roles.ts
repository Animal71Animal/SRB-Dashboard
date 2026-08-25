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
    special: []
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

// ---------------------------------------------------------------------------
// Client-side role resolution
//
// SECURITY: `srb-role-preview` is a SuperAdmin-only convenience for previewing
// the dashboard as another role. It MUST NOT be honored unless the
// currently-authenticated user is actually a SuperAdmin. Otherwise a DJ or
// Employee who logs in on the same tab after a SuperAdmin preview would
// inherit elevated access. Always go through `resolveClientRole` (or
// `canUseRolePreview`) instead of reading `srb-role-preview` directly.
// ---------------------------------------------------------------------------

export const SESSION_EMAIL_KEY = "srb-session-email";
export const ROLE_PREVIEW_KEY = "srb-role-preview";

/** Most-restricted role used as the safe default on any failure. */
export const RESTRICTED_ROLE: Role = "Employee";

function safeStorageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function isRole(value: string | null | undefined): value is Role {
  return value === "SuperAdmin" || value === "Admin" || value === "Manager" || value === "DJ" || value === "Employee";
}

/**
 * Look up the currently-authenticated user's actual role from the server.
 * Returns `null` if no email is stored or the user can't be resolved.
 */
export async function fetchActualRole(): Promise<Role | null> {
  const email = safeStorageGet(SESSION_EMAIL_KEY);
  if (!email) return null;

  try {
    const res = await fetch("/api/users");
    if (!res.ok) return null;
    const data = await res.json();
    const users: Array<{ email: string; role: Role }> = data.users || [];
    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return matched?.role ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns true only when the currently-authenticated user is a SuperAdmin.
 * Used to gate the role-preview UI itself.
 */
export async function canUseRolePreview(): Promise<boolean> {
  const actual = await fetchActualRole();
  return actual === "SuperAdmin";
}

/**
 * Resolve the role to render UI for.
 *
 * Rules:
 *   1. Look up the actual role of the currently-authenticated user.
 *   2. If no actual role can be determined, fall back to `RESTRICTED_ROLE`.
 *   3. If `srb-role-preview` is set AND the actual role is SuperAdmin,
 *      honor the preview.
 *   4. Otherwise ignore any stale preview and return the actual role.
 *
 * When the preview is ignored, this function also clears the stale value
 * from sessionStorage so it doesn't linger for the next tab session.
 */
export async function resolveClientRole(): Promise<Role> {
  const actual = await fetchActualRole();

  if (!actual) return RESTRICTED_ROLE;

  const previewRaw = safeStorageGet(ROLE_PREVIEW_KEY);
  const previewValid = isRole(previewRaw);

  if (actual === "SuperAdmin" && previewValid) {
    return previewRaw;
  }

  // Stale preview from a previous session — purge it.
  if (previewRaw && typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(ROLE_PREVIEW_KEY);
      // Notify other components mounted on the same page.
      window.dispatchEvent(new Event("venue-changed"));
      window.dispatchEvent(new Event("storage"));
    } catch {
      /* noop */
    }
  }

  return actual;
}

/** Clear any role preview from sessionStorage. Safe to call any time. */
export function clearRolePreview(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ROLE_PREVIEW_KEY);
    window.dispatchEvent(new Event("venue-changed"));
    window.dispatchEvent(new Event("storage"));
  } catch {
    /* noop */
  }
}
