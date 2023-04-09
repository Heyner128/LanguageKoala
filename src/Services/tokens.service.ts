import { WriteResult } from '@google-cloud/firestore';
import Server from '../server';

/**
 * Creates a token in the db
 * @param token - The token to create
 * @param groupId - The group id to associate the token with
 * @param subscriptionDurationInDays - The duration of the subscription
 *
 * @returns A promise that resolves to the write result
 *
 * @throws Error - If the token cannot be created
 */
async function createToken(
  token: string,
  groupId: bigint,
  subscriptionDurationInDays: number
): Promise<WriteResult> {
  try {
    return await Server.database.tokens.doc(token).set({
      groupId: String(groupId),
      subscriptionDurationInDays,
      redeemed: false,
    });
  } catch (error) {
    Server.logger.error(
      new Error(`
      Token creation database error: ${
        error instanceof Error ? error : 'UNDEFINED'
      }`)
    );
    throw new Error('Cannot create token, group not found');
  }
}

/**
 * Changes a token status to redeemed
 * @param token - The token to redeem
 *
 * @returns A promise that resolves to the write result
 *
 * @throws Error - If the token cannot be found
 */
async function redeemToken(token: string): Promise<WriteResult> {
  try {
    return await Server.database.tokens.doc(token).update({
      redeemed: true,
    });
  } catch (error) {
    Server.logger.error(
      new Error(`
      Token redemption database error: ${
        error instanceof Error ? error : 'UNDEFINED'
      }`)
    );
    throw new Error('Cannot redeem token, not found');
  }
}

export default { createToken, redeemToken };
