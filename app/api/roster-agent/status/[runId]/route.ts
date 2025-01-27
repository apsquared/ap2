import { createStatusRoute } from '@/utils/api/base-agent-routes';
import { teamRosterClient } from '@/utils/team-roster-client/team-roster-client';

export const GET = createStatusRoute(teamRosterClient); 