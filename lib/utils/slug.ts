/**
 * TypeScript utility functions for event slug generation and route matching.
 */

export function getEventSlug(eventOrTitle: any): string {
  if (!eventOrTitle) return "";

  const title =
    typeof eventOrTitle === "string"
      ? eventOrTitle
      : eventOrTitle.info?.eventTitle ||
        eventOrTitle.eventTitle ||
        eventOrTitle.title ||
        "";

  if (!title) return "";

  if (/\d+\.\d+/.test(title)) {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9.]+/g, "");
  }

  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]+/g, "")
    .replace(/-+/g, "-");
}

export function matchEvent(event: any, param: string | null | undefined): boolean {
  if (!event || !param) return false;

  const paramStr = String(param).trim().toLowerCase();

  if (event.id === param || String(event.id).toLowerCase() === paramStr) {
    return true;
  }

  const title =
    event.info?.eventTitle || event.eventTitle || event.title || "";
  if (!title) return false;

  const slug = getEventSlug(title);
  if (slug && slug === paramStr) return true;

  const noSpaceSlug = title.toLowerCase().replace(/[^a-z0-9.]+/g, "");
  if (noSpaceSlug && noSpaceSlug === paramStr.replace(/[^a-z0-9.]+/g, ""))
    return true;

  const hyphenSlug = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]+/g, "");
  if (hyphenSlug && hyphenSlug === paramStr) return true;

  try {
    const decodedParam = decodeURIComponent(paramStr);
    if (title.toLowerCase() === decodedParam) return true;
  } catch {
    // Ignore URI decode errors
  }

  return false;
}
