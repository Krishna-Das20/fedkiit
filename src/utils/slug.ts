/**
 * Event slug generation and route matching.
 *
 * This file was a line-for-line copy of `lib/utils/slug.ts`; it now re-exports
 * that module so the client and the server cannot drift apart.
 */
export { getEventSlug, matchEvent } from "@/lib/utils/slug";
