import { Subscription } from '@prisma/client';
import Server from '../server';

async function createSubscription(
  userTelegramId: number,
  groupTelegramId: number,
  expiresAt: Date
): Promise<void> {
  await Server.database.subscription.create({
    data: {
      user: {
        connect: {
          telegramId: userTelegramId,
        },
      },
      group: {
        connect: {
          telegramId: groupTelegramId,
        },
      },
      expiresAt,
    },
  });
}

async function userHasActiveSubscription(
  userId: number,
  groupId: number
): Promise<boolean> {
  const firstSubscription: Subscription | null =
    await Server.database.subscription.findFirst({
      where: {
        userId,
        groupId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

  return firstSubscription !== null;
}

async function getSubscriptionsByUserId(
  userId: number
): Promise<Subscription[]> {
  return Server.database.subscription.findMany({
    where: {
      userId,
    },
  });
}

export default {
  createSubscription,
  userHasActiveSubscription,
  getSubscriptionsByUserId,
};
