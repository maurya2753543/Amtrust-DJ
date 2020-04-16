import { Component, OnInit } from '@angular/core';
import { PolicyDocument } from 'src/app/model/policy.document';
import { ActivatedRoute, Router } from '@angular/router';
import { PolicySearchCriteria } from 'src/app/model/policy.search';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from 'src/app/app.service';
import { PolicyEnum } from 'src/app/model/policy.enum';
import { ToastrService } from 'ngx-toastr';
import { AppConstants } from 'src/app/app.constants';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, mergeMap } from 'rxjs/operators';
import { ProductService } from 'src/app/product/product.service';

@Component({
  selector: 'app-policy-detail',
  templateUrl: './policy-detail.component.html',
  styleUrls: ['./policy-detail.component.css']
})
export class PolicyDetailComponent implements OnInit {
  countries: any[];
  searchTextChanged = new Subject<any>();
  searchList: Array<any>;
  subscription: any;
  policyModel: PolicyDocument = {
    custAddress: ''
  };
  search: PolicySearchCriteria;
  productsData: any;
  policyDetailsForm: FormGroup;
  panelOpenState = false;
  //isLoadingResults = true;
  plans: String[] = [];
  editPolicyBtn = false;
  error: string;


  constructor(private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private service: AppService,
    private toastr: ToastrService,
    private productService: ProductService) {
  }

  ngOnInit() {
    this.getListOfCoutries();
    this.policyModel = window.history.state[0];
    if (this.policyModel != null && (this.policyModel.custAddress === null || this.policyModel.custAddress === undefined)) {
      this.policyModel.custAddress = {};
    }
    this.search = window.history.state[1];
    if (this.search) {
      this.search.currentPage = window.history.state[2];
    }
    if (this.policyModel && this.policyModel.productsModel) {
      this.productsData = JSON.parse(this.policyModel.productsModel);
    }
    if (this.productsData) {
      this.productsData.plans.forEach(element => {
        if (element && element.price) {
          this.plans.push(element);
        } else {
          element.band.name = element.name;
          this.plans.push(element.band);
        }

      });
    }
    this.policyDetailsForm = this.formBuilder.group({
      customerEmail: [''],
      customerName: [''],
      customerLastName: [''],
      customerPhone: [''],
      custMobileNumber: [''],
      policyIMEINumber: [''],
      customerAddress1: [''],
      customerAddress2: [''],
      cutomerPostalCode: [''],
      customerState: [''],
      customerCity: [''],
      customerCountryCode: ['']
    });

    this.policyDetailsForm['controls'].customerCountryCode.setValue(JSON.parse(this.policyModel.productsModel).client.countryCode);
    this.subscription = this.searchTextChanged.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => this.productService.getAutcompleteAdress(search.searchKey, search.country)
      )
    ).subscribe((res: any) => {
      this.searchList = res;
    });
  }

  back() {
    this.router.navigate(['../', this.search], { relativeTo: this.route });
  }

  editPolicy() {
    this.editPolicyBtn = true;
  }

  cancelEdit() {
    this.editPolicyBtn = false;
  }

  updatePolicyDetails(form: NgForm) {
    this.spinner.show();
    let policyNumber = (this.policyModel.partnerId === PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_RETAIL
      || this.policyModel.partnerId === PolicyEnum.PARTNER_SAMSUNG_INDONESIA_RETAIL
      || this.policyModel.partnerId === PolicyEnum.PARTNER_SAMSUNG_INDONESIA_CF
      || this.policyModel.partnerId === PolicyEnum.PARTNER_SAMSUNG_PHILLIPINES_CF
      || this.policyModel.partnerId === PolicyEnum.PARTNER_SAMSUNG_VIETNAM_RETAIL) ?
      this.policyModel.partnerContractId : this.policyModel.policyNumber;

    this.policyModel.updatedBy = sessionStorage.getItem(AppConstants.LOGGED_IN_USER);
    this.policyModel.custAddress.address1 = this.policyDetailsForm['controls'].customerAddress1.value;
    this.policyModel.custAddress.address2 = this.policyDetailsForm['controls'].customerAddress2.value;
    this.policyModel.custAddress.postalCode = this.policyDetailsForm['controls'].cutomerPostalCode.value;
    this.policyModel.custAddress.state = this.policyDetailsForm['controls'].customerState.value;
    this.policyModel.custAddress.city = this.policyDetailsForm['controls'].customerCity.value;
    this.policyModel.custAddress.countryCode = this.policyDetailsForm['controls'].customerCountryCode.value;
    this.service.updatePolicy(this.policyModel, policyNumber).subscribe(
      res => {
        this.spinner.hide();
        if (JSON.stringify(res['message']).substr(0, 27) === 'Policy Successfully Updated') {
          this.service.showInfo('Policy updated, Policy ID: ', policyNumber);
        } else {
          this.service.showInfo(res.message, '');
          return;
        }
        //this.isLoadingResults = false;
      },
      err => {
        this.error = err;
        this.spinner.hide();
      }
    );
    this.editPolicyBtn = false;
  }

  autoCompleteSearch(event) {
    let countryCode = this.policyDetailsForm['controls'].customerCountryCode.value;
    if (countryCode === '') {
      this.service.showInfo('Please select the country before search', '');
      return;
    }
    let searchCriteria = {
      searchKey: event.target.value,
      country: countryCode
    };
    this.searchTextChanged.next(searchCriteria);
  }

  setAddress(placeId: string, country: string) {

    this.productService.getAddressDetails(placeId, country).subscribe((res) => {

      if (res.addressLine1 != null) {
        this.policyDetailsForm['controls'].customerAddress1.setValue(res.name + " , " + res.addressLine1);
      } else {
        this.policyDetailsForm['controls'].customerAddress1.setValue(res.name);
      }
      this.policyDetailsForm['controls'].customerAddress2.setValue(res.addressLine2);
      this.policyDetailsForm['controls'].cutomerPostalCode.setValue(res.postalCode);
      this.policyDetailsForm['controls'].customerState.setValue(res.state);
      this.policyDetailsForm['controls'].customerCity.setValue(res.city);
    });
  }

  getListOfCoutries() {
    this.service.getCountryList().subscribe(res => {
      this.countries = res;
    });
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
}

