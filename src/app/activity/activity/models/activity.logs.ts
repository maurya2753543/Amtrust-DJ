import {ActivityDetails} from './activity.details';
import {AgentDetails} from './agent.details';
import {DateTimeDetails} from './date.time.details';

export class ActivityLogs {
  activityId: string;
  activityDetails: ActivityDetails;
  agentDetails: AgentDetails[];
  dateTimeDetails: DateTimeDetails;

}
