import {ClaimField} from './claim.field';
import {PolicyField} from './policy.fields';

export class RuleResult {
  valid: boolean;
  claimField: ClaimField;
  policyField: PolicyField;
}
