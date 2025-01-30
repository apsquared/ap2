import { createStartRoute } from '@/utils/api/base-agent-routes';
import { teamRosterClient } from '@/utils/team-roster-client/team-roster-client';

export const maxDuration = 30;
export const POST = createStartRoute(teamRosterClient); 