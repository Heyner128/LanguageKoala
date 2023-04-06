import { SubscriptionType } from './subscription.dto';

export type UserType = {
  id: number;
  name: string;
  email?: string;
  documentId?: number;
  subscriptions?: SubscriptionType[];
};
