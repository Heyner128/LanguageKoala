export type User = {
  telegramId: string;
  name?: string;
  email?: string;
  documentId?: number;
  subscriptions: Subscription[];
};

export type Subscription = {
  groupId: string;
  expiresAt: Date;
};
