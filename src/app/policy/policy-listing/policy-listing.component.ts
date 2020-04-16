import { Component, OnInit } from '@angular/core';
import { PolicySearchCriteria } from 'src/app/model/policy.search';
import { AppConstants } from 'src/app/app.constants';
import { PolicyService } from '../policy.service';
import { AppService } from '../../app.service';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ResponsePolicyObject } from 'src/app/model/response.policy.object';
import { ClaimConstants } from 'src/app/claim/claim.constants';

@Component({
  selector: 'app-policy-listing',
  templateUrl: './policy-listing.component.html',
  styleUrls: ['./policy-listing.component.css']
})
export class PolicyListingComponent implements OnInit {
  policyId: string;
  isLoading: boolean = false;
  maxDate: Date = new Date();
  policySearch: PolicySearchCriteria = PolicySearchCriteria.newPolicySearchCriteria();
  response: ResponsePolicyObject = {
    timeStamp: '',
    transactionId: '',
    status: '',
    message: [],
    obj: '',

  };
  error: String;
  itemsPerPage = 10;
  currentPage = 1;
  showFilter: boolean = true;
  clientDetails: any;

  constructor(
    private service: PolicyService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private appservice: AppService
  ) {
  }

  ngOnInit() {
    this.policyId = this.appservice.uuidv4();
    this.appservice.findClientPartnerDetails().subscribe(
      res => {
        this.clientDetails = this.service.filterClientDetails(res);
      }
    );
    this.route.paramMap.subscribe(params => {
      if (params.get(AppConstants.POLICY_NUMBER) != null ||
        params.get(AppConstants.CUSTOMER_MOBILE_NUMBER) != null) {
        this.isLoading = true;
        this.showFilter = true;
        this.currentPage = Number(params.get(AppConstants.CURRENT_PAGE));
        this.policySearch.policyNumber = this.checkNullAndEmpty(params.get(AppConstants.POLICY_NUMBER));
        this.policySearch.customerName = this.checkNullAndEmpty(params.get(AppConstants.CUSTOMER_NAME));
        this.policySearch.policyIMEINumber = this.checkNullAndEmpty(params.get(AppConstants.POLICY_IMEI_NUMBER));
        this.policySearch.policyStatus = this.checkNullAndEmpty(params.get(AppConstants.POLICY_STATUS));
        this.policySearch.custMobileNumber = this.checkNullAndEmpty(params.get(AppConstants.CUSTOMER_MOBILE_NUMBER));
        this.policySearch.customerId = this.checkNullAndEmpty(params.get(AppConstants.CUSTOMER_ID));
        this.policySearch.coverage = this.checkNullAndEmpty(params.get(AppConstants.POLICY_COVERAGE));
        this.policySearch.customerEmail = this.checkNullAndEmpty(params.get(AppConstants.CUSTOMER_EMAIL));
        this.policySearch.clientTransactionNumber = this.checkNullAndEmpty(params.get(AppConstants.CLIENT_TRANSACTION_NUMBER));
        this.policySearch.partnerId = this.checkNullAndEmpty(params.get(AppConstants.PARTNER_ID));
        this.policySearch.dateCreated = this.checkNullAndEmpty(params.get(AppConstants.DATE_CREATED));
        this.search();
      }
    });
  }

  search() {
    this.response.message = [];
    if (this.policySearch.partnerId === '' || this.policySearch.partnerId === undefined) {
      this.appservice.showInfo(ClaimConstants.CLIENT_NAME_IS_MANDATORY, ClaimConstants.MANDATORY_FILL);
    } else {
      let timezoneDate = this.policySearch.dateCreated;
      let isCreationDateEmpty = (timezoneDate == null || timezoneDate === '' || timezoneDate === undefined);
      this.policySearch.dateCreated = isCreationDateEmpty ? '' : this.fetchFormattedDate(timezoneDate);
      this.findPolicies(this.policySearch);
    }
  }

  onComplete() {
    if (this.response != undefined && this.response.status === 'ERROR') {
      this.appservice.showInfo('', AppConstants.NO_DATA_FOUND);
    }
  }

  loader() {
    this.spinner.hide();
    this.isLoading = false;
  }

  displayCriteria() {
    this.showFilter = !this.showFilter;
  }

  selectCreationDate(event) {
    this.policySearch.dateCreated = event.value;
  }

  fetchFormattedDate(date) {
    const d = new Date(date);
    const fmDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
    return fmDate.substr(0, 10);
  }

  private findPolicies(policySearch, showSpinner: boolean = true) {
    this.spinner.show();
    if (showSpinner) {
      if (policySearch.pageIndex != 0) {
        this.appservice.resetControls(this.policySearch, this);
      }
    }
    this.service.findPolicies(policySearch).subscribe(res => {
      this.response = res;
    }, err => {
      this.error = err;
      this.spinner.hide();
    },
      () => {
        this.onComplete();
      });
  }

  checkNullAndEmpty(value: any) {
    if (value != null) {
      return value;
    }
    return '';
  }
}
