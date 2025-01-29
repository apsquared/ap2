import { createStatusRoute } from '@/utils/api/base-agent-routes';
import { marketingClient } from '@/utils/marketing-agent/marketing-client';

export const maxDuration = 45;

export const dynamic = 'force-dynamic';

export const GET = createStatusRoute(marketingClient); 