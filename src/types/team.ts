/** A team member as /api/form/teamDetails lists them. */
export type TeamMember = {
  name: string | null;
  email: string;
  img: string | null;
  rollNumber?: string | null;
  college: string | null;
  year: string | null;
};

/** Event limits and state, common to both teamDetails responses. */
type TeamEventInfo = {
  eventTitle?: string;
  maxTeamSize: number;
  minTeamSize: number;
  isRegistrationClosed: boolean;
  isEventPast: boolean;
  formId: string;
};

/** /api/form/teamDetails for a registrant who is on a team. */
export type TeamDetails = TeamEventInfo & {
  isTeamless?: false;
  teamName: string;
  teamCode: string;
  teamSize: number;
  members: TeamMember[];
  leaderEmail: string | null;
};

/** /api/form/teamDetails for a registrant not yet on any team. */
export type TeamlessDetails = TeamEventInfo & {
  isTeamless: true;
};

/** /api/form/inviteLink, for a team leader. */
export type TeamInviteLink = {
  inviteLink: string;
  shareText: string;
};

/** One open team in /api/form/searchTeams. */
export type OpenTeam = {
  teamRegistrationId: string;
  teamName: string;
  teamSize: number;
  maxTeamSize: number;
  leaderName: string;
  spotsRemaining: number;
  /** The searcher has already asked to join it. */
  hasPendingRequest: boolean;
};
