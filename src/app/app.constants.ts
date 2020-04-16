import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConstants {
  public static ENABLE_POLICY_TAB: string = 'showPolicyTab';
  public static ENABLE_LOGIN: string = 'showTabs';
  public static ENABLE_CLAIM_TAB: string = 'showClaimTab';
  public static ENABLE_PRODUCTS_TAB: string = 'showProductsTab';
  public static ROLE: string = 'role';
  public static TRUE: string = 'true';
  public static FALSE: string = 'false';
  public static LOGGED_IN_USER: string = 'loggedInUser';
  public static TITLE: string = 'CRMZ';
  public static GROUP = 'gidNumber';
  public static COUNTRY_CODE = 'postalAddress';
  public static ALL_COUNTRIES_ACCESS = 'regional';
  public static POLICY_MODULE = 'policy';
  public static CLAIM_MODULE = 'claim';
  public static PRODUCT_MODULE = 'product';
  public static PARTNER_ID = 'partnerId';
  public static NONE = 'none';
  public static POLICY_LISTING_MANDATORY_CONDITION = 'Policy IMEI or Policy Number or Policy Status or Customer Identification No must be provided';
  public static RESPONSE_FAILED = 'Failed';
  public static RESPONSE_ERROR = 'ERROR';
  public static POLICY_NUMBER = 'policyNumber';
  public static CUSTOMER_NAME = 'customerName';
  public static POLICY_IMEI_NUMBER = 'policyIMEINumber';
  public static POLICY_STATUS = 'policyStatus';
  public static CUSTOMER_MOBILE_NUMBER = 'custMobileNumber';
  public static CUSTOMER_ID = 'customerId';
  public static POLICY_COVERAGE = 'coverage';
  public static CUSTOMER_EMAIL = 'customerEmail';
  public static CLIENT_TRANSACTION_NUMBER = 'clientTransactionNumber';
  public static STATUS_COMPLETE = 'complete';
  public static CURRENT_PAGE = 'currentPage';
  public static CLIENT_NAME = 'Please select the Client name';
  public static HEADERS = ['Client Transaction No', 'Contract Sold Date/Policy Purchase date', 'Product Name', 'Customer Name',
    'CUST ID NUMBER', 'Customer Mobile Number', 'Customer Email', 'Customer Address', 'Customer City',
    'Store Code', 'Store Name', 'Store Address', 'Store City', 'Sales Rep id', 'Sales Rep Name',
    'Device Retail Price(RRP)', 'Device Type', 'Device Make', 'Device Model', 'Device Color', 'IMEI', 'Name Goods Type',
    'Policy Start Date', 'Policy End Date', 'Device value Sum Covered', 'Validation Failures'];
  public static TAB_NAME = 'Policy-Logs';
  public static DATE_CREATED = 'dateCreated';
  public static NO_DATA_FOUND = 'No Records Found';
  public static ENABLE_PARTNERS_TAB: string = 'showPartnersTab';
}
