export interface FlowableProcess {
  id: string;
  url: string;
  name: string;
  businessKey: string;
  suspended: boolean;
  ended: boolean;
  processDefinitionId: string;
  processDefinitionUrl: string;
  processDefinitionName: string;
  processDefinitionDescription: string;
  activityId: string;
  startUserId: string;
  startTime: string;
  variables: any;
  callbackId: string;
  callbackType: string;
  referenceId: string;
  referenceType: string;
  tenantId: string;
  completed: boolean;
}
