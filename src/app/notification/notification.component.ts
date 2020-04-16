import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConstants } from '../app.constants';
import { AppService } from '../app.service';
import { ClaimDocument } from '../model/ClaimDocument';
import { ResponseObject } from '../model/response.claim.object';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  userId: String;
  currentPage = 1;
  response: ResponseObject;
  constructor(private dialogRef: MatDialogRef<NotificationComponent>, private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data, private service: AppService, private router: Router) { }

  ngOnInit() {
    this.userId = sessionStorage.getItem(AppConstants.LOGGED_IN_USER);
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  fetchClaimDetails(claimDoc: ClaimDocument) {
    this.service.showClaimDetailByClaimNumber(claimDoc.claimNo, claimDoc.claimLogId).subscribe(res => {
      this.router.navigate([]);
      this.response = res;
      if (res && res.content) {
        claimDoc.partnerId = res.content.partnerId;
      }
      this.dialogRef.close();
      this.router.navigate(['claim', 'pending', 'detail'],
        { state: [this.response.content, claimDoc] });
    });
  }
}
