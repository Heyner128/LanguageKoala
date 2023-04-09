import { WriteResult } from '@google-cloud/firestore';
import dayjs from 'dayjs';
import { SubscriptionType } from '../Models/subscription.dto';
import UserService from './users.service';
import Server from '../server';

/**
 * Creates a subscription in the db
 * @param userTelegramId - The telegram id of the user
 * @param groupTelegramId - The telegram id of the group
 * @param expiresAt - The date the subscription expires
 *
 * @returns A promise that resolves to the write result
 *
 * @throws Error - If the subscription cannot be created, normally if the user or group cannot be found
 */
async function createSubscription(
  userTelegramId: bigint,
  groupTelegramId: bigint,
  expiresAt: Date
): Promise<WriteResult> {
  try {
    return await Server.database.users
      .doc(String(userTelegramId))
      .collection('subscriptions')
      .doc(String(groupTelegramId))
      .set({
        expiresAt,
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
 *
 * @returns A promise that resolves to true if the user has an active subscription, false otherwise
 *
 * @throws Error - If the query fails
 */
async function userHasActiveSubscription(userId: bigint): Promise<boolean> {
  try {
    const snapshot = await Server.database
      .subscriptions(String(userId))
      .where('expiresAt', '>', dayjs().toDate())
      .get();

    const subscriptions: SubscriptionType[] = snapshot.docs.map((doc) =>
      doc.data()
    );

    return subscriptions.length > 0;
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
 * @param userTelegramId - The telegram id of the user
 *
 * @returns A promise that resolves to an array of subscriptions
 *
 * @throws Error - If the query fails, normally if the user cannot be found
 */
async function getSubscriptionsByUserId(
  userTelegramId: bigint
): Promise<SubscriptionType[]> {
  try {
    const snapshot = await Server.database
      .subscriptions(String(userTelegramId))
      .get();
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    Server.logger.error(
      new Error(`Subscription find error: ${
        error instanceof Error ? error : 'UNDEFINED'
      }
      `)
    );
    throw new Error('Cannot get subscriptions');
  }
}

export default {
  createSubscription,
  userHasActiveSubscription,
  getSubscriptionsByUserId,
};
