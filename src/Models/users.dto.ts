import { SubscriptionType } from './subscription.dto.js';

/**
 * Type for firestore queries validation
 */
export type UserType = {
  userId: string;
  isAdmin: boolean;
  subscriptions?: SubscriptionType[];
};
