/**
 * Utility functions for event slug generation and route matching.
 */

export function getEventSlug(eventOrTitle) {
  if (!eventOrTitle) return "";

  const title =
    typeof eventOrTitle === "string"
      ? eventOrTitle
      : eventOrTitle.info?.eventTitle ||
      eventOrTitle.eventTitle ||
      eventOrTitle.title ||
      "";

  if (!title) return "";

  // If title has version format (like Omega 6.0), remove space to produce e.g. "omega6.0"
  if (/\d+\.\d+/.test(title)) {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9.]+/g, "");
  }

  // General title slugifying (e.g. "Pixel AI Hack" -> "pixel-ai-hack")
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]+/g, "")
    .replace(/-+/g, "-");
}

export function matchEvent(event, param) {
  if (!event || !param) return false;

  const paramStr = String(param).trim().toLowerCase();

  // 1. Direct MongoDB ID match
  if (event.id === param || String(event.id).toLowerCase() === paramStr) {
    return true;
  }

  const title =
    event.info?.eventTitle || event.eventTitle || event.title || "";
  if (!title) return false;

  // 2. Slug match (e.g., omega6.0 or pixel-ai-hack)
  const slug = getEventSlug(title);
  if (slug && slug === paramStr) return true;

  // 3. No-space slug match (e.g., omega6.0 or pixelaihack)
  const noSpaceSlug = title.toLowerCase().replace(/[^a-z0-9.]+/g, "");
  if (noSpaceSlug && noSpaceSlug === paramStr.replace(/[^a-z0-9.]+/g, ""))
    return true;

  // 4. Hyphenated slug match
  const hyphenSlug = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]+/g, "");
  if (hyphenSlug && hyphenSlug === paramStr) return true;

  // 5. URI decoded title match
  try {
    const decodedParam = decodeURIComponent(paramStr);
    if (title.toLowerCase() === decodedParam) return true;
  } catch {
    // Ignore URI decode errors
  }

  return false;
}
