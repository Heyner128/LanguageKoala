/**
 * Type for firestore queries validation
 */
export type SubscriptionType = {
  userId: bigint;
  groupId: bigint;
  expiresAt: Date;
};
