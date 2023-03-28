import { User } from '@prisma/client';
import Server from '../server';

/**
 * Create or updates the name of a user from the db
 * @param telegramId - The telegram id of the user
 * @param name - The name of the user
 *
 * @returns A promise that resolves to the user
 *
 * @throws Error - If the user cannot be created or updated
 */
async function createUser(telegramId: bigint, name: string): Promise<User> {
  try {
    return await Server.database.user.upsert({
      where: {
        telegramId,
      },
      update: {
        name,
      },
      create: {
        telegramId,
        name,
      },
    });
  } catch (error) {
    Server.logger.error(
      new Error(
        `User create or update error: ${
          error instanceof Error ? error : 'UNDEFINED'
        }`
      )
    );
    throw new Error('Cannot create or update user');
  }
}

/**
 * Get a user from the db by their telegram id
 * @param userId - The telegram id of the user
 *
 * @returns A promise that resolves to the user
 *
 * @throws Error - If the user cannot be found
 */
async function getUserById(userId: number): Promise<User | null> {
  try {
    return await Server.database.user.findUnique({
      where: {
        telegramId: userId,
      },
    });
  } catch (error) {
    Server.logger.error(
      new Error(
        `User find error: ${error instanceof Error ? error : 'UNDEFINED'}`
      )
    );
    throw new Error('Cannot get user, not found');
  }
}

export default {
  createUser,
  getUserById,
};
