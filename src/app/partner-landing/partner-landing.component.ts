import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login/login.service';
import { AppConstants } from '../app.constants';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-partner-landing',
  templateUrl: './partner-landing.component.html',
  styleUrls: ['./partner-landing.component.css']
})
export class PartnerLandingComponent implements OnInit {

  constructor(private loginService: LoginService) { }

  ngOnInit() {
  }

  navigateToNewDevice() {
    window.open(environment.newDeviceDigi, "_blank");
  }

  navigateToTermination() {
    window.open(environment.terminationDigi, "_blank");
  }

  showDigiApp() {
    this.loginService.showDigi.next(AppConstants.TRUE);
  }

}
