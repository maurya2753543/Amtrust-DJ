import { Component, OnInit } from '@angular/core';
import { version } from '../../../package.json';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  appVersion: string;
  constructor() {
    this.appVersion = version;
  }

  ngOnInit() {

  }

}
