import { LogisticCourier, LogisticStatus } from '../model/ClaimDocument';

export class ClaimConstants {
  public static POLICY_NUMBER = 'policyNo';
  public static CLAIM_NUMBER = 'claimNo';
  public static IMEI = 'imei';
  public static STATUS = 'status';
  public static SUB_STATUS = 'claimSubStatus';
  public static STATUS_CODE = 'statusCode';
  public static SUB_STATUS_CODE = 'subStatusCode';
  public static CLIENT = 'client';
  public static CUSTOMER_NAME = 'customerName';
  public static CUSTOMER_CONTACT = 'customerContact';
  public static CUSTOMER_ID = 'customerId';
  public static CUSTOMER_EMAIL = 'customerEmail';
  public static COUNTRY = 'country';
  public static PARTNER_ID = 'partnerId';
  public static DATE_CREATED = 'dateCreated';
  public static EXIST = 'Exist';
  public static COMPLETED = 'CS_007';
  public static CLOSED = 'CSS_039';
  public static UPDATED_CLAIM = 'Updated Claim';
  public static APPROVED = 'Approved';
  public static NEW_CLAIM_REQUEST = 'CS_001';
  public static POLICY_INACTIVE = 'Inactive';
  static ERROR_MSG = 'Something went wrong, Please try again. We are looking into it';
  static MANDATORY_FILL = 'Please fill all the mandatory fields';
  static EXCESS_FEE_VALIDATION_MSG = 'Please fill the excess fee field';
  public static APPROVED_BY_CS = 'CSS_001';
  static _VALIDATION_MSG_FINAL_TOTAL_COST = 'Total Cost is a mandatory field. Please fill';
  public static LIST_OF_ASSIFNEES = 'listOfAssignees';
  public static SEARCHED_ASSINEES = 'assigneesSearched';
  public static PENDING_EXCESS_FEES_AND_DEDUCTIBLES = 'CSS_003';
  public static PENDING_DELIVERY = 'CS_006';
  public static ATTEMPT_DELIVERY_1 = 'CSS_029';
  public static CLIENT_NAME_IS_MANDATORY = 'Client Name Is Mandatory Field';
  public static EDIT_LOCK_ACQUIRED = 'Somebody has started editing the claim detail';
  public static EDIT_LOCK_RELEASED = 'You can continue editing the claim detail';
  public static EDIT_LOCK_MESSAGE = 'Editing of claim';
  public static FILE_UPLOAD_HEADING = 'File Upload';
  public static FILE_UPLOAD_LIMIT_EXCEEDED = 'Can not upload more than 3 documents.';
  public static INVALID_FILE_EXTENSION = 'Only files with the following extension are supported: (.jpg,.png,.xls,.csv,.pdf, .doc,.docx,.xlsx).';
  public static INVALID_FILE_SIZE = 'size is too large, The maximum file size allowed is 2GB.';
  public static DUPLICATE_FILE = 'A file with same name already exist and uploading this file will override the already existing file.';
  public static TRANSACTION_SLIP_UPLOAD_LIMIT_EXCEEDED = 'Can not upload more than 3 Transaction slips.';
}

export const LogisticStatuses: LogisticStatus[] = [
  { id: 'Unknown', value: 'Unknown' },
  { id: 'Booked', value: 'Booked' },
  { id: 'InTransit', value: 'InTransit' },
  { id: 'OutForDelivery', value: 'OutForDelivery' },
  { id: 'Delivered', value: 'Delivered' },
  { id: 'Undelivered', value: 'Undelivered' },
  { id: 'RTO', value: 'RTO' },
  { id: 'HeldUp', value: 'HeldUp' },
  { id: 'MisRoute', value: 'MisRoute' },
  { id: 'Partial Delivered', value: 'Partial Delivered' },
  { id: 'Closed', value: 'Closed' },
  { id: 'PickedUp', value: 'PickedUp' },
  { id: 'Arrived', value: 'Arrived' },
  { id: 'Cancelled', value: 'Cancelled' },
  { id: 'OutForPickUP', value: 'OutForPickUP' },
  { id: 'PickUpFailure', value: 'PickUpFailure' },
  { id: 'RTOPickedUP', value: 'RTOPickedUP' },
  { id: 'RTOInTransit', value: 'RTOInTransit' },
  { id: 'RTOHandover', value: 'RTOHandover' },
  { id: 'RTODelivered', value: 'RTODelivered' },
  { id: 'RTOUnDelivered', value: 'RTOUnDelivered' }
];

const LogisticCouriersPH: LogisticCourier[] = [
  { id: 'Mr. Speedy', value: 'Mr. Speedy' },
  { id: 'Lalamove', value: 'Lalamove' },
  { id: 'Fastrust', value: 'Fastrust' },
  { id: 'Fonerange', value: 'Fonerange' },
  { id: 'Jayzertech', value: 'Jayzertech' },
  { id: '2Go', value: '2Go' },
  { id: 'LBC', value: 'LBC' },
  { id: 'W Express', value: 'W Express' },
  { id: 'Zoom', value: 'Zoom' },
  { id: 'Totgo', value: 'Totgo' },
  { id: 'RCGL', value: 'RCGL' },
  { id: 'CK Davao', value: 'CK Davao' },
  { id: 'RME', value: 'RME' },
  { id: 'Abest', value: 'Abest' }
];

const LogisticCouriersID = [
  { id: 'RPX', value: 'RPX' },
  { id: 'TIKI', value: 'TIKI' },
  { id: 'DHL', value: 'DHL' },
  { id: 'JNE', value: 'JNE' },
  { id: 'JNT', value: 'JNT' },
  { id: 'Pos Indonesia', value: 'Pos Indonesia' },
  { id: 'Paxel', value: 'Paxel' },
  { id: 'Lalamove', value: 'Lalamove' },
  { id: 'Grab Express', value: 'Grab Express' },
  { id: 'Sigin Express', value: 'Sigin Express' },
  { id: 'Internal Courier', value: 'Internal Courier' },
];

const LogisticCouriersVN = [
  { id: 'Grab Express (Metro)', value: 'Grab Express (Metro)' },
  { id: 'Lalamove (Metro)', value: 'Lalamove (Metro)' },
  { id: 'GHTK', value: 'GHTK' },
  { id: 'GHN', value: 'GHN' },
  { id: 'Kerry Express', value: 'Kerry Express' },
  { id: 'Ninjavan', value: 'Ninjavan' },
  { id: 'Viettel Post', value: 'Viettel Post' },

];

export const LogisticCouriers = {
  'PH': sortCouriersByName(LogisticCouriersPH),
  'ID': sortCouriersByName(LogisticCouriersID),
  'VN': sortCouriersByName(LogisticCouriersVN)
};

function sortCouriersByName(couriers){
  if(couriers == null || couriers == undefined){
    return;
  }
  couriers.sort((first,second) : number =>{
    if(first.id < second.id) return -1;
    else if(first.id > second.id) return 1;
    else return 0;
  });
  return couriers;
}
