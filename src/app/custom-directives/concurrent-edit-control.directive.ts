import {Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LockRequest} from '../model/lock.request';
import {AppService} from '../app.service';
import {ClaimConstants} from '../claim/claim.constants';
import {SourceEnum} from '../model/source.enum';
import {LockEnum} from '../model/lock.enum';
import {LockGrantStatusEnum} from '../model/lock.grant,status.enum';
import {PolicyConstants} from '../policy/policy.constants';

@Directive({
  selector: '[appConcurrentEditControl]'
})
export class ConcurrentEditControlDirective implements OnInit, OnDestroy {

  @Input() sourceName: string;
  @Input() sourceIdentifiersString: string;
  @Input() action: string;
  @Input() isTarget: string;
  @Output('callback') callComponentFunction: EventEmitter<any> = new EventEmitter<any>();

  constructor(private el: ElementRef, private service: AppService) {
  }

  ngOnInit() {
  }

  @HostListener('click') fetchLock() {
    switch (this.action) {
      case 'ACTION_ACQUIRE':
        this.acquireLock();
        break;
      case 'ACTION_RELEASE':
        this.releaseLock();
        break;
      case 'ACTION_SAVE':
        this.saveChanges();
    }
  }

  saveChanges(): void {
    this.releaseLock();
    this.callComponentFunction.emit();
  }

  subscribeToLockNotifications(isStopRequest: boolean = false): void {
    let primaryIdentifier = this.getPrimaryIdentifer();
    if (primaryIdentifier != null) {
      if (sessionStorage.getItem('subscriberId') == null) {
        let subscriberId = this.service.uuidv4();
        let notificationListener = this.service.subscribeToLockNotifications(primaryIdentifier, subscriberId);

        //Listener for closeNotificationChannel Event
        sessionStorage.setItem("subscriberId", subscriberId);
        notificationListener.addEventListener("CLOSE_NOTIFICATION_CHANNEL", (message :any) => {
          notificationListener.close();
        });

        //Listener for lockRelease Event
        notificationListener.addEventListener("LOCK_RELEASE", (message: any) => {
          let lockNotificationResponse = JSON.parse(message.data);
          this.showInfoMessagesForLock(lockNotificationResponse);
        });
      }
    }
  }

  getPrimaryIdentifer(): string {
    let primaryIdentifierFromLocal = sessionStorage.getItem('primaryIdentifier');
    if (primaryIdentifierFromLocal) {
      return primaryIdentifierFromLocal;
    }

    let sourceIdentifier = this.sourceIdentifiersString.split(' ');
    let primaryIdentifier;
    switch (this.sourceName) {
      case SourceEnum.SOURCE_CLAIM:
        primaryIdentifier = sourceIdentifier[1];
        break;
      case SourceEnum.SOURCE_POLICY:
        primaryIdentifier = sourceIdentifier[0];
        break;
      case SourceEnum.SOURCE_REPAIR:
        primaryIdentifier = sourceIdentifier[2];
        break;
    }
    return primaryIdentifier;

  }

  private acquireLock(): void {
    let lockId = this.getLockIdFromLocal();
    if (lockId == null) {
      let lockRequest = this.buildLockRequest();
      this.performLockAquisitionTasks(lockRequest);
    } else {
      this.callComponentFunction.emit('edit');
    }
    this.subscribeToLockNotifications();
  }

  private releaseLock(): void {
    let lockId = this.getLockIdFromLocal();
    if (lockId != null) {
      this.performLockReleaseTasks(lockId);
    }
    this.callComponentFunction.emit();
  }

  private performLockAquisitionTasks(lockRequest: LockRequest): void {
    this.service.acquireLock(lockRequest).subscribe(
      res => {
        if (res.grantStatus === 'LG_001') {
          this.setLockKeys(res.lockId);
          this.callComponentFunction.emit();
        } else if (res.grantStatus === LockGrantStatusEnum.GRANT_STATUS_LG_002) {
          this.el.nativeElement.diabled = "disabled";
          this.showInfoMessagesForLock(res);
        }
        sessionStorage.setItem('primaryIdentifier', this.getPrimaryIdentifer());
      });
  }

  private performLockReleaseTasks(lockId: string): void {
    let primaryIdentifier = this.getPrimaryIdentifer();
    let subscriberId = sessionStorage.getItem("subscriberId");
    this.service.releaseLock(primaryIdentifier, subscriberId, lockId).subscribe(
      res => {
        if (res.grantStatus == LockGrantStatusEnum.GRANT_STATUS_LG_004) {
          this.clearLockKeys();
          this.callComponentFunction.emit();
        } else if (res.grantStatus == LockGrantStatusEnum.GRANT_STATUS_LG_003) {

        }
      }
    );
  }

  private buildLockRequest(): LockRequest {
    let sourceIdentifier = this.sourceIdentifiersString.split(' ');
    let lockRequest: LockRequest;
    switch (this.sourceName) {
      case SourceEnum.SOURCE_CLAIM:
        lockRequest = {
          'policyIdentifier': sourceIdentifier[0],
          'claimIdentifier': sourceIdentifier[1],
          'client': 'LC_002',
          'repairIdentifier': null,
          'requestedBy': sessionStorage.getItem('loggedInUser'),
          'requestedAt': new Date()
        };
        break;
      case SourceEnum.SOURCE_POLICY:
        lockRequest = {
          'policyIdentifier': sourceIdentifier[0],
          'claimIdentifier': null,
          'client': 'LC_001',
          'repairIdentifier': null,
          'requestedBy': sessionStorage.getItem('loggedInUser'),
          'requestedAt': new Date()
        };
        break;
    }
    return lockRequest;
  }

  private getLockIdFromLocal(): string {
    return sessionStorage.getItem(this.getLockStringFromLocal());
  }

  private getLockStringFromLocal(): string {
    switch (this.sourceName) {
      case SourceEnum.SOURCE_CLAIM:
        return LockEnum.CLAIM_LOCK_ID;
      case SourceEnum.SOURCE_POLICY:
        return LockEnum.POLICY_LOCK_ID;
      case SourceEnum.SOURCE_REPAIR:
        return LockEnum.REPAIR_LOCK_ID;
    }
  }

  private setLockKeys(lockId: string) {
    sessionStorage.setItem(this.getLockStringFromLocal(), lockId);
  }

  private clearLockKeys(): void {
    sessionStorage.removeItem("primaryIdentifier");
    sessionStorage.removeItem(this.getLockStringFromLocal());
    sessionStorage.removeItem("LOCK_REQUESTED");
    sessionStorage.removeItem("subscriberId");
  }

  private extractMsgFromNotification(lockNotificationResponse: any): string {
    let ownerEntity = lockNotificationResponse.ownerEntity;
    let editorEntity;
    if (ownerEntity == 'LO_001') {
      editorEntity = 'policy';
    } else if (ownerEntity == 'LO_002') {
      editorEntity = 'claim';
    } else {
      editorEntity = 'repair';
    }
    return 'User : ' + lockNotificationResponse.acquiredBy + ' is updating the ' + editorEntity + '!!!';
  }

  private showInfoMessagesForLock(lockNotificationResponse: any): void {
    let grantStatus = lockNotificationResponse.grantStatus;
    let rootCause, message;
    switch (this.sourceName) {
      case SourceEnum.SOURCE_CLAIM:
        rootCause = ClaimConstants.EDIT_LOCK_MESSAGE;
        if (grantStatus == LockGrantStatusEnum.GRANT_STATUS_LG_002) {
          message = this.extractMsgFromNotification(lockNotificationResponse);
        } else if (grantStatus == 'LG_004') {
          message = 'Claim is now available for update!!!';
        }
        break;
      case SourceEnum.SOURCE_POLICY:
        rootCause = PolicyConstants.EDIT_LOCK_MESSAGE;
        if (grantStatus == LockGrantStatusEnum.GRANT_STATUS_LG_002) {
          message = this.extractMsgFromNotification(lockNotificationResponse);
        } else if (grantStatus == 'LG_004') {
          message = 'Policy is now available for update!!!';
        }
        break;
    }
    this.service.showInfo(rootCause, message);
  }

  @HostListener('window:beforeunload')
  performWindowUnloadTasks() {
    if (this.isTarget == undefined) {
      let primaryIdentifier = this.getPrimaryIdentifer();
      let subscriberId = sessionStorage.getItem("subscriberId");
      let lockId = this.getLockIdFromLocal();
      if (subscriberId != null) {
        this.service.removeSubscriberBeforeWindowUnload(primaryIdentifier, subscriberId, lockId)
        sessionStorage.removeItem("subscriberId");
      }
    }
  }

  ngOnDestroy() {
    // cleanup logic goes here
    if (this.isTarget == undefined) {
      this.releaseLock();
    }
  }
}
