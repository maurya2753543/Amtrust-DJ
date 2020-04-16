import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IProduct } from './product';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private productUrl = environment.productUrl + 'products/VN_HC_NA_ADLD';

    constructor(private http: HttpClient) {
    }

    getProductList(productSearchCriteria): Observable<any> {
        const url = environment.productUrl + 'products/search';
        return this.http.post(url, productSearchCriteria).pipe(
            map(data => {
                return data;
            }),
            catchError(this.handleError)
        );
    }

    getProducts(): Observable<IProduct> {
        return this.http.get<IProduct>(this.productUrl).pipe(
            map(data => {
                return data;
            }),
            catchError(this.handleError)
        );
    }

    getProduct(id: number): Observable<IProduct> {
        const url = `{productUrl}/${id}`;
        return this.http.get<IProduct>(url).pipe(
            map(result => {
                return result;
            }),
            catchError(this.handleError)
        );
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

    private handleError(err: HttpErrorResponse) {
        let errorMessage = '';
        if (err.error instanceof ErrorEvent) {
            errorMessage = `An error occurred: ${err.error.message}`;
        } else {
            errorMessage = `Server returned code: ${err.status}, error message is: ${
                err.message
                }`;
        }
        console.error(errorMessage);
        return throwError(errorMessage);
    }


    getAutcompleteAdress(searchKey: string, country: string) {
        return <any>this.http.get(environment.productUrl + 'address/autoComplete/' + country + "?searchKey=" + searchKey);
    }

    getAddressDetails(placeId: string, country: string) {
        return <any>this.http.get(environment.productUrl + 'address/details/' + country + '?placeId=' + placeId);
    }

}
