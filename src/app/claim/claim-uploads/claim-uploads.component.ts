import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AppService} from 'src/app/app.service';

@Component({
  selector: 'app-claim-uploads',
  templateUrl: './claim-uploads.component.html',
  styleUrls: ['./claim-uploads.component.css']
})
export class ClaimUploadsComponent implements OnInit {

  profileForm: FormGroup;
  file: File;
  fileUpload = {status: '', message: '', id: ''};
  startTimeStamp: number;
  endTimeStamp: number;
  responseTime: number;
  error: String;

  constructor(private fb: FormBuilder, private service: AppService) {
  }

  ngOnInit() {
    this.profileForm = this.fb.group({
      fileUploaded: ['']
    });
  }

  onSelectedFile(event) {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('file', this.file);
    this.startTimeStamp = new Date().getTime();
    this.service.uploadClaims(formData).subscribe(
      res => this.fileUpload = res,
      err => this.error = err
    );
    this.endTimeStamp = new Date().getTime();
    this.responseTime = this.endTimeStamp - this.startTimeStamp;
  }

}
