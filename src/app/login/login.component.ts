import { version } from '../../../package.json';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginCredentials } from '../model/login.credentials';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FlowableConstants } from '../flowable.constants';
import { WebSocketAPI } from '../websockets/webSocketAPI.js';
import { WebSocketTopics } from '../websockets/websocket.topics.constants.js';
import { AppRoutingConstants } from '../app-routing.constants';
import { AppConstants } from '../app.constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  appVersion: string;
  loginForm: FormGroup;
  hide: boolean = true;
  auth: LoginCredentials = {
    userName: '',
    password: ''
  };
  responseMessage: {};
  responseAvailable: boolean = false;
  responseFailed: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private loginService: LoginService,
    private spinner: NgxSpinnerService,
    private webSocketAPI: WebSocketAPI
  ) {
    this.appVersion = version;
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.responseMessage = {
      status: '',
      message: ''
    };
  }


  ngOnInit() {
  }

  login(): void {
    this.spinner.show();
    this.webSocketAPI.connect(WebSocketTopics.topicOfClaimLogs, this.auth.userName);
    setTimeout(() => {
    }, 10000);
    this.loginService.getUser(this.auth).subscribe(
      res => {
        this.spinner.hide();
        this.responseAvailable = true;
        if (res.jwtToken && res.jwtToken.accessToken) {
          this.loginForm.reset();
        }
        this.responseMessage = {
          status: res.status,
          message: res.message
        };
        // Store the auth as a b64 token
        localStorage.setItem(FlowableConstants.FLOWABLE_BASIC_AUTH_KEY, btoa([this.auth.userName, this.auth.password].join(':')));
        this.loginService.showPartnersTab.subscribe(res5 => {
          if (!(res5 === AppConstants.TRUE ? true : false)) {
            this.filterRouting();
          }
        });
      },
      err => {
        this.spinner.hide();
        this.responseAvailable = false;
        this.responseFailed = true;
        this.responseMessage = {
          message: err.message
        };
      }
    );
  }

  private filterRouting() {
    if (!window.location.href.includes(AppRoutingConstants.POLICY_SEARCH)) {
      this.router.navigate(['home']);
    }
  }
}
