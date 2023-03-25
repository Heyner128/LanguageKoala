import { Subscription } from '@prisma/client';
import Server from '../server';

async function createSubscription(
  userTelegramId: bigint,
  groupTelegramId: bigint,
  expiresAt: Date
): Promise<Subscription> {
  try {
    return await Server.database.subscription.create({
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
  } catch (error) {
    console.error(error);
    throw new Error('Cannot create subscription, user or group not found');
  }
}

async function userHasActiveSubscription(
  userId: bigint,
  groupId: bigint
): Promise<boolean> {
  try {
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
  } catch (error) {
    console.error(error);
    throw new Error('Cannot get subscription, user or group not found');
  }
}

async function getSubscriptionsByUserId(
  userId: bigint
): Promise<Subscription[]> {
  try {
    return await Server.database.subscription.findMany({
      where: {
        userId,
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error('Cannot get subscriptions, user not found');
  }
}

export default {
  createSubscription,
  userHasActiveSubscription,
  getSubscriptionsByUserId,
};
