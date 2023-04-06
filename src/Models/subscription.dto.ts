import { GroupsType } from './groups.dto';

export type SubscriptionType = {
  group: GroupsType;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
