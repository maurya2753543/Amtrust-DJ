import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from "rxjs";
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppConstants } from '../app.constants';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  constructor(private http: HttpClient) { }

  public claimAuditSearch(formData): Observable<any> {
    return this.http.post(environment.claimUrl + 'auditLogs', formData).pipe(
      map(data => { return data; }),
      catchError(this.handleError)
    );
  }

  public repairAuditSearch(formData): Observable<any> {
    return this.http.post(environment.repairUrl + 'auditLogs', formData).pipe(
      map(data => { return data; }),
      catchError(this.handleError)
    );
  }

  public policyAuditSearch(formData): Observable<any> {
    return this.http.post(environment.policyUrl + 'auditLogs', formData).pipe(
      map(data => { return data; }),
      catchError(this.handleError)
    );
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
}
