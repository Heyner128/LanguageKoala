import { WriteResult } from '@google-cloud/firestore';
import { UserType } from '../Models/users.dto.js';
import Server from '../server.js';

/**
 * Creates a user in the db
 * @param telegramId - The telegram id of the user
 * @param isAdmin - Whether the user is an admin or not
 *
 * @returns A promise that resolves to the write result
 */
async function createUser(
  telegramId: bigint,
  isAdmin: boolean = false
): Promise<WriteResult> {
  return Server.database.users.doc(String(telegramId)).set({
    userId: String(telegramId),
    isAdmin,
  });
}

/**
 * Get a user from the db by their telegram id
 * @param userId - The telegram id of the user
 *
 * @returns A promise that resolves to the user
 */
async function getUserById(userId: bigint): Promise<UserType> {
  const doc = await Server.database.users.doc(String(userId)).get();

  if (!doc.exists) throw new Error('User not found');

  return doc.data() as UserType;
}

/**
 * Returns whether a user is an admin or not
 * @param userId - The telegram id of the user
 *
 * @returns A promise that resolves to a boolean indicating whether the user is an admin or not
 */
async function userIsAdmin(userId: bigint): Promise<boolean> {
  try {
    const user = await getUserById(userId);

    return user.isAdmin;
  } catch (error) {
    return false;
  }
}

export default {
  createUser,
  getUserById,
  userIsAdmin,
};
