import { createStartRoute } from '@/utils/api/base-agent-routes';
import { marketingClient } from '@/utils/marketing-agent/marketing-client';

export const maxDuration = 30;

export const dynamic = 'force-dynamic';

export const POST = createStartRoute(marketingClient);
