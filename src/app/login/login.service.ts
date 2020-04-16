import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Groups } from '../model/groups';
import { AppConstants } from '../app.constants';
import { LoginCredentials } from '../model/login.credentials';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AppService } from '../app.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public showTabs: Observable<String>;
  public showPolicyTab: Observable<String>;
  public showClaimTab: Observable<String>;
  public showProductTabSubject: BehaviorSubject<String>;
  public showProductTab: Observable<String>;
  private showTabsSubject: BehaviorSubject<String>;
  private showPolicyTabSubject: BehaviorSubject<String>;
  private showClaimTabSubject: BehaviorSubject<String>;
  public showPartnersTab: Observable<String>;
  private showPartnersTabSubject: BehaviorSubject<String>;
  public showDigi: BehaviorSubject<string>;

  constructor(
    private _http: HttpClient,
    private groups: Groups,
    private appService: AppService
  ) {
    this.showTabsSubject = new BehaviorSubject<String>(
      JSON.parse(sessionStorage.getItem(AppConstants.ENABLE_LOGIN))
    );
    this.showTabs = this.showTabsSubject.asObservable();
    this.showPolicyTabSubject = new BehaviorSubject<String>(
      JSON.parse(sessionStorage.getItem(AppConstants.ENABLE_POLICY_TAB))
    );
    this.showPolicyTab = this.showPolicyTabSubject.asObservable();
    this.showClaimTabSubject = new BehaviorSubject<String>(
      JSON.parse(sessionStorage.getItem(AppConstants.ENABLE_CLAIM_TAB))
    );
    this.showClaimTab = this.showClaimTabSubject.asObservable();
    this.showProductTabSubject = new BehaviorSubject<String>(
      JSON.parse(sessionStorage.getItem(AppConstants.ENABLE_PRODUCTS_TAB))
    );
    this.showPartnersTabSubject = new BehaviorSubject<String>(
      JSON.parse(sessionStorage.getItem(AppConstants.ENABLE_PARTNERS_TAB))
    );
    this.showProductTab = this.showProductTabSubject.asObservable();
    this.showPartnersTab = this.showPartnersTabSubject.asObservable();
    this.showDigi = new BehaviorSubject<string>(
      AppConstants.FALSE
    )
  }

  /*Get User Details*/
  getUser(data: LoginCredentials): Observable<any> {
    return this._http
      .post<any>(environment.identityUrl + 'login/permissions', data)
      .pipe(
        map(res => {
          if (res && res.jwtToken) {
            let listOfClaimLogs: any;
            this.showTabsSubject.next(AppConstants.TRUE);
            sessionStorage.setItem(AppConstants.ENABLE_LOGIN, AppConstants.TRUE);
            const response = this.parseJwt(res.jwtToken.accessToken);
            sessionStorage.setItem(AppConstants.LOGGED_IN_USER, response.sub);
            sessionStorage.setItem(AppConstants.ROLE, response.role);
            sessionStorage.setItem(AppConstants.GROUP, response.gidNumber);
            sessionStorage.setItem(AppConstants.COUNTRY_CODE, response.postalAddress);
            this.showTabsSubject.next(AppConstants.TRUE);
            if (typeof response.partnerId != undefined && response.partnerId) {
              sessionStorage.setItem(AppConstants.PARTNER_ID, response.partnerId);
              sessionStorage.setItem(
                AppConstants.ENABLE_PARTNERS_TAB,
                AppConstants.TRUE
              );
              this.showPartnersTabSubject.next(AppConstants.TRUE);
            } else {
              if (
                response &&
                response.gidNumber &&
                this.groups.policyGroups.includes(response.gidNumber)
              ) {
                sessionStorage.setItem(
                  AppConstants.ENABLE_POLICY_TAB,
                  AppConstants.TRUE
                );
                this.showPolicyTabSubject.next(AppConstants.TRUE);
              }
              for (let i = 0; i < this.groups.claimGroups.length; i++) {
                if (
                  response &&
                  response.gidNumber &&
                  this.groups.claimGroups[i].includes(response.gidNumber)
                ) {
                  sessionStorage.setItem(
                    AppConstants.ENABLE_CLAIM_TAB,
                    AppConstants.TRUE
                  );
                  this.showClaimTabSubject.next(AppConstants.TRUE);
                  break;
                }
              }
              for (let i = 0; i < this.groups.productGroups.length; i++) {
                if (
                  response &&
                  response.gidNumber &&
                  this.groups.productGroups[i].includes(response.gidNumber)
                ) {
                  sessionStorage.setItem(
                    AppConstants.ENABLE_PRODUCTS_TAB,
                    AppConstants.TRUE
                  );
                  this.showProductTabSubject.next(AppConstants.TRUE);
                  break;
                }
              }
            }
          }
          return res;
        })
      );
  }

  parseJwt(accessToken) {
    const base64Url = accessToken.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  }

  setSessionStorageForLogin(res: any) {
    this.showTabsSubject.next(AppConstants.TRUE);
    sessionStorage.setItem(AppConstants.ENABLE_LOGIN, AppConstants.TRUE);
    const response = this.parseJwt(res.jwtToken.accessToken);
    sessionStorage.setItem(AppConstants.LOGGED_IN_USER, response.sub);
    sessionStorage.setItem(AppConstants.ROLE, response.role);
    sessionStorage.setItem(AppConstants.GROUP, response.gidNumber);
    sessionStorage.setItem(AppConstants.COUNTRY_CODE, response.postalAddress);
  }
}
