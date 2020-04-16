import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/product/product.service';
import { ProductConstants } from 'src/app/product/product.constants';
import { ProductSearchCriteria } from 'src/app/model/product.search';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductParamsResponse } from 'src/app/model/reponse.productParams.object';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConstants } from 'src/app/app.constants';
import { AppService } from '../../app.service';
import { PolicyService } from 'src/app/policy/policy.service';
import { ClaimConstants } from 'src/app/claim/claim.constants';


@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent implements OnInit {
  productSearchCriteria: ProductSearchCriteria =
    {
      productId: '',
      productName: '',
      countryCode: '',
      insurerCode: '',
      clientCode: '',
      productStatus: '',
      coverageCodes: [],
      currentPage: null
    };

  books: any = []; //change to more relevant name
  showFilter: boolean = true;
  responseReceived: boolean = false;
  clientDetails: any;
  error: String;
  countryDetails: any;
  productStatuses = [{
    code: ProductConstants.STATUS_ACTIVE,
    desc: 'Active'
  }, {
    code: ProductConstants.STATUS_INACTIVE,
    desc: 'InActive'
  }];


  productStatusActive = ProductConstants.STATUS_ACTIVE;
  productStatusInactive = ProductConstants.STATUS_INACTIVE;
  coverageDetails: any;
  insurerDetails: any;
  params: ProductParamsResponse = {
    country: '',
    insurer: '',
    coverage: '',
    client: ''
  };
  countries: any[] = [];
  currentPage = 1;

  constructor(
    private router: Router,
    private apiService: ProductService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private appservice: AppService,
    private service: PolicyService
  ) {
  }

  // hide & show form wrapper div
  displayCriteria() {
    this.showFilter = !this.showFilter;
  }

  getProductList() {
    if (this.productSearchCriteria.clientCode === '' || this.productSearchCriteria.clientCode === undefined) {
      this.appservice.showInfo(ClaimConstants.CLIENT_NAME_IS_MANDATORY, ClaimConstants.MANDATORY_FILL);
    } else {
      this.spinner.show();
      this.apiService.getProductList(this.productSearchCriteria).subscribe(
        (data) => {

          this.books = data;
          if (data[0]) {
            this.responseReceived = true;
          }
          this.spinner.hide();
        }, err => {
          this.error = err;
          this.spinner.hide();
        },
        () => {
          this.onComplete();
        });
    }
  }

  onComplete() {
    if (this.books != undefined && this.books[0] === undefined) {
      this.appservice.showInfo('', AppConstants.NO_DATA_FOUND);
    }
  }

  loader() {
    this.spinner.hide();
  }

  showProductDetail(product) {
    this.router.routerState;
    this.router.navigate(['productsearch/details']);
  }

  ngOnInit() {
    this.getListOfCoutries();
    this.params.country = this.countries;
    this.appservice.findClientPartnerDetails().subscribe(
      res => {
        this.clientDetails = this.service.filterClientDetails(res);
      }
    );
    this.route.paramMap.subscribe(params => {
      if (params.get('productStatus') != null) {
        this.showFilter = true;
        this.currentPage = Number(params.get(AppConstants.CURRENT_PAGE));

        this.productSearchCriteria.productName = params.get('productName');
        this.productSearchCriteria.productId = params.get('productId');
        this.productSearchCriteria.insurerCode = params.get('insurerCode');
        this.productSearchCriteria.clientCode = params.get('clientCode');
        this.productSearchCriteria.productStatus = params.get('productStatus');
        this.productSearchCriteria.countryCode = params.get('countryCode');
        this.getProductList();
      }
    });

  }

  getListOfCoutries() {
    this.appservice.getCountryList().subscribe(res => {
      this.countries = res;
    });
  }
}

