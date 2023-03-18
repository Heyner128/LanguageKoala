import { User } from '@prisma/client';
import Server from '../server';

async function getUserById(userId: number): Promise<User | null> {
  return Server.database.user.findUnique({
    where: {
      telegramId: userId,
    },
  });
}

export default {
  getUserById,
};
