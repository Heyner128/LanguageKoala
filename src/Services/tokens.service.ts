import { v4 as uuid } from 'uuid';
import { WriteResult } from '@google-cloud/firestore';
import Server from '../server.js';
import GroupsService from './groups.service.js';
import { TokenType } from '../Models/tokens.dto.js';

/**
 * Get a token by id from the db
 *
 * @param token - The token to get
 */

async function getTokenById(token: string): Promise<TokenType> {
  const doc = await Server.database.tokens.doc(token).get();

  if (!doc.exists) throw new Error('Token not found');

  return doc.data() as TokenType;
}

/**
 * Creates a token in the db
 * @param groupId - The group id to associate the token with
 * @param subscriptionDurationInDays - The duration of the subscription
 *
 * @returns A promise that resolves to the write result
 *
 * @throws Error - If the token cannot be created
 */
async function createToken(
  groupId: bigint,
  subscriptionDurationInDays: number
): Promise<TokenType> {
  await GroupsService.getGroups(groupId);

  const token = uuid();

  await Server.database.tokens.doc(token).set({
    tokenId: token,
    groupId: String(groupId),
    subscriptionDurationInDays,
    redeemed: false,
  });

  return getTokenById(token);
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
  return Server.database.tokens.doc(token).update({
    redeemed: true,
  });
}

export default { createToken, redeemToken, getTokenById };
