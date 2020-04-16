import {ClaimNextStatusObject} from './ClaimNextStatusObject';
import {ClaimSubStatusObject} from './ClaimSubStatusObject';

export class ClaimStatusObject {
  name: string;
  code: string;
  nextStatus: ClaimNextStatusObject[];
  subStatus: ClaimSubStatusObject[];
}
