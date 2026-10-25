/** Academic sessions start in July (month index 6). */
const SESSION_START_MONTH = 6;

/**
 * The session an alumnus is listed under on /Alumni, from their roll number.
 *
 * KIIT roll numbers start with the two-digit admission year, and alumni are
 * shown under the session of their third year (admission + 2): a roll number
 * starting 22 gives "2024-25". Returns null when the roll number does not start
 * with two digits; the page lists those alumni under a separate tab.
 *
 * Alumni have finished their tenure, so the result is capped at the last
 * completed session: someone who left before their third year would otherwise
 * be placed in the session still under way (or a future one), and the page
 * opens on the newest tab.
 *
 * Worked out here rather than in the browser so the public alumni endpoint
 * never has to send roll numbers themselves.
 */
export function alumniSession(
  rollNumber: string | number | null | undefined,
  now: Date = new Date()
): string | null {
  const roll = String(rollNumber ?? "").trim();
  if (!/^\d{2}/.test(roll)) return null;

  const currentSessionStart =
    now.getMonth() >= SESSION_START_MONTH
      ? now.getFullYear()
      : now.getFullYear() - 1;
  const startYear = Math.min(
    2000 + parseInt(roll.slice(0, 2), 10) + 2,
    currentSessionStart - 1
  );
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}
