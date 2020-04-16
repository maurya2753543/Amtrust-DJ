import { AppComponent } from '../app.component';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AppConstants } from '../app.constants';
import { ResponseObject } from '../model/response.claim.object';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketAPI {
  constructor() {
    this.listOfNotificationSubject = new BehaviorSubject<ResponseObject>(JSON.parse(sessionStorage.getItem(AppConstants.ENABLE_PRODUCTS_TAB)));
    this.listOfNotification = this.listOfNotificationSubject.asObservable();
  }

  webSocketEndPoint: string = environment.websocketUrl + 'ws';
  public listOfNotification: Observable<ResponseObject>;
  private listOfNotificationSubject: BehaviorSubject<ResponseObject>;

  stompClient: any;
  connect(topic: string, userId: string) {
    let ws = new SockJS(this.webSocketEndPoint);
    this.stompClient = Stomp.over(ws);
    const _this = this;
    _this.stompClient.connect({}, function (frame) {
      _this.stompClient.subscribe(topic + '/' + userId, function (sdkEvent) {
        _this.onMessageReceived(sdkEvent);
      });
      _this.send(userId);
    }, this.errorCallBack(topic, userId));
  };

  disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
  }

  // on error, schedule a reconnection attempt
  errorCallBack(topic, userId) {
    setTimeout(() => {
      this.connect(topic, userId);
    }, 5000);
  }

  /**
   * Send message to sever via web socket
   */
  send(userId) {
    this.stompClient.send("/app/claimLogs/" + userId, {});
  }

  onMessageReceived(message) {
    let listOfClaimLogs = JSON.parse(message.body);
    this.listOfNotificationSubject.next(listOfClaimLogs)
  }
}
