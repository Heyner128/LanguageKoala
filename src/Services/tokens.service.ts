import { Token } from '@prisma/client';
import Server from '../server';

async function createToken(
  token: string,
  groupId: number,
  subscriptionDurationInDays: number
): Promise<void> {
  await Server.database.token.create({
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
}

async function redeemToken(token: string): Promise<Token> {
  return Server.database.token.update({
    where: {
      token,
    },
    data: {
      redeemed: true,
    },
  });
}

export default { createToken, redeemToken };
