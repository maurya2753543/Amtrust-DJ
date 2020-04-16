import {AgentDetails} from './agent.details';

export class ActivityRequest {
  subject: string;
  statusCode: string;
  email: string;
  priorityCode: string;
  typeToConnectCode: string;
  description: string;
  relatedId: string;
  activityType: string;
  agentDetails: AgentDetails;

}
