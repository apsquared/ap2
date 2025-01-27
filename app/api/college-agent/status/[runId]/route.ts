import { createStatusRoute } from '@/utils/api/base-agent-routes';
import { collegeClient } from '@/utils/college-agent/college-client';

export const GET = createStatusRoute(collegeClient); 