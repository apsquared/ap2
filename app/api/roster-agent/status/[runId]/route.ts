import { createStatusRoute } from '@/utils/api/base-agent-routes';
import { teamRosterClient } from '@/utils/team-roster-client/team-roster-client';

export const maxDuration = 45;

export const dynamic = 'force-dynamic';


export const GET = createStatusRoute(teamRosterClient); 