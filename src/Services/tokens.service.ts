import { Token } from '@prisma/client';
import Server from '../server';

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
    Server.logger.error('Token creation database error', error);
    throw new Error('Cannot create token, group not found');
  }
}

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
    Server.logger.error('Token redemption database error', error);
    throw new Error('Cannot redeem token, not found');
  }
}

export default { createToken, redeemToken };
