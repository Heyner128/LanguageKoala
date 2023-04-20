import { SubscriptionType } from './subscription.dto';

export type UserType = {
  telegramId: string;
  name: string;
  email?: string;
  documentId?: number;
  subscriptions?: SubscriptionType[];
};
