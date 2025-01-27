import { createStartRoute } from '@/utils/api/base-agent-routes';
import { collegeClient } from '@/utils/college-agent/college-client';

export const maxDuration = 30;
export const POST = createStartRoute(collegeClient); 