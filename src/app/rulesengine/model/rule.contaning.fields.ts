import {ClaimField} from './claim.field';
import {PolicyField} from './policy.fields';

export interface RuleContaningFields {
  claimField: ClaimField;
  policyField: PolicyField;
}
