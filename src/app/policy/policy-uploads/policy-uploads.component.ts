import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PolicyService } from '../policy.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConstants } from 'src/app/app.constants';
import { PolicySearchCriteria } from 'src/app/model/policy.search';
import { AppService } from '../../app.service';
import { PolicyConstants } from '../policy.constants';

@Component({
    selector: 'app-policy-uploads',
    templateUrl: './policy-uploads.component.html',
    styleUrls: ['./policy-uploads.component.css']
})
export class PolicyUploadsComponent implements OnInit {
    selectedPartnerId: string;
    errMsg: string;
    policySearch: PolicySearchCriteria = PolicySearchCriteria.newPolicySearchCriteria();

    profileForm: FormGroup;
    file: File;
    fileUpload = { status: '', message: '', transactionId: '' };
    error: String;
    responseReceived: boolean = false;
    toggleBatchSummary: boolean = false;
    clientNames: any;
    isCancelupload: boolean = false;
    showCancellationOption: boolean = false;

    constructor(
        private fb: FormBuilder,
        private service: PolicyService,
        private appservice: AppService,
        private spinner: NgxSpinnerService
    ) {
    }

    ngOnInit() {
        this.profileForm = this.fb.group({
            fileUploaded: [''],
            uploadAction: ''
        });

        this.getClientName();
    }

    getClientName() {
        this.appservice.findClientPartnerDetails().subscribe(
            res => {
                this.clientNames = this.service.filterClientDetails(res);
                if (this.clientNames != null && this.clientNames != undefined) {
                    this.showCancellationOption = this.service.decideIsCancellationActive(this.clientNames);
                }
            }
        );
    }

    onSelectedFile(event) {
        if (event.target.files.length > 0) {
            if (event.target.files[0].type === 'text/csv' || event.target.files[0].type === 'application/vnd.ms-excel') {
                this.file = event.target.files[0];
            } else {
                this.appservice.showInfo("Only CSV format is supported", "NOT SUPPORTED")
                this.profileForm['controls'].fileUploaded.setValue('');
                this.file = undefined;
            }
        }
    }

    validate() {
        if (this.file && this.selectedPartnerId) {
            return true;
        } else {
            this.appservice.showInfo('Please select the client name and file!', '');
            return false;
        }
    }

    onSubmit() {
        if (this.validate()) {
            this.spinner.show();
            const formData = new FormData();
            formData.append('file', this.file);
            formData.append('partnerId', this.selectedPartnerId);
            formData.append('user', sessionStorage.getItem(AppConstants.LOGGED_IN_USER))
            let isCancelUpload = this.profileForm.get("uploadAction").value == PolicyConstants.UPLOAD_ACTION_CANCEL ? "true" : "false";
            formData.append('isCancelUpload', isCancelUpload);
            this.service.uploadPolicies(formData).subscribe(
                res => {
                    this.fileUpload = res;
                    this.responseReceived = true;
                    if (this.fileUpload && this.fileUpload.status && this.fileUpload.status === AppConstants.STATUS_COMPLETE) {
                        this.spinner.hide();
                    }
                },
                err => {
                    this.error = err;
                    this.spinner.hide();
                }
            );
        }
    }

    displaySummary() {
        this.toggleBatchSummary = true;
    }

    selectClientName(event) {
        this.selectedPartnerId = event.target.value;
    }
}
