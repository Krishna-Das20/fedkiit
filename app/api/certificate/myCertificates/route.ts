import { prisma } from "@/lib/db";
import { expressError, handle, json } from "@/lib/api/express";
import { getCurrentUser } from "@/lib/auth/access";

/**
 * GET /api/certificate/myCertificates
 *
 * The signed-in user's own issued certificates, one row per certificate, with
 * the event title and date resolved here so the list does not depend on which
 * forms are currently public.
 *
 * Based only on issued certificates — never on attendance. A certificate is
 * the record of having taken part, and several events issued certificates
 * without ever scanning attendance.
 */
export async function GET() {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return expressError(401, "Token is required");

    const issued = await prisma.issuedCertificates.findMany({
      // Older batches stored addresses as uploaded, so match case-insensitively.
      where: { email: { equals: user.email.trim(), mode: "insensitive" } },
      select: {
        id: true,
        eventId: true,
        fieldValues: true,
        event: { select: { name: true, formId: true, createdAt: true } },
      },
      orderBy: { id: "desc" },
    });

    // Trashed certificates fail public verification, so do not offer them.
    const active = issued.filter(
      (row) => !(row.fieldValues as Record<string, unknown> | null)?._isDeleted,
    );

    const formIds = [
      ...new Set(active.map((row) => row.event?.formId).filter((id): id is string => Boolean(id))),
    ];
    const forms = formIds.length
      ? await prisma.form.findMany({
          where: { id: { in: formIds } },
          select: { id: true, info: true },
        })
      : [];
    const formInfo = new Map(
      forms.map((form) => [form.id, (form.info ?? {}) as Record<string, unknown>]),
    );

    const certificates = active.map((row) => {
      const info = row.event?.formId ? formInfo.get(row.event.formId) : undefined;
      return {
        certificateId: row.id,
        eventId: row.eventId,
        formId: row.event?.formId ?? null,
        eventTitle:
          (typeof info?.eventTitle === "string" && info.eventTitle) ||
          row.event?.name ||
          "Event",
        eventDate:
          (typeof info?.eventDate === "string" && info.eventDate) ||
          row.event?.createdAt?.toISOString() ||
          null,
      };
    });

    return json({ success: true, certificates });
  });
}
