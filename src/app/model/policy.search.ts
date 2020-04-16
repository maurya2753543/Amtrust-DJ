export class PolicySearchCriteria {
    policyNumber: String = '';
    customerName: String = '';
    policyIMEINumber: String = '';
    policyStatus: String = '';
    custMobileNumber: String = '';
    customerId: String = '';
    coverage: String = '';
    customerEmail: String = '';
    clientTransactionNumber: String = '';
    policyPurchaseDate: String = '';
    partnerContractId: String = '';
    partnerProductId: String = '';
    partnerId: String = '';
    currentPage: Number = 0;
    dateCreated: String = '';
    claimNo: String = '';
    pageIndex : number = 0;
    pageRecordCount : number = 10;

  static newPolicySearchCriteria(): PolicySearchCriteria {
    return new PolicySearchCriteria();
  }
}
