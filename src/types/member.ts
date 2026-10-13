/** Profile links and blurb a member's card shows. */
export type MemberExtra = {
  linkedin?: string;
  github?: string;
  know?: string;
  designation?: string;
};

/**
 * A user as the member and team endpoints return it. Older rows store `extra`
 * as a JSON string, and some carry the links at the top level instead.
 */
export type Member = {
  id?: string;
  name: string;
  email: string;
  img?: string;
  access?: string;
  year?: string;
  college?: string;
  school?: string;
  rollNumber?: string;
  contactNo?: string;
  blurhash?: string;
  extra?: MemberExtra | string | null;
  linkedin?: string;
  github?: string;
  know?: string;
  designation?: string;
};
