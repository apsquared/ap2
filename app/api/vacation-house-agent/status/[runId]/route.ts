import { vacationHouseClient } from '@/utils/vacation-house-agent/vacation-house-client';
import { createStatusRoute } from '@/utils/api/base-agent-routes';

export const maxDuration = 45;

export const dynamic = 'force-dynamic';


export const GET = createStatusRoute(vacationHouseClient); 