export class AuditSearch {
  searchType: String = "NA";
  policyNumber: String = "";
  claimNumber: String = "";
  repairId: String = "";
  user: String = "";

  static newAuditSearch(): AuditSearch {
    const cd: AuditSearch = new AuditSearch();
    return cd;
  }
}
