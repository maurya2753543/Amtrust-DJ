export interface LockRequest {
  policyIdentifier: String;
  claimIdentifier: String,
  repairIdentifier: String,
  requestedBy: String,
  requestedAt: Date,
  client: String
}
