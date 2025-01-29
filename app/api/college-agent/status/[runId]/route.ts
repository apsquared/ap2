import { createStatusRoute } from '@/utils/api/base-agent-routes';
import { collegeClient } from '@/utils/college-agent/college-client';


export const maxDuration = 45;

export const dynamic = 'force-dynamic';


export const GET = createStatusRoute(collegeClient); 