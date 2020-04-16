import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-repair',
  templateUrl: './repair.component.html',
  styleUrls: ['./repair.component.css'],
})

export class RepairComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<RepairComponent>, private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
  }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
