import { sendCertificateBatch } from "@/lib/services/certificates";
import { body, expressError, handle, json } from "@/lib/api/express";
import { getCurrentUser, isAdmin } from "@/lib/auth/access";

/**
 * POST /api/certificate/sendCertificates — admin only.
 *
 * Issues certificates for an event and emails them.
 *
 * This arrived in PR #28 mounted on `sendCertificatesAndEvents`, which already
 * exists and does the opposite: it reads back the certificates issued to one
 * address and is what the "My Events" tab calls. Two callers in that branch hit
 * the one path with different bodies, so whichever handler won, the other
 * caller broke. Splitting them keeps the Express-derived read where its callers
 * expect it and gives the send a name that says what it does.
 *
 * Accepts either a rich `recipients` list or a plain `emails` array.
 *
 * Returns 207 when some recipients failed and 200 when all succeeded, with the
 * per-recipient failures in `failed` either way — a partial send is reported as
 * a partial send rather than a flat success or a flat error.
 */
export async function POST(request: Request) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return expressError(401, "Token is required");
    if (!isAdmin(user)) return expressError(403, "Unauthorized");

    const b = await body<{
      eventId?: string;
      recipients?: Array<{ email: string; fieldValues?: Record<string, string> }>;
      emails?: string[];
      resend?: boolean;
    }>(request);

    const recipients =
      b.recipients ??
      (b.emails ?? []).map((email) => ({ email, fieldValues: {} }));

    const data = await sendCertificateBatch({
      eventId: b.eventId ?? "",
      recipients,
      resend: b.resend === true,
    });

    const status = data.failures.length > 0 ? 207 : 200;
    return json(
      {
        success: data.failures.length === 0,
        message:
          data.failures.length > 0
            ? "Some certificates could not be emailed"
            : "Certificates sent successfully",
        data,
        failed: data.failures,
      },
      status,
    );
  });
}
