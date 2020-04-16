import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WebSocketTopics {
    public static topicOfClaimLogs: string = "/topic/claimLogs";
}
