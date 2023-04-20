import { SubscriptionType } from './subscription.dto.js';

export type UserType = {
  telegramId: string;
  name: string;
  email?: string;
  documentId?: number;
  subscriptions?: SubscriptionType[];
};
