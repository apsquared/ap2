import { createStartRoute } from '@/utils/api/base-agent-routes';
import { VacationHouseClient } from '@/utils/vacation-house-agent/vacation-house-client';

const agentClient = new VacationHouseClient();
const POST = createStartRoute(agentClient);

export { POST }; 