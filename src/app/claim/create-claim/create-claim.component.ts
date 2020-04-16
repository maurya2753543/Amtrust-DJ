import { Component, ElementRef, EventEmitter, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MatDialog, MatRadioButton, MatDialogConfig } from '@angular/material';
import { APP_DATE_FORMATS, AppDateAdapter } from 'src/app/utility/date.adapter';
import { Assignees, ClaimDocument, LogisticCourier, LogisticStatus } from 'src/app/model/ClaimDocument';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ResponseObject } from 'src/app/model/response.claim.object';
import { NgxSpinnerService } from 'ngx-spinner';
import { PolicySearchCriteria } from 'src/app/model/policy.search';
import { PolicyDocument } from 'src/app/model/policy.document';
import { AppConstants } from 'src/app/app.constants';
import { ClaimConstants, LogisticCouriers, LogisticStatuses } from 'src/app/claim/claim.constants';
import { PolicyEnum } from 'src/app/model/policy.enum';
import { ClaimStatusObject } from 'src/app/model/ClaimStatusObject';
import { AssigneeList } from 'src/app/model/assignee';
import { PolicyService } from '../../policy/policy.service';
import { RulesValidationService } from 'src/app/rulesengine/rules.validation.service';
import { RuleContaningFields } from 'src/app/rulesengine/model/rule.contaning.fields';
import { debounceTime, distinctUntilChanged, mergeMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ProductService } from 'src/app/product/product.service';
import { ConfirmationDialogComponent } from '../../components/shared/confirmation-dialog/confirmation-dialog.component';
import { DraftClaimDailogComponent } from './draft-claim-dailog/draft-claim-dailog.component';
import { environment } from 'src/environments/environment';
import * as path from 'path';


@Component({
  selector: 'app-create-claim',
  templateUrl: './create-claim.component.html',
  styleUrls: ['./create-claim.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
  ]
})
export class CreateClaimComponent implements OnInit {
  searchTextChanged = new Subject<any>();
  countries: any[];
  assignesMap: any;
  claimStatusObject: ClaimStatusObject[];
  claimStatusArray: any[] = [];
  defaultStatus: string;
  defautlSubstatus: string;
  successMsg: string;
  errorMsg: string;
  response: PolicyDocument;
  search: PolicySearchCriteria;
  isLoading: boolean = false;
  claimDetailsError: boolean = false;
  panelErrorMessage: string;
  paymentDetailsValidation: boolean = false;
  responseObject: ResponseObject;
  // today's date
  todaydate: Date = new Date();
  claimModel = ClaimDocument.newClaimDocument();
  returnClaim: ClaimDocument;
  error: String;
  claimForm: FormGroup;
  policyDetail = [];
  product = [];
  rule = [];
  file: File;
  fileUpload = { status: '', message: '', id: '' };
  hideTransactionUpload = false;
  hideSupportUpload = false;
  hideProofUpload = false;
  hideOtherUpload = false;
  isLoadingResults: boolean = false;
  uploadImageError: String;
  uploadDocError: string;
  claimData = new FormData();
  selfClaim: boolean = true;
  assigneesList: Assignees[] = [];
  todayDate: Date = new Date();
  logisticStatuses: LogisticStatus[] = LogisticStatuses;
  logisticCouriers: LogisticCourier[] = [];
  @ViewChild('policyHolder', null) policyHolderRB: MatRadioButton;
  @ViewChild('withinCountry', null) withinCountryRB: MatRadioButton;
  @Output() close = new EventEmitter();
  checked = true;
  withinCountryValid = true;
  requiredWithinCountry = false;
  disableCountryFields = true;
  disableClaimBtn = false;
  disableDraftBtn = true;
  cancelClaimBtn = true;
  imageSrc = '';
  hideButton = false;
  isDraft: boolean = false;
  filename: string = '';
  supportFilename: string = '';
  transactionFilename: string = '';
  proofFilename: string = '';
  otherFilename: string = '';
  proofFiles: string[] = [];
  supportFiles: string[] = [];
  otherFiles: string[] = [];
  maxDate: Date;
  claimStatus: any[] = [];
  claimSubStatus: any[] = [];
  countryDesc: string = '';
  searchList: Array<any>;
  subscription: any;
  fileUploadQueue = {
    support: [],
    proof: [],
    other: [],
    transaction: []
  };
  supportingDocumentSections = [
    { type: 'support', title: 'Travel Document' },
    { type: 'proof', title: 'Proof of Purchase' },
    { type: 'other', title: 'Other Document' }
  ];
  transactionDocLinks: string[] = [];
  supportDocLinks: string[] = [];
  proofDocLinks: string[] = [];
  otherDocLinks: string[] = [];
  initRequired = true;
  dateOfIncident: Date = null;
  @ViewChild('image', null) private image: ElementRef;

  constructor(
    private service: AppService,
    private policyService: PolicyService,
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder, private rulesValidationService: RulesValidationService,
    private productService: ProductService,
    public dialog: MatDialog) {
  }

  ngOnInit() {
    this.getClaimStatus();
    this.response = window.history.state[0];
    this.search = window.history.state[1];
    if (this.search) {
      this.search.currentPage = window.history.state[2];
    }
    this.initValue();
    if (this.response) {
      this.checkDraftClaimByPolicy(this.response.policyNumber);
    }
    this.getListOfCoutries();
    this.claimSubStatus = [];
    this.claimStatus = [];
    if (this.response) {
      this.populateLogisticCouriers(this.response.partnerId);
    }
    this.getAssignees();

    const productsModelTemp = JSON.parse(this.response.productsModel);
    this.rulesValidationService.setClaimForm(this.claimForm, 'CREATE');
    this.rulesValidationService.loadProductRulesByProductCode(productsModelTemp.productCode);

    this.subscription = this.searchTextChanged.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => this.productService.getAutcompleteAdress(search.searchKey, search.country)
      )
    ).subscribe((res: any) => {
      this.searchList = res;
    });
  }

  initForm() {
    this.claimForm = this.fb.group({
      claimDetailsPanel: this.fb.group({
        claimType: new FormControl(''),
        damageType: new FormControl(''),
        relationship: new FormControl('self'),
        claimantName: new FormControl(this.claimModel.claimantName),
        claimantEmail: new FormControl(this.claimModel.customerEmail),
        claimantContact: new FormControl(this.claimModel.claimantContact),
        claimantAlternateContact: new FormControl(''),
        channel: new FormControl('Offline'),
        dateOfIncident: new FormControl(''),
        timeOfIncident: new FormControl(''),
        withinCountry: new FormControl(''),
        travelDateFrom: new FormControl(''),
        travelDateTo: new FormControl(''),
        issueDesc: new FormControl(''),
        requiredLogistic: new FormControl('')
      }),
      paymentDetails: this.fb.group({
        paymentMethod: new FormControl(''),
        paymentReferenceNo: new FormControl(''),
        requiredPayment: new FormControl(''),
        receivedAmount: new FormControl(''),
        excessFee: new FormControl('')
      }),
      logisticsDetails: this.fb.group({
        requiresPickup: new FormControl(false),
        requiresDelivery: new FormControl(false),

        collectAddress1: new FormControl(''),
        collectAddress2: new FormControl(''),
        collectPostcode: new FormControl(''),
        collectState: new FormControl(''),
        collectCity: new FormControl(''),
        collectCountry: new FormControl(this.claimModel.collectCountry),
        collectStatus: new FormControl(''),
        collectTracking: new FormControl(''),
        collectCourier: new FormControl(''),
        collectDate: new FormControl(''),
        collectTime: new FormControl(''),
        actualCollectDate: new FormControl(''),
        actualCollectTime: new FormControl(''),
        arrivalCollectDate: new FormControl(''),
        arrivalCollectTime: new FormControl(''),
        // DropOff
        scheduledDropOffDate: new FormControl(''),
        scheduledDropOffTime: new FormControl(''),
        // DropOff - Actual
        actualDropOffDate: new FormControl(''),
        actualDropOffTime: new FormControl(''),

        dispatchCenterName: new FormControl('', Validators.maxLength(50)),
        dispatchAddress1: new FormControl(''),
        dispatchAddress2: new FormControl(''),
        dispatchPostcode: new FormControl(''),
        dispatchCity: new FormControl(''),
        dispatchState: new FormControl(''),
        dispatchCountry: new FormControl(this.claimModel.collectCountry),
        deliveryAddress1: new FormControl(''),
        deliveryAddress2: new FormControl(''),
        deliveryCity: new FormControl(''),
        deliveryPostcode: new FormControl(''),
        deliveryState: new FormControl(''),
        deliveryCountry: new FormControl(this.claimModel.deliveryCountry),
        deliveryStatus: new FormControl(''),
        deliveryTracking: new FormControl(''),
        deliveryDate: new FormControl(''),
        deliveryTime: new FormControl(''),
        deliveryCourier: new FormControl(''),
        // Delivery - Actual
        actualDeliveryDate: new FormControl(''),
        actualDeliveryTime: new FormControl(''),
        // Delivery - Customer
        customerDeliveryDate: new FormControl(''),
        customerDeliveryTime: new FormControl(''),
        // Pickup - Scheduled
        scheduledPickUpDate: new FormControl(''),
        scheduledPickUpTime: new FormControl(''),
        // Pickup - Actual
        actualPickUpDate: new FormControl(''),
        actualPickUpTime: new FormControl(''),

        copyPolicyAddressToCollect: new FormControl(false),
        copyPolicyAddressToDelivery: new FormControl(false),
      }),
      suppDocumentsPanel: this.fb.group({}),

      claimStatusPanel: this.fb.group({
        status: new FormControl(this.claimModel.statusCode),
        claimSubStatus: new FormControl(this.claimModel.subStatusCode),
        assignee: new FormControl(this.claimModel.assignee),
      }),
    });
    this.maxDate = new Date();
    // tslint:disable-next-line: max-line-length
    if (this.response && (this.response.policyStatus.toUpperCase() === ClaimConstants.POLICY_INACTIVE.toUpperCase() || this.response.policyStatus === '' || this.response.policyStatus === null)) {
      this.hideButton = true;
    }
    if (this.disableCountryFields) {
      this.claimForm['controls'].logisticsDetails['controls'].collectCountry.disable();
      this.claimForm['controls'].logisticsDetails['controls'].dispatchCountry.disable();
      this.claimForm['controls'].logisticsDetails['controls'].deliveryCountry.disable();
    }
    this.onChanges();
  }

  initValue() {
    if (this.response) {
      this.validActiveClaim(this.response.policyNumber);
      /** value passed form search page */
      this.claimModel.policyNo = this.response.policyNumber;
      this.claimModel.imei = this.response.policyIMEINumber;
      this.claimModel.deviceSerialNo = this.response.deviceSerialNo;
      this.claimModel.productName = this.response.productName;
      this.claimModel.productDesc = this.response.clientProductDescription;
      this.claimModel.coverage = this.response.coverage;
      this.claimModel.policyStatus = this.response.policyStatus;
      this.claimModel.policyStartDate = this.response.policyStartDate;
      this.claimModel.policyEndDate = this.response.policyEndDate;
      this.claimModel.make = this.response.deviceMake;
      this.claimModel.model = this.response.deviceModel;
      this.claimModel.colour = this.response.deviceColor;
      this.claimModel.rrp = this.response.deviceRRP;
      this.claimModel.balanceRRP = this.response.balanceRRP;
      this.claimModel.memoryStorage = parseInt(this.response.deviceMemory, 10);
      this.claimModel.purchaseDate = this.response.policyPurchaseDate;
      this.claimModel.customerName = this.response.customerName + ' ' + this.response.customerLastName;
      this.claimModel.customerContact = this.response.custMobileNumber;
      this.claimModel.customerEmail = this.response.customerEmail;
      this.claimModel.claimantEmail = this.response.customerEmail;
      this.claimModel.claimantContact = this.response.custMobileNumber;
      this.claimModel.claimantName = this.response.customerName + ' ' + this.response.customerLastName;
      this.claimModel.partnerId = this.response.partnerId;
      this.claimModel.partnerContractId = this.response.partnerContractId;
      this.claimModel.country = this.response.countryCode;
      this.claimModel.collectCountry = this.response.countryCode;
      this.claimModel.dispatchCountry = this.response.countryCode;
      this.claimModel.deliveryCountry = this.response.countryCode;
      this.claimModel.ecertUrl = this.response.ecertUrl;
      const productModelObj = JSON.parse(this.response.productsModel);
      this.claimModel.productCode = productModelObj.productCode;
    }
    this.initForm();
  }

  onClaimStatusChange(event: any) {
    this.setStatusFromLocal(event.value);
  }

  setStatusFromLocal(statusCode: string) {
    this.claimSubStatus = [];
    let claimStatusTemp2: ClaimStatusObject;

    claimStatusTemp2 = this.claimStatusObject.filter(x => x.code == statusCode)[0];

    for (let i = 0; i < claimStatusTemp2.subStatus.length; i++) {
      this.claimSubStatus.push(claimStatusTemp2.subStatus[i]);
      this.claimStatusArray.push(claimStatusTemp2.subStatus[i]);
    }

    if (statusCode === ClaimConstants.NEW_CLAIM_REQUEST) {

      if (window.history.state[0] && window.history.state[0].partnerId) {
        const partnerId = window.history.state[0].partnerId;

        if (partnerId == PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL || partnerId == PolicyEnum.PARTNER_SAMSUNG_INDONESIA_CF) {
          this.claimForm['controls'].claimStatusPanel['controls'].claimSubStatus.setValue(this.claimSubStatus[2].code);
        } else {
          this.claimForm['controls'].claimStatusPanel['controls'].claimSubStatus.setValue(this.claimSubStatus[0].code);
        }
      }
    } else {
      this.claimForm['controls'].claimStatusPanel['controls'].claimSubStatus.setValue(this.claimSubStatus[0].code);
    }
  }

  /**
   *
   * @param statusName: main status name
   * @param type 1: main and sub status change, 2: only sub status change
   */
  getClaimStatus() {

    this.service.findClaimStatus().subscribe(
      res => {

        if (res.status === 'OK') {

          if (res['message'] === ClaimConstants.EXIST) {
            this.claimStatusArray = [];
            this.claimStatusObject = [];
            this.claimStatusObject = res.content as ClaimStatusObject[];

            const claimStatusTemp = {
              name: this.claimStatusObject[0].name,
              code: this.claimStatusObject[0].code
            };

            this.claimStatus.push(claimStatusTemp);
            this.claimStatusArray.push(claimStatusTemp);

            for (let i = 0; i < this.claimStatusObject[0].nextStatus.length; i++) {
              this.claimStatus.push(this.claimStatusObject[0].nextStatus[i]);
              this.claimStatusArray.push(this.claimStatusObject[0].nextStatus[i]);
            }
            let claimStatusTemp2: ClaimStatusObject;

            claimStatusTemp2 = this.claimStatusObject.filter(x => x.code == ClaimConstants.NEW_CLAIM_REQUEST)[0];

            for (let i = 0; i < claimStatusTemp2.subStatus.length; i++) {
              this.claimSubStatus.push(claimStatusTemp2.subStatus[i]);
              this.claimStatusArray.push(claimStatusTemp2.subStatus[i]);
            }
            // this.claimForm['controls'].claimStatusPanel['controls'].status.setValue(this.claimStatus[0].code);
            // this.setStatusFromLocal(ClaimConstants.NEW_CLAIM_REQUEST);
          }
        } else {
          // If Error
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

  /** validate policy has active claim */
  validActiveClaim(policyNo: string) {
    this.spinner.show();
    this.service.findActiveClaim(policyNo).subscribe(
      res => {
        this.spinner.hide();
        if (res.status === 'OK') {
          if (res['message'] === ClaimConstants.EXIST) {

            this.hideButton = true;
            this.cancelClaimBtn = false;
            this.claimModel.claimType = res['content'].claimType;
            this.claimModel.damageType = res['content'].damageType;
            this.claimModel.relationship = res['content'].relationship;
            this.claimModel.claimantName = res['content'].claimantName;
            this.claimModel.claimantEmail = res['content'].claimantEmail;
            this.claimModel.claimantContact = res['content'].claimantContact;
            this.claimModel.claimantAlternateContact = res['content'].claimantAlternateContact;
            this.claimModel.channel = res['content'].channel;
            this.claimModel.extraProtection = res['content'].extraProtection;
            this.claimModel.claimFiveYear = res['content'].claimFiveYear;
            this.claimModel.dateOfIncident = res['content'].dateOfIncident;
            this.claimModel.timeOfIncident = res['content'].timeOfIncident;
            this.claimModel.issueDesc = res['content'].issueDesc;
            this.claimModel.withinCountry = res['content'].withinCountry;
            this.claimModel.travelDateFrom = res['content'].travelDateFrom;
            this.claimModel.travelDateTo = res['content'].travelDateTo;
            this.claimModel.collectAddress1 = res['content'].collectAddress1;
            this.claimModel.collectAddress2 = res['content'].collectAddress2;
            this.claimModel.collectCity = res['content'].collectCity;
            this.claimModel.collectPostcode = res['content'].collectPostcode;
            this.claimModel.collectState = res['content'].collectState;
            this.claimModel.collectCountry = res['content'].collectCountry;
            this.claimModel.collectStatus = res['content'].collectStatus;
            this.claimModel.collectTracking = res['content'].collectTracking;
            this.claimModel.collectDate = res['content'].collectDate;
            this.claimModel.collectTime = res['content'].collectTime;
            this.claimModel.collectCourier = res['content'].collectCourier;
            this.claimModel.dispatchCenterName = res['content'].dispatchCenterName;
            this.claimModel.dispatchAddress1 = res['content'].dispatchAddress1;
            this.claimModel.dispatchAddress2 = res['content'].dispatchAddress2;
            this.claimModel.dispatchPostcode = res['content'].dispatchPostcode;
            this.claimModel.dispatchCity = res['content'].dicpatchCity;
            this.claimModel.dispatchState = res['content'].dispatchState;
            this.claimModel.dispatchCountry = res['content'].dispatchCountry;
            this.claimModel.deliveryAddress1 = res['content'].deliveryAddress1;
            this.claimModel.deliveryAddress2 = res['content'].deliveryAddress2;
            this.claimModel.deliveryCity = res['content'].deliveryCity;
            this.claimModel.deliveryPostcode = res['content'].deliveryPostcode;
            this.claimModel.deliveryState = res['content'].deliveryState;
            this.claimModel.deliveryCountry = res['content'].deliveryCountry;
            this.claimModel.deliveryStatus = res['content'].deliveryStatus;
            this.claimModel.deliveryTracking = res['content'].deliveryTracking;
            this.claimModel.deliveryDate = res['content'].deliveryDate;
            this.claimModel.deliveryTime = res['content'].deliveryTime;
            this.claimModel.deliveryCourier = res['content'].deliveryCourier;
            this.claimModel.receivedAmount = res['content'].receivedAmount;
            this.claimModel.requiredPayment = res['content'].requiredPayment;
            this.claimModel.paymentMethod = res['content'].paymentMethod;
            this.claimModel.paymentReferenceNo = res['content'].paymentReferenceNo;
            this.claimModel.assignee = res['content'].assignee;
            this.claimModel.status = res['content'].status;
            this.claimModel.statusCode = res['content'].statusCode;
            this.claimModel.partnerId = res['content'].partnerId;
            this.claimModel.claimSubStatus = res['content'].claimSubStatus;
            this.claimModel.subStatusCode = res['content'].subStatusCode;
            this.claimForm['controls'].claimStatusPanel['controls'].status.setValue(res['content'].statusCode);
            this.setStatusFromLocal(res['content'].statusCode);
            this.claimForm['controls'].claimStatusPanel['controls'].claimSubStatus.setValue(res['content'].subStatusCode);
            this.claimForm['controls'].claimStatusPanel['controls'].status.disable();
            this.claimForm['controls'].claimStatusPanel['controls'].claimSubStatus.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].claimType.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].damageType.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].relationship.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].claimantName.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].claimantEmail.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].claimantContact.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].claimantAlternateContact.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].channel.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].dateOfIncident.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].timeOfIncident.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].withinCountry.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].travelDateFrom.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].travelDateTo.disable();
            this.claimForm['controls'].claimDetailsPanel['controls'].issueDesc.disable();
            this.claimForm['controls'].logisticsDetails['controls'].collectAddress1.disable();
            this.claimForm['controls'].logisticsDetails['controls'].collectAddress2.disable();
            this.claimForm['controls'].logisticsDetails['controls'].collectPostcode.disable();
            this.claimForm['controls'].logisticsDetails['controls'].collectCity.disable();
            this.claimForm['controls'].logisticsDetails['controls'].collectState.disable();
            this.claimForm['controls'].logisticsDetails['controls'].collectCountry.disable();
            this.claimForm['controls'].logisticsDetails['controls'].collectStatus.disable();
            this.claimForm['controls'].logisticsDetails['controls'].collectTracking.disable();
            this.claimForm['controls'].logisticsDetails['controls'].collectDate.disable();
            this.claimForm['controls'].logisticsDetails['controls'].collectTime.disable();
            this.claimForm['controls'].logisticsDetails['controls'].collectCourier.disable();
            this.claimForm['controls'].logisticsDetails['controls'].dispatchCenterName.disable();
            this.claimForm['controls'].logisticsDetails['controls'].dispatchAddress1.disable();
            this.claimForm['controls'].logisticsDetails['controls'].dispatchAddress2.disable();
            this.claimForm['controls'].logisticsDetails['controls'].dispatchPostcode.disable();
            this.claimForm['controls'].logisticsDetails['controls'].dispatchCity.disable();
            this.claimForm['controls'].logisticsDetails['controls'].dispatchState.disable();
            this.claimForm['controls'].logisticsDetails['controls'].dispatchCountry.disable();
            this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress1.disable();
            this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress2.disable();
            this.claimForm['controls'].logisticsDetails['controls'].deliveryCity.disable();
            this.claimForm['controls'].logisticsDetails['controls'].deliveryPostcode.disable();
            this.claimForm['controls'].logisticsDetails['controls'].deliveryState.disable();
            this.claimForm['controls'].logisticsDetails['controls'].deliveryCountry.disable();
            this.claimForm['controls'].logisticsDetails['controls'].deliveryStatus.disable();
            this.claimForm['controls'].logisticsDetails['controls'].deliveryTracking.disable();
            this.claimForm['controls'].logisticsDetails['controls'].deliveryDate.disable();
            this.claimForm['controls'].logisticsDetails['controls'].deliveryTime.disable();
            this.claimForm['controls'].logisticsDetails['controls'].deliveryCourier.disable();
            this.claimForm['controls'].paymentDetails['controls'].receivedAmount.disable();
            this.claimForm['controls'].paymentDetails['controls'].requiredPayment.disable();
            this.claimForm['controls'].paymentDetails['controls'].paymentMethod.disable();
            this.claimForm['controls'].paymentDetails['controls'].paymentReferenceNo.disable();
            this.claimForm['controls'].paymentDetails['controls'].excessFee.disable();
            this.claimForm['controls'].claimStatusPanel['controls'].assignee.disable();


          } else {
            this.selfClaim = true;

          }
        } else {
          if (res.status === 'ERROR') {
            if (res.content.code === '200.100') {
              this.service.showInfo(ClaimConstants.ERROR_MSG, 'IN FINDING ACTIVE CLAIM');
              return;
            } else {
              /*this.toastr.error(res.content.message[0], res.content.error, {
                timeOut: 10000
              });*/
              return false;
            }
          }
        }
      },
      err => {
        this.spinner.hide();
        this.error = err;
      }
    );
  }

  onChange(val) {
    const d = new Date(val);
    const date = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('01').slice(-2)].join('-');
  }

  onChangeRelationship(event) {

    if (event.value === 'self') {

      this.claimForm['controls'].claimDetailsPanel['controls'].claimantName.setValue(this.claimModel.customerName);
      this.claimForm['controls'].claimDetailsPanel['controls'].claimantContact.setValue(this.claimModel.customerContact);
      this.claimForm['controls'].claimDetailsPanel['controls'].claimantEmail.setValue(this.claimModel.customerEmail);
      this.selfClaim = true;
    } else {
      this.claimForm['controls'].claimDetailsPanel['controls'].claimantName.setValue('');
      this.claimForm['controls'].claimDetailsPanel['controls'].claimantContact.setValue('');
      this.claimForm['controls'].claimDetailsPanel['controls'].claimantEmail.setValue('');
      this.selfClaim = false;
    }
  }

  copyPolicytoDeliveryAddress(val) {
    if (val) {
      this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress1.setValue(this.claimForm['controls'].logisticsDetails['controls'].collectAddress1.value);
      this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress2.setValue(this.claimForm['controls'].logisticsDetails['controls'].collectAddress2.value);
      this.claimForm['controls'].logisticsDetails['controls'].deliveryPostcode.setValue(this.claimForm['controls'].logisticsDetails['controls'].collectPostcode.value);
      this.claimForm['controls'].logisticsDetails['controls'].deliveryCity.setValue(this.claimForm['controls'].logisticsDetails['controls'].collectCity.value);
      this.claimForm['controls'].logisticsDetails['controls'].deliveryState.setValue(this.claimForm['controls'].logisticsDetails['controls'].collectState.value);
    } else {
      this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress1.setValue('');
      this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress2.setValue('');
      this.claimForm['controls'].logisticsDetails['controls'].deliveryPostcode.setValue('');
      this.claimForm['controls'].logisticsDetails['controls'].deliveryCity.setValue('');
      this.claimForm['controls'].logisticsDetails['controls'].deliveryState.setValue('');
    }
  }

  uploadFile() {
    const formData = new FormData();
    formData.append('file', this.file);
    this.service.uploadDocument(formData).subscribe(
      res => {
        if (res.status === 'OK') {
        } else {
          if (res.status === 'ERROR') {
            if (res.content.code === '200.100') {
              this.service.showInfo(ClaimConstants.ERROR_MSG, 'IN UPLOADING DOCUMENT');
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
    this.isLoadingResults = false;
  }

  onSelectedFile(event, type) {
    switch (type) {
      case 'support':
        if (event.target.files.length > 0) {
          this.file = event.target.files[0];
          this.supportFilename = this.file.name;
          this.hideSupportUpload = true;
          this.claimData.append('file', this.file);
        } else {
          this.hideSupportUpload = false;
        }
        break;
      case 'transaction':
        if (event.target.files.length > 0) {
          this.file = event.target.files[0];
          this.transactionFilename = this.file.name;
          this.hideTransactionUpload = true;
          this.claimData.append('transaction', this.file);
        } else {
          this.hideTransactionUpload = false;
        }
        break;
      case 'proof':
        if (event.target.files.length > 0) {
          this.file = event.target.files[0];
          this.proofFilename = this.file.name;
          this.hideProofUpload = true;
          this.claimData.append('proof', this.file);
        } else {
          this.hideProofUpload = false;
        }
        break;
      case 'other':
        if (event.target.files.length > 0) {
          this.file = event.target.files[0];
          this.otherFilename = this.file.name;
          this.hideOtherUpload = true;
          this.claimData.append('other', this.file);
        } else {
          this.hideOtherUpload = false;
        }
        break;
    }
  }

  addFileToList(event, type) {
    const validFile = event.target.files.length > 0;
    const file = event.target.files[0]; // Get file object
    if (validFile) {
      this.fileUploadQueue[type].push(file); // Append file
      event.target.value = ''; // Reset target value
    }
  }

  removeSelectedFile(type, indexToDelete) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      position: { top: '100px' },
      width: '360px',
      data: 'Are you sure you want to delete this file?'
    });

    dialogRef.afterClosed().subscribe(result => {
      // Yes is clicked
      if (result) {
        const existingFileUploadQueue = this.fileUploadQueue[type];
        const filteredFileUploadQueue = existingFileUploadQueue.filter((_, index) => index !== indexToDelete);

        this.fileUploadQueue[type] = filteredFileUploadQueue;
      }
    });
  }

  onSelectedImage(event) {
    if (event.target.files.length > 0) {
      const image = event.target.files[0];
      const formData = new FormData();
      formData.append('file', image);
      this.service.uploadImage(formData).subscribe(
        res => {
          if (res.status === 200 && res.response.status === 'success') {
            this.uploadImageError = '';

            const li: HTMLLIElement = this.renderer.createElement('li');

            const img: HTMLImageElement = this.renderer.createElement('img');
            img.src = res.response.imagePath;
            this.renderer.addClass(img, 'claim-image');
            img.addEventListener('click', this.promptImage.bind(this, res.response.imagePath));

            const a: HTMLAnchorElement = this.renderer.createElement('a');
            a.innerText = 'Delete';
            this.renderer.addClass(a, 'delete-btn');
            a.addEventListener('click', this.deleteClaimImage.bind(this, res.response.keyName, a));

            this.renderer.appendChild(this.image.nativeElement, li);
            this.renderer.appendChild(li, img);
            this.renderer.appendChild(li, a);
          } else {
            this.uploadImageError = res.response.message;
          }
        },
        err => this.error = err
      );
    }
  }

  onSelectedDocument(event) {
    if (event.target.files.length > 0) {
      const image = event.target.files[0];
      const formData = new FormData();
      formData.append('file', image);
      this.service.uploadImage(formData).subscribe(
        res => {
          if (res.status === 200 && res.response.status === 'success') {
            this.uploadImageError = '';

            const li: HTMLLIElement = this.renderer.createElement('li');

            const img: HTMLImageElement = this.renderer.createElement('img');
            img.src = res.response.imagePath;
            this.renderer.addClass(img, 'claim-doc');
            img.addEventListener('click', this.promptImage.bind(this, res.response.imagePath));

            const a: HTMLAnchorElement = this.renderer.createElement('a');
            a.innerText = 'Delete';
            this.renderer.addClass(a, 'delete-btn');
            a.addEventListener('click', this.deleteClaimImage.bind(this, res.response.keyName, a));

            this.renderer.appendChild(this.image.nativeElement, li);
            this.renderer.appendChild(li, img);
            this.renderer.appendChild(li, a);
          } else {
            this.uploadImageError = res.response.message;
          }
        },
        err => this.error = err
      );
    }
  }

  promptImage(path) {
    const modal = document.getElementById('myModal');
    this.imageSrc = path;
    modal.style.display = 'block';
  }

  closeModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
  }

  deleteClaimImage(filename, a) {
    const formData = new FormData();
    formData.append('filename', filename);
    this.service.deleteImage(formData).subscribe(
      res => {
        a.parentElement.remove();
      },
      err => this.error = err
    );
  }

  onClose(data: any) {
    this.close.emit(data);
  }

  onWithinCountryChange() {
    this.withinCountryValid = this.withinCountryRB.checked;
    if (this.withinCountryValid) {
      this.requiredWithinCountry = false;
    } else {
      this.requiredWithinCountry = true;
    }
  }


  async newClaim() {
    this.cancelClaimBtn = false;
    this.disableClaimBtn = true;
    this.disableDraftBtn = false;
  }

  async cancelClaim() {
    this.cancelClaimBtn = true;
    this.disableDraftBtn = true;
    this.disableClaimBtn = false;
    this.claimDetailsError = false;
  }

  onChangeDateTo(event) {
    const d = new Date(event.value);
    if (this.claimForm['controls'].claimDetailsPanel['controls'].travelDateFrom.value === '') {
      this.service.showInfo('Please select Travel date from', '');

      this.claimForm['controls'].claimDetailsPanel['controls'].travelDateTo.setValue('');
      return;
    }
    if (event.value < this.claimForm['controls'].claimDetailsPanel['controls'].travelDateFrom.value) {
      this.service.showInfo('Travel Date To must greater than Travel Date From', '');
      this.claimForm['controls'].claimDetailsPanel['controls'].travelDateTo.setValue('');
      return;
    }
  }

  convertUTCDate(date) {
    if (date != null && date != '') {
      const d = new Date(date);
      const fmDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
      return fmDate.substr(0, 10);
    }
  }

  async onSubmit() {
    if (!this.validateFiles('transaction')) {
      return false;
    }
    if (!this.validateFiles('support')) {
      return false;
    }
    if (!this.validateFiles('proof')) {
      return false;
    }

    if (!this.validateFiles('other')) {
      return false;
    }
    this.claimForm.valueChanges.subscribe(() => {
      if (!this.claimForm['controls'].claimDetailsPanel.valid) {
        this.claimDetailsError = true;
      } else if (this.claimForm['controls'].claimDetailsPanel.valid) {
        this.claimDetailsError = false;
      } else if (!this.claimForm['controls'].paymentDetails.valid) {
        this.paymentDetailsValidation = true;
      } else {
        this.paymentDetailsValidation = false;
      }
    });

    const ruelContaningFields: RuleContaningFields = {
      claimField: {
        excessFee: this.claimForm['controls'].paymentDetails['controls'].excessFee.value,
        statusCode: this.claimForm['controls'].claimStatusPanel['controls'].status.value,
        subStatusCode: this.claimForm['controls'].claimStatusPanel['controls'].claimSubStatus.value,
        diagnosticOutcome: ''
      },
      policyField: null
    };
    this.rulesValidationService.validationWithRule(ruelContaningFields);
    this.rulesValidationService.getRuleResult().valid = false;
    this.spinner.show();
    let createClaimValidationFailed: boolean = false;
    if (!this.claimForm['controls'].claimDetailsPanel.valid) {
      this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
      this.spinner.hide();
      this.claimDetailsError = true;
      createClaimValidationFailed = true;
      return;
    }

    if (!this.claimForm['controls'].paymentDetails.valid) {
      this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
      this.spinner.hide();
      this.paymentDetailsValidation = true;
      createClaimValidationFailed = true;
      return;
    }
    if (!createClaimValidationFailed) {
      this.claimModel.fromUI = true;
      this.claimDetailsError = false;
      const statusName = this.claimStatusArray.filter(x => x.code == this.claimForm['controls'].claimStatusPanel['controls'].status.value)[0];
      const subStatusName = this.claimStatusArray.filter(x => x.code == this.claimForm['controls'].claimStatusPanel['controls'].claimSubStatus.value)[0];
      this.claimModel.status = statusName.name;
      this.claimModel.claimSubStatus = subStatusName.name;
      this.claimModel.statusCode = this.claimForm['controls'].claimStatusPanel['controls'].status.value;
      this.claimModel.subStatusCode = this.claimForm['controls'].claimStatusPanel['controls'].claimSubStatus.value;
      this.claimModel.excessFee = this.claimForm['controls'].paymentDetails['controls'].excessFee.value;
      this.claimModel.claimType = this.claimForm['controls'].claimDetailsPanel['controls'].claimType.value;
      this.claimModel.damageType = this.claimForm['controls'].claimDetailsPanel['controls'].damageType.value;
      this.claimModel.dateOfIncident = this.convertUTCDate(this.claimForm['controls'].claimDetailsPanel['controls'].dateOfIncident.value);
      this.claimModel.timeOfIncident = this.claimForm['controls'].claimDetailsPanel['controls'].timeOfIncident.value;
      this.claimModel.channel = this.claimForm['controls'].claimDetailsPanel['controls'].channel.value;
      this.claimModel.relationship = this.claimForm['controls'].claimDetailsPanel['controls'].relationship.value;
      this.claimModel.claimantName = this.claimForm['controls'].claimDetailsPanel['controls'].claimantName.value;
      this.claimModel.claimantEmail = this.claimForm['controls'].claimDetailsPanel['controls'].claimantEmail.value;
      this.claimModel.claimantContact = this.claimForm['controls'].claimDetailsPanel['controls'].claimantContact.value;
      this.claimModel.claimantAlternateContact = this.claimForm['controls'].claimDetailsPanel['controls'].claimantAlternateContact.value;
      this.claimModel.withinCountry = this.withinCountryRB.checked;
      if (this.claimModel.withinCountry) {
        this.claimModel.travelDateFrom = '';
        this.claimModel.travelDateTo = '';
      } else {
        this.claimModel.travelDateFrom = this.convertUTCDate(this.claimForm['controls'].claimDetailsPanel['controls'].travelDateFrom.value);
        this.claimModel.travelDateTo = this.convertUTCDate(this.claimForm['controls'].claimDetailsPanel['controls'].travelDateTo.value);
      }
      this.claimModel.issueDesc = this.claimForm['controls'].claimDetailsPanel['controls'].issueDesc.value;
      // tslint:disable-next-line: max-line-length
      // this.claimModel.requiredLogistic = this.claimForm['controls'].claimDetailsPanel['controls'].requiredLogistic.value === '' ? 'N' : this.claimForm['controls'].claimDetailsPanel['controls'].requiredLogistic.value;
      this.claimModel.collectAddress1 = this.claimForm['controls'].logisticsDetails['controls'].collectAddress1.value;
      this.claimModel.collectAddress2 = this.claimForm['controls'].logisticsDetails['controls'].collectAddress2.value;
      this.claimModel.collectPostcode = this.claimForm['controls'].logisticsDetails['controls'].collectPostcode.value;
      this.claimModel.collectCity = this.claimForm['controls'].logisticsDetails['controls'].collectCity.value;
      this.claimModel.collectState = this.claimForm['controls'].logisticsDetails['controls'].collectState.value;
      this.claimModel.collectCountry = this.claimForm['controls'].logisticsDetails['controls'].collectCountry.value;
      this.claimModel.collectStatus = this.claimForm['controls'].logisticsDetails['controls'].collectStatus.value;
      this.claimModel.collectTracking = this.claimForm['controls'].logisticsDetails['controls'].collectTracking.value;
      // tslint:disable-next-line: max-line-length
      this.claimModel.collectCourier = this.claimForm['controls'].logisticsDetails['controls'].collectCourier.value;
      this.claimModel.dispatchCenterName = this.claimForm['controls'].logisticsDetails['controls'].dispatchCenterName.value;
      this.claimModel.dispatchAddress1 = this.claimForm['controls'].logisticsDetails['controls'].dispatchAddress1.value;
      this.claimModel.dispatchAddress2 = this.claimForm['controls'].logisticsDetails['controls'].dispatchAddress2.value;
      this.claimModel.dispatchPostcode = this.claimForm['controls'].logisticsDetails['controls'].dispatchPostcode.value;
      this.claimModel.dispatchCity = this.claimForm['controls'].logisticsDetails['controls'].dispatchCity.value;
      this.claimModel.dispatchState = this.claimForm['controls'].logisticsDetails['controls'].dispatchState.value;
      this.claimModel.dispatchCountry = this.claimForm['controls'].logisticsDetails['controls'].dispatchCountry.value;
      this.claimModel.deliveryAddress1 = this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress1.value;
      this.claimModel.deliveryAddress2 = this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress2.value;
      this.claimModel.deliveryCity = this.claimForm['controls'].logisticsDetails['controls'].deliveryCity.value;
      this.claimModel.deliveryPostcode = this.claimForm['controls'].logisticsDetails['controls'].deliveryPostcode.value;
      this.claimModel.deliveryState = this.claimForm['controls'].logisticsDetails['controls'].deliveryState.value;
      this.claimModel.deliveryCountry = this.claimForm['controls'].logisticsDetails['controls'].deliveryCountry.value;
      this.claimModel.deliveryStatus = this.claimForm['controls'].logisticsDetails['controls'].deliveryStatus.value;
      this.claimModel.deliveryTracking = this.claimForm['controls'].logisticsDetails['controls'].deliveryTracking.value;
      // tslint:disable-next-line: max-line-length
      this.claimModel.deliveryCourier = this.claimForm['controls'].logisticsDetails['controls'].deliveryCourier.value;
      this.claimModel.requiredPayment = this.claimForm['controls'].paymentDetails['controls'].requiredPayment.value;
      this.claimModel.receivedAmount = this.claimForm['controls'].paymentDetails['controls'].receivedAmount.value;
      this.claimModel.insertBy = sessionStorage.getItem(AppConstants.LOGGED_IN_USER);
      this.claimModel.paymentMethod = this.claimForm['controls'].paymentDetails['controls'].paymentMethod.value;
      this.claimModel.paymentReferenceNo = this.claimForm['controls'].paymentDetails['controls'].paymentReferenceNo.value;
      this.claimModel.assignee = this.claimForm['controls'].claimStatusPanel['controls'].assignee.value;

      // Add data for logisticsFields
      // @ts-ignore
      const logisticsDetailsValues = this.claimForm['controls'].logisticsDetails.getRawValue();
      // Handle date formatting
      Object.keys(logisticsDetailsValues).forEach(key => {
        if (key.includes('Date')) {
          const dateValue = logisticsDetailsValues[key];
          if (dateValue && dateValue !== '') {
            logisticsDetailsValues[key] = this.convertUTCDate(dateValue);
          }
        }
      });

      // Merge back into claim
      // Add Logistics Data
      this.claimModel = Object.assign(this.claimModel, logisticsDetailsValues);
      // Add Logistics Data
      // Create Claim Data
      this.claimData.append('claimRequest', JSON.stringify(this.claimModel));

      // Add files for upload
      for (const section of this.supportingDocumentSections) {
        for (const fileToUpload of this.fileUploadQueue[section.type]) {
          if (section.type === 'support') {
            this.claimData.append('file', fileToUpload); // Support files are sent under the key files
          } else {
            this.claimData.append(section.type, fileToUpload); // Update file list on claimData
          }
        }
      }
      for (const transactionFile of this.fileUploadQueue['transaction']) {
        this.claimData.append('transaction', transactionFile);
      }

      // Trigger flowable or
      if (this.shouldUseFlowable()) {
        try {
          const flowableProcessInstanceID = this.claimModel.flowableProcessInstanceID;
          const claimFormDataWithFile = this.claimData; // Setting an alias for clarity
          await this.service.flowableCreateClaim(flowableProcessInstanceID, claimFormDataWithFile);
          let newClaim = await this.getClaimFromPolicyNo(this.claimModel.policyNo);

          // Add files for upload
          try {
            // Transaction Document
            const transactionFile = this.claimData.get('transaction');
            if (transactionFile) {
              await this.attachFileToClaim(newClaim.claimNo.toString(), transactionFile, 'transaction');
            }

            // Supporting documents
            for (const section of this.supportingDocumentSections) {
              if (section) {
                for (const fileToUpload of this.fileUploadQueue[section.type]) {
                  // Attach files to existing claim
                  await this.attachFileToClaim(newClaim.claimNo.toString(), fileToUpload, section.type);
                }
              }
            }
            // Navigate to claim detail
            newClaim = await this.getClaimFromPolicyNo(this.claimModel.policyNo);
            this.navigateToClaimDetail(newClaim);
            this.spinner.hide();
          } catch (err) {
            this.service.showInfo('Create claim request failed', '');
            this.service.showInfo('Unable to attach files to claim', 'ATTACHING FILES TO CLAIM');
            this.spinner.hide();
          }
        } catch (err) {
          this.service.showInfo('Create claim request failed', '');
          this.service.showInfo('Create claim process cannot be started', 'CREATING FLOWABLE PROCESS');
          this.spinner.hide();
        }
      } else {
        this.service.createClaim(this.claimData).subscribe(
          async res => {
            const data: string = res.status;
            this.spinner.hide();
            if (res['message'] === 'Claim Created') {
              this.service.showInfo('Claim created, Claim ID: ' + res['content'], 'Success');
              const newClaim = await this.getClaimFromPolicyNo(this.claimModel.policyNo);
              this.navigateToClaimDetail(newClaim);
            } else {
              this.clearAppendedFiles();
              if (res.status === 'ERROR') {
                if (res.content.code === '200.100') {
                  this.service.showInfo(ClaimConstants.ERROR_MSG, 'IN CREATING CLAIM');
                  this.spinner.hide();
                  return;
                } else {
                  this.service.showInfo(res.content.message[0], res.content.error);
                  this.spinner.hide();
                  return;
                }
              }
            }
          },
          err => {
            this.spinner.hide();
            this.error = err;
            this.clearAppendedFiles();
          }
        );
      }
    }
  }

  async getClaimFromPolicyNo(policyNo: string): Promise<ClaimDocument> {
    return new Promise((resolve, reject) => {
      this.service.getClaim(policyNo).subscribe(
        res => {
          const claim: ClaimDocument = res.content;
          resolve(claim);
        },
        err => {
          reject(err);
        }
      );
    });
  }

  /**
   *
   * @param claimNo: the claim number on which to upload file
   * @param fileInput: the file to upload
   * @param fileType: the type of file to upload
   */
  async attachFileToClaim(claimNo: string, fileInput, fileType: string): Promise<string> {
    const file = fileInput;
    const filename = file.name;

    // check the param whether has value
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileType);
    formData.append('claimId', claimNo);
    formData.append('author', sessionStorage.getItem(AppConstants.LOGGED_IN_USER));

    // Upload file
    return new Promise((resolve, reject) => {
      this.service.uploadDocument(formData).subscribe(
        res => {
          const path = res.response.content;
          this.service.showInfo('File' + filename + ' uploaded successfully', ClaimConstants.FILE_UPLOAD_HEADING);
          resolve(path);
        },
        err => {
          reject(err);
        }
      );
    });
  }

  shouldUseFlowable() {
    return this.claimModel.partnerId === PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL_GRAB ||
      this.claimModel.partnerId === PolicyEnum.PARTNER_HOMECREDIT_VIETNAM;
  }

  countryLookup(countryCode: string) {
    let countryTemp: any;
    countryTemp = this.countries.filter(x => x.twoCharCode == countryCode)[0];
    this.disableCountryFields = true;
    if (countryTemp == null || countryTemp == undefined) {
      countryTemp = this.countries.filter(x => x.threeCharCode == countryCode)[0];
      if (countryTemp == null || countryTemp == undefined) {
        throw new Error('CountryCode Not Supported');
      } else {
        this.countryDesc = countryTemp.name;
        return countryTemp.twoCharCode;
      }
    }
    return this.countryDesc = countryTemp.name;
  }

  back() {
    this.router.navigate(['../', this.search], { relativeTo: this.route });
  }

  /**
   * navigateToClaimDetail navigates to the claim detail page that was just created
   *
   * @param claim: The claim that we'll use to navigate to the
   * detail page
   */
  navigateToClaimDetail(claim: ClaimDocument) {
    this.search.claimNo = claim.claimNo;
    this.router.navigate(['claim', 'pending', 'detail'],
      { state: [claim, this.search] });
  }

  loader() {
    this.spinner.hide();
    this.isLoading = false;
  }

  getClaimSubStatusToBeSearched(partnerId) {
    let subStatusConstant;
    switch (partnerId) {
      case PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL:
        subStatusConstant = ClaimConstants.PENDING_EXCESS_FEES_AND_DEDUCTIBLES;
        break;
      case PolicyEnum.PARTNER_SAMSUNG_INDONESIA_CF:
        subStatusConstant = ClaimConstants.PENDING_EXCESS_FEES_AND_DEDUCTIBLES;
        break;
      default:
        subStatusConstant = ClaimConstants.APPROVED_BY_CS;
    }
    return subStatusConstant;
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

            if (assignesList[i].partnerId == PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_RETAIL
              || assignesList[i].partnerId == PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_CF) {
              assignesForPH.push(assignesList[i]);

            } else if (assignesList[i].partnerId == PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL || assignesList[i].partnerId == PolicyEnum.PARTNER_SAMSUNG_INDONESIA_CF) {
              assignesForIDO.push(assignesList[i]);
            } else if (assignesList[i].partnerId === PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL) {
              assignesForVN.push(assignesList[i]);
            }
          }
          this.assignesMap[0] = [PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_RETAIL, assignesForPH];
          this.assignesMap[1] = [PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL, assignesForIDO];
          this.assignesMap[2] = [PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL, assignesForVN];

          const claim = window.history.state[0];

          if (claim && claim.partnerId) {
            if (PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_RETAIL == claim.partnerId
              || PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_CF == claim.partnerId) {
              this.assigneesList = this.assignesMap[0][1];

            } else if (PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL == claim.partnerId
              || PolicyEnum.PARTNER_SAMSUNG_INDONESIA_CF == claim.partnerId) {
              this.assigneesList = this.assignesMap[1][1];

            } else if (PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL) {
              this.assigneesList = this.assignesMap[2][1];
            }
          }
        }
      }
    );
  }

  populateLogisticCouriers(partnerId) {
    switch (partnerId) {
      case PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_RETAIL:
      case PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_CF:
        this.logisticCouriers = LogisticCouriers['PH'];
        break;
      case PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL:
      case PolicyEnum.PARTNER_SAMSUNG_INDONESIA_CF:
        this.logisticCouriers = LogisticCouriers['ID'];
        break;
      case PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL_GRAB:
      case PolicyEnum.PARTNER_HOMECREDIT_VIETNAM:
        this.logisticCouriers = LogisticCouriers['VN'];
        break;
      default:
        break;
    }
  }

  getListOfCoutries() {
    this.service.getCountryList().subscribe(res => {
      this.countries = res;
      if (this.response && this.response.countryCode) {
        this.countryDesc = this.countryLookup(this.response.countryCode);
      }

    });
  }

  copyPolicyAddress(copyTheAddress: boolean, fieldToCopyTo: string) {
    // Do nothing if copyTheAddress is not defined or null
    if (copyTheAddress === undefined || copyTheAddress === null || copyTheAddress == false) {
      return;
    }
    this.policyService.findPolicies({
      policyNumber: this.claimModel.policyNo,
      partnerId: this.claimModel.partnerId,
      returnFields: 'custAddress'
    }).subscribe((res) => {
      if (res) {
        const policy = res.obj.resultList[0];
        if (policy) {
          const custAddress = policy.custAddress;
          if (custAddress != null) {
            const controlsLogistic = this.getLogisticsDetailsControls();
            if (fieldToCopyTo == 'delivery') {
              controlsLogistic.deliveryAddress1.setValue(custAddress.address1);
              controlsLogistic.deliveryAddress2.setValue(custAddress.address2);
              controlsLogistic.deliveryPostcode.setValue(custAddress.postalCode);
              controlsLogistic.deliveryState.setValue(custAddress.state);
              controlsLogistic.deliveryCity.setValue(custAddress.city);
              controlsLogistic.deliveryCountry.setValue(custAddress.countryCode);
            } else if (fieldToCopyTo == 'collect') {
              controlsLogistic.collectAddress1.setValue(custAddress.address1);
              controlsLogistic.collectAddress2.setValue(custAddress.address2);
              controlsLogistic.collectPostcode.setValue(custAddress.postalCode);
              controlsLogistic.collectCity.setValue(custAddress.city);
              controlsLogistic.collectState.setValue(custAddress.state);
              controlsLogistic.collectCountry.setValue(custAddress.countryCode);
            }
          } else {
            this.service.showInfo('Address in not present in policy', '');
          }
        }
      }
    });
  }

  // Sets up the subscribe method handlers for form changes
  onChanges() {
    // Subscribe to changes
    this.claimForm.valueChanges.subscribe(val => {
      const claim = this.claimModel;

      // Retrieve claimDetails panel
      const claimDetailsPanel = val['claimDetailsPanel'];
      // Retrieve timeOfIncident
      if (claimDetailsPanel) {
        claim.timeOfIncident = claimDetailsPanel.timeOfIncident;
      }

      // Retrieve Logistics Details
      const logisticsDetails = val['logisticsDetails'];
      if (logisticsDetails) {
        // Handle changes for requiresPickup, requiresDelivery
        claim.requiresPickup = logisticsDetails.requiresPickup;
        claim.requiresDelivery = logisticsDetails.requiresDelivery;
      }

      // Update the claim value
      this.claimModel = claim; // Update the claim
    });

    // Handle changes for copyPolicyAddressTo
    const ldControls = this.claimForm.controls.logisticsDetails['controls'];
    ldControls.copyPolicyAddressToDelivery.valueChanges.subscribe(val => {
      this.copyPolicyAddress(val, 'delivery');
    });
    ldControls.copyPolicyAddressToCollect.valueChanges.subscribe(val => {
      this.copyPolicyAddress(val, 'collect');
    });
  }

  // Clears all address fields for a given logistics address section
  clearAddressFor(fieldToCopyTo) {
    const ldControls = this.getLogisticsDetailsControls();

    // Clear fields
    const fieldsToClear = ['address1', 'address2', 'city', 'state', 'postcode']; // We don't clear country
    fieldsToClear
      .map(capitalise)                               // e.g. address1 -> Address1
      .map(prefix(fieldToCopyTo))                   // e.g. Address1 -> collectAddress1
      .forEach(clearFieldForControl(ldControls));   // clear the field
  }


  // Clears all address fields for a given logistics address section
  // e.g. clearCopyAddressCheckboxFor('collect') or clearCopyAddressCheckboxFor('delivery')
  clearCopyAddressCheckboxFor(addressSectionToClear) {
    const ldControls = this.getLogisticsDetailsControls();

    // The section's checkbox is prefixed by copyPolicyAddressTo
    const fieldsToClear = ['copyPolicyAddressTo' + capitalise(addressSectionToClear)];

    // Clear the field
    fieldsToClear.map(clearFieldForControl(ldControls, null));
  }


  getLogisticsDetailsControls() {
    return this.claimForm.controls.logisticsDetails['controls'];
  }


  autoCompleteSearch(event, country) {
    const searchCriteria = {
      searchKey: event.target.value,
      country: country
    };
    this.searchTextChanged.next(searchCriteria);
  }

  setAddress(placeId: string, country: string) {
    this.productService.getAddressDetails(placeId, country).subscribe((res) => {
      const controlsLogistic = this.getLogisticsDetailsControls();
      if (res.addressLine1 == null) {
        controlsLogistic.collectAddress1.setValue(res.name);
      } else {
        controlsLogistic.collectAddress1.setValue(res.name + ',' + res.addressLine1);
      }
      controlsLogistic.collectAddress2.setValue(res.addressLine2);
      controlsLogistic.collectPostcode.setValue(res.postalCode);
      controlsLogistic.collectCity.setValue(res.city);
      controlsLogistic.collectState.setValue(res.state);

    });

  }

  setDispatchAddress(placeId: string, country: string) {
    this.productService.getAddressDetails(placeId, country).subscribe((res) => {
      const controlsLogistic = this.getLogisticsDetailsControls();
      if (res.addressLine1 == null) {
        controlsLogistic.dispatchAddress1.setValue(res.name);
      } else {
        controlsLogistic.dispatchAddress1.setValue(res.name + ',' + res.addressLine1);
      }
      controlsLogistic.dispatchAddress2.setValue(res.addressLine2);
      controlsLogistic.dispatchPostcode.setValue(res.postalCode);
      controlsLogistic.dispatchCity.setValue(res.city);
      controlsLogistic.dispatchState.setValue(res.state);

    });

  }

  setDeliveryAddress(placeId: string, country: string) {

    this.productService.getAddressDetails(placeId, country).subscribe((res) => {
      const controlsLogistic = this.getLogisticsDetailsControls();
      if (res.addressLine1 == null) {
        controlsLogistic.deliveryAddress1.setValue(res.name);
      } else {
        controlsLogistic.deliveryAddress1.setValue(res.name + ',' + res.addressLine1);
      }
      controlsLogistic.deliveryAddress2.setValue(res.addressLine2);
      controlsLogistic.deliveryPostcode.setValue(res.postalCode);
      controlsLogistic.deliveryState.setValue(res.state);
      controlsLogistic.deliveryCity.setValue(res.city);

    });

  }

  checkDraftClaimByPolicy(policyNo: string) {
    this.toggleButtonState(true);
    this.disableClaimBtn = true;

    this.service.fetchDraftClaimByPolicyNo(policyNo).subscribe((res) => {
      if (res) {
        const claim: ClaimDocument = res.content;
        if (claim) {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.disableClose = true;
          dialogConfig.autoFocus = true;
          dialogConfig.position = { top: '100px' };
          dialogConfig.width = '500px';
          dialogConfig.panelClass = 'dialogC';
          dialogConfig.data = 'You have a drafted claim for this policy, Do you want to discard it or continue with the drafted claim?';
          const draftClaimDailog = this.dialog.open(DraftClaimDailogComponent, dialogConfig);

          draftClaimDailog.afterClosed().subscribe(result => {
            if (result == undefined) {
              return;
            }
            // Discard is clicked
            // this.spinner.show();
            if (result) {
              const formData = new FormData();
              formData.append('policyNumber', policyNo);
              formData.append('author', sessionStorage.getItem(AppConstants.LOGGED_IN_USER));
              this.service.deActiveDraft(formData).subscribe((res) => {
                if (res && res.content === 'No') {
                  this.service.showInfo('Drafted claim discarded', '');
                  this.toggleButtonState(true);
                  this.disableClaimBtn = false;
                } else {
                  this.service.showInfo(res.message, '');
                }
              });
            } else {
              this.loadDraft(claim);
              this.hideButton = false;
            }
          });
        } else {
          this.disableClaimBtn = false;
          this.toggleButtonState(true);
        }
      } else {
        this.disableClaimBtn = false;
      }
    });
  }
  selectMinDate(inputDate: string): Date {
    if (inputDate == null || inputDate.trim() == '') {
      return this.todayDate;
    } else {
      return new Date(inputDate);
    }
  }




  validateFiles(type) {
    let files: File[] = this.fileUploadQueue[type];
    let draftedFielsCount = this[type + 'DocLinks'].length;
    let totalFiles = files.length + draftedFielsCount;
    if (totalFiles <= 3) {
      for (let count = 0; count < files.length; count++) {
        let file = files[count];
        if (!validFileExtension(file.name)) {
          let errorMsg = `Sorry! The File "${file.name}" could not be uploaded. ` + ClaimConstants.INVALID_FILE_EXTENSION;
          this.service.showInfo(errorMsg, 'IN UPLOADING DOCUMENT');
          return;
        }
        if (!validFileSize(file.size)) {
          let errorMsg = `Sorry! The File "${file.name}" ` + ClaimConstants.INVALID_FILE_SIZE;
          this.service.showInfo(errorMsg, 'IN UPLOADING DOCUMENT');
          return;
        }
        if (fileExist(file.name, files, count)) {
          this.service.showInfo(ClaimConstants.DUPLICATE_FILE, 'IN UPLOADING DOCUMENT');
          return;
        }
      }
    }
    else {
      let errorMsg = (type === 'transaction' ? ClaimConstants.TRANSACTION_SLIP_UPLOAD_LIMIT_EXCEEDED : ClaimConstants.FILE_UPLOAD_LIMIT_EXCEEDED);
      this.service.showInfo(errorMsg, 'IN UPLOADING DOCUMENT');
      return;
    }
    if (!this.validateDraftFiles(type)) {
      return;
    }
    return true;
  }
  validateDraftFiles(type) {
    let draftedFilePaths = this[type + 'DocLinks'];
    let fileNames = [];
    for (let count = 0; count < draftedFilePaths.length; count++) {
      let existingFileName = extractFileNameFromFilePath(draftedFilePaths[count]);
      if (!validFileExtension(existingFileName)) {
        let errorMsg = `Sorry! The File "${existingFileName}" could not be uploaded. ` + ClaimConstants.INVALID_FILE_EXTENSION;
        this.service.showInfo(errorMsg, 'IN UPLOADING DOCUMENT');
        return;
      }
      fileNames.push(existingFileName);
    }
    this.fileUploadQueue[type].forEach(file => {
      fileNames.push(file.name);
    });
    if (this.duplicateDraftFile(fileNames)) {
      this.service.showInfo(ClaimConstants.DUPLICATE_FILE, 'IN UPLOADING DOCUMENT');
      return;
    }
    return true;
  }

  duplicateDraftFile(existingFileNames) {
    var visitedFileName = [];
    for (let count = 0; count < existingFileNames.length; count++) {
      let current = existingFileNames[count];
      if (visitedFileName[current]) {
        return true;
      } else {
        visitedFileName[current] = true;
      }
    }
    return false;
  }

  setClaimModel(claim) {
    if (claim.dateOfIncident != null && claim.dateOfIncident != '') {
      let strDate = claim.dateOfIncident.split('/');
      let day = parseInt(strDate[0]);
      let mon = parseInt(strDate[1]);
      let year = parseInt(strDate[2]);
      this.dateOfIncident = new Date(year, mon - 1, day);
    }
    if (claim.withinCountry) {
      this.withinCountryValid = true;
      this.requiredWithinCountry = false;
      this.withinCountryRB.checked = true;
    } else {
      this.withinCountryValid = false;
      this.requiredWithinCountry = true;
    }
    this.claimModel.withinCountry = claim.withinCountry;

    this.claimModel.requiresPickup = claim.requiresPickup;
    this.claimModel.requiresDelivery = claim.requiresDelivery;

    this.claimModel.collectAddress1 = claim.collectAddress1;
    this.claimModel.collectAddress2 = claim.collectAddress2;
    this.claimModel.collectPostcode = claim.collectPostcode;
    this.claimModel.collectState = claim.collectState;
    this.claimModel.collectCity = claim.collectCity;
    this.claimModel.collectCountry = claim.collectCountry;
    this.claimModel.collectStatus = claim.collectStatus;
    this.claimModel.collectTracking = claim.collectTracking;
    this.claimModel.collectCourier = claim.collectCourier;
    this.claimModel.collectDate = claim.collectDate;
    this.claimModel.collectTime = claim.collectTime;
    this.claimModel.actualCollectDate = claim.actualCollectDate;
    this.claimModel.actualCollectTime = claim.actualCollectTime;
    this.claimModel.arrivalCollectDate = claim.arrivalCollectDate;
    this.claimModel.arrivalCollectTime = claim.arrivalCollectTime;

    this.claimModel.deliveryAddress1 = claim.deliveryAddress1;
    this.claimModel.deliveryAddress2 = claim.deliveryAddress2;
    this.claimModel.deliveryPostcode = claim.deliveryPostcode;
    this.claimModel.deliveryState = claim.deliveryState;
    this.claimModel.deliveryCity = claim.deliveryCity;
    this.claimModel.deliveryCountry = claim.deliveryCountry;
    this.claimModel.deliveryDate = claim.deliveryDate;
    this.claimModel.deliveryTime = claim.deliveryTime;
    this.claimModel.actualDeliveryDate = claim.actualDeliveryDate;
    this.claimModel.actualDeliveryTime = claim.actualDeliveryTime;
    this.claimModel.customerDeliveryDate = claim.customerDeliveryDate;
    this.claimModel.customerDeliveryTime = claim.customerDeliveryTime;
    this.claimModel.deliveryStatus = claim.deliveryStatus;
    this.claimModel.deliveryTracking = claim.deliveryTracking;
    this.claimModel.deliveryCourier = claim.deliveryCourier;

    this.claimModel.scheduledDropOffDate = claim.scheduledDropOffDate;
    this.claimModel.scheduledDropOffTime = claim.scheduledDropOffTime;
    this.claimModel.actualDropOffDate = claim.actualDropOffDate;
    this.claimModel.actualDropOffTime = claim.actualDropOffTime;

    this.claimModel.scheduledPickUpDate = claim.scheduledPickUpDate;
    this.claimModel.scheduledPickUpTime = claim.scheduledPickUpTime;
    this.claimModel.actualPickUpDate = claim.actualPickUpDate;
    this.claimModel.actualPickUpTime = claim.actualPickUpTime;
    this.claimModel.transactionDocumentPath = claim.transactionDocumentPath;
    this.claimModel.supportDocumentPath = claim.supportDocumentPath;
    this.claimModel.proofDocumentPath = claim.proofDocumentPath;
    this.claimModel.otherDocumentPath = claim.otherDocumentPath;
  }

  clearAppendedFiles() {
    ['support', 'proof', 'other', 'transaction'].map(
      docType => {
        if (docType === 'supprot')
          this.claimData.delete('file');
        else
          this.claimData.delete(docType);
      }
    );
  }

  loadDraft(claim) {
    this.toggleButtonState(false);
    this.disableClaimBtn = true;
    this.setDocumentLinksFromClaimObject(claim);
    this.setClaimModel(claim);
    this.claimForm = this.fb.group({
      claimDetailsPanel: this.fb.group({
        claimType: new FormControl(claim.claimType),
        damageType: new FormControl(claim.damageType),
        relationship: new FormControl(claim.relationship),
        claimantName: new FormControl(claim.claimantName),
        claimantEmail: new FormControl(claim.claimantEmail),
        claimantContact: new FormControl(claim.claimantContact),
        claimantAlternateContact: new FormControl(claim.claimantAlternateContact),
        channel: new FormControl(claim.channel),
        dateOfIncident: new FormControl(this.dateOfIncident),
        timeOfIncident: new FormControl(claim.timeOfIncident),
        withinCountry: new FormControl(''),
        travelDateFrom: new FormControl(claim.travelDateFrom),
        travelDateTo: new FormControl(claim.travelDateTo),
        issueDesc: new FormControl(claim.issueDesc),
        requiredLogistic: new FormControl(claim.requiredLogistic)
      }),
      paymentDetails: this.fb.group({
        paymentMethod: new FormControl(claim.paymentMethod),
        paymentReferenceNo: new FormControl(claim.paymentReferenceNo),
        requiredPayment: new FormControl(claim.requiredPayment),
        receivedAmount: new FormControl(claim.receivedAmount),
        excessFee: new FormControl(claim.excessFee)
      }),
      logisticsDetails: this.fb.group({
        requiresPickup: new FormControl(claim.requiresPickup),
        requiresDelivery: new FormControl(claim.requiresDelivery),

        collectAddress1: new FormControl(claim.collectAddress1),
        collectAddress2: new FormControl(claim.collectAddress2),
        collectPostcode: new FormControl(claim.collectPostcode),
        collectState: new FormControl(claim.collectState),
        collectCity: new FormControl(claim.collectCity),
        collectCountry: new FormControl(this.claimModel.collectCountry),
        collectStatus: new FormControl(claim.collectStatus),
        collectTracking: new FormControl(claim.collectTracking),
        collectCourier: new FormControl(claim.collectCourier),
        collectDate: new FormControl(claim.collectDate),
        collectTime: new FormControl(claim.collectTime),
        actualCollectDate: new FormControl(claim.actualCollectDate),
        actualCollectTime: new FormControl(claim.actualCollectTime),
        arrivalCollectDate: new FormControl(claim.arrivalCollectDate),
        arrivalCollectTime: new FormControl(claim.arrivalCollectTime),
        // DropOff
        scheduledDropOffDate: new FormControl(claim.scheduledDropOffDate),
        scheduledDropOffTime: new FormControl(claim.scheduledDropOffTime),
        // DropOff - Actual
        actualDropOffDate: new FormControl(claim.actualDropOffDate),
        actualDropOffTime: new FormControl(claim.actualDropOffTime),

        dispatchCenterName: new FormControl(claim.dispatchCenterName, Validators.maxLength(50)),
        dispatchAddress1: new FormControl(claim.dispatchAddress1),
        dispatchAddress2: new FormControl(claim.dispatchAddress2),
        dispatchPostcode: new FormControl(claim.dispatchPostcode),
        dispatchCity: new FormControl(claim.dispatchCity),
        dispatchState: new FormControl(claim.dispatchState),
        dispatchCountry: new FormControl(claim.dispatchCountry),
        deliveryAddress1: new FormControl(claim.deliveryAddress1),
        deliveryAddress2: new FormControl(claim.deliveryAddress2),
        deliveryCity: new FormControl(claim.deliveryCity),
        deliveryPostcode: new FormControl(claim.deliveryPostcode),
        deliveryState: new FormControl(claim.deliveryState),
        deliveryCountry: new FormControl(this.claimModel.deliveryCountry),
        deliveryStatus: new FormControl(claim.deliveryStatus),
        deliveryTracking: new FormControl(claim.deliveryTracking),
        deliveryDate: new FormControl(claim.deliveryDate),
        deliveryTime: new FormControl(claim.deliveryTime),
        deliveryCourier: new FormControl(claim.deliveryCourier),
        // Delivery - Actual
        actualDeliveryDate: new FormControl(claim.actualDeliveryDate),
        actualDeliveryTime: new FormControl(claim.actualDeliveryTime),
        // Delivery - Customer
        customerDeliveryDate: new FormControl(claim.customerDeliveryDate),
        customerDeliveryTime: new FormControl(claim.customerDeliveryTime),
        // Pickup - Scheduled
        scheduledPickUpDate: new FormControl(claim.scheduledPickUpDate),
        scheduledPickUpTime: new FormControl(claim.scheduledPickUpTime),
        // Pickup - Actual
        actualPickUpDate: new FormControl(claim.actualPickUpDate),
        actualPickUpTime: new FormControl(claim.actualPickUpTime),

        copyPolicyAddressToCollect: new FormControl(false),
        copyPolicyAddressToDelivery: new FormControl(false),
      }),
      suppDocumentsPanel: this.fb.group({}),

      claimStatusPanel: this.fb.group({
        status: new FormControl(claim.statusCode),
        claimSubStatus: new FormControl(claim.subStatusCode),
        assignee: new FormControl(claim.assignee),
      }),
    });
    this.maxDate = new Date();
    // tslint:disable-next-line: max-line-length
    if (this.response && (this.response.policyStatus.toUpperCase() === ClaimConstants.POLICY_INACTIVE.toUpperCase() || this.response.policyStatus === '' || this.response.policyStatus === null)) {
      this.hideButton = true;
    }
    if (this.disableCountryFields) {
      this.claimForm['controls'].logisticsDetails['controls'].collectCountry.disable();
      this.claimForm['controls'].logisticsDetails['controls'].dispatchCountry.disable();
      this.claimForm['controls'].logisticsDetails['controls'].deliveryCountry.disable();
    }
    this.onChanges();

  }
  setDocumentLinksFromClaimObject(claimObj) {
    // Set the value for support, proof, other and transaction links
    ['support', 'proof', 'other', 'transaction'].map(
      docType => {
        if (claimObj[docType + 'DocumentPath']) {
          const parsedFiles = claimObj[docType + 'DocumentPath'].split(',');
          this[docType + 'DocLinks'] = parsedFiles.map(filePath => environment.s3ObjUrl + filePath);
        }
      }
    );
  }

  getFilesFor(fileType: string) {
    const files = this.claimModel[fileType + 'DocumentPath'];
    if (files === null || files === undefined || files === '') {
      return [];
    } else {
      return files.split(',');
    }
  }
  removeSelectedDraftFile(type, fileToDelete) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      position: { top: '100px' },
      width: '360px',
      data: 'Are you sure you want to delete this file?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result) {
          const formData = new FormData();
          formData.append('fileToDelete', fileToDelete);
          formData.append('type', type);
          formData.append('policyNo', this.claimModel.policyNo.toString());
          formData.append('author', sessionStorage.getItem(AppConstants.LOGGED_IN_USER));
          this.service.removeDraftDocument(formData).subscribe(
            res => {
              const path = res.response.content;
              if (this[type + 'DocLinks'] != null || this[type + 'DocLinks'] != undefined) {
                this[type + 'DocLinks'] = this[type + 'DocLinks'].filter(function (value) {
                  return extractFileNameFromFilePath(value) != extractFileNameFromFilePath(fileToDelete);
                });
              }
              // Update the claim object
              this.claimModel[type + 'DocumentPath'] = path;
              this.setDocumentLinksFromClaimObject(this.claimModel);

            },
            err => this.error = err
          );
        }
      }
    });
  }
  goToLink(param: string, index: number) {
    let url: string;
    url = this[param + 'DocLinks'][index];
    return url;
  }

  getFileName(filePath: string) {
    if (filePath == null || filePath.trim() == '') {
      return;
    } else {
      return filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length);
    }
  }

  toggleButtonState(value: boolean) {
    this.cancelClaimBtn = value;
    this.disableDraftBtn = value;
  }

  draftClaim() {
    this.isDraft = true;
    this.claimModel.fromUI = true;
    const statusName = this.claimStatusArray.filter(x => x.code == this.claimForm['controls'].claimStatusPanel['controls'].status.value)[0];
    const subStatusName = this.claimStatusArray.filter(x => x.code == this.claimForm['controls'].claimStatusPanel['controls'].claimSubStatus.value)[0];
    this.claimModel.status = statusName.name;
    this.claimModel.claimSubStatus = subStatusName.name;
    this.claimModel.statusCode = this.claimForm['controls'].claimStatusPanel['controls'].status.value;
    this.claimModel.subStatusCode = this.claimForm['controls'].claimStatusPanel['controls'].claimSubStatus.value;
    this.claimModel.excessFee = this.claimForm['controls'].paymentDetails['controls'].excessFee.value;
    this.claimModel.claimType = this.claimForm['controls'].claimDetailsPanel['controls'].claimType.value;
    this.claimModel.damageType = this.claimForm['controls'].claimDetailsPanel['controls'].damageType.value;
    const incidentDate = this.claimForm['controls'].claimDetailsPanel['controls'].dateOfIncident.value;
    if (incidentDate && incidentDate != '')
      this.claimModel.dateOfIncident = this.convertUTCDate(incidentDate);

    this.claimModel.timeOfIncident = this.claimForm['controls'].claimDetailsPanel['controls'].timeOfIncident.value;
    this.claimModel.channel = this.claimForm['controls'].claimDetailsPanel['controls'].channel.value;
    this.claimModel.relationship = this.claimForm['controls'].claimDetailsPanel['controls'].relationship.value;
    this.claimModel.claimantName = this.claimForm['controls'].claimDetailsPanel['controls'].claimantName.value;
    this.claimModel.claimantEmail = this.claimForm['controls'].claimDetailsPanel['controls'].claimantEmail.value;
    this.claimModel.claimantContact = this.claimForm['controls'].claimDetailsPanel['controls'].claimantContact.value;
    this.claimModel.claimantAlternateContact = this.claimForm['controls'].claimDetailsPanel['controls'].claimantAlternateContact.value;
    this.claimModel.withinCountry = this.withinCountryRB.checked;
    if (this.claimModel.withinCountry) {
      this.claimModel.travelDateFrom = '';
      this.claimModel.travelDateTo = '';
    } else {
      const travelDateFrom = this.claimForm['controls'].claimDetailsPanel['controls'].travelDateFrom.value;
      const travelDateTo = this.claimForm['controls'].claimDetailsPanel['controls'].travelDateTo.value;
      if (travelDateFrom && travelDateFrom != '')
        this.claimModel.travelDateFrom = this.convertUTCDate(travelDateFrom);
      if (travelDateTo && travelDateTo != '')
        this.claimModel.travelDateTo = this.convertUTCDate(travelDateTo);
    }
    this.claimModel.issueDesc = this.claimForm['controls'].claimDetailsPanel['controls'].issueDesc.value;
    // tslint:disable-next-line: max-line-length
    this.claimModel.requiredLogistic = this.claimForm['controls'].claimDetailsPanel['controls'].requiredLogistic.value === '' ? 'N' : this.claimForm['controls'].claimDetailsPanel['controls'].requiredLogistic.value;
    this.claimModel.collectAddress1 = this.claimForm['controls'].logisticsDetails['controls'].collectAddress1.value;
    this.claimModel.collectAddress2 = this.claimForm['controls'].logisticsDetails['controls'].collectAddress2.value;
    this.claimModel.collectPostcode = this.claimForm['controls'].logisticsDetails['controls'].collectPostcode.value;
    this.claimModel.collectCity = this.claimForm['controls'].logisticsDetails['controls'].collectCity.value;
    this.claimModel.collectState = this.claimForm['controls'].logisticsDetails['controls'].collectState.value;
    this.claimModel.collectCountry = this.claimForm['controls'].logisticsDetails['controls'].collectCountry.value;
    this.claimModel.collectStatus = this.claimForm['controls'].logisticsDetails['controls'].collectStatus.value;
    this.claimModel.collectTracking = this.claimForm['controls'].logisticsDetails['controls'].collectTracking.value;
    // tslint:disable-next-line: max-line-length
    this.claimModel.collectCourier = this.claimForm['controls'].logisticsDetails['controls'].collectCourier.value;
    this.claimModel.dispatchCenterName = this.claimForm['controls'].logisticsDetails['controls'].dispatchCenterName.value;
    this.claimModel.dispatchAddress1 = this.claimForm['controls'].logisticsDetails['controls'].dispatchAddress1.value;
    this.claimModel.dispatchAddress2 = this.claimForm['controls'].logisticsDetails['controls'].dispatchAddress2.value;
    this.claimModel.dispatchPostcode = this.claimForm['controls'].logisticsDetails['controls'].dispatchPostcode.value;
    this.claimModel.dispatchCity = this.claimForm['controls'].logisticsDetails['controls'].dispatchCity.value;
    this.claimModel.dispatchState = this.claimForm['controls'].logisticsDetails['controls'].dispatchState.value;
    this.claimModel.dispatchCountry = this.claimForm['controls'].logisticsDetails['controls'].dispatchCountry.value;
    this.claimModel.deliveryAddress1 = this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress1.value;
    this.claimModel.deliveryAddress2 = this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress2.value;
    this.claimModel.deliveryCity = this.claimForm['controls'].logisticsDetails['controls'].deliveryCity.value;
    this.claimModel.deliveryPostcode = this.claimForm['controls'].logisticsDetails['controls'].deliveryPostcode.value;
    this.claimModel.deliveryState = this.claimForm['controls'].logisticsDetails['controls'].deliveryState.value;
    this.claimModel.deliveryCountry = this.claimForm['controls'].logisticsDetails['controls'].deliveryCountry.value;
    this.claimModel.deliveryStatus = this.claimForm['controls'].logisticsDetails['controls'].deliveryStatus.value;
    this.claimModel.deliveryTracking = this.claimForm['controls'].logisticsDetails['controls'].deliveryTracking.value;
    // tslint:disable-next-line: max-line-length
    this.claimModel.deliveryCourier = this.claimForm['controls'].logisticsDetails['controls'].deliveryCourier.value;
    this.claimModel.requiredPayment = this.claimForm['controls'].paymentDetails['controls'].requiredPayment.value;
    this.claimModel.receivedAmount = this.claimForm['controls'].paymentDetails['controls'].receivedAmount.value;
    this.claimModel.paymentMethod = this.claimForm['controls'].paymentDetails['controls'].paymentMethod.value;
    this.claimModel.paymentReferenceNo = this.claimForm['controls'].paymentDetails['controls'].paymentReferenceNo.value;
    this.claimModel.assignee = this.claimForm['controls'].claimStatusPanel['controls'].assignee.value;

    // Add data for logisticsFields
    // @ts-ignore
    const logisticsDetailsValues = this.claimForm['controls'].logisticsDetails.getRawValue();
    // Handle date formatting
    Object.keys(logisticsDetailsValues).forEach(key => {
      if (key.includes('Date')) {
        const dateValue = logisticsDetailsValues[key];
        if (dateValue && dateValue !== '') {
          logisticsDetailsValues[key] = this.convertUTCDate(dateValue);
        }
      }
    });

    // Merge back into claim
    this.claimModel = Object.assign(this.claimModel, logisticsDetailsValues);

    // Add Logistics Data
    this.claimData.append('claimRequest', JSON.stringify(this.claimModel));
    this.claimData.append('author', sessionStorage.getItem(AppConstants.LOGGED_IN_USER));
    // Add files for upload
    for (const section of this.supportingDocumentSections) {
      for (const fileToUpload of this.fileUploadQueue[section.type]) {
        this.claimData.append(section.type, fileToUpload);
      }
    }
    for (const transactionFile of this.fileUploadQueue['transaction']) {
      this.claimData.append('transaction', transactionFile);
    }

    this.service.draftClaim(this.claimData).subscribe(
      res => {
        const data: string = res.status;
        this.spinner.hide();
        if (res['message'] === 'Claim Drafted') {
          this.service.showInfo('Claim Drafted Sucessfully', 'Success');
        } else {
          this.clearAppendedFiles();
          if (res.status === 'ERROR') {
            if (res.content.code === '200.100') {
              this.service.showInfo(ClaimConstants.ERROR_MSG, 'IN DRAFT CLAIM');
              this.spinner.hide();
              return;
            } else {
              this.service.showInfo(res.content.message[0], res.content.error);
              this.spinner.hide();
              return;
            }
          }
        }
      },
      err => {
        this.spinner.hide();
        this.error = err;
        this.clearAppendedFiles();
      }
    );
    this.isDraft = false;
    this.claimData = new FormData();
  }
}



// Helper that joins a prefix with the fieldName
// Useful for cases where we have repetitive nested structures like
//
// e.g:
//   collectAddress1, deliveryAddress1, collectState, deliveryState
//
// Returns a function that applies on strings
// e.g. const prefixer = prefix("collect")
//      prefixer("Address1")
//      >>> "collectAddress1"
//
function prefix(pre) {
  // Combines a prefix with the given string in camel case notation
  return (s) => pre + s;
}

function capitalise(s) {
  return s.replace(/^\w/, c => c.toUpperCase());
}

// returns a function that takes in a field and clears the value on it
// - the control used should be provided as the argument
//
// e.g:
// LogisticsDetailsClearer = clearFieldForControl(this.claimForm.controls.logisticsDetails.controls)
// >>> LogisticsDetailsClearer('collectAddress1')
//
function clearFieldForControl(control, defaultClearValue: any = '') {
  return (field) => control[field].setValue(defaultClearValue);
}

function validFileExtension(fileName) {
  const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
  const validFileExtensions = [
    'jpg', 'png', 'xls', 'csv', 'pdf', 'doc', 'docx', 'xlsx'
  ];
  return validFileExtensions.includes(extension.toLowerCase());
}

function validFileSize(bytes) {
  return (bytes <= 2147483648); // 2147483648 = 2 GB
}

function fileExist(fileName, files, currentFile) {
  for (let count = 0; count < files.length; count++) {
    if (count != currentFile) {
      let existingFileName = files[count].name;
      if (fileName === existingFileName) {
        return true;
      }
    }
  }
  return false;
}
function extractFileNameFromFilePath(filePath) {
  if (filePath == null || filePath.trim() == '') {
    return;
  } else {
    return filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length);
  }
}
