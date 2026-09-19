import { AccessTypes } from "@prisma/client";
import { handle, json } from "@/lib/api/express";
import { getCurrentUser, isAdmin } from "@/lib/auth/access";

const HIDDEN_PUBLIC_ROLES = new Set(["ADMIN", "USER", "EX_MEMBER", "ALUMNI"]);

/**
 * GET /api/user/fetchAccessTypes
 *
 * Populates role dropdowns. Admins receive all enum values;
 * public callers receive only visible society team roles, never ADMIN.
 */
export async function GET() {
  return handle(async () => {
    const user = await getCurrentUser();
    if (user && isAdmin(user)) {
      return json({ success: true, data: Object.values(AccessTypes) });
    }

    const publicRoles = Object.values(AccessTypes).filter(
      (role) => !HIDDEN_PUBLIC_ROLES.has(role),
    );

    return json({ success: true, data: publicRoles });
  });
}
