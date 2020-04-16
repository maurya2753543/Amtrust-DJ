import {ActivityLogs} from './activity.logs';
import {ActivityType} from './activity.type';
import {RelatedIds} from './relatedIds';
import {DateTimeDetails} from './date.time.details';

export class ActivityResponse {

  globalActivityId: string;
  activityLogs: ActivityLogs;
  type: ActivityType;
  relatedIds: RelatedIds;
  dateTimeDetails: DateTimeDetails;

}

