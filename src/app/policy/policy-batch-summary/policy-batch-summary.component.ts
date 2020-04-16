import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {PolicyService} from '../policy.service';
import {AngularCsv} from 'angular7-csv/dist/Angular-csv';
import {ResponseObjectValidationLogs} from 'src/app/model/response.errorlogs.obj';
import {ResponsePolicyObject} from 'src/app/model/response.policy.object';
import {AppConstants} from 'src/app/app.constants';

@Component({
  selector: 'app-policy-batch-summary',
  templateUrl: './policy-batch-summary.component.html',
  styleUrls: ['./policy-batch-summary.component.css']
})
export class PolicyBatchSummaryComponent implements OnInit {
  @Input() public batchId: string;
  profileForm: FormGroup;
  batchSummary: ResponsePolicyObject;
  policyValidationLogs: ResponseObjectValidationLogs = {
    status: '',
    message: '',
    obj: {
      batchId: '',
      policyDataWithErrorLogs: []
    },
    id: ''
  };
  error: string;
  breakpoint: any;
  csvOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    headers: AppConstants.HEADERS
  };
  policyLogs: any[];

  constructor(private fb: FormBuilder, private service: PolicyService) {
  }

  ngOnInit() {
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 6;
    this.profileForm = this.fb.group({});
    this.onSubmit();
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 6;
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('batchId', this.batchId);
    this.service.findPolicyBatchSummary(formData).subscribe(
      res => this.batchSummary = res,
      err => this.error = err
    );
  }

  downloadCSV() {
    const formData = new FormData();
    formData.append('batchId', this.batchId);
    this.service.findPolicyBatchErrorLogs(formData).subscribe(
      res => {
        this.policyValidationLogs = res;
        if (this.policyValidationLogs != undefined) {
          this.policyLogs = JSON.parse(JSON.stringify(this.policyValidationLogs.obj));
          new AngularCsv(this.policyLogs, AppConstants.TAB_NAME, this.csvOptions);
        }

      },
      err => this.error = err
    );
  }
}
