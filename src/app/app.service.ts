import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ajax } from 'rxjs/ajax';
import { ClaimDocument } from './model/ClaimDocument';
import { ResponseObject } from 'src/app/model/response.claim.object';
import { ToastrService } from 'ngx-toastr';
import { ActivityRequest } from './activity/activity/models/activity.request';
import { AppConstants } from './app.constants';
import { FlowableConstants } from './flowable.constants';
import { FlowableTask } from './flowable/FlowableTask';
import { FlowableProcess } from './flowable/FlowableProcess';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {
  }


  // Helper: Creates basic http options for a request
  static flowableCreateBasicHttpOptions(): any {
    return {
      headers: this.flowableCreateHeaders(),
    };
  }


  // Helper: Creates basic headers with authentications
  static flowableCreateHeaders(): HttpHeaders {
    const userAuthenticationDetails = this.flowableGetUserAuthenticationDetails();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + this.flowableGetUserAuthenticationDetails()
    });
  }

  static flowableGetUserAuthenticationDetails() {
    return localStorage.getItem(FlowableConstants.FLOWABLE_BASIC_AUTH_KEY);
  }

  getAssignees(): Observable<any> {
    return this.http.get<ResponseObject>(environment.claimUrl + 'assignee/').pipe(
      map(event => {
        return event;
      }),
      catchError(this.handleError));
  }

  findProductDetail(productId: string) {
    return <any>this.http.get(environment.policyUrl + 'productapi/products',
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  uploadClaims(formData) {
    return this.http.post(environment.claimUrl + 'claims/batch/upload', formData,
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  findClaimBatchSummary(formData) {
    return <any>this.http.get(environment.claimUrl + 'claim/batch/summary?batchId=' + formData.get('batchId'),
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  findClaimsBatchExecutionHistory() {
    return <any>this.http.get(environment.claimUrl + 'claims/batches',
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  findClientPartnerDetails() {
    return this.http.get(environment.productUrl + 'clients/',
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  createClaim(claimModel): Observable<any> {
    return <any>this.http.post(environment.claimUrl + 'v1', claimModel);
  }

  updateClaim(claimModel): Observable<any> {
    return <any>this.http.post(environment.claimUrl + 'v1/update', claimModel);
  }

  findClaim(policyId: String) {
    return <any>this.http.get(environment.claimUrl + 'byPolicyNo?policyId=' + policyId,
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  getClaim(policyNo: String) {
    const url = environment.claimUrl + 'byActiveClaim/v1?policyNo=' + policyNo;
    return <any>this.http.get(url);
  }

  findActiveClaim(policyNo: String): Observable<any> {
    const url = environment.claimUrl + 'byActiveClaim/v1?policyNo=' + policyNo;
    return this.http.get(url).pipe(
      map(event => {
        return event;
      }),
      catchError(this.handleError)
    );
  }

  findClaimStatus(): Observable<any> {
    return this.http.get<ResponseObject>(environment.claimUrl + 'claimStatusList/').pipe(
      map(event => {
        return event;
      }),
      catchError(this.handleError));
  }


  findClaims(claimSearch): Observable<any> {
    return this.http.get(environment.claimUrl + 'claimSearch', {
        params: claimSearch
      }
    );
  }

  findClaimAuditTrial(claimNo: string): Observable<any> {
    return this.http.get(environment.claimUrl + 'claimAuditLog?claimNo=' + claimNo).pipe(
      map(event => {
        return event;
      }),
      catchError(this.handleError)
    );
  }

  showClaims(): Observable<any> {
    const url = environment.claimUrl + 'all/v1';
    return this.http.get<ClaimDocument>(url).pipe(
      map(event => {

        return event;
      }),
      catchError(this.handleError)
    );
  }

  showClaimDetail(claimId: String, partnerId: String): Observable<any> {
    const url = environment.claimUrl + 'byClaimId/v1/' + claimId + '?' + 'partnerId=' + partnerId;
    return this.http.get<ResponseObject>(url).pipe(
      map(event => {
        return event;
      }),
      catchError(this.handleError)
    );
  }

  showClaimDetailByClaimNumber(claimNo: String, claimLogId: string): Observable<any> {
    const userId = sessionStorage.getItem(AppConstants.LOGGED_IN_USER);
    const url = environment.claimUrl + 'byClaimType/v1?claimNo=' + claimNo + '&userId=' + userId + '&claimLogId=' + claimLogId;
    return this.http.get<ResponseObject>(url).pipe(
      map(event => {
        return event;
      }),
      catchError(this.handleError)
    );
  }

  findProduct(productId: string) {
    return <any>this.http.get(environment.claimUrl + 'byProdut?productId=' + productId,
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  uploadDocument(formData): Observable<any> {
    return ajax.post(environment.claimUrl + 'upload', formData);
  }

  removeDocument(formData) {
    return ajax.post(environment.claimUrl + 'document/delete', formData);
  }

  downloadDocument(path, filename) {
    const url = environment.claimUrl + 'downloadFile/' + filename;
    return this.http.get<ClaimDocument>(url).pipe(
      map(event => {
        return event;
      }),
      catchError(this.handleError)
    );
  }

  uploadImage(formData) {
    return ajax.post(environment.claimUrl + 'upload', formData);
  }

  deleteImage(formData) {
    return this.http.post<any>(environment.claimUrl + 'deleteImage', formData)
    .pipe(
      catchError(this.handleError)
    );
  }

  postCapture(data: any) {
    return <any>this.http.post(environment.claimUrl + 'api/postlog', data,
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  getRepairDetails(repairId, partnerId): Observable<any> {
    const url = environment.repairUrl + 'repair/v1/cases/' + repairId + '?partnerId=' + partnerId;
    return this.http.get(url).pipe(
      map(event => {
        return event;
      }),
      catchError(this.handleError)
    );
  }

  updatePolicy(policyDocument, policyId): Observable<any> {
    return <any>this.http.put(environment.policyUrl + 'policies/' + policyId, policyDocument);
  }

  showInfo(message, title) {
    this.toastr.info(message, title, {
      closeButton: true,
      positionClass: 'toast-top-center'
    });
  }

  saveActivityRequest(activityRequest: any): Observable<any> {
    return <any>this.http.post(environment.activityUrl + '/', activityRequest);
  }

  getActivityConstants(activitType: string): Observable<any> {
    return <any>this.http.get(environment.activityUrl + 'constants?activitYType=' + activitType);
  }

  getActivityLog(relatedId: string, activityType: string): Observable<any> {
    return <any>this.http.get(environment.activityUrl + relatedId + '?activityType=' + activityType);
  }

  updateActivityRequest(activityRequest: ActivityRequest, activityId: string) {
    return <any>this.http.put(environment.activityUrl + activityId, activityRequest);

  }

  deleteRequest(activityId: string) {
    return <any>this.http.delete(environment.activityUrl + activityId);
  }

  getConstantsRequest(activitYType: string): Observable<any> {
    return <any>this.http.get(environment.activityUrl + 'constants?activityType=' + activitYType);
  }

  getCountryList(): Observable<any> {
    return <any>this.http.get(environment.productUrl + 'countries/');
  }

  subscribeToLockNotifications(primaryIdentifier: string, subscriberId: string): EventSource {
    return new EventSource(`${environment.lockUrl}${primaryIdentifier}?subscriberId=${subscriberId}`);
  }

  acquireLock(lockRequestModel): Observable<any> {
    return <any>this.http.post(environment.lockUrl, lockRequestModel);
  }

  releaseLock(primaryIdentifier: string, subscriberId: string, lockId: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('primaryIdentifier', primaryIdentifier);
    params = params.append('subscriberId', subscriberId);
    params = params.append('lockId', lockId);
    return <any>this.http.delete(`${environment.lockUrl}`, { params: params });
  }

  uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r:(r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  removeSubscriberBeforeWindowUnload(primaryIdentifier: string, subscriberId: string, lockId: string) {
    let xhr = new XMLHttpRequest();
    xhr.open('DELETE', `${environment.lockUrl}?primaryIdentifier=${primaryIdentifier}&subscriberId=${subscriberId}&lockId=${lockId}`, false);
    xhr.send();
  }

  getProductRuleByProductCode(productCode: string): Observable<any> {
    return <any>this.http.get(environment.productUrl + '/productrules/rule?productCode=' + productCode);
  }

  private getEventMessage(event: HttpEvent<any>) {

    switch (event.type) {

      case HttpEventType.UploadProgress:
        return this.fileUploadProgress(event);

      case HttpEventType.Response:
        return this.apiResponse(event);
    }
  }

  private fileUploadProgress(event) {
    const percentDone = Math.round(100 * event.loaded / event.total);
    return { status: 'Progress', message: percentDone };
  }

  private apiResponse(event) {
    return event.body;
  }

  private handleError(error: HttpErrorResponse) {
    return throwError('Something bad happened; please try again later.');
  }

  paginateSearch(event, itemsPerPage, searchObj, callback: Function, componentRef, isItemsChangeEvent = false): void {
    if (!isItemsChangeEvent) {
      searchObj.pageIndex = event - 1;
      searchObj.pageRecordCount = itemsPerPage;
      componentRef.currentPage = event;
    } else {
      searchObj.pageIndex = componentRef.currentPage - 1;
      searchObj.pageRecordCount = event.value;
    }
    callback(searchObj, false);
  }

  resetControls(searchObject, componentRef) {
    searchObject.pageIndex = 0;
    componentRef.currentPage = 1;
    searchObject.pageRecordCount = 10;
  }

  findProductByPartnerid(partnerid: string): Observable<any> {
    return <any>this.http.get(environment.productUrl + '/products/products-by-partnerid/' + partnerid);
  }

  findStores(partnerProductCode: string): Observable<any> {
    return <any>this.http.get(environment.mdmUrl + '/store?productPartnerCode=' + partnerProductCode);
  }

  /**
   *
   * @param processDefinitionID: The processDefinitionID is the id of the process that
   * we want to start for the claim process
   */
  async startFlowableProcess(processDefinitionID: string): Promise<FlowableProcess> {
    // Prepare request body
    // - Needs the processDefinitionID
    const body = {
      'processDefinitionId': processDefinitionID,
    };

    // Make request to flowable
    const endpoint = FlowableConstants.FLOWABLE_PROCESS_INSTANCE_ENDPOINT;
    const options = AppService.flowableCreateBasicHttpOptions();
    // - Request (return as a promsie that resolves to FlowableProcess)
    return new Promise((resolve, reject) => {
      this.http.post(endpoint, body, options).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err)
      );
    });
  }

  /**
   *
   * @param processDefinitionID: The processDefinitionID is the id of the process that
   * we want to start for the claim process
   */
  async startFlowableProcessWithData(processDefinitionID: string, claimFormDataWithFile: any): Promise<FlowableProcess> {
    // Prepare variables
    const variables = [];

    // Handle form data
    // - Chrome doesn't use the of operator currently.
    const claimIterator = claimFormDataWithFile.entries();
    while (true) {
      const nextIter = claimIterator.next();
      const pair = nextIter.value;
      if (nextIter.done) {
        break;
      }
      const key = pair[0];
      const value = pair[1];
      // Handle claim request object
      if (key === 'claimRequest') {
        const data = JSON.parse(pair[1]); // Parse the string object that we received
        Object.keys(data).forEach(k => {
          // Map policyNo to policyNumber
          if (k === 'policyNo') {
            variables.push({ 'name': 'policyNumber', 'value': data[k] });
          }
          variables.push({ 'name': k, 'value': data[k] });
        });
      }

      // [] TODO: FIXME: Handle file Uploads
      // Note: Currently we don't support file uploads since we don't know
      // how to do it with flowable as of yet. Will add it as a separate
      // JIRA TASK

    }

    // Prepare request body
    // - Needs the processDefinitionID
    const body = {
      'processDefinitionId': processDefinitionID,
      'variables': variables
    };

    // Make request to flowable
    const endpoint = FlowableConstants.FLOWABLE_PROCESS_INSTANCE_ENDPOINT;
    const options = AppService.flowableCreateBasicHttpOptions();
    // - Request (return as a promsie that resolves to FlowableProcess)
    return new Promise((resolve, reject) => {
      this.http.post(endpoint, body, options).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err)
      );
    });
  }


  /**
   *
   * @param flowableProcessInstanceID: The flowableProcessInstanceID is the id of the process that
   * we want to cancel for the claim process
   */
  async cancelFlowableProcess(flowableProcessInstanceID: string) {
    // Make request to flowable
    const endpoint = FlowableConstants.FLOWABLE_PROCESS_INSTANCE_ENDPOINT;
    const endpointWithProcessID = [endpoint, flowableProcessInstanceID].join('/');
    const options = AppService.flowableCreateBasicHttpOptions();
    // - Request (return as a promsie that resolves to FlowableProcess)
    return new Promise((resolve, reject) => {
      this.http.delete(endpointWithProcessID, options).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err)
      );
    });
  }

  /**
   * Retrieves the details for the specified process
   *
   * @param processInstanceID: The processInstanceID that we want to retrieve
   */
  flowableGetProcessInstanceByID(processInstanceID: string) {
    // Make request to flowable
    const endpoint = FlowableConstants.FLOWABLE_PROCESS_INSTANCE_ENDPOINT;
    const options = AppService.flowableCreateBasicHttpOptions();
    // - Request (return as a promsie that resolves to FlowableProcess)
    return new Promise((resolve, reject) => {
      this.http.get(endpoint, options).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err)
      );
    });
  }


  /**
   * Retrieves the details for the specified task
   *
   * @param processInstanceID: The processInstanceID that we want to retrieve
   */
  async flowableGetTasksByProcessInstanceID(processInstanceID: string): Promise<FlowableTask[]> {
    // Note: Endpoint is dynamically generated from the given processInstanceID
    const endpoint = FlowableConstants.FLOWABLE_TASKS_ENDPOINT;
    const options = AppService.flowableCreateBasicHttpOptions();

    // Add query parameters
    options.params = Object.assign(options.params || {}, {
      processInstanceId: processInstanceID,
    });

    // Make request
    return new Promise((resolve, reject) => {
        this.http.get(endpoint, options).subscribe(
          (res: any) => {
            resolve(res.data);
          },
          (err: any) => {
            reject(err);
          });
      }
    );

  }

  /**
   * Retrieves the details for the specified task
   *
   * @param processInstanceID: The processInstanceID that we want to retrieve
   */
  flowableGetFormByTaskID(processInstanceID: string) {
    const endpoint = FlowableConstants.FLOWABLE_TASK_ENDPOINT;
    const options = AppService.flowableCreateBasicHttpOptions();

    // Make request
    return new Promise((resolve, reject) => {
      this.http.get(endpoint, options).subscribe(
        res => resolve(res),
        err => reject(err)
      );
    });
  }

  /**
   * Claim the task using the current user's credentials
   *
   * Note: You need to first claim the task using the current user
   * before you're able to complete an action on it
   *
   * @param taskID: The task on which to claim
   */
  async flowableClaimTaskByID(taskID: string) {
    const action = FlowableConstants.FLOWABLE_ACTION_CLAIM_TASK;
    const payload = {
      'assignee': this.getCurrentUser(),
    };

    return this.flowableActionByTaskID(taskID, action, payload);
  }

  /**
   * Complete the task
   *
   * @param taskID: The task on which to claim
   * @param payload: The payload to send to flowable
   */
  async flowableCompleteTaskByID(taskID: string, payload: any) {
    const action = FlowableConstants.FLOWABLE_ACTION_COMPLETE_TASK;
    return this.flowableActionByTaskID(taskID, action, payload);
  }

  /**
   * Trigger an action on flowable for a specific task
   *
   * @param taskID: The task on which we want to do the action
   * @param action: The action that we want to do (See actions under FlowableConstants)
   * @param actionVariables: The variables that we want to pass to claim
   */
  async flowableActionByTaskID(taskID: string, action: string, payload: any) {
    // Prepare request body
    // - Attach the action
    const body = Object.assign(
      {},
      { 'action': action }, // Source1
      payload,                    // Source2
    );

    // Make request to flowable
    const endpoint = FlowableConstants.flowableTaskEndpoint(taskID);
    const options = AppService.flowableCreateBasicHttpOptions();
    // - Request
    return new Promise((resolve, reject) => {
      this.http.post(endpoint, body, options).subscribe(
        (res: any) => resolve(res),
        (err) => reject(err)
      );
    });
  }


  async flowableCreateClaim(processID: string, claimFormDataWithFile: any) {
    // - Creating the flowable flow is done in one step by creating
    //   a new processInstance and passing the variables to that process
    //
    // - We will pass the entire create claim form alongside the starting of process
    const process: FlowableProcess = await this.startFlowableProcessWithData(
      await this.flowableProcessDefinitionID(), claimFormDataWithFile
    );

    return process;
  }


  async flowableUpdateClaim(processID: string, claimUpdateObject: any) {
    let i = 0;
    while (true) {
      // Note: Currently we've to do this three times to reach the verify claim stage
      const tasks: FlowableTask[] = await this.flowableGetTasksByProcessInstanceID(processID);
      const task: FlowableTask = tasks[0];

      // Handle form data
      const variables = [];
      const values = {};
      Object.keys(claimUpdateObject).forEach(k => {
        // Map policyNo to policyNumber
        if (k === 'policyNo') {
          variables.push({ 'name': 'policyNumber', 'value': claimUpdateObject[k] });
          values['policyNumber'] = claimUpdateObject[k];
        } else if (k === 'dateOfIncident') {
          // FIXME: Temporary workaround for date formatting
          const reformattedDate = [
            claimUpdateObject[k].substr(0, 2),
            claimUpdateObject[k].substr(3, 2),
            claimUpdateObject[k].substr(6, 4)
          ].reverse().join('-');
          values[k] = reformattedDate;
          variables.push({ 'name': k, 'value': reformattedDate });
        } else {
          values[k] = claimUpdateObject[k];
          variables.push({ 'name': k, 'value': claimUpdateObject[k] });
        }
      });

      const payload = { variables: variables, values: values };
      await this.flowableCompleteTaskByID(task.id, payload);
      break;

      // Stop at Assign CA / Verify Claim task
      if (task && (task.name === 'Verify Claim' || task.name === 'Assign CA' || (i++ > 3))) {
        break;
      }
      await this.flowableCompleteTaskByID(task.id, {});
    }
  }

  public async flowableProcessDefinitionID(): Promise<string> {
    const getRequest = FlowableConstants.FLOWABLE_PROCESS_DEFINITION_ENDPOINT + '?latest=true&key=' + environment.flowableAppDefinitionKey;
    return new Promise((resolve, reject) => {
      this.http.get(getRequest, AppService.flowableCreateBasicHttpOptions()).subscribe(
        (res: any) => resolve(res.data[0].id),
        (err) => reject(err)
      );
    });

    //   const localProcessDefinitionID = localStorage.getItem('processDefinitionID');
    //   if (localProcessDefinitionID && localProcessDefinitionID !== '') {
    //     return localProcessDefinitionID;
    //   }
    //
    //   return this.PROCESS_DEFINITION_ID_CREATE_CLAIM;
    // }
  }

  private getCurrentUser() {
    return sessionStorage.getItem(AppConstants.LOGGED_IN_USER);
  }
  fetchDraftClaimByPolicyNo(policyNo : string) : Observable<any>{
    return <any>this.http.get(environment.claimUrl + 'fetchDraft/' + policyNo);
  }
  draftClaim(claimModel): Observable<any> {
    return <any>this.http.post(environment.claimUrl + '/draft', claimModel);
  }
  deActiveDraft(formData : FormData): Observable<any> {
    return <any>this.http.post(environment.claimUrl+'/deActivateDraft',formData);
  }
  removeDraftDocument(formData) {
    return ajax.post(environment.claimUrl + 'draft/document/delete', formData);
  }
}

