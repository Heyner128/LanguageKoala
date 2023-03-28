import { Token } from '@prisma/client';
import Server from '../server';

/**
 * Creates a token in the db
 * @param token - The token to create
 * @param groupId - The group id to associate the token with
 * @param subscriptionDurationInDays - The duration of the subscription
 *
 * @returns A promise that resolves to the token
 *
 * @throws Error - If the token cannot be created
 */
async function createToken(
  token: string,
  groupId: bigint,
  subscriptionDurationInDays: number
): Promise<Token> {
  try {
    return await Server.database.token.create({
      data: {
        token,
        group: {
          connect: {
            telegramId: groupId,
          },
        },
        subscriptionDurationInDays,
      },
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
 * @returns A promise that resolves to the token that was redeemed
 *
 * @throws Error - If the token cannot be found
 */
async function redeemToken(token: string): Promise<Token> {
  try {
    return await Server.database.token.update({
      where: {
        token,
      },
      data: {
        redeemed: true,
      },
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
