import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm, AbstractControl, FormControl } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { PolicyService } from '../policy.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProductService } from 'src/app/product/product.service';
import { MatDialog } from '@angular/material';
import { PolicyDocument } from 'src/app/model/policy.document';
import { Subject, Observable, of } from 'rxjs';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { debounceTime, distinctUntilChanged, mergeMap } from 'rxjs/operators';
import { ClaimConstants } from 'src/app/claim/claim.constants';
import { ProductDetail } from 'src/app/model/product.detail';
import { PolicyConstants } from '../policy.constants';
import { LoginService } from 'src/app/login/login.service';
import { AppConstants } from 'src/app/app.constants';


@Component({
  selector: 'app-partner-onboarding',
  templateUrl: './partner-onboarding.component.html',
  styleUrls: ['./partner-onboarding.component.css']
})
export class PartnerOnboardingComponent implements OnInit {

  constructor(private service: AppService,
    private policyService: PolicyService,
    private spinner: NgxSpinnerService,
    private productService: ProductService,
    public dialog: MatDialog, private cdr: ChangeDetectorRef,
    private loginService: LoginService) { }

  partnerOnboardingForm: FormGroup;
  partnerPolicy: PolicyDocument = {
    custAddress: new Object()
  };
  searchTextChanged = new Subject<any>();
  searchList: Array<any>;
  subscription: any;
  currentActiveTab: number = 0;
  // latest snapshot
  public frontWebcamImage: WebcamImage = null;
  frontImageUrl: string = null;
  backImageUrl: string = null;
  countries: any[];
  panelErrorMessage: string;
  customerInfoValidationFailed: boolean;
  deviceInfoValidationFailed: boolean;
  staffInfoValidationFailed: boolean;
  productValidationFailed: boolean;
  frontImageValidationFailed: boolean;
  backImageValidationFailed: boolean;
  staffAcknowledgementValidationFailed: boolean = false;
  customerAcknowledgementValidationFailed: boolean = false;
  staffAcknowledgement: boolean = false;
  customerAcknowledgement: boolean = false;
  productDetailList: Array<ProductDetail>;
  pageHeadingArray: Array<string>;
  partnerStoresName: any[];
  imageCapturePanel: boolean = false;
  productDescriptionBullets: string[];
  partnerColorCode: any;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  defaultCountry : string;

  ngOnInit(): void {
    this.getListOfCoutries();

    this.partnerOnboardingForm = new FormGroup({
      customerDetailPanel: new FormGroup({
        customerName: new FormControl('', { validators: [this.isEmptyValueValidator.bind(this), this.isNumericValidator.bind(this)], updateOn: "blur" }),
        idType: new FormControl(''),
        customerId: new FormControl(''),
        customerEmail: new FormControl('', { validators: [this.emailValidator.bind(this)], updateOn: "blur" }),
        custMobileNumber: new FormControl('', { validators: [this.isEmptyValueValidator.bind(this), this.isNonNumericValidator.bind(this)], updateOn: "blur" }),
        custAddress: new FormControl(''),
        postalCode: new FormControl(''),
        customerCity: new FormControl(''),
        customerState: new FormControl(''),
        customerCountryCode: new FormControl('')
      }),
      deviceDetailPanel: new FormGroup({
        policyIMEINumber: new FormControl('', { validators: [this.imeiValidator.bind(this)], updateOn: "blur" }),
        deviceSerialNo: new FormControl(''),
        deviceMake: new FormControl(''),
        deviceModel: new FormControl(''),
        deviceCapacity: new FormControl('', { validators: [this.isEmptyValueValidator.bind(this), this.isNonNumericValidator.bind(this)], updateOn: "blur" }),
        deviceColor: new FormControl('', { validators: [this.isEmptyValueValidator.bind(this), this.isNonAlphabeticValidator.bind(this)], updateOn: "blur" }),
      }),
      productDetailPanel: new FormGroup({
        productName: new FormControl('', Validators.required),
        productsModel: new FormControl('', Validators.required),
      }),
      staffDetailPanel: new FormGroup({
        staffName: new FormControl('', Validators.required),
        storeName: new FormControl('', Validators.required),
      }),
      confirmationPanel: new FormGroup({
        customerAcknowledgement: new FormControl('', Validators.required),
        staffAcknowledgement: new FormControl('', Validators.required),
      }),
    })
    this.setPageDefaults();
    this.setAddressHandlers();
    this.getListOfCoutries();
    this.fetchClientDetails();
  }

  setPageDefaults() {
    this.pageHeadingArray = ["Sales Registration", "Select Product", "Capture Device Image", "Confirmation", "Successful"];
    //Setting StoresName
    this.service.findStores(PolicyConstants.PARTNER_PRODUCT_CODE_DIGI).subscribe((res) => {
      if (res && res.status == 'OK') {
        this.partnerStoresName = res.obj;
      }
    });
  }

  fetchClientDetails() {
    this.service.findClientPartnerDetails().subscribe(
      res => {
        let clientDetails = this.policyService.filterClientDetails(res);
        if (clientDetails != undefined) {
          let digiClient = clientDetails.filter((x) => x.clientCode === "DIMY")
          if (digiClient != undefined) {
            this.partnerColorCode = digiClient[0].colorCode;
          }
        }
      }
    );
  }

  setAddressHandlers() {
    this.subscription = this.searchTextChanged.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => this.productService.getAutcompleteAdress(search.searchKey, search.country)
      )
    ).subscribe((res: any) => {
      this.searchList = res
    });
    if (this.partnerPolicy.custAddress == null || this.partnerPolicy.custAddress == undefined) {
      this.partnerPolicy.custAddress = {}
    }
    this.partnerPolicy.custAddress.customerCountry = "Malaysia";
    this.defaultCountry = this.partnerPolicy.custAddress.customerCountry;
    this.partnerOnboardingForm.get('customerDetailPanel').get('customerCountryCode').setValue("MY");
  }

  getListOfCoutries() {
    this.service.getCountryList().subscribe(res => {
      this.countries = res;
    });
  }

  autoCompleteSearch(event) {
    let countryCode = this.partnerOnboardingForm.get('customerDetailPanel').get('customerCountryCode').value;
    if (countryCode == '') {
      this.service.showInfo("Please select the country before search", "");
      return;
    }
    let searchCriteria = {
      searchKey: event.target.value,
      country: countryCode
    }
    this.searchTextChanged.next(searchCriteria);
  }

  changeTab(showBack: boolean = false) {
    this.spinner.show();
    if (!showBack) {
      if (this.validateRules() && this.currentActiveTab <= 3) {
        this.currentActiveTab++;
        if (this.currentActiveTab == 1) {
          let partnerId = sessionStorage.getItem("partnerId");
          //this.refreshCountryOfAddress();
          this.setProductDetailsForDevice(partnerId);
        }
      }
    } else {
      if (this.currentActiveTab == 4 || this.currentActiveTab == 0) {
        this.loginService.showDigi.next(AppConstants.FALSE)
        this.currentActiveTab = 0;
      } else if (this.currentActiveTab >= 0) {
        this.currentActiveTab--;
      }
    }
    this.spinner.hide();
  }
  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public recaptureImage(isBackImage: boolean = false) {
    if (!isBackImage) {
      this.frontImageUrl = null;
    } else {
      this.backImageUrl = null;
    }
  }

  public handleInitError(error: WebcamInitError): void {
    // this.errors.push(error);
  }

  public handleImage(webcamImage: WebcamImage): void {
    if (this.imageCapturePanel && this.frontImageUrl == null) {
      this.frontImageUrl = webcamImage.imageAsDataUrl;
      this.partnerPolicy.deviceFrontImage = webcamImage.imageAsBase64;
    } else if (!this.imageCapturePanel && this.backImageUrl == null) {
      this.backImageUrl = webcamImage.imageAsDataUrl;
      this.partnerPolicy.deviceBackImage = webcamImage.imageAsBase64;
    }
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  setAddress(placeId: string, country: string) {
    this.partnerOnboardingForm.get('customerDetailPanel').get('custAddress').value;

    this.productService.getAddressDetails(placeId, country).subscribe((res) => {

      if (res.addressLine1 != null) {
        this.partnerOnboardingForm.get('customerDetailPanel').get('custAddress').setValue(res.name + " , " + res.addressLine1);
      } else {
        this.partnerOnboardingForm.get('customerDetailPanel').get('custAddress').setValue(res.name);
      }
      this.partnerOnboardingForm.get('customerDetailPanel').get('postalCode').setValue(res.postalCode);
      this.partnerOnboardingForm.get('customerDetailPanel').get('customerState').setValue(res.state);
      this.partnerOnboardingForm.get('customerDetailPanel').get('customerCity').setValue(res.city);
      this.partnerPolicy.custAddress.address1 = res.name;
      this.partnerPolicy.custAddress.postalCode = res.postalCode;
      this.partnerPolicy.custAddress.state = res.state;
      this.partnerPolicy.custAddress.postalCode = res.postalCode;
      this.partnerPolicy.custAddress.city = res.city;
      this.partnerPolicy.custAddress.countryCode = "MY";
    });
  }

  validateRules(): boolean {
    let resultFromRuleEngine: boolean = true;
    this.setPanelValidationMessage();
    switch (this.currentActiveTab) {
      case 0:
        if (!this.partnerOnboardingForm['controls'].customerDetailPanel.valid) {
          this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
          this.customerInfoValidationFailed = true;
          resultFromRuleEngine = false;
        }
        if (!this.validatePolicyIMEI() || !this.partnerOnboardingForm['controls'].deviceDetailPanel.valid) {
          this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
          this.deviceInfoValidationFailed = true;
          resultFromRuleEngine = false;
        }
        if (!this.partnerOnboardingForm['controls'].staffDetailPanel.valid) {
          this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
          this.staffInfoValidationFailed = true;
          resultFromRuleEngine = false;
        }
        break;
      case 2:
        if (this.frontImageUrl == null) {
          this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
          this.frontImageValidationFailed = true;
          resultFromRuleEngine = false;
        }
        if (this.backImageUrl == null) {
          this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
          this.backImageValidationFailed = true;
          resultFromRuleEngine = false;
        }
    }
    return resultFromRuleEngine;
  }

  private setPanelValidationMessage() {
    this.customerInfoValidationFailed = false;
    this.deviceInfoValidationFailed = false;
    this.staffInfoValidationFailed = false;
    this.productValidationFailed = false;
    this.frontImageValidationFailed = false;
    this.backImageValidationFailed = false;
  }

  imeiValidator(control: AbstractControl): { [key: string]: boolean } | null {
    let partnerId = sessionStorage.getItem("partnerId");
    if (control.value != undefined && control.value != '') {
      if (control.value.length < 15) {
        this.resetDevicePanelErrors();
        return { 'invalidLength': true }
      } else if (isNaN(control.value)) {
        return { 'invalidFormat': true }
      } else {
        this.resetDevicePanelErrors();
        this.policyService.validateIMEI(partnerId, control.value).subscribe((response) => {
          if (response) {
            if (response.status == "ERROR") {
              if (response.code == "200.009") {
                control.setErrors({ 'nonUniqueImei': true });
              } else if (response.code == "200.400") {
                control.setErrors({ 'luhnCheckNotFollowed': true });
              }
            } else if (response.status == "OK") {
              this.setDeviceDetailslUsingIMEI(control.value);
            }
          }
        });
      }
    }
    return null;
  }

  setDeviceDetailslUsingIMEI(imeiNumber: string) {
    this.policyService.findDeviceDetailsByImei(imeiNumber).subscribe((response) => {
      if (response && response.status == 'OK') {
        if ((response.obj != null || response.obj != undefined) && response.obj.tacMake != '' && response.obj.tacModel != '') {
          this.partnerOnboardingForm.get('deviceDetailPanel').get('deviceMake').setValue(response.obj.tacMake);
          this.partnerOnboardingForm.get('deviceDetailPanel').get('deviceModel').setValue(response.obj.tacModel);
          this.partnerPolicy.deviceMake = response.obj.tacMake;
          this.partnerPolicy.deviceModel = response.obj.tacModel;
          this.partnerPolicy.deviceRRP = response.obj.proposedRrp;
        } else {
          this.resetDeviceDetails();
        }
      }
    })
  }

  setProductDetailsForDevice(partnerId: string) {
    this.service.findProductByPartnerid(partnerId).subscribe((response) => {
      if (response && response != undefined) {
        let termsAndConditionsString = response[0].termsAndConditions;
        this.productDescriptionBullets = termsAndConditionsString.split("\n");
        this.productDetailList = response;
      }
    })
  }
  onboardPartnerPolicy() {
    if (this.validateConfirmation()) {
      this.spinner.show();
      this.currentActiveTab++;
      this.partnerPolicy.custMobileNumber = "60" + this.partnerPolicy.custMobileNumber;
      this.partnerPolicy.partnerId = sessionStorage.getItem("partnerId");
      this.partnerPolicy.salesRepId = sessionStorage.getItem("loggedInUser");
      this.policyService.createPolicy(this.partnerPolicy).subscribe((response) => {
        if (response && response != undefined) {
          if(Number(this.partnerPolicy.deviceRRP) != 0){
            this.saveImeiInDB(this.partnerPolicy.policyIMEINumber);
          }
          this.resetPageDefaults();
          this.spinner.hide();
        }
      })
    }
  }

  resetCountry(event) {
    let selectedCountryCode = event.value;
    let selectedCountry = this.countries.filter((x) => x.twoCharCode == selectedCountryCode);
    this.refreshCountryOfAddress(selectedCountry[0].name);
    this.defaultCountry = this.partnerPolicy.custAddress.customerCountry;
  }
  resetDevicePanelErrors() {
    this.partnerOnboardingForm['controls'].deviceDetailPanel['controls'].policyIMEINumber.setErrors(null);
    this.partnerOnboardingForm['controls'].deviceDetailPanel['controls'].deviceSerialNo.setErrors(null);
  }
  enableWebCam(isBackImageCapturePanel) {
    this.imageCapturePanel = isBackImageCapturePanel;
  }
  confirmContract(contract: any) {
    this.partnerPolicy.productName = contract.productName;
    this.partnerPolicy.partnerProductId = contract.partnerProductId;
    this.partnerPolicy.selectedProdcutTenure = "Monthly cover";
    this.partnerPolicy.selectedProductDescription = contract.description;
    this.partnerPolicy.selectedProductTermsAndConditions = contract.termsAndConditions;
    this.partnerPolicy.internalProductId = contract.amsInternalProductId;
    this.currentActiveTab++;
  }

  resetPageDefaults() {
    this.frontImageUrl = null;
    this.backImageUrl = null;
    this.partnerPolicy = PolicyDocument.newPolicyDocument();
    this.partnerPolicy.custAddress = new Object();
    this.partnerOnboardingForm.reset();
    this.setPageDefaults();
    this.setAddressHandlers();
    this.getListOfCoutries();
  }

  validatePolicyIMEI() {
    let resultFromValidateIMEIEngine = true
    let deviceControls = this.partnerOnboardingForm['controls'].deviceDetailPanel['controls'];
    let imeiNumber = deviceControls.policyIMEINumber.value;
    let deviceSerailnumber = deviceControls.deviceSerialNo.value;
    let makeNumber = deviceControls.deviceMake;
    let modelNumber = deviceControls.deviceModel;
    if ((imeiNumber == null || imeiNumber == '')) {
      this.partnerOnboardingForm['controls'].deviceDetailPanel['controls'].policyIMEINumber.setErrors({ 'bothIMEIandSerialNumberEmpty': true });
      resultFromValidateIMEIEngine = false;
    }
    if ((makeNumber.value == null || makeNumber.value == '')) {
      makeNumber.setErrors({ 'makeCheckFailed': true });
      resultFromValidateIMEIEngine = false;
    }
    if ((modelNumber.value == null || modelNumber.value == '')) {
      modelNumber.setErrors({ 'modelCheckFailed': true });
      resultFromValidateIMEIEngine = false;
    }
    return resultFromValidateIMEIEngine;
  }

  isEmptyValueValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if ((control.value == undefined || control.value == '')) {
      return { 'emptyCheckFailed': true };
    }
    return null;
  }
  isNonNumericValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value != '' && isNaN(control.value)) {
      return { 'nonNumberCheckFailed': true };
    }
    return null;
  }
  isNumericValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value != '' && !isNaN(control.value)) {
      return { 'numberCheckFailed': true };
    }
    return null;
  }

  isNonAlphabeticValidator(control: AbstractControl): { [key: string]: boolean } | null {
    let specialCharPattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (control.value != '' && (specialCharPattern.test(control.value) || !isNaN(control.value))) {
      return { 'nonAlphabeticCheckFailed': true };
    }
    return null;
  }


  resetDeviceDetails() {

    //Resetting values if already set
    let makeControl = this.partnerOnboardingForm.get('deviceDetailPanel').get('deviceMake');
    let modelControl = this.partnerOnboardingForm.get('deviceDetailPanel').get('deviceModel');

    //Resetting values
    if (makeControl.value != null || makeControl.value != undefined) {
      makeControl.setValue(null);
      this.partnerPolicy.deviceMake = null;
    }
    if (modelControl.value != null || makeControl.value != undefined) {
      modelControl.setValue(null);
      this.partnerPolicy.deviceModel = null;
    }
    this.partnerPolicy.deviceRRP = '0';

    //Adjusting form controls
    makeControl.markAsTouched();
    modelControl.markAsTouched();
    makeControl.markAsDirty();
    modelControl.markAsDirty();
    makeControl.setErrors({ 'makeCheckFailed': true });
    modelControl.setErrors({ 'modelCheckFailed': true });
  }
  confirmAcknowledgement(inputString) {
    switch (inputString) {
      case 'CUSTOMER':
        this.customerAcknowledgement = !this.customerAcknowledgement;
        break;
      case 'STAFF':
        this.staffAcknowledgement = !this.staffAcknowledgement;
        break;
    }
  }

  validateConfirmation() {
    let resultFromConfirmationValidationEngine = true;
    if (!this.customerAcknowledgement) {
      this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
      this.customerAcknowledgementValidationFailed = true;
      resultFromConfirmationValidationEngine = false;
    } else {
      this.customerAcknowledgementValidationFailed = false;
    }
    if (!this.staffAcknowledgement) {
      this.panelErrorMessage = ClaimConstants.MANDATORY_FILL;
      this.staffAcknowledgementValidationFailed = true;
      resultFromConfirmationValidationEngine = false;
    } else {
      this.staffAcknowledgementValidationFailed = false;
    }
    return resultFromConfirmationValidationEngine;
  }

  emailValidator(control: AbstractControl): { [key: string]: boolean } | null {
    let emailRegexPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (control.value != '' && !emailRegexPattern.test(control.value)) {
      return { 'emailValidationFailed': true };
    }
    return null;
  }
  refreshCountryOfAddress(country :any = this.defaultCountry){
    if (this.partnerPolicy.custAddress == null || this.partnerPolicy.custAddress == undefined) {
      this.partnerPolicy.custAddress = new Object();
    }
    this.partnerPolicy.custAddress.customerCountry = country;
  }

  saveImeiInDB(imeiNumber : string){
    this.policyService.saveImei(imeiNumber).subscribe((response) => {
      //Tasks can be done depending on the basis of response status received
    })
  }

}
