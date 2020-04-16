import {Component, OnInit} from '@angular/core';
import {ResponseObject} from 'src/app/model/response.object';
import {AppService} from 'src/app/app.service';

@Component({
  selector: 'app-claim-batch-execution-history',
  templateUrl: './claim-batch-execution-history.component.html',
  styleUrls: ['./claim-batch-execution-history.component.css']
})
export class ClaimBatchExecutionHistoryComponent implements OnInit {

  batchExecutionHistory: ResponseObject;
  error: String;

  constructor(private service: AppService) {
  }

  ngOnInit() {
    this.service.findClaimsBatchExecutionHistory().subscribe(
      res => this.batchExecutionHistory = res,
      err => {
        this.error = err;
      }
    );
  }
}
