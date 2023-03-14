import { Prisma } from '@prisma/client';
import Server from '../server';

async function createUsers(
  exampleUsers: Prisma.UserCreateManyInput[]
): Promise<void> {
  await Server.database.user.createMany({
    data: exampleUsers.map((user) => ({
      telegramId: user.telegramId,
      documentId: user.documentId,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    })),
  });
}

async function createGroups(
  exampleGroups: Prisma.GroupCreateManyInput[]
): Promise<void> {
  await Server.database.group.createMany({
    data: exampleGroups.map((group) => ({
      telegramId: group.telegramId,
      name: group.name,
    })),
  });
}

async function createSubscriptions(
  exampleSubscriptions: Prisma.SubscriptionCreateManyInput[]
): Promise<void> {
  await Server.database.subscription.createMany({
    data: exampleSubscriptions.map((subscription) => ({
      userId: subscription.userId,
      groupId: subscription.groupId,
      expiresAt: subscription.expiresAt,
    })),
  });
}

async function resetDatabase(): Promise<void> {
  await Server.database.subscription.deleteMany();
  await Server.database.group.deleteMany();
  await Server.database.user.deleteMany();
}

async function createData(
  exampleUsers: Prisma.UserCreateManyInput[],
  exampleGroups: Prisma.GroupCreateManyInput[],
  exampleSubscriptions: Prisma.SubscriptionCreateManyInput[]
): Promise<void> {
  await createUsers(exampleUsers);
  await createGroups(exampleGroups);
  await createSubscriptions(exampleSubscriptions);
}

export default { createData, resetDatabase };
