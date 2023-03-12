import { User, Subscription } from '@prisma/client';
import Server from '../server';

async function getUserById(userId: number): Promise<User | null> {
  return Server.database.user.findUnique({
    where: {
      telegramId: userId,
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

export default { getUserById, userHasActiveSubscription };
