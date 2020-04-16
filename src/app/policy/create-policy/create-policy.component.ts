import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material';
import {PolicyDocument} from 'src/app/model/policy.document';
import {PolicyService} from '../policy.service';
import {APP_DATE_FORMATS, AppDateAdapter} from 'src/app/utility/date.adapter';
import {ResponsePolicyObject} from 'src/app/model/response.policy.object';

@Component({
  selector: 'app-create-policy',
  templateUrl: './create-policy.component.html',
  styleUrls: ['./create-policy.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
  ]
})
export class CreatePolicyComponent implements OnInit {
  policyModel: PolicyDocument;
  response: ResponsePolicyObject;
  error: String;
  policyForm: FormGroup;

  constructor(private fb: FormBuilder, private service: PolicyService) {
  }

  ngOnInit() {
    this.policyForm = new FormGroup({
      policyIMEINumber: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9]*')]),
      policyStatus: new FormControl(''),
      policyCoverageType: new FormControl(''),
      policyStartDate: new FormControl('', Validators.required),
      policyEndDate: new FormControl('', Validators.required),
      channelId: new FormControl('', Validators.required),
      assignedTo: new FormControl('', Validators.required),
      createdTime: new FormControl(''),
      customerName: new FormControl('', Validators.required),
      policySoldDate: new FormControl('', Validators.required),
      invoiceNumber: new FormControl(''),
      productName: new FormControl(''),
      policyTenure: new FormControl(''),
      custIdNumber: new FormControl(''),
      custMobileNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
      customerEmail: new FormControl('', Validators.email),
      customerAddress: new FormControl(''),
      custPostalCode: new FormControl(''),
      customerCity: new FormControl(''),
      customerState: new FormControl(''),
      deviceType: new FormControl(''),
      deviceSumInsured: new FormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
      deviceSerialNo: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9]*')]),
      deviceMake: new FormControl(''),
      deviceModel: new FormControl(''),
      salesRepId: new FormControl(''),
      salesRepName: new FormControl(''),
      storeId: new FormControl(''),
      storeName: new FormControl(''),
      storeCity: new FormControl(''),
      storeState: new FormControl(''),
      storePromotion: new FormControl(''),
      retailer: new FormControl(''),
      deviceColor: new FormControl(''),
      deviceStorage: new FormControl('')
    });
  }

  /**
   * Validation error message of FormControls
   */
  getErrorMessage(control: String) {
    if (control === 'custMobileNumber') {
      return this.policyForm.get('custMobileNumber').hasError('required') ? 'Mobile number can not be empty' :
        this.policyForm.get('custMobileNumber').hasError('pattern') ? 'Mobile number can only be numeric' : '';
    } else if (control === 'policyIMEINumber') {
      return this.policyForm.get('policyIMEINumber').hasError('required') ? 'IMEI number can not be empty' :
        this.policyForm.get('policyIMEINumber').hasError('pattern') ? 'IMEI number can not contain special characters' : '';
    } else if (control === 'deviceSerialNo') {
      return this.policyForm.get('deviceSerialNo').hasError('required') ? 'Device serial number can not be empty' :
        this.policyForm.get('deviceSerialNo').hasError('pattern') ? 'Device serial number can not contain special characters' : '';
    } else if (control === 'deviceSumInsured') {
      return this.policyForm.get('deviceSumInsured').hasError('required') ? 'Sum insured can not be empty' :
        this.policyForm.get('deviceSumInsured').hasError('pattern') ? 'Sum insured can only be numeric' : '';

    }
    return null;
  }

  onSubmit() {
    if (!this.policyForm.valid) {
      return;
    } else {
      this.policyModel.policyStartDate = this.policyForm.get('policyStartDate').value;
      this.policyModel.policyEndDate = this.policyForm.get('policyEndDate').value;
      this.service.createPolicy(this.policyModel).subscribe(
        res => {
          this.response = res;
          this.policyForm.reset();
        },
        err => this.error = err
      );
    }
  }
}
