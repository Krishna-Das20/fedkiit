import { prisma } from "@/lib/db";
import { expressError, handle, json } from "@/lib/api/express";
import { getCurrentUser, isAdmin } from "@/lib/auth/access";

/**
 * GET /api/user/fetchTeam
 *
 * Port of controllers/userController/user/getTeam.js. The projection matches the original
 * exactly — Team.jsx sorts on `member.year`, which the Express endpoint never
 * selected, so adding it here would silently reorder the roster.
 *
 * `email` is returned to admins only. The public Team page has no use for it
 * and stopped receiving it in the API lockdown, but the admin member view reads
 * this same endpoint, and its Update form fills the email field from the row it
 * was opened on — the email is what addMember keys the update on. Without it
 * the form opened blank and every role change was refused as missing a field.
 */
export async function GET() {
  return handle(async () => {
    const viewer = await getCurrentUser();
    const includeEmail = viewer ? isAdmin(viewer) : false;

    const users = await prisma.user.findMany({
      where: { access: { notIn: ["USER", "ADMIN"] } },
      select: {
        id: true,
        name: true,
        access: true,
        img: true,
        extra: true,
        email: includeEmail,
      },
    });

    if (users.length === 0) {
      // Preserved from the original, which 404'd on an empty roster.
      return expressError(404, "No teams found");
    }

    const normalizedUsers = users.map((u) => {
      let extra = u.extra;
      if (typeof extra === "string") {
        try {
          extra = JSON.parse(extra);
        } catch {
          extra = {};
        }
      }
      return {
        ...u,
        extra: extra || {},
      };
    });

    return json({ success: true, data: normalizedUsers });
  });
}
