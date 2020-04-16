import { version } from '../../package.json';
import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { LoginService } from './login/login.service';
import { Router } from '@angular/router';
import { AppConstants } from './app.constants';
import { BnNgIdleService } from 'bn-ng-idle';
import { AppService } from './app.service';
import { ToastrService } from 'ngx-toastr';
import { LockEnum } from './model/lock.enum.js';
import { ResponseObject } from './model/response.claim.object.js';
import { MatDialog } from '@angular/material';
import { NotificationComponent } from './notification/notification.component';
import { WebSocketAPI } from './websockets/webSocketAPI.js';
import { ClaimDocument } from './model/ClaimDocument.js';
import { WebSocketTopics } from './websockets/websocket.topics.constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterContentChecked {
  appVersion: string;
  title = AppConstants.TITLE;
  showTabs: boolean = false;
  showPolicyTab: boolean = false;
  showClaimTab: boolean = false;
  showProductTab: boolean = false;
  showPartnersTab: boolean = false;
  showDigiApp: boolean = false;
  userName: string;
  crmzSelectedTab: Number = 0;
  responseList: any = {
    headers: Object,
    body: Object,
    statusCodeValue: '',
    statusCode: ''
  }
  response: ResponseObject;
  badgeCounter: Number;

  constructor(private router: Router, private toastr: ToastrService, private loginService: LoginService,
    private bnIdle: BnNgIdleService, private appService: AppService, private webSocketAPI: WebSocketAPI, private dialog: MatDialog) {
    this.appVersion = version;
    this.bnIdle.startWatching(3600).subscribe((res) => {
      if (res) {
        this.toastr.info('Session Expired', '', {
          closeButton: true,
          positionClass: 'toast-top-center',
          timeOut: 600000
        });
        this.logout();
      }
    });
    this.loginService.showTabs.subscribe(res => {
      this.showTabs = res === AppConstants.TRUE ? true : false;
      this.userName = sessionStorage.getItem(AppConstants.LOGGED_IN_USER);
    });
    this.loginService.showPolicyTab.subscribe(res1 => {
      this.showPolicyTab = res1 === AppConstants.TRUE ? true : false;
    });
    this.loginService.showClaimTab.subscribe(res2 => {
      this.showClaimTab = res2 === AppConstants.TRUE ? true : false;
    });
    this.loginService.showProductTab.subscribe(res2 => {
      this.showProductTab = res2 === AppConstants.TRUE ? true : false;
    });
    this.loginService.showPartnersTab.subscribe(res4 => {
      this.showPartnersTab = res4 === AppConstants.TRUE ? true : false;
    });
    this.loginService.showDigi.subscribe(res5 => {
      this.showDigiApp = res5 === AppConstants.TRUE ? true : false;
    });
    this.webSocketAPI.listOfNotification.subscribe(list => {
      this.responseList = list;
      if (this.responseList) {
        this.response = this.responseList.body;
      }
      if (this.response && this.response.content) {
        let i: number = 0;
        for (let entry of this.response.content) {
          if (!((<ClaimDocument>entry).notificationRead && (<ClaimDocument>entry).notificationRead.length > 0
            && (<ClaimDocument>entry).notificationRead.includes(sessionStorage.getItem(AppConstants.LOGGED_IN_USER)))) {
            i++;
          }
        }
        this.badgeCounter = i;
      }
    });
  }

  ngAfterContentChecked() {
    if (sessionStorage.getItem(AppConstants.LOGGED_IN_USER)) {
      this.userName = sessionStorage.getItem(AppConstants.LOGGED_IN_USER);
    }
    if (sessionStorage.getItem(AppConstants.ENABLE_LOGIN)) {
      this.showTabs = sessionStorage.getItem(AppConstants.ENABLE_LOGIN) == AppConstants.TRUE;
    }
    if (sessionStorage.getItem(AppConstants.ENABLE_POLICY_TAB)) {
      this.showPolicyTab = sessionStorage.getItem(AppConstants.ENABLE_POLICY_TAB) == AppConstants.TRUE;
    }
    if (sessionStorage.getItem(AppConstants.ENABLE_CLAIM_TAB)) {
      this.showClaimTab = sessionStorage.getItem(AppConstants.ENABLE_CLAIM_TAB) == AppConstants.TRUE;
    }
    if (sessionStorage.getItem(AppConstants.ENABLE_PRODUCTS_TAB)) {
      this.showProductTab = sessionStorage.getItem(AppConstants.ENABLE_PRODUCTS_TAB) == AppConstants.TRUE;
    }
    if (sessionStorage.getItem(AppConstants.ENABLE_PARTNERS_TAB)) {
      this.showPartnersTab = sessionStorage.getItem(AppConstants.ENABLE_PARTNERS_TAB) == AppConstants.TRUE;
    }

  }

  logout() {
    this.clearLockSubscriptions();
    sessionStorage.clear();
    window.location.replace(window.location.origin);
  }

  /**
   * Reset outletName of each tab DOM
   * content to null
   */
  resetRoute() {
    this.clearLockSubscriptions();
    this.router.navigate([{ outlets: { primary: null } }]);
  }

  clearLockSubscriptions() {
    let primaryIdentifier = sessionStorage.getItem('primaryIdentifier');
    let subscriberId = sessionStorage.getItem('subscriberId');
    let lockId = sessionStorage.getItem(LockEnum.CLAIM_LOCK_ID) || sessionStorage.getItem(LockEnum.POLICY_LOCK_ID) || sessionStorage.getItem(LockEnum.REPAIR_LOCK_ID);
    if (primaryIdentifier && subscriberId) {
      this.appService.releaseLock(primaryIdentifier, subscriberId, lockId).subscribe((res: any) => {

      }), (err: any) => {
      };
    }
  }

  openNotifications() {
    this.crmzSelectedTab = this.crmzSelectedTab != 2 ? 2 : this.crmzSelectedTab;
    this.resetRoute();
    this.dialog.open(NotificationComponent, {
      data: this.response.content
    });
    this.badgeCounter = null;
  }
}
