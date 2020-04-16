import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppConstants } from '../app.constants';
import { PolicyEnum } from '../model/policy.enum';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  constructor(private http: HttpClient) {
  }

  uploadPolicies(formData) {
    return this.http.post(environment.policyUrl + 'policies/batch/upload', formData,
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  findPolicyBatchSummary(formData) {
    return <any>this.http.get(environment.policyUrl + 'policies/batch/summary?batchId=' + formData.get('batchId'),
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  findPolicyBatchErrorLogs(formData) {
    return <any>this.http.get(environment.policyUrl + 'policies/error?batchId=' + formData.get('batchId'),
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  findPoliciesBatchExecutionHistory(batchExecutionHistorySearchObject) {
    return this.http.get(environment.policyUrl + 'policies/batches', {
      params: batchExecutionHistorySearchObject,
      reportProgress: true, observe: 'events'
    }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  createPolicy(policyModel) {
    return <any>this.http.post(environment.policyUrl + 'policy', policyModel,
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );

  }

  findPolicies(policySearch) {
    let enpointUrl  = environment.policyUrl;
    if(policySearch.partnerId == PolicyEnum.PARTNER_DIGI_MALAYSIA){
      enpointUrl = enpointUrl + 'fetchDeviceImageInfo'
    }else{
      enpointUrl = enpointUrl + 'policies'
    }
    return this.http.get(enpointUrl , {
      params: policySearch,
      reportProgress: true, observe: 'events'
    }
    ).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  findDeviceDetailsByImei(imeiNumber: string): Observable<any> {
    return this.http.get(environment.mdmUrl + '/deviceinfo/' + imeiNumber, {
      reportProgress: true, observe: 'events'
    }).pipe(
      map(event => this.getEventMessage(event)),
      catchError(this.handleError)
    );
  }

  filterClientDetails(res) {
    if (res != undefined) {
      let countryCode = sessionStorage.getItem(AppConstants.COUNTRY_CODE);
      if (countryCode != AppConstants.ALL_COUNTRIES_ACCESS) {
        return res.filter(element => element.countryCode === sessionStorage.getItem(AppConstants.COUNTRY_CODE));
      } else {
        return res;
      }
    }
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
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status},` + `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }

  decideIsCancellationActive(clientNames: any) {
    let hcvnClient = clientNames.filter(element => element.clientCode == 'HC')
    return (sessionStorage.getItem(AppConstants.COUNTRY_CODE) == AppConstants.ALL_COUNTRIES_ACCESS || (hcvnClient != undefined && hcvnClient.length > 0));
  }

  validateIMEI(partnerId, imeiNumber): Observable<any> {
    return <any>this.http.get(environment.policyUrl + 'validateIMEI/' + partnerId + '?imeiNumber=' + imeiNumber);
  }
  saveImei(imeiNumber : string):Observable<any>{
    let imeiParams = new HttpParams();
    imeiParams = imeiParams.set('imeiNumber', imeiNumber);
    return <any>this.http.post(environment.mdmUrl + '/saveImei', imeiParams);
  }
}
