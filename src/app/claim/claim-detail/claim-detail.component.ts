import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimDocument, LogisticCourier, LogisticStatus } from 'src/app/model/ClaimDocument';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { ClaimConstants, LogisticCouriers, LogisticStatuses } from 'src/app/claim/claim.constants';
import { ResponseObject } from 'src/app/model/response.claim.object';
import { AppConstants } from 'src/app/app.constants';
import { ClaimSearch } from 'src/app/model/claim.search';
import { PolicyEnum } from 'src/app/model/policy.enum';
import { ClaimStatusObject } from 'src/app/model/ClaimStatusObject';
import { AssigneeList } from 'src/app/model/assignee';
import { PolicyService } from '../../policy/policy.service';
import { RulesValidationService } from 'src/app/rulesengine/rules.validation.service';
import { RuleContaningFields } from 'src/app/rulesengine/model/rule.contaning.fields';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, mergeMap } from 'rxjs/operators';
import { ProductService } from 'src/app/product/product.service';
import { ConfirmationDialogComponent } from '../../components/shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-claim-detail',
  templateUrl: './claim-detail.component.html',
  styleUrls: ['./claim-detail.component.css']
})

export class ClaimDetailComponent implements OnInit {
  searchList: Array<any>;
  subscription: any;
  searchTextChanged = new Subject<any>();
  countryAtGlobal: string;
  countries: any[];
  assignesMap: any;
  claimStatusObject: ClaimStatusObject[];
  claimStatusArray: any[] = [];
  defaultStatus: string;
  successMsg: string;
  errorMsg: string;
  disableCountryFields = true;
  dispatchCountryDesc: string = '';
  deliveryCountryDesc: string = '';
  collectCountryDesc: string = '';
  error: string;
  claimStatusValidationFailed: boolean;
  generalValidationFailed: boolean;
  claimDetailsValidationFailed: boolean;
  deviceAssessmentValidationFailed: boolean;
  paymentDetailsValidationFailed: boolean;
  logisticsDetailsValidationFailed: boolean;
  panelErrorMessage: string;
  isLoadingResults = true;
  claimForm: FormGroup;
  formData = new FormData();
  claim = ClaimDocument.newClaimDocument();
  search: ClaimSearch;
  claimLog: string[] = [];
  response: ResponseObject;
  editClaimBtn: boolean = false;
  hideActionBtn: boolean = false;
  uploadDocError: string;
  claimStatusToDisplay: any[] = [];
  claimSubStatus: any[] = [];
  productCode: String;
  assigneesList: AssigneeList[] = [];
  todayDate: Date = new Date();
  logisticStatuses: LogisticStatus[] = LogisticStatuses;
  logisticCouriers: LogisticCourier[] = [];
  file: File;
  hideUpload: boolean = false;
  filename: string = '';
  claimDecisionDeclined: boolean = false;
  repairFields: boolean;
  replaceFields: boolean;
  EWFields: boolean;
  hideTransactionUpload = false;
  transactionDocLinks: string[] = [];
  hideSupportUpload = false; // travel document
  supportDocLinks: string[] = [];
  hideProofUpload = false;
  proofDocLinks: string[] = [];
  hideOtherUpload = false;
  otherDocLinks: string[] = [];
  repairStatus: string = null;
  lockNotificationResponse: any;
  supportingDocumentSections = [
    { type: 'support', title: 'Travel Document' },
    { type: 'proof', title: 'Proof of Purchase' },
    { type: 'other', title: 'Other Document' }
  ];

  constructor(
    private service: AppService,
    private policyService: PolicyService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService, private rulesValidationService: RulesValidationService,
    private productService: ProductService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.getListOfCoutries();
    this.claim = window.history.state[0];
    const search = window.history.state[1];
    this.search = search;
    // Add current page to the search history object so that the
    // previous state of listing page is preserrved
    if (this.search) {
      this.search.currentPage = window.history.state[2];
    }
    if (this.claim !== undefined) {
      this.claimForm = this.fb.group({
        claimStatusPanel: this.fb.group({
          statusCode: [this.claim.statusCode, Validators.required],
          subStatusCode: [this.claim.subStatusCode, Validators.required],
          assignee: [this.claim.assignee, Validators.required],
        }),
        general: this.fb.group({
          policyNo: [null],
        }),
        claimDetailsPanel: this.fb.group({
          claimantContact: [this.claim.claimantContact, Validators.required],
          claimantName: [this.claim.claimantName, Validators.required],
          claimantAlternateContact: [this.claim.claimantAlternateContact],
          claimantEmail: [this.claim.claimantEmail],
          issueDesc: [this.claim.issueDesc, Validators.required],
          // requiredLogistic: [this.claim.requiredLogistic, Validators.required],
          claimType: [this.claim.claimType],
        }),
        deviceAssessment: this.fb.group({
          assessBy: [this.claim.assessBy],
          assessOn: [this.claim.assessOn],
          assessReferenceNo: [this.claim.assessReferenceNo],
          reasonForReplace: [this.claim.reasonForReplace],
          replaceImei: [this.claim.replaceImei],
          replaceMake: [this.claim.replaceMake],
          replaceModel: [this.claim.replaceModel],
          replaceColor: [this.claim.replaceColor],
          replaceStorage: [this.claim.replaceStorage],
          quotationPartCosts: [this.claim.quotationPartCosts],
          quotationLabourCosts: [this.claim.quotationLabourCosts],
          quotationRepairedTax: [this.claim.quotationRepairedTax],
          quotationRepairedTotalCost: [this.claim.quotationRepairedTotalCost],
          finalPartCosts: [this.claim.finalPartCosts],
          finalLabourCosts: [this.claim.finalLabourCosts],
          finalRepairedTax: [this.claim.finalRepairedTax],
          finalRepairedTotalCost: [this.claim.finalRepairedTotalCost],
          diagnosticOutcome: [this.claim.diagnosticOutcome],
          replacementCost: [this.claim.replacementCost],
          diagnosticCost: [this.claim.diagnosticCost],
          replacementTax: [this.claim.replacementTax],
          totalReplacementCost: [this.claim.totalReplacementCost],
        }),
        paymentDetails: this.fb.group({
          requiredPayment: false,
          receivedAmount: [this.claim.receivedAmount],
          paymentMethod: [this.claim.paymentMethod],
          paymentReferenceNo: [this.claim.paymentReferenceNo],
          excessFee: [this.claim.excessFee],
        }),
        logisticsDetails: this.fb.group({
          requiresPickup: [this.claim.requiresPickup],
          requiresDelivery: [this.claim.requiresDelivery],

          // Collect
          collectAddress1: [this.claim.collectAddress1],
          collectAddress2: [this.claim.collectAddress2],
          collectPostcode: [this.claim.collectPostcode],
          collectCity: [this.claim.collectCity],
          collectState: [this.claim.collectState],
          collectCountry: [this.claim.collectCountry],
          collectStatus: [this.claim.collectStatus],
          collectTracking: [this.claim.collectTracking],
          collectDate: [this.claim.collectDate],
          collectTime: [this.claim.collectTime],
          collectCourier: [this.claim.collectCourier],
          actualCollectDate: [this.claim.actualCollectDate],
          actualCollectTime: [this.claim.actualCollectTime],
          arrivalCollectDate: [this.claim.arrivalCollectDate],
          arrivalCollectTime: [this.claim.arrivalCollectTime],

          // DropOff
          scheduledDropOffDate: [this.claim.scheduledDropOffDate],
          scheduledDropOffTime: [this.claim.scheduledDropOffTime],

          // DropOff - Actual
          actualDropOffDate: [this.claim.actualDropOffDate],
          actualDropOffTime: [this.claim.actualDropOffTime],

          // Dispatch
          dispatchCenterName: [this.claim.dispatchCenterName, Validators.maxLength(50)],
          dispatchAddress1: [this.claim.dispatchAddress1],
          dispatchAddress2: [this.claim.dispatchAddress2],
          dispatchPostcode: [this.claim.dispatchPostcode],
          dispatchCity: [this.claim.dispatchCity],
          dispatchState: [this.claim.dispatchState],
          dispatchCountry: [this.claim.dispatchCountry],

          // Delivery
          deliveryAddress1: [this.claim.deliveryAddress1],
          deliveryAddress2: [this.claim.deliveryAddress2],
          deliveryCity: [this.claim.deliveryCity],
          deliveryState: [this.claim.deliveryState],
          deliveryPostcode: [this.claim.deliveryPostcode],
          deliveryCountry: [this.claim.deliveryCountry],
          deliveryStatus: [this.claim.deliveryStatus],
          deliveryTracking: [this.claim.deliveryTracking],
          deliveryDate: [this.claim.deliveryDate],
          deliveryTime: [this.claim.deliveryTime],
          deliveryCourier: [this.claim.deliveryCourier],
          // Delivery - Actual
          actualDeliveryDate: [this.claim.actualDeliveryDate],
          actualDeliveryTime: [this.claim.actualDeliveryTime],
          // Delivery - Customer
          customerDeliveryDate: [this.claim.customerDeliveryDate],
          customerDeliveryTime: [this.claim.customerDeliveryTime],

          // Pickup - Scheduled
          scheduledPickUpDate: [this.claim.scheduledPickUpDate],
          scheduledPickUpTime: [this.claim.scheduledPickUpTime],
          // Pickup - Actual
          actualPickUpDate: [this.claim.actualPickUpDate],
          actualPickUpTime: [this.claim.actualPickUpTime],

          copyPolicyAddressToCollect: [this.claim.copyPolicyAddressToCollect],
          copyPolicyAddressToDelivery: [this.claim.copyPolicyAddressToDelivery],
        }),
        supportingDocuments: this.fb.group({}),
      });
      this.setClaimDetails(this.claim);
      this.setDeliveryValidators();
      if (this.claim.statusCode === ClaimConstants.PENDING_DELIVERY && this.claim.deliveryStatus === 'OutForDelivery') {
        this.claimForm['controls'].logisticsDetails['controls'].deliveryTracking.setValidators(Validators.required);
        this.claimForm['controls'].logisticsDetails['controls'].deliveryCourier.setValidators(Validators.required);
      }
      this.populateLogisticCouriers(this.claim.partnerId);
      this.getAssignees();
      this.enableControl(false);
      this.onChanges();
    }
    this.rulesValidationService.setClaimForm(this.claimForm, 'UPDATE');
    if (this.claim != undefined) {
      this.rulesValidationService.loadProductRulesByProductCode(this.claim.productCode);
    }

    this.subscription = this.searchTextChanged.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => this.productService.getAutcompleteAdress(search.searchKey, search.country)
      )
    ).subscribe((res: any) => {
      this.searchList = res;
    });

  }

  getClaimDetail(claimId: String, partnerId: String) {
    this.service.showClaimDetail(claimId, partnerId).subscribe(
      (res) => {
        if (res === null) {
          return;
        }
        if (res.content === null) {
          return;
        }
        if (res.status === 'ERROR') {
          if (res.content.code === '200.100') {
            this.service.showInfo(ClaimConstants.ERROR_MSG, 'IN GETTING CLAIM DETAILS');
            return;
          } else {
            this.service.showInfo(res.content.message[0], res.content.error);
            return;
          }
        }
        this.setClaimDetails(res.content);
      }, err => {
        this.isLoadingResults = false;
      }
    );


  }

  setClaimDetails(claimObj) {
    this.productCode = claimObj.productCode;
    this.claimSubStatus = [];
    this.claimStatusToDisplay = [];
    this.repairStatus = null;
    this.onDiagnosticChange(claimObj.diagnosticOutcome);

    // this.setStatusFromLocal(claimObj.statusCode);
    this.setDocumentLinksFromClaimObject(claimObj);
    setTimeout(() => {
      this.dispatchCountryDesc = this.countryLookup(claimObj.dispatchCountry);
      this.deliveryCountryDesc = this.countryLookup(claimObj.deliveryCountry);
      this.collectCountryDesc = this.countryLookup(claimObj.collectCountry);
      this.countryAtGlobal = this.validateContryCode(claimObj.country);

    }, 3000);

    if (claimObj.statusCode === ClaimConstants.COMPLETED && claimObj.subStatusCode === ClaimConstants.CLOSED) {
      this.hideActionBtn = true;
    }
    this.getClaimStatus(claimObj.statusCode, false);
    this.claimForm['controls'].claimStatusPanel['controls'].statusCode.setValue(claimObj.statusCode);
    this.claimForm['controls'].claimStatusPanel['controls'].subStatusCode.setValue(claimObj.subStatusCode);

    let controlsLogistic = this.getLogisticsDetailsControls();

    controlsLogistic.collectAddress1.setValue(claimObj.collectAddress1);
    controlsLogistic.collectAddress2.setValue(claimObj.collectAddress2);
    controlsLogistic.collectPostcode.setValue(claimObj.collectPostcode);
    controlsLogistic.collectCity.setValue(claimObj.collectCity);
    controlsLogistic.collectState.setValue(claimObj.collectState);
    controlsLogistic.collectCountry.setValue(claimObj.collectCountry);


    controlsLogistic.dispatchAddress1.setValue(claimObj.dispatchAddress1);
    controlsLogistic.dispatchAddress2.setValue(claimObj.dispatchAddress2);
    controlsLogistic.dispatchPostcode.setValue(claimObj.dispatchPostcode);
    controlsLogistic.dispatchCity.setValue(claimObj.dispatchCity);
    controlsLogistic.dispatchState.setValue(claimObj.dispatchState);
    controlsLogistic.dispatchCountry.setValue(claimObj.dispatchCountry);

    controlsLogistic.deliveryAddress1.setValue(claimObj.deliveryAddress1);
    controlsLogistic.deliveryAddress2.setValue(claimObj.deliveryAddress2);
    controlsLogistic.deliveryPostcode.setValue(claimObj.deliveryPostcode);
    controlsLogistic.deliveryState.setValue(claimObj.deliveryState);
    controlsLogistic.deliveryCity.setValue(claimObj.deliveryCity);
    controlsLogistic.deliveryCountry.setValue(claimObj.deliveryCountry);

    this.isLoadingResults = false;
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

  validateContryCode(countryCode: any): any {

    let countryTemp: any;
    countryTemp = this.countries.filter(x => x.twoCharCode === countryCode)[0];
    if (countryTemp === null || countryTemp === undefined) {
      countryTemp = this.countries.filter(x => x.threeCharCode === countryCode)[0];
      if (countryTemp === null || countryTemp === undefined) {
        throw new Error('CountryCode Not Supported');
      } else {
        return countryTemp.twoCharCode;
      }
    }
    return countryTemp.twoCharCode;
  }

  getClaimDetailAuditLog(claimNo: string) {
    this.service.findClaimAuditTrial(claimNo).subscribe((res) => {
      if (res.status === 'OK') {
        this.claimLog = res;
      } else {
        if (res.status === 'ERROR') {
          if (res.content.code === '200.100') {
            this.service.showInfo(ClaimConstants.ERROR_MSG, 'IN GETTING CLAIM AUDIT LOG');
            return;
          } else {
            this.service.showInfo(res.content.message[0], res.content.error);
            return;
          }
        }
      }

    }, err => {
    });
  }

  toggleDatePicker() {
    if (this.claimForm['controls'].logisticsDetails['controls'].collectDate.disabled) {
      return 'disabled === "true"';
    } else {
      return 'disabled === "false"';
    }
  }

  enableControl(enable: boolean) {
    const claimFormControls = this.claimForm.controls;

    const controls = ['claimStatusPanel',
      'claimDetailsPanel',
      'deviceAssessment',
      'paymentDetails',
      'logisticsDetails'
    ];
    if (enable) {
      // Enable all fields
      controls.forEach(ctrl => claimFormControls[ctrl].enable());

      // Disable
      // - Some fields remain disabled in all cases
      ['collectCountry', 'dispatchCountry', 'deliveryCountry']
        .forEach(f => claimFormControls['logisticsDetails'].get(f).disable());

    } else {
      controls.forEach(ctrl => claimFormControls[ctrl].disable());
    }
  }

  editClaim() {
    this.editClaimBtn = true;
    this.enableControl(true);
  }

  cancelEdit() {
    this.editClaimBtn = false;
    this.enableControl(false);
    this.setPanelValidationMessage();
    this.getClaimDetail(this.claim.claimNo, this.claim.partnerId);
  }

  goToLink(param: string, index: number) {
    let url: string;
    url = this[param + 'DocLinks'][index];
    return url;
  }


  async updateClaim(form: NgForm) {
    this.claimForm.valueChanges.subscribe(() => {
      if (!this.claimForm['controls'].claimDetailsPanel.valid) {
        this.claimDetailsValidationFailed = true;
      }
      this.claimDetailsValidationFailed = false;
    });
    let rulesContaningField: RuleContaningFields = {
      claimField: {
        excessFee: this.claim.excessFee,
        statusCode: this.claim.statusCode,
        subStatusCode: this.claim.subStatusCode,
        diagnosticOutcome: this.claim.diagnosticOutcome
      },
      policyField: null
    };

    this.rulesValidationService.validationWithRule(rulesContaningField);
    this.rulesValidationService.getRuleResult().valid = false;
    this.setDeliveryValidators();
    this.claimForm['productCode'] = this.productCode;
    let updateClaimValidationFailed: boolean = false;
    this.setPanelValidationMessage();
    if (!this.claimForm['controls'].claimStatusPanel.valid) {
      this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
      this.spinner.hide();
      this.claimStatusValidationFailed = true;
      updateClaimValidationFailed = true;
    }
    if (!this.claimForm['controls'].general.valid) {
      this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
      this.spinner.hide();
      this.generalValidationFailed = true;
      updateClaimValidationFailed = true;
    }
    if (!this.claimForm['controls'].claimDetailsPanel.valid) {
      this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
      this.spinner.hide();
      this.claimDetailsValidationFailed = true;
      updateClaimValidationFailed = true;
    }
    if (!this.claimForm['controls'].deviceAssessment.valid) {
      this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
      this.spinner.hide();
      this.deviceAssessmentValidationFailed = true;
      updateClaimValidationFailed = true;
      if (this.claimForm['controls'].deviceAssessment['controls'].diagnosticOutcome.value === 'BER'
        && this.claimForm['controls'].claimStatusPanel['controls'].statusCode.value === ClaimConstants.COMPLETED
        && this.claimForm['controls'].deviceAssessment['controls'].replaceImei.value === '') {
        this.claimForm['controls'].deviceAssessment['controls'].replaceImei.setErrors({
          required: true
        });
        return;
      }
    }
    if (!this.claimForm['controls'].paymentDetails.valid) {
      this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
      this.spinner.hide();
      this.paymentDetailsValidationFailed = true;
      updateClaimValidationFailed = true;
    }
    if (!this.claimForm['controls'].logisticsDetails.valid) {
      this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
      this.spinner.hide();
      this.logisticsDetailsValidationFailed = true;
      updateClaimValidationFailed = true;
    }

    // Termiante if update claim failed
    if (updateClaimValidationFailed) {
      return;
    } else {
      this.spinner.show();
      if (this.claimForm['controls'].deviceAssessment['controls'].diagnosticOutcome.value === 'BER'
        && this.claimForm['controls'].claimStatusPanel['controls'].statusCode.value === ClaimConstants.COMPLETED
        && this.claimForm['controls'].deviceAssessment['controls'].replaceImei.value === '') {
        this.claimForm['controls'].deviceAssessment['controls'].replaceImei.setErrors({
          required: true
        });
        this.deviceAssessmentValidationFailed = true;
        this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
        this.spinner.hide();
        return;
      }
      // tslint:disable-next-line:max-line-length
      const claimStatusIsCompleted = this.claimForm['controls'].claimStatusPanel['controls'].statusCode.value === ClaimConstants.COMPLETED;
      // tslint:disable-next-line:max-line-length
      const claimSubStatusIsClosed = this.claimForm['controls'].claimStatusPanel['controls'].subStatusCode.value === ClaimConstants.CLOSED;

      const invalidReplaceImei = this.claimForm['controls'].deviceAssessment['controls'].replaceImei === null ||
        this.claimForm['controls'].deviceAssessment['controls'].replaceImei == '';
      if (claimStatusIsCompleted && claimSubStatusIsClosed && invalidReplaceImei) {
        this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
        this.deviceAssessmentValidationFailed = true;
        this.claimForm['controls'].deviceAssessment['controls'].replaceImei.setErrors({
          required: true
        });
        this.spinner.hide();
        return;
      }

      // tslint:disable-next-line:max-line-length
      const claimTotalCostIsInvalid = this.claimForm['controls'].deviceAssessment['controls'].finalRepairedTotalCost === null || this.claimForm['controls'].deviceAssessment['controls'].finalRepairedTotalCost.value <= 0;
      // Throw invalid total cost error for "completed" & "closed" claim is total cost is null or < 0
      if (claimStatusIsCompleted && claimSubStatusIsClosed && claimTotalCostIsInvalid) {
        this.panelErrorMessage = ClaimConstants._VALIDATION_MSG_FINAL_TOTAL_COST;
        this.deviceAssessmentValidationFailed = true;
        this.claimForm['controls'].deviceAssessment['controls'].finalRepairedTotalCost.setErrors({
          required: true
        });
        this.spinner.hide();
        return;
      }
      // Add user
      this.claim.updateBy = sessionStorage.getItem(AppConstants.LOGGED_IN_USER);
      // this.claim.requiredLogistic = this.claimForm['controls'].claimDetailsPanel['controls'].requiredLogistic.value;
      this.claim.diagnosticOutcome = this.claimForm['controls'].deviceAssessment['controls'].diagnosticOutcome.value;
      this.claim.fromUI = true;
      this.claim.country = this.countryAtGlobal;

      // tslint:disable-next-line:max-line-length
      this.claim.claimSubStatus = this.claimSubStatus.filter(x => x.code === this.claimForm['controls'].claimStatusPanel['controls'].subStatusCode.value)[0].name;

      // Add data for logisticsFields
      // @ts-ignore
      const logisticsDetailsValues = this.claimForm['controls'].logisticsDetails.getRawValue();
      // Handle Date Formatting
      Object.keys(logisticsDetailsValues).forEach(key => {
        if (key.includes('Date')) {
          const dateValue = logisticsDetailsValues[key];
          if (dateValue && dateValue !== '') {
            logisticsDetailsValues[key] = this.convertUTCDate(dateValue);
          }
        }
      });
      // Merge back into claim
      this.claim = Object.assign(this.claim, logisticsDetailsValues);


      const hideActionButton = () => {
        if (this.claimForm['controls'].claimStatusPanel['controls'].statusCode.value === ClaimConstants.COMPLETED
          && this.claimForm['controls'].claimStatusPanel['controls'].subStatusCode.value === ClaimConstants.CLOSED) {
          this.hideActionBtn = true;
        }
      };

      if (this.shouldUseFlowable()) {
        try {
          const flowableProcessInstanceID = this.claim.flowableProcessInstanceID;
          const claimObject = this.claim;
          await this.service.flowableUpdateClaim(flowableProcessInstanceID, claimObject);
          this.spinner.hide();
          this.editClaimBtn = false;
          this.enableControl(false);
          // Set status from latest claim
          this.getClaimDetail(this.claim.claimNo, this.claim.partnerId);
          hideActionButton();
        } catch (err) {
          console.log(err);
          this.service.showInfo('Update claim request failed', '');
          this.service.showInfo('Update claim process cannot be started', 'UPDATE FLOWABLE PROCESS');
          this.spinner.hide();
        }
      } else {
        this.service.updateClaim(this.claim).subscribe(
          res => {
            this.spinner.hide();
            if (res.status === 'OK') {
              if (res['message'] === ClaimConstants.UPDATED_CLAIM) {
                this.service.showInfo('Claim updated, Claim ID: ' + res['content'].claimNo, 'Success');
                this.claimStatusToDisplay = [];
                this.claimSubStatus = [];

                this.getClaimStatus(res['content'].statusCode, false);
                this.setStatusFromLocal(res['content'].statusCode, false);

                this.editClaimBtn = false;
                this.enableControl(false);
                hideActionButton();
              }
            } else {
              if (res.status === 'ERROR') {
                if (res.content.code === '200.100') {
                  this.service.showInfo(ClaimConstants.ERROR_MSG, 'IN UPDATING CLAIM DETAILS');
                  this.spinner.hide();
                  return;
                } else {
                  this.service.showInfo(res.content.message[0], res.content.error);
                  this.spinner.hide();
                  return;
                }
              }
              this.isLoadingResults = false;
            }
          },
          err => {
            this.error = err;
            this.spinner.hide();
          }
        );
        this.claimForm['controls'].claimStatusPanel['controls'].statusCode.setValue(this.claim.statusCode);
        this.claimForm['controls'].claimStatusPanel['controls'].subStatusCode.setValue(this.claim.subStatusCode);
      }

    }
  }

  onSelectedFile(event, fileInput, type) {
    event.preventDefault();
    if (fileInput.files.length > 0) {
      const target = event.currentTarget;
      event.currentTarget.disabled = true;
      this.file = fileInput.files[0];
      this.filename = this.file.name;
      // check the param whether has value
      const formData = new FormData();
      formData.append('file', this.file);
      formData.append('type', type);
      formData.append('claimId', this.claim.claimNo.toString());
      formData.append('author', sessionStorage.getItem(AppConstants.LOGGED_IN_USER));

      // Upload file
      this.service.uploadDocument(formData).subscribe(
        res => {
          const path = res.response.content;
          // Update the claim object
          this.claim[type + 'DocumentPath'] = path;
          this.setDocumentLinksFromClaimObject(this.claim);
          this.service.showInfo('File uploaded successfully', ClaimConstants.FILE_UPLOAD_HEADING);
          fileInput.value = ''; // Clear file input value
          target.disabled = false;
        },
        err => {
          target.disabled = false;
          this.error = err;
        }
      );
      this.isLoadingResults = false;
    } else {
      this.hideUpload = false;
    }
  }

  removeSelectedFile(type, fileName) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      position: { top: '100px' },
      width: '360px',
      data: 'Are you sure you want to delete this file?'
    });

    dialogRef.afterClosed().subscribe(result => {
      // Yes is clicked
      if (result) {
        // Remove file
        const formData = new FormData();
        formData.append('fileName', fileName);
        formData.append('type', type);
        formData.append('claimId', this.claim.claimNo.toString());
        formData.append('author', sessionStorage.getItem(AppConstants.LOGGED_IN_USER));
        this.service.removeDocument(formData).subscribe(
          res => {
            const path = res.response.content;
            if (this[type + 'DocLinks'] != null || this[type + 'DocLinks'] != undefined) {
              this[type + 'DocLinks'] = this[type + 'DocLinks'].filter(function (value) {
                return extractFileNameFromFilePath(value) != extractFileNameFromFilePath(fileName);
              });
            }
            // Update the claim object
            this.claim[type + 'DocumentPath'] = path;
            this.setDocumentLinksFromClaimObject(this.claim);

          },
          err => this.error = err
        );
      }
    });
  }

  getFilesFor(fileType: string) {
    const files = this.claim[fileType + 'DocumentPath'];
    if (files === null || files === undefined || files === '') {
      return [];
    } else {
      if (fileType === 'transcaction') {
        return files; // Transaction currently only supports single file upload
      } else {
        return files.split(',');
      }
    }
  }

  back() {
    this.router.navigate(['../', this.search], { relativeTo: this.route });
  }

  setStatusFromLocal(statusCode: string, fromOnit: boolean) {
    this.claimSubStatus = [];
    let claimStatusTemp2: ClaimStatusObject;

    claimStatusTemp2 = this.claimStatusObject.filter(x => x.code === statusCode)[0];

    for (let i = 0; i < claimStatusTemp2.subStatus.length; i++) {
      this.claimSubStatus.push(claimStatusTemp2.subStatus[i]);
      this.claimStatusArray.push(claimStatusTemp2.subStatus[i]);
    }
    this.claim.status = claimStatusTemp2.name;

    if (fromOnit) {
      this.claimForm['controls'].claimStatusPanel['controls'].subStatusCode.value = this.claimSubStatus[0].code;
      this.claim.subStatusCode = this.claimSubStatus[0].code;
    }

  }

  /**
   *
   * @param statusName: main status name
   * @param type 1: main and sub status change, 2: only sub status change
   */
  getClaimStatus(statusCode: string, fromOnit: boolean) {
    this.service.findClaimStatus().subscribe(
      res => {
        if (res.status === 'OK') {
          if (res['message'] === 'Exist') {
            this.claimStatusArray = [];
            this.claimStatusObject = [];
            this.claimStatusObject = res.content as ClaimStatusObject[];
            this.setStatusCodeListFromLocal(statusCode);
            this.setStatusFromLocal(statusCode, fromOnit);
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

  setStatusCodeListFromLocal(statusCode: string) {
    let claimStatusTemp: ClaimStatusObject;
    claimStatusTemp = this.claimStatusObject.filter(x => x.code === statusCode)[0];

    const claimStatusTemp2 = {
      name: claimStatusTemp.name,
      code: claimStatusTemp.code
    };
    this.claimStatusToDisplay.push(claimStatusTemp2);
    this.claimStatusArray.push(claimStatusTemp);

    for (let i = 0; i < claimStatusTemp.nextStatus.length; i++) {
      this.claimStatusToDisplay.push(claimStatusTemp.nextStatus[i]);
      this.claimStatusArray.push(claimStatusTemp.nextStatus[i]);
    }
  }

  loader() {
    this.spinner.hide();
    this.isLoadingResults = false;
  }

  onClaimDecisionChange(event) {
    if (event.value === ClaimConstants.APPROVED) {
      this.claimDecisionDeclined = false;
    } else {
      this.claimDecisionDeclined = true;
    }
  }

  onClaimStatusChange(event) {
    this.setStatusFromLocal(event.value, true);
  }

  onClaimSubStatusChange(event) {
    this.claim.claimSubStatus = this.claimSubStatus.filter(x => x.code === event.value)[0].name;
  }

  getLogisticsDetailsControls() {
    return this.claimForm.controls.logisticsDetails['controls'];
  }

  copyPolicyAddress(copyTheAddress: boolean, fieldToCopyTo: string) {
    // Do nothing if copyTheAddress is not defined or null
    if (copyTheAddress === undefined || copyTheAddress === null || copyTheAddress == false) {
      return;
    }
    this.policyService.findPolicies({
      policyNumber: this.claim.policyNo,
      partnerId: this.claim.partnerId,
      returnFields: 'custAddress'
    }).subscribe((res) => {
      if (res) {
        const policy = res.obj.resultList[0];
        if (policy) {
          const custAddress = policy.custAddress;
          if (custAddress != null) {
            let controlsLogistic = this.getLogisticsDetailsControls();
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

  // e.g. clearCopyAddressCheckboxFor('collect') or clearCopyAddressCheckboxFor('delivery')
  clearCopyAddressCheckboxFor(addressSectionToClear) {
    const ldControls = this.getLogisticsDetailsControls();

    // The section's checkbox is prefixed by copyPolicyAddressTo
    const fieldsToClear = ['copyPolicyAddressTo' + capitalise(addressSectionToClear)];

    // Clear the field
    fieldsToClear.map(clearFieldForControl(ldControls, null));
  }


  // Clears all address fields for a given logistics address section

  onDiagnosticChange(option: string) {
    if (this.claim.diagnosticOutcome !== null && option !== this.claim.diagnosticOutcome) {
      this.claimForm['controls'].deviceAssessment['controls'].diagnosticOutcome.setValue(this.claim.diagnosticOutcome);
      return;
    }
    switch (option) {
      case 'ADA':
        this.repairFields = true;
        this.replaceFields = false;
        this.EWFields = false;
        break;
      case 'BER':
        this.repairFields = true;
        this.replaceFields = true;
        break;
      case 'EWA':
        this.repairFields = true;
        this.replaceFields = false;
        break;
      default:
        this.repairFields = false;
        this.replaceFields = false;
        break;
    }
  }

  /**
   * @method If Diagnostic type BER then set validation
   */
  onDiagnosticChangeSetValidators() {
    this.claimForm['controls'].deviceAssessment['controls'].replaceImei.setErrors({
      required: true
    });
    this.claimForm['controls'].deviceAssessment['controls'].replaceMake.setErrors({
      required: true
    });
    this.claimForm['controls'].deviceAssessment['controls'].replaceModel.setErrors({
      required: true
    });
  }

  /**
   * @method If claim status is pending delivery, courier name and tracking number is mandatory
   */
  setDeliveryValidators() {
    const logisticsDetails = this.claimForm['controls'].logisticsDetails['controls'];
    const claimStatusPanel = this.claimForm['controls'].claimStatusPanel['controls'];
    const deliveryCourier = logisticsDetails.deliveryCourier;
    const deliveryTracking = logisticsDetails.deliveryTracking;
    const requiresDelivery = logisticsDetails.requiresDelivery.value;
    if (claimStatusPanel.subStatusCode.value === ClaimConstants.ATTEMPT_DELIVERY_1) {
      // Set validators on requiresDelivery conditionally
      if (requiresDelivery) {
        deliveryCourier.setValidators([Validators.required]);
        deliveryTracking.setValidators([Validators.required]);
      }
    }
    deliveryCourier.updateValueAndValidity();
    deliveryTracking.updateValueAndValidity();
  }

  /**
   * @method If Diagnostic type not BER then remove validation
   */
  onDiagnosticChangeClearValidators() {
    this.claimForm['controls'].deviceAssessment['controls'].replaceImei.clearValidators();
    this.claimForm['controls'].deviceAssessment['controls'].replaceMake.clearValidators();
    this.claimForm['controls'].deviceAssessment['controls'].replaceModel.clearValidators();
  }

  copyPolicytoDeliveryAddress(val) {
    if (val) {
      this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress1.setValue(this.claimForm['controls'].logisticsDetails['controls'].collectAddress1.value);
      this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress2.setValue(this.claimForm['controls'].logisticsDetails['controls'].collectAddress2.value);
      this.claimForm['controls'].logisticsDetails['controls'].deliveryPostcode.setValue(this.claimForm['controls'].logisticsDetails['controls'].collectPostcode.value);
      this.claimForm['controls'].logisticsDetails['controls'].deliveryCity.setValue(this.claimForm['controls'].logisticsDetails['controls'].collectCity.value);
      this.claimForm['controls'].logisticsDetails['controls'].deliveryState.setValue(this.claimForm['controls'].logisticsDetails['controls'].collectState.value);
      this.claimForm['controls'].logisticsDetails['controls'].deliveryCountry.setValue(this.claimForm['controls'].logisticsDetails['controls'].collectCountry.value);
    } else {
      this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress1.setValue('');
      this.claimForm['controls'].logisticsDetails['controls'].deliveryAddress2.setValue('');
      this.claimForm['controls'].logisticsDetails['controls'].deliveryPostcode.setValue('');
      this.claimForm['controls'].logisticsDetails['controls'].deliveryCity.setValue('');
      this.claimForm['controls'].logisticsDetails['controls'].deliveryState.setValue('');
      this.claimForm['controls'].logisticsDetails['controls'].deliveryCountry.setValue('');
    }
  }

  countryLookup(countryCode: string) {

    let countryTemp: any;
    countryTemp = this.countries.filter(x => x.twoCharCode === countryCode)[0];
    if (countryTemp === null || countryTemp === undefined) {
      countryTemp = this.countries.filter(x => x.threeCharCode === countryCode)[0];
      if (countryTemp === null || countryTemp === undefined) {
        throw new Error('CountryCode Not Supported');
      }
    }
    this.disableCountryFields = true;
    return countryTemp.name;
  }

  populateLogisticCouriers(partnerId) {
    if (partnerId === PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_RETAIL ||
      partnerId === PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_CF) {
      this.logisticCouriers = LogisticCouriers['PH'];
    } else if (partnerId === PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL
      || partnerId === PolicyEnum.PARTNER_SAMSUNG_INDONESIA_CF) {
      this.logisticCouriers = LogisticCouriers['ID'];
    } else if (partnerId === PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL
      || partnerId === PolicyEnum.PARTNER_HOMECREDIT_VIETNAM
      || partnerId === PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL_GRAB
    ) {
      this.logisticCouriers = LogisticCouriers['VN'];
    }
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

            } else if (assignesList[i].partnerId === PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL
              || assignesList[i].partnerId === PolicyEnum.PARTNER_SAMSUNG_INDONESIA_CF) {
              assignesForIDO.push(assignesList[i]);

            } else if (assignesList[i].partnerId === PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL) {
              assignesForVN.push(assignesList[i]);
            }
          }
          this.assignesMap[0] = [PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_RETAIL, assignesForPH];
          this.assignesMap[1] = [PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL, assignesForIDO];
          this.assignesMap[2] = [PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL, assignesForVN];

          const claim = window.history.state[0];

          if (claim !== undefined && claim !== '') {
            if (PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_RETAIL === claim.partnerId
              || PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_CF === claim.partnerId) {
              this.assigneesList = this.assignesMap[0][1];

            } else if (PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL === claim.partnerId
              || PolicyEnum.PARTNER_SAMSUNG_INDONESIA_CF === claim.partnerId) {
              this.assigneesList = this.assignesMap[1][1];

            } else if (PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL) {
              this.assigneesList = this.assignesMap[2][1];
            }
          }
        }
      }
    );
  }

  getListOfCoutries() {
    this.service.getCountryList().subscribe(res => {
      this.countries = res;
    });
  }

  // Sets up the subscribe method handlers for form changes
  onChanges() {
    // Subscribe to changes
    this.claimForm.valueChanges.subscribe(val => {
      // Retrieve Logistics Details
      const claim = this.claim;
      const logisticsDetails = val['logisticsDetails'];
      if (logisticsDetails) {
        // Handle changes for requiresPickup, requiresDelivery
        claim.requiresPickup = logisticsDetails.requiresPickup;
        claim.requiresDelivery = logisticsDetails.requiresDelivery;
      }

      // Update the claim value
      this.claim = claim; // Update the claim
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

  convertUTCDate(date) {
    const d = new Date(date);
    const fmDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
    return fmDate.substr(0, 10);
  }

  autoCompleteSearch(event, country) {
    let searchCriteria = {
      searchKey: event.target.value,
      country: country
    };
    this.searchTextChanged.next(searchCriteria);
  }

  setAddress(placeId: string, country: string) {
    this.productService.getAddressDetails(placeId, country).subscribe((res) => {
      let controlsLogistic = this.getLogisticsDetailsControls();
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
      let controlsLogistic = this.getLogisticsDetailsControls();
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
      let controlsLogistic = this.getLogisticsDetailsControls();
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

  private setPanelValidationMessage() {
    this.claimStatusValidationFailed = false;
    this.generalValidationFailed = false;
    this.claimDetailsValidationFailed = false;
    this.deviceAssessmentValidationFailed = false;
    this.paymentDetailsValidationFailed = false;
    this.logisticsDetailsValidationFailed = false;
  }

  validateFile(event, type) {
    event.preventDefault();
    const validFile = event.target.files.length > 0;
    if (validFile) {
      const numberOfFiles = this[type + 'DocLinks'].length;
      if (numberOfFiles == 3) {
        event.target.value = '';
        let errorMsg = (type === 'transaction' ? ClaimConstants.TRANSACTION_SLIP_UPLOAD_LIMIT_EXCEEDED:ClaimConstants.FILE_UPLOAD_LIMIT_EXCEEDED);
        this.service.showInfo(errorMsg, 'IN UPLOADING DOCUMENT');
        return;
      }
      const file = event.target.files[0];
      if (!validFileExtension(file.name)) {
        event.target.value = '';
        let errorMsg = `Sorry! The File "${file.name}" could not be uploaded. ` + ClaimConstants.INVALID_FILE_EXTENSION;
        this.service.showInfo(errorMsg, 'IN UPLOADING DOCUMENT');
        return;
      }
      if (!validFileSize(file.size)) {
        event.target.value = '';
        let errorMsg = `Sorry! The File "${file.name}" ` + ClaimConstants.INVALID_FILE_SIZE;
        this.service.showInfo(errorMsg, 'IN UPLOADING DOCUMENT');
        return;
      }
      if (fileExist(file.name, this[type + 'DocLinks'])) {
        event.target.value = '';
        this.service.showInfo(ClaimConstants.DUPLICATE_FILE, 'IN UPLOADING DOCUMENT');
        return;
      }
    }
  }

  getFileName(filePath: string) {
    if (filePath == null || filePath.trim() == '') {
      return;
    } else {
      return filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length);
    }
  }

  private shouldUseFlowable() {
    return this.claim.partnerId === PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL_GRAB ||
      this.claim.partnerId === PolicyEnum.PARTNER_HOMECREDIT_VIETNAM;
  }

  selectMinDate(inputDate: string): Date {
    if (inputDate == null || inputDate.trim() == '') {
      return this.todayDate;
    } else {
      return new Date(inputDate);
    }
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
  var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
  var validFileExtensions = [
    'jpg', 'png', 'xls', 'csv', 'pdf', 'doc', 'docx', 'xlsx'
  ];
  return validFileExtensions.includes(extension.toLowerCase());
}

function validFileSize(bytes) {
  return (bytes <= 2147483648); // 2147483648 = 2 GB
}

function fileExist(fileName, files) {
  for (let count = 0; count < files.length; count++) {
    let existingFileName = extractFileNameFromFilePath(files[count]);
    if (fileName === existingFileName) {
      return true;
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
