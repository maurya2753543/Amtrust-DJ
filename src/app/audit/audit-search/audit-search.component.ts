import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuditService } from '../audit.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { AuditSearch } from 'src/app/model/auditSearch';
import { AppService } from '../../app.service';
import { AppConstants } from 'src/app/app.constants';
import { AuditSearchModel } from 'src/app/model/AuditSearchModel';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuditChangesComponent } from '../audit-changes/audit-changes.component'
import { RepairComponent } from 'src/app/repair/repair.component';


@Component({
  selector: 'app-audit-search',
  templateUrl: './audit-search.component.html',
  styleUrls: ['./audit-search.component.css']
})

export class AuditSearchComponent implements OnInit {
  policyAuditFlag: boolean = false;
  claimAuditFlag: boolean = false;
  repairAuditFlag: boolean = false;
  auditSeacrhFields = new AuditSearch();
  books: any = [];

  auditForm = new FormGroup({
    searchType: new FormControl()
  });
  constructor(
    private fb: FormBuilder,
    private service: AuditService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private appservice: AppService
  ) {
  }
  auditSearch = AuditSearch.newAuditSearch();
  auditSearchModel = AuditSearchModel.newClaimSearch();

  ngOnInit() {
    this.auditForm = this.fb.group({
      searchQuery: this.fb.group({
        searchType: this.auditSearch.searchType
      })
    });
    this.onChanges();
  }
  selectPolicy() {
    this.policyAuditFlag = true;
    this.claimAuditFlag = false;
  }
  selectClaim() {
    this.claimAuditFlag = true;
    this.policyAuditFlag = false;
  }
  onChanges() {
    this.auditForm.valueChanges.subscribe(val => {
      if (val['searchQuery']['searchType'] == 'policy') {
        this.policyAuditFlag = true;
        this.claimAuditFlag = false;
        this.repairAuditFlag = false;

        this.auditSearch.searchType = 'policy';
        this.auditSearch.claimNumber = '';
        this.auditSearch.repairId = '';
        this.books = [];
      } else if (val['searchQuery']['searchType'] == 'repair') {
        this.policyAuditFlag = false;
        this.claimAuditFlag = false;
        this.repairAuditFlag = true;

        this.auditSearch.searchType = 'repair';
        this.auditSearch.claimNumber = '';
        this.auditSearch.policyNumber = '';
        this.books = [];

      } else {
        this.claimAuditFlag = true;
        this.policyAuditFlag = false;
        this.repairAuditFlag = false;

        this.auditSearch.searchType = 'claim';
        this.auditSearch.policyNumber = '';
        this.auditSearch.repairId = '';
        this.books = [];
      }
    });
  }
  search() {
    if (this.auditSearch.searchType == 'claim') {
      this.auditSearchModel.claimNo = this.auditSearch.claimNumber;
      this.auditSearchModel.user = this.auditSearch.user;
      this.findClaimAudit(this.auditSearchModel);
    } else if (this.auditSearch.searchType == 'policy') {
      this.auditSearchModel.policyNumber = this.auditSearch.policyNumber;
      this.auditSearchModel.user = this.auditSearch.user;
      this.findPolicyAudit(this.auditSearchModel);
    } else if (this.auditSearch.searchType == 'repair') {
      this.auditSearchModel.repairId = this.auditSearch.repairId;
      this.auditSearchModel.user = this.auditSearch.user;
      this.findRepairAudit(this.auditSearchModel);
    } else {
      this.appservice.showInfo("Please select a Module (Policy/Claim)", "Error");
    }
  }
  private findClaimAudit(params) {
    this.spinner.show();
    this.service.claimAuditSearch(params).subscribe(res => {
      this.books = res;
    }, err => {
      this.appservice.showInfo('', "ERROR");
      this.spinner.hide();
    },
      () => {
        this.onComplete();
      });
  }

  private findRepairAudit(params) {
    this.spinner.show();
    this.service.repairAuditSearch(params).subscribe(res => {
      this.books = res;
    }, err => {
      this.appservice.showInfo('', "ERROR");
      this.spinner.hide();
    },
      () => {
        this.onComplete();
      });
  }

  private findPolicyAudit(params) {
    this.spinner.show();
    this.service.policyAuditSearch(params).subscribe(res => {
      this.books = res;
    }, err => {
      this.appservice.showInfo('', "ERROR");
      this.spinner.hide();
    },
      () => {
        this.onComplete();
      });
  }
  onComplete() {
    if (this.books.length == 0) {
      this.appservice.showInfo('', AppConstants.NO_DATA_FOUND);
    }
    this.spinner.hide();
  }
  viewChanges(changes) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.width = '800';
    dialogConfig.height = '600';
    dialogConfig.data = changes;
    this.dialog.open(AuditChangesComponent, dialogConfig);
  }
}

