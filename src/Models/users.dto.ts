import { SubscriptionType } from './subscription.dto.js';

export type UserType = {
  telegramId: string;
  name: string;
  isAdmin?: boolean;
  subscriptions?: SubscriptionType[];
};
