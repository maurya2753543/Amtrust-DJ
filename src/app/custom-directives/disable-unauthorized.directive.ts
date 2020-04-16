import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import {AppConstants} from '../app.constants';
import {RoleMap} from '../model/roles.map';

@Directive({
  selector: '[disableIfUnauthorized]'
})
export class DisableUnauthorizedDirective implements OnInit {
  @Input() permission: String; // Required permission passed in
  constructor(private el: ElementRef, private access: RoleMap) {
  }

  ngOnInit() {
    if (!(this.access.roleMap.get(this.permission) <= this.access.roleMap.get(sessionStorage.getItem(AppConstants.ROLE)))) {
      return true;
    }
  }
}
