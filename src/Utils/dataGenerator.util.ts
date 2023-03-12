import { Prisma } from '@prisma/client';
import Server from '../server';

function createUsers(exampleUsers: Prisma.UserCreateManyInput[]): void {
  Server.database.user.createMany({
    data: exampleUsers.map((user) => ({
      telegramId: user.telegramId,
      documentId: user.documentId,
      email: user.email,
      name: user.name,
    })),
  });
}

function createGroups(exampleGroups: Prisma.GroupCreateManyInput[]): void {
  Server.database.group.createMany({
    data: exampleGroups.map((group) => ({
      telegramId: group.telegramId,
      name: group.name,
    })),
  });
}

function createSubscriptions(
  exampleSubscriptions: Prisma.SubscriptionCreateManyInput[]
): void {
  Server.database.subscription.createMany({
    data: exampleSubscriptions.map((subscription) => ({
      userId: subscription.userId,
      groupId: subscription.groupId,
      expiresAt: subscription.expiresAt,
    })),
  });
}

function resetDatabase() {
  Server.database.user.deleteMany();
  Server.database.group.deleteMany();
  Server.database.subscription.deleteMany();
}

function createData(
  exampleUsers: Prisma.UserCreateManyInput[],
  exampleGroups: Prisma.GroupCreateManyInput[],
  exampleSubscriptions: Prisma.SubscriptionCreateManyInput[]
) {
  createUsers(exampleUsers);
  createGroups(exampleGroups);
  createSubscriptions(exampleSubscriptions);
}

export default { createData, resetDatabase };
