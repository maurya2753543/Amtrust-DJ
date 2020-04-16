import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import {RoleMap} from '../model/roles.map';
import {AppConstants} from '../app.constants';
import {Groups} from '../model/groups';
import {RoleEnum} from '../model/roles.enum';

@Directive({
  selector: '[hideIfUnauthorized]'
})
export class HideUnauthorizedDirective implements OnInit {
  @Input() permission: String; // Required permission passed in
  @Input() module: String;

  constructor(private el: ElementRef, private access: RoleMap, private groups: Groups) {
  }

  ngOnInit() {
    const roles: string[] = sessionStorage.getItem(AppConstants.ROLE).split(',');
    if (this.module === AppConstants.POLICY_MODULE
      && this.groups.policyGroups.includes(sessionStorage.getItem(AppConstants.GROUP))) {
      if (Number(roles[0]) >= RoleEnum.Upload) {
        if (this.access.roleMap.get(this.permission) === RoleEnum.Upload) {
          return;
        } else if (!(this.access.roleMap.get(this.permission) <= (Number(roles[0]) - RoleEnum.Upload))) {
          this.el.nativeElement.style.display = AppConstants.NONE;
        }
      } else if (!(this.access.roleMap.get(this.permission) <= Number(roles[0]))) {
        this.el.nativeElement.style.display = AppConstants.NONE;
      }
    } else if (this.module === AppConstants.CLAIM_MODULE) {
      if (this.groups.claimGroups.includes(sessionStorage.getItem(AppConstants.GROUP))) {
        if (!(this.access.roleMap.get(this.permission) <= Number(roles[1]))) {
          this.el.nativeElement.style.display = AppConstants.NONE;
        }
      }
    } else if (this.module === AppConstants.PRODUCT_MODULE) {
      if (this.groups.productGroups.includes(sessionStorage.getItem(AppConstants.GROUP))) {
        if (!(this.access.roleMap.get(this.permission) <= (Number(roles[2])))) {
          this.el.nativeElement.style.display = AppConstants.NONE;
        }
      }
    }
  }
}
