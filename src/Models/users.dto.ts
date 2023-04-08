import { SubscriptionType } from './subscription.dto';

export type UserType = {
  name: string;
  email?: string;
  documentId?: number;
  subscriptions?: SubscriptionType[];
};
