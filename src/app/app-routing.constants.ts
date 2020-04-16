import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppRoutingConstants {

  public static APP_LOGIN: string = 'login';
  public static APP_LOGIN_DEFAULT: string = '';
  public static HOME: string = 'home';
  public static POLICY_UPLOAD: string = 'policy/upload';
  public static POLICY_BATCH_SUMMARY: string = 'policy/batch/summary';
  public static POLICY_CREATE: string = 'policy';
  public static POLICY_BATCH_HISTORY: string = 'policy/batch/history';
  public static POLICY_SEARCH: string = 'policy/list';
  public static POLICY_DETAIL: string = 'policy/list/detail';
  public static CLAIM_SEARCH: string = 'claim/search';
  public static CLAIM_SEARCH_BY_PARAMETERS: string = 'claim/search/:searchBy';
  public static CLAIM_DETAIL: string = 'claim/search/detail';
}
