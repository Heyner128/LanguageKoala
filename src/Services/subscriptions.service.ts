import { WriteResult } from '@google-cloud/firestore';
import dayjs from 'dayjs';
import { SubscriptionType } from '../Models/subscription.dto.js';
import Server from '../server.js';

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
  return Server.database.users
    .doc(String(userTelegramId))
    .collection('subscriptions')
    .doc(String(groupTelegramId))
    .set({
      expiresAt,
    });
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
  const snapshot = await Server.database
    .subscriptions(String(userId))
    .where('expiresAt', '>', dayjs().toDate())
    .where('groupId', '==', String(groupId))
    .get();

  const subscriptions: SubscriptionType[] = snapshot.docs.map((doc) =>
    doc.data()
  );

  return subscriptions.length > 0;
}
/**
 * Gets all the subscriptions of a given user
 * @param userTelegramId - The telegram id of the user
 * @param groupId - The telegram id of the group
 *
 * @returns A promise that resolves to an array of subscriptions
 *
 * @throws Error - If the query fails, normally if the user cannot be found
 */
async function getSubscriptions(
  userTelegramId: bigint,
  groupId?: bigint
): Promise<SubscriptionType[]> {
  if (groupId) {
    const doc = await Server.database
      .subscriptions(String(userTelegramId))
      .doc(String(groupId))
      .get();

    if (!doc.exists) throw new Error('Subscription not found');

    return [doc.data()] as SubscriptionType[];
  }
  const snapshot = await Server.database
    .subscriptions(String(userTelegramId))
    .get();

  return snapshot.docs.map((doc) => doc.data());
}

export default {
  createSubscription,
  userHasActiveSubscription,
  getSubscriptions,
};
