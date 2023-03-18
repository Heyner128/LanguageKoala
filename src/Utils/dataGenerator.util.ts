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

async function createTokens(
  exampleTokens: Prisma.TokenCreateManyInput[]
): Promise<void> {
  await Server.database.token.createMany({
    data: exampleTokens.map((token) => ({
      token: token.token,
      groupId: token.groupId,
      subscriptionDurationInDays: token.subscriptionDurationInDays,
    })),
  });
}

async function resetDatabase(): Promise<void> {
  await Server.database.token.deleteMany();
  await Server.database.subscription.deleteMany();
  await Server.database.group.deleteMany();
  await Server.database.user.deleteMany();
}

async function createData(
  exampleUsers: Prisma.UserCreateManyInput[],
  exampleGroups: Prisma.GroupCreateManyInput[],
  exampleTokens: Prisma.TokenCreateManyInput[]
): Promise<void> {
  await createUsers(exampleUsers);
  await createGroups(exampleGroups);
  await createTokens(exampleTokens);
}

export default { createData, resetDatabase };
