import { WriteResult } from '@google-cloud/firestore';
import { UserType } from '../Models/users.dto';
import Server from '../server';

/**
 * Creates a user in the db
 * @param telegramId - The telegram id of the user
 * @param name - The name of the user
 *
 * @returns A promise that resolves to the write result
 *
 * @throws Error - If the user cannot be created or updated
 */
async function createUser(
  telegramId: bigint,
  name: string
): Promise<WriteResult> {
  try {
    return await Server.database.users.doc(String(telegramId)).set({
      name,
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
async function getUserById(userId: bigint): Promise<UserType | undefined> {
  try {
    const doc = await Server.database.users.doc(String(userId)).get();

    return doc.exists ? doc.data() : undefined;
  } catch (error) {
    Server.logger.error(
      new Error(
        `User find error: ${error instanceof Error ? error : 'UNDEFINED'}`
      )
    );
    throw new Error('Cannot get user, database error');
  }
}

export default {
  createUser,
  getUserById,
};
