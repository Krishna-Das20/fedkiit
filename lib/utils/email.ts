/**
 * A Prisma string filter that matches an email address exactly, ignoring case.
 *
 * Certificates issued by the old backend keep whatever casing the admin
 * uploaded, so lookups by a signed-in member's address need
 * `mode: "insensitive"`. On MongoDB, Prisma runs that as an anchored regex
 * built from the raw value without escaping it: a "." would match any
 * character (so "j.hn@gmail.com", which Gmail delivers to jhn@gmail.com, would
 * also find john@gmail.com's certificates) and a "+" would stop an address
 * matching itself. Escaping the address keeps it an exact match.
 */
export function emailEquals(email: string) {
  return {
    equals: email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    mode: "insensitive" as const,
  };
}
