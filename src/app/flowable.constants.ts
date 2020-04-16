import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { ClaimDocument } from './model/ClaimDocument';
import { catchError, map } from 'rxjs/operators';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class FlowableConstants {

  // Endpoint configurations
  public static FLOWABLE_PROCESS_API_RUNTIME_ENDPOINT = environment.flowableTaskUrl + 'process-api/runtime/';
  public static FLOWABLE_PROCESS_API_REPOSITORY_ENDPOINT = environment.flowableTaskUrl + 'process-api/repository/';
  public static FLOWABLE_TASK_ENDPOINT = FlowableConstants.FLOWABLE_PROCESS_API_RUNTIME_ENDPOINT + 'task';
  public static FLOWABLE_TASKS_ENDPOINT = FlowableConstants.FLOWABLE_PROCESS_API_RUNTIME_ENDPOINT + 'tasks';
  public static FLOWABLE_PROCESS_INSTANCE_ENDPOINT = FlowableConstants.FLOWABLE_PROCESS_API_RUNTIME_ENDPOINT + 'process-instances';
  public static FLOWABLE_PROCESS_DEFINITION_ENDPOINT = FlowableConstants.FLOWABLE_PROCESS_API_REPOSITORY_ENDPOINT + 'process-definitions';


  // Actions
  public static FLOWABLE_ACTION_CLAIM_TASK = 'claim';
  public static FLOWABLE_ACTION_COMPLETE_TASK = 'complete';
  public static FLOWABLE_BASIC_AUTH_KEY: string = 'flowableBasicAuth';


  public static flowableTaskEndpoint(taskID: string) {
    // e.g. <flowable-task-endpoint>/<taskid>/form
    return [this.FLOWABLE_TASKS_ENDPOINT, taskID].join('/');
  }

  public static flowableTaskFormEndpoint(taskID: string) {
    // e.g. <flowable-task-endpoint>/<taskid>/form
    return [this.FLOWABLE_TASKS_ENDPOINT, taskID, 'form'].join('/');
  }

}
