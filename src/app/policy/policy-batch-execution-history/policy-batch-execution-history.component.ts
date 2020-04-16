import { Component, OnInit } from '@angular/core';
import { PolicyService } from '../policy.service';
import { ResponsePolicyObject } from 'src/app/model/response.policy.object';
import { ResponseObjectValidationLogs } from 'src/app/model/response.errorlogs.obj';
import { AngularCsv } from 'angular7-csv/dist/Angular-csv';
import { AppConstants } from 'src/app/app.constants';
import { AppService } from 'src/app/app.service';
import { BatchExecutionHistorySearchCRiteria} from 'src/app/model/policy.batch.execution.history.search';

@Component({
  selector: 'app-policy-batch-execution-history',
  templateUrl: './policy-batch-execution-history.component.html',
  styleUrls: ['./policy-batch-execution-history.component.css']
})
export class PolicyBatchExecutionHistoryComponent implements OnInit {
  batchExecutionHistory: ResponsePolicyObject;
  pageLength: Number;
  error: String;
  itemsPerPage = 10;
  currentPage = 1;
  breakpoint: any;
  policyValidationLogs: ResponseObjectValidationLogs;
  csvOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    headers: AppConstants.HEADERS
  };
  policyLogs = []
  selectedPartbnerId : any;
  batchExecutionHistorySearchObject : BatchExecutionHistorySearchCRiteria  = BatchExecutionHistorySearchCRiteria.BatchExecutionHistorySearchCRiteria();
  policy_batch_exec_pagination_control: string;
  clientNames: any[];
  clientId:String;

  constructor(private service: PolicyService, private appService: AppService) { }
  ngOnInit() {
    this.policy_batch_exec_pagination_control = this.appService.uuidv4();
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 7;
    this.getClientNames();
    this.clientId = "";
  }

  findBatchExecutionHistory(batchExecutionHistorySearchObject): void {
    this.service.findPoliciesBatchExecutionHistory(batchExecutionHistorySearchObject).subscribe(
      res => {
        this.batchExecutionHistory = res;
      },
      err => this.error = err
    );
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 7;
  }

  downloadCSV(batchId) {
    const formData = new FormData();
    formData.append('batchId', batchId);
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

  getClientNames() {
    this.appService.findClientPartnerDetails().subscribe(
      res => {
        this.clientNames = this.service.filterClientDetails(res);
      }
    );
  }
  selectClientName(event) {
    this.batchExecutionHistorySearchObject.selectedPartnerId = event.value;
    this.findBatchExecutionHistory(this.batchExecutionHistorySearchObject);
  }
}
