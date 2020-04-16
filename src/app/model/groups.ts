import { Injectable } from '@angular/core';

const CLAIM_AGENT = '501';
const FINANCE = '502';
const CLAIM_MANAGER = '503';
const BUSINESS_USER = '504';
const ADMIN = '505';

@Injectable({
  providedIn: 'root'
})
export class Groups {
  policyGroups = [ADMIN, CLAIM_MANAGER, FINANCE];
  claimGroups = [ADMIN, BUSINESS_USER, CLAIM_AGENT, CLAIM_MANAGER];
  productGroups = [ADMIN, CLAIM_AGENT, CLAIM_MANAGER, FINANCE];
}
