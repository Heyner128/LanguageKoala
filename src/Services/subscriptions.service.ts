import { Subscription } from '@prisma/client';
import Server from '../server';

/**
 * Creates a subscription in the db
 * @param userTelegramId - The telegram id of the user
 * @param groupTelegramId - The telegram id of the group
 * @param expiresAt - The date the subscription expires
 *
 * @returns A promise that resolves to the subscription
 *
 * @throws Error - If the subscription cannot be created, normally if the user or group cannot be found
 */
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
    Server.logger.error(
      new Error(
        `Subscription creation database error: ${
          error instanceof Error ? error : 'UNDEFINED'
        }
      `
      )
    );
    throw new Error('Cannot create subscription, user or group not found');
  }
}

/**
 * Checks if a user has an active subscription
 * @param userId - The telegram id of the user
 * @param groupId - The telegram id of the group
 *
 * @returns A promise that resolves to true if the user has an active subscription, false otherwise
 *
 * @throws Error - If the query fails
 */
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
    Server.logger.error(
      new Error(`Subscription find error: ${
        error instanceof Error ? error : 'UNDEFINED'
      }
      `)
    );
    throw new Error('Cannot get subscription, user or group not found');
  }
}

/**
 * Gets all the subscriptions of a given user
 * @param userId - The telegram id of the user
 *
 * @returns A promise that resolves to an array of subscriptions
 *
 * @throws Error - If the query fails, normally if the user cannot be found
 */
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
    Server.logger.error(
      new Error(`Subscription find error: ${
        error instanceof Error ? error : 'UNDEFINED'
      }
      `)
    );
    throw new Error('Cannot get subscriptions, user not found');
  }
}

export default {
  createSubscription,
  userHasActiveSubscription,
  getSubscriptionsByUserId,
};
