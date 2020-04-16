import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-audit-changes',
  templateUrl: './audit-changes.component.html',
  styleUrls: ['./audit-changes.component.css']
})

export class AuditChangesComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<AuditChangesComponent>, private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public datas
  ) { }

  ngOnInit() { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
