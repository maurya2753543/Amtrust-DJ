export class AuditSearchModel {
  claimNo: String;
  user: String;
  policyNumber: String;
  repairId: String;


  static newClaimSearch(): AuditSearchModel {
    const cd: AuditSearchModel = new AuditSearchModel();
    return cd;
  }
}
