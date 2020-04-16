import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-draft-claim-dailog',
  templateUrl: './draft-claim-dailog.component.html',
  styleUrls: ['./draft-claim-dailog.component.css']
})
export class DraftClaimDailogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<DraftClaimDailogComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string) { 
    
    }

  ngOnInit() {

  }
}
