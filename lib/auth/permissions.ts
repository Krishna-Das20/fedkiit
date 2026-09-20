import "server-only";

import type { SafeUser } from "@/lib/auth/access";
import { isAttendanceScanner } from "@/lib/auth/attendance";
import { FORM_ANALYTICS_ROLES, FORM_ATTENDANCE_ROLES } from "@/lib/auth/roles";
import { envList, getEnv } from "@/lib/env";

/**
 * Who may do what, declared once.
 *
 * Role lists used to be written out inside the route that needed them, so
 * adding a role meant hunting down every endpoint that mentioned it. A
 * permission is named for the capability, not the screen, so the same set can
 * back several routes.
 *
 * ADMIN is not listed in each set — `can()` grants it everything, matching the
 * Express `checkAccess`, where ADMIN always passed.
 */
export const PERMISSIONS = {
  /** Read a form's registration analytics (EventStats). */
  FORM_ANALYTICS_VIEW: new Set<string>(FORM_ANALYTICS_ROLES),

  /** Scan a QR and mark a registrant present. */
  FORM_ATTENDANCE_MARK: new Set<string>(FORM_ATTENDANCE_ROLES),
} satisfies Record<string, ReadonlySet<string>>;

export type Permission = keyof typeof PERMISSIONS;

/**
 * `user.access` is this project's role field — the Express `user.role` in the
 * review comment does not exist on this schema.
 */
export function can(
  user: Pick<SafeUser, "access"> | null | undefined,
  permission: Permission,
): boolean {
  if (!user) return false;
  if (user.access === "ADMIN") return true;
  return PERMISSIONS[permission].has(user.access);
}

/**
 * Role check, or failing that an address on a configured allowlist.
 *
 * The allowlist exists for accounts whose role cannot express what they are
 * for: a shared scanning login is a plain USER, and promoting it to ADMIN to
 * let it scan would also let it edit and delete events.
 */
function canByRoleOrEmail(
  user: Pick<SafeUser, "access" | "email"> | null | undefined,
  permission: Permission,
  configured: string | undefined,
): boolean {
  if (!user) return false;
  if (can(user, permission)) return true;

  const allowed = envList(configured).map((entry) => entry.toLowerCase());
  return allowed.includes(user.email.toLowerCase());
}

/**
 * The whole of the Express analytics rule, in one place:
 *
 *   if (!allowedUsers.includes(req.user.access) && req.user.email != "srex@…")
 *
 * The address list moved to `FORM_ANALYTICS_ALLOWED_EMAILS` in the environment.
 *
 * Both the API route and the page that renders EventStats call this, so the
 * page can no longer refuse someone the endpoint would have served — which is
 * exactly what happened when the page checked `isAdmin` on its own.
 */
export function canViewFormAnalytics(
  user: Pick<SafeUser, "access" | "email"> | null | undefined,
): boolean {
  return canByRoleOrEmail(
    user,
    "FORM_ANALYTICS_VIEW",
    getEnv().FORM_ANALYTICS_ALLOWED_EMAILS,
  );
}

/**
 * May scan a QR and mark someone present.
 *
 * Three ways in, and no more: ADMIN (via `can`), a role in
 * `FORM_ATTENDANCE_ROLES`, or an address in `FORM_ATTENDANCE_ALLOWED_EMAILS`.
 * The built-in door-duty account is also allowed, because the sidebar and the
 * `/profile` redirect decide what to show from `isAttendanceScanner` on the
 * client, where a server-only env var cannot be read. Accepting it here too
 * keeps those two from promising a screen the server would refuse.
 *
 * Granting this grants the scanner page and the attendance endpoints, and
 * nothing else — it does not change what role the account holds, so add, edit
 * and delete still ask `isAdmin` and still say no.
 */
export function canMarkAttendance(
  user: Pick<SafeUser, "access" | "email"> | null | undefined,
): boolean {
  if (!user) return false;
  if (isAttendanceScanner(user)) return true;

  return canByRoleOrEmail(
    user,
    "FORM_ATTENDANCE_MARK",
    getEnv().FORM_ATTENDANCE_ALLOWED_EMAILS,
  );
}
