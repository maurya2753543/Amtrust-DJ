export class ClaimDocument {
  /* policy */
  excessFee: string = '';
  rrp: string = '';
  balanceRRP: string = '';
  claimNo: String = '';
  policyNo: string = '';
  productName: string = '';
  productDesc: string = '';
  coverage: string = '';
  productCode: string = '';
  policyStartDate: string = '';
  policyEndDate: string = '';
  policyStatus: string = '';
  policyType: string = '';
  ecertUrl: string = '';

  /* device detail */
  imei: string = '';
  deviceSerialNo: string = '';
  make: string = '';
  model: string = '';
  colour: string = '';
  memoryStorage: number = 0;
  purchaseDate: string = '';
  deviceCost: number = 0;
  /* customer detail */
  customerName: string = '';
  customerContact: string = '';
  customerIdentityNo: string = '';
  customerAlternateContact: string = '';
  customerEmail: string = '';
  relationship: string = '';
  claimantName: string = '';
  claimantContact: string = '';
  claimantAlternateContact: string = '';
  claimantEmail: string = '';
  channel: string = '';
  /* Claim detail */
  claimType: string = '';
  damageType: string = '';
  claimFiveYear: boolean;
  extraProtection: boolean;
  issueDesc: string = '';
  requiredLogistic: string = '';
  dateOfIncident: string = '';
  timeOfIncident: string = '';
  withinCountry: boolean = true;
  country: string = '';
  travelDateFrom: string = '';
  travelDateTo: string = '';
  /* Claim workflow information */
  assignee: string = '';
  status: string = '';
  claimSubStatus: string = '';
  statusCode: string = '';
  subStatusCode: string = '';
  insertDate: string = '';
  insertBy: string = '';
  updateDate: string = '';
  updateBy: string = '';
  /* pickup address */
  requiresPickup: boolean = true;
  requiresDelivery: boolean = true;
  collectAddress1: string = '';
  collectAddress2: string = '';
  collectCity: string = '';
  collectPostcode: string = '';
  collectState: string = '';
  collectCountry: string = '';
  collectStatus: string = '';
  collectTracking: string = '';
  collectDate: string = '';
  collectTime: string = '';
  collectCourier: string = '';
  // Collect - Actual
  actualCollectDate: string = '';
  actualCollectTime: string = '';
  // Collect - Arrival
  arrivalCollectDate: string = '';
  arrivalCollectTime: string = '';

  // Dropoff
  scheduledDropOffDate: string = '';
  scheduledDropOffTime: string = '';
  // Dropoff - Actual
  actualDropOffDate: string = '';
  actualDropOffTime: string = '';

  /* dispatch address */
  dispatchCenterName: string = '';
  dispatchAddress1: string = '';
  dispatchAddress2: string = '';
  dispatchCity: string = '';
  dispatchPostcode: string = '';
  dispatchState: string = '';
  dispatchCountry: string = '';

  /* Delivery address */
  deliveryAddress1: string = '';
  deliveryAddress2: string = '';
  deliveryCity: string = '';
  deliveryPostcode: string = '';
  deliveryState: string = '';
  deliveryCountry: string = '';
  deliveryStatus: string = '';
  deliveryTracking: string = '';
  deliveryDate: string = '';
  deliveryTime: string = '';
  deliveryCourier: string = '';
  // Delivery - Actual
  actualDeliveryDate: string = '';
  actualDeliveryTime: string = '';
  // Delivery - Customr
  customerDeliveryDate: string = '';
  customerDeliveryTime: string = '';

  // Pickup
  scheduledPickUpDate: string = '';
  scheduledPickUpTime: string = '';
  // Pickup - Actual
  actualPickUpDate: string = '';
  actualPickUpTime: string = '';

  copyPolicyAddressToCollect: boolean;
  copyPolicyAddressToDelivery: boolean;
  /* payment detail */
  requiredPayment: boolean;
  transactionDocumentPath: string = '';
  receivedAmount: number = 0;
  paymentMethod: string = '';
  paymentReferenceNo: string = '';

  /* Device assessment */
  assessBy: string = '';
  assessOn: string = '';
  assessReferenceNo: string = '';
  diagnosticOutcome: string = '';
  // if diagnosticOutcome is true, below columns are required
  reasonForReplace: string = '';
  replaceImei: string = '';
  replaceMake: string = '';
  replaceModel: string = '';
  replaceColor: string = '';
  replaceStorage: string = '';

  replacementCost: number = 0;
  diagnosticCost: number = 0;
  replacementTax: number = 0;
  totalReplacementCost: number = 0;

  // if diagnosticOutcome is false, below columns are required
  quotationPartCosts: number = 0;
  quotationLabourCosts: number = 0;
  quotationRepairedTax: number = 0;
  quotationRepairedTotalCost: number = 0;
  finalPartCosts: number = 0;
  finalLabourCosts: number = 0;
  finalRepairedTax: number = 0;
  finalRepairedTotalCost: number = 0;
  claimDecision: boolean = false;
  declineReason: string = '';

  /* documents path */
  proofDocumentPath: string = '';
  supportDocumentPath: string = '';
  otherDocumentPath: string = '';
  partnerId: string = '';
  repairId: string = '';
  repairStatus: string = '';
  ascCode: string = '';
  partnerContractId: string = '';
  fromUI: boolean = true;

  // Flowable
  flowableProcessInstanceID: string;

  claimLogId: string;
  statusChange: boolean;
  subStatusChange: boolean;
  integrationStatus: String;
  notificationRead: string[];

  static newClaimDocument(): ClaimDocument {
    const cd: ClaimDocument = new ClaimDocument();
    return cd;
  }
}

export enum ClaimType { 'ADLD', 'Extended Warranty' }

export enum ClaimStatus {
  st1 = 'Reported',
  st2 = 'Verified : pending excess fees',
  st3 = 'Pending approval from U/W',
  st4 = 'Pending technical report',
  st5 = 'Pending Excess fee payment',
  st6 = 'Pending document',
  st7 = 'Pending top up',
  st8 = 'Customer undecided – claim cancelled',
  st9 = 'Customer undecided',
  st10 = 'No response – claim cancelled',
  st11 = 'Outside policy guideline',
  st12 = 'No drop off – claim decline',
  st13 = 'Callback',
  st14 = 'No respond – claim cancelled',
  st15 = 'Approved – pending parts / replacement phone',
  st16 = 'Approved – repair',
  st17 = 'Pick up arrangement and timeline confirmation (arrangement)',
  st18 = 'Pick up in transit',
  st19 = 'Unit under technical evaluation',
  st20 = 'Repair ongoing',
  st21 = 'Approved – pending replacement phone',
  st22 = 'Replacement – pending customer decision',
  st23 = 'Unit repaired : for delivery',
  st24 = 'Unit repaired – for customer pickup',
  st25 = 'Phone collected- close',
  st26 = 'Unit replaced – claim completed',
  st27 = 'Unit repaired – claim completed',
  st28 = 'Unit repaired- delivered to customer'
}


export interface Statues {
  id: string;
  value: string;
}

export interface Assignees {
  id: string;
  value: string;
}

export interface LogisticStatus {
  id: string;
  value: string;
}

export interface LogisticCourier {
  id: string;
  value: string;
}
