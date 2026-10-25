import { prisma } from "@/lib/db";
import { expressError, handle, json } from "@/lib/api/express";
import { alumniSession } from "@/lib/utils/alumni";

/**
 * GET /api/user/fetchAlumni
 * Port of controllers/userController/user/getAlumni.js.
 *
 * Each alumnus also carries `session` ("2024-25", or null), which the Alumni
 * page groups its tabs by. It is derived here from the roll number, which is
 * read only for that and never sent: this endpoint is public.
 */
export async function GET() {
  return handle(async () => {
    const users = await prisma.user.findMany({
      where: { access: { in: ["ALUMNI"] } },
      // Like getAlumni.js, no `id`; the page keys its cards on name and
      // position instead.
      select: {
        name: true,
        access: true,
        img: true,
        extra: true,
        rollNumber: true,
      },
    });

    if (users.length === 0) {
      return expressError(404, "No teams found");
    }

    const normalizedUsers = users.map(({ rollNumber, ...u }) => {
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
        session: alumniSession(rollNumber),
      };
    });

    return json({ success: true, data: normalizedUsers });
  });
}
