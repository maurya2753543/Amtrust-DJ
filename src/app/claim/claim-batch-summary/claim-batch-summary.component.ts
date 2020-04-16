import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ResponseObject} from 'src/app/model/response.object';
import {AppService} from 'src/app/app.service';

@Component({
  selector: 'app-claim-batch-summary',
  templateUrl: './claim-batch-summary.component.html',
  styleUrls: ['./claim-batch-summary.component.css']
})
export class ClaimBatchSummaryComponent implements OnInit {

  profileForm: FormGroup;
  batchSummary: ResponseObject;
  error: String;

  constructor(private fb: FormBuilder, private service: AppService) {
  }

  ngOnInit() {
    this.profileForm = this.fb.group({
      batchIdNumber: ['']
    });
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('batchId', this.profileForm.get('batchIdNumber').value);
    this.service.findClaimBatchSummary(formData).subscribe(
      res => this.batchSummary = res,
      err => this.error = err
    );
  }
}
