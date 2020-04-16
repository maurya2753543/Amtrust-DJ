import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ResponseObject } from 'src/app/model/response.claim.object';
import { ClaimSearch } from './../../model/claim.search';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import { RepairComponent } from 'src/app/repair/repair.component';
import { ClaimConstants } from 'src/app/claim/claim.constants';
import { PolicyService } from 'src/app/policy/policy.service';
import { AppConstants } from 'src/app/app.constants';
import { ClaimStatusObject } from 'src/app/model/ClaimStatusObject';
import { AssigneeList } from 'src/app/model/assignee';
import { PolicyEnum } from 'src/app/model/policy.enum';

@Component({
  selector: 'app-claim-pending',
  templateUrl: './claim-pending.component.html',
  styleUrls: ['./claim-pending.component.css']
})

export class ClaimPendingComponent implements OnInit {
  claimStatusObject: ClaimStatusObject[];
  claimStatusArray: any[] = [];
  defaultStatus: string;
  defautlSubstatus: string;
  successMsg: string;
  errorMsg: string;
  viewDetailsData: any;

  error: string;
  isLoading: boolean = false;
  showFilter: boolean = true;
  itemsPerPage = 10;
  currentPage = 1;
  isLoadingResults: boolean = true;
  clientDetails: any;
  assignesMap: any;
  showAssignees: boolean = true;
  maxDate: Date = new Date();

  claimSearch: ClaimSearch = {
    policyNo: '',
    customerName: '',
    imei: '',
    customerEmail: '',
    claimNo: '',
    customerId: '',
    customerContact: '',
    statusCode: '',
    subStatusCode: '',
    client: '',
    country: '',
    partnerId: '',
    currentPage: 0,
    listOfAssignees: [],
    assigneesSearched: [],
    searchedAssigneeCodes: [],
    dateCreated: '',
    pageIndex: 0,
    pageRecordCount: 10
  };

  claimStatus: any[] = [];
  claimSubStatus: any[] = [];
  countries: any[] = [];

  /*response: ResponseObject = {
    status: '',
    message: '',
    obj: null,
    id: ''
  };*/
  response: ResponseObject = {
    timeStamp: '',
    status: '',
    message: [],
    content: null,
    transactionId: '',

  };

  constructor(
    private service: AppService,
    private policyService: PolicyService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private appService: AppService
  ) {
  }

  search() {
    if (this.claimSearch.partnerId === '' || this.claimSearch.partnerId === undefined) {
      this.service.showInfo(ClaimConstants.CLIENT_NAME_IS_MANDATORY, ClaimConstants.MANDATORY_FILL);
    } else {
      this.findClaims(this.claimSearch);
    }
  }

  onComplete() {
    if (this.response !== undefined && !this.response.message.includes('Exist')) {
      this.service.showInfo('', AppConstants.NO_DATA_FOUND);
    }
  }

  loader() {
    this.spinner.hide();
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.getClaimStatus();
    this.getListOfCoutries();
    this.appService.findClientPartnerDetails().subscribe(
      res => {
        this.clientDetails = this.policyService.filterClientDetails(res);
      }
    );
    this.route.paramMap.subscribe(params => {
      if (params.get('claimNo') !== null) {
        this.isLoading = true;
        this.showFilter = true;
        this.currentPage = Number(params.get(AppConstants.CURRENT_PAGE));

        // Handle null values
        // - when we arrive at this page from create claim - the policy search criteria doesn't
        //   have a one-to-one mapping with claim search criteria. If any value has been set as
        //   null, we revert it to default
        const getDefault = (v, defaultValue = '') => params.get(v) ? params.get(v) : '';
        // Either get the value or set in a default value
        this.claimSearch.policyNo = getDefault(ClaimConstants.POLICY_NUMBER);
        this.claimSearch.claimNo = getDefault(ClaimConstants.CLAIM_NUMBER);
        this.claimSearch.imei = getDefault(ClaimConstants.IMEI);
        this.claimSearch.customerEmail = getDefault(ClaimConstants.CUSTOMER_EMAIL);
        this.claimSearch.customerName = getDefault(ClaimConstants.CUSTOMER_NAME);
        this.claimSearch.customerContact = getDefault(ClaimConstants.CUSTOMER_CONTACT);
        this.claimSearch.customerId = getDefault(ClaimConstants.CUSTOMER_ID);
        this.claimSearch.client = getDefault(ClaimConstants.CLIENT);
        this.claimSearch.country = getDefault(ClaimConstants.COUNTRY);
        this.claimSearch.partnerId = getDefault(ClaimConstants.PARTNER_ID);
        this.claimSearch.assigneesSearched = params.getAll(ClaimConstants.SEARCHED_ASSINEES);
        this.claimSearch.listOfAssignees = params.getAll(ClaimConstants.LIST_OF_ASSIFNEES);
        this.claimSearch.dateCreated = getDefault(ClaimConstants.DATE_CREATED);

        if (params.get(ClaimConstants.STATUS_CODE) !== null && params.get(ClaimConstants.STATUS_CODE) !== undefined) {
          this.claimSearch.statusCode = params.get(ClaimConstants.STATUS_CODE);
        }

        // Claim Sub Status
        if (params.get(ClaimConstants.SUB_STATUS_CODE) !== null && params.get(ClaimConstants.SUB_STATUS_CODE) !== undefined) {
          this.claimSearch.subStatusCode = params.get(ClaimConstants.SUB_STATUS_CODE);
        }

        // Update the claimSubStatus (this is usually updated based on the status)
        if (this.claimSearch && this.claimSearch.statusCode) {
          this.setStatusFromLocal(this.claimSearch.statusCode);
        }

        this.findClaims(this.claimSearch, false);

      }
    });
    if (this.claimSearch.listOfAssignees.length === 0) {
      this.getAssignees();
    }
  }

  getListOfCoutries() {
    this.appService.getCountryList().subscribe(res => {
      this.countries = res;
    });
  }

  displayCriteria() {
    this.showFilter = !this.showFilter;
  }

  setStatusFromLocal(statusCode: string) {
    // Wait until the object is loaded
    if (this.claimStatusObject === undefined) {
      setTimeout(() => this.setStatusFromLocal(statusCode), 100);
      return;
    }
    this.claimSubStatus = [];
    this.claimStatusArray = [];
    let claimStatusTemp2: ClaimStatusObject;

    claimStatusTemp2 = this.claimStatusObject.filter(x => x.code === statusCode)[0];

    for (let i = 0; i < claimStatusTemp2.subStatus.length; i++) {
      this.claimSubStatus.push(claimStatusTemp2.subStatus[i]);
      this.claimStatusArray.push(claimStatusTemp2.subStatus[i]);
    }
    this.claimSearch.statusCode = claimStatusTemp2.code;
  }

  getClaimStatus() {
    this.service.findClaimStatus().subscribe(
      res => {
        if (res.status === 'OK') {
          if (res['message'] === ClaimConstants.EXIST) {
            this.claimStatusArray = [];
            this.claimStatusObject = [];
            this.claimStatus = [];
            this.claimSubStatus = [];

            this.claimStatusObject = res.content as ClaimStatusObject[];

            for (let i = 0; i < this.claimStatusObject.length; i++) {
              const claimStatusTemp = {
                name: this.claimStatusObject[i].name,
                code: this.claimStatusObject[i].code
              };
              this.claimStatus.push(claimStatusTemp);
              this.claimStatusArray.push(claimStatusTemp);
            }
          }
        } else {
          if (res.status === 'ERROR') {
            if (res.content.code === '200.100') {
              this.service.showInfo(ClaimConstants.ERROR_MSG, 'IN GETTING CLAIM STATUS');
              return;
            } else {
              this.service.showInfo(res.content.message[0], res.content.error);
              return;
            }
          }
        }
      },
      err => this.error = err
    );
  }

  viewClaim(claim) {

    this.service.getRepairDetails(claim.repairId, claim.partnerId).subscribe(
      (res) => {
        if (res.status === 'OK') {
          this.viewDetailsData = res;
          this.dialog.open(RepairComponent, {
            data: this.viewDetailsData
          });
        } else {
          if (res.status === 'ERROR') {
            if (res.content.code === '200.100') {
              this.service.showInfo(ClaimConstants.ERROR_MSG, 'IN GETTING CLAIM REPAIR STATUS');
              return;
            } else {
              this.service.showInfo(res.content.message[0], res.content.error);
              return;
            }
          }
        }
      },
      (err) => {
      }
    );
  }

  getAssignees() {
    this.service.getAssignees().subscribe(
      res => {

        if (res.status === 'OK') {

          this.assignesMap = [];

          const assignesList = res.content as AssigneeList[];

          const assignesForPH: AssigneeList[] = [];
          const assignesForIDO: AssigneeList[] = [];
          const assignesForVN: AssigneeList[] = [];

          for (let i = 0; i < assignesList.length; i++) {

            if (assignesList[i].partnerId === PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_RETAIL
              || assignesList[i].partnerId === PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_CF) {
              assignesForPH.push(assignesList[i]);

            } else if (assignesList[i].partnerId === PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL || assignesList[i].partnerId === PolicyEnum.PARTNER_SAMSUNG_INDONESIA_CF) {
              assignesForIDO.push(assignesList[i]);
            } else if (assignesList[i].partnerId === PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL) {
              assignesForVN.push(assignesList[i]);
            }
          }
          this.assignesMap[0] = [PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_RETAIL, assignesForPH];
          this.assignesMap[1] = [PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL, assignesForIDO];
          this.assignesMap[2] = [PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL, assignesForVN];
        }
      }
    );
  }

  setAssignee(partnerId: string) {
    let keyIndex = -1;
    this.showAssignees = false;
    this.claimSearch.listOfAssignees = [];
    switch (partnerId) {
      case PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_RETAIL:
        this.claimSearch.listOfAssignees = this.assignesMap[0][1];
        break;
      case PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_CF:
        this.claimSearch.listOfAssignees = this.assignesMap[0][1];
        break;
      case PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL:
        this.claimSearch.listOfAssignees = this.assignesMap[1][1];
        break;
      case PolicyEnum.PARTNER_SAMSUNG_INDONESIA_CF:
        this.claimSearch.listOfAssignees = this.assignesMap[1][1];
        break;
      case PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL:
        this.claimSearch.listOfAssignees = this.assignesMap[2][1];
        break;
      default:
        this.claimSearch.listOfAssignees = [];
        break;
    }
  }

  selectCreationDate(event) {
    this.claimSearch.dateCreated = event.value;
  }

  fetchFormattedDate(date) {
    const d = new Date(date);
    const fmDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
    return fmDate.substr(0, 10);
  }

  private findClaims(claimSearch, showSpinner: boolean = true) {
    if (showSpinner) {
      this.spinner.show();
      if (claimSearch.pageIndex != 0) {
        this.appService.resetControls(this.claimSearch, this);
      }
    }

    claimSearch.searchedAssigneeCodes = claimSearch.assigneesSearched.map(assignee => assignee.code);
    const isClaimCreatedDateEmpty = (claimSearch.dateCreated === null || claimSearch.dateCreated === '' || claimSearch.dateCreated === undefined);
    this.claimSearch.dateCreated = isClaimCreatedDateEmpty ? '' : this.fetchFormattedDate(this.claimSearch.dateCreated);

    this.service.findClaims(claimSearch).subscribe(res => {
      if (res.status === 'OK' && res.content) {
        this.response = res;
        this.spinner.hide();
      } else {
        if (res.status === 'ERROR') {
          if (res.content.code === '200.100') {
            this.service.showInfo(ClaimConstants.ERROR_MSG, 'IN SEARCHING CLAIM ');
            this.spinner.hide();
            return;
          } else {
            this.service.showInfo(res.content.message[0], res.content.error);
            this.spinner.hide();
            return;
          }
        }
      }
    }, err => {
      this.error = err;
      this.spinner.hide();
    },
      () => {
        this.onComplete();
      });
  }
}



