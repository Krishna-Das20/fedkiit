import { prisma } from "@/lib/db";
import { handle, json } from "@/lib/api/express";
import { matchEvent } from "@/lib/utils/slug";

/**
 * GET /api/form/getAllForms[?id=<formIdOrSlug>]
 *
 * Port of FED-Backend/controllers/forms/getForm.js. The response shape
 * (`{ success, message, events }`) is preserved because Event.jsx reads
 * `response.data.events` and then `event.info.*` / `event.sections`.
 */
export async function GET(request: Request) {
  return handle(async () => {
    const id = new URL(request.url).searchParams.get("id");

    if (id) {
      let form = /^[a-f\d]{24}$/i.test(id)
        ? await prisma.form.findUnique({ where: { id } })
        : null;

      if (!form) {
        const allForms = await prisma.form.findMany({});
        form = allForms.find((f) => matchEvent(f, id)) || null;
      }

      return json({
        success: true,
        message: "All forms fetched successfully",
        events: form,
      });
    }

    const forms = await prisma.form.findMany({});

    return json({
      success: true,
      message: "All forms fetched successfully",
      events: forms,
    });
  });
}
