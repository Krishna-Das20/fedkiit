import { prisma } from "@/lib/db";
import { handle, json } from "@/lib/api/express";
import { getCurrentUser, isAdmin } from "@/lib/auth/access";
import { matchEvent } from "@/lib/utils/slug";

/**
 * GET /api/form/getAllForms[?id=<formIdOrSlug>]
 *
 * Serves public event listings and single-event registration forms.
 * Unauthenticated / regular visitors receive only public events, with
 * draft forms, internal question sections, and payment receiver details redacted.
 * Admins receive the complete forms collection for management.
 */
export async function GET(request: Request) {
  return handle(async () => {
    const user = await getCurrentUser();
    const admin = Boolean(user && isAdmin(user));
    const id = new URL(request.url).searchParams.get("id");

    if (id) {
      let form = /^[a-f\d]{24}$/i.test(id)
        ? await prisma.form.findUnique({ where: { id } })
        : null;

      if (!form) {
        const allForms = await prisma.form.findMany({});
        form = allForms.find((f) => matchEvent(f, id)) || null;
      }

      if (!form) {
        return json({
          success: true,
          message: "All forms fetched successfully",
          events: null,
        });
      }

      const info = (form.info ?? {}) as Record<string, unknown>;

      // Only admins can see unreleased / draft / private forms
      if (!admin && (info.isPublic === false || info.isPublic === "false")) {
        return json({
          success: true,
          message: "All forms fetched successfully",
          events: null,
        });
      }

      return json({
        success: true,
        message: "All forms fetched successfully",
        events: form,
      });
    }

    // Full collection for admins
    if (admin) {
      const forms = await prisma.form.findMany({});
      return json({
        success: true,
        message: "All forms fetched successfully",
        events: forms,
      });
    }

    // Public collection: only public events; omit sections and sensitive payment receiver details
    const publicForms = await prisma.form.findMany({
      select: {
        id: true,
        info: true,
      },
    });

    const sanitized = publicForms
      .filter((f) => {
        const info = (f.info ?? {}) as Record<string, unknown>;
        return info.isPublic !== false && info.isPublic !== "false";
      })
      .map((f) => {
        const info = { ...((f.info ?? {}) as Record<string, unknown>) };
        delete info.receiverDetails;
        return { id: f.id, info };
      });

    return json({
      success: true,
      message: "All forms fetched successfully",
      events: sanitized,
    });
  });
}
