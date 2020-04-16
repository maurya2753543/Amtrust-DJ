export interface BatchSummary {
  id: String;
  batchId: String;
  totalRecordsUploaded: BigInteger;
  totalValidationSuccess: BigInteger;
  totalValidationFailure: BigInteger;
  batchUploadDate: String;
  jobStatus: String;
}
