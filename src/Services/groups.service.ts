import { WriteResult } from '@google-cloud/firestore';
import Server from '../server';
import { GroupType } from '../Models/groups.dto';

/**
 * Creates a group in the db
 *
 * @param telegramId - The telegram id of the group
 * @param name - The name of the group
 *
 * @returns A promise that resolves to the write result
 *
 * @throws Error - If the group cannot be created
 */
async function createGroup(
  telegramId: bigint,
  name: string
): Promise<WriteResult> {
  try {
    return await Server.database.groups.doc(String(telegramId)).set({
      name,
    });
  } catch (error) {
    Server.logger.error(
      new Error(
        `Group creation database error: ${
          error instanceof Error ? error : 'UNDEFINED'
        }`
      )
    );
    throw new Error('Cannot create group, already exists');
  }
}

/**
 * Deletes a group from the db
 * @param groupId - The telegram id of the group
 *
 * @returns A promise that resolves to the write result
 *
 * @throws Error - If the group cannot be found
 */
async function deleteGroup(groupId: bigint): Promise<WriteResult> {
  try {
    return await Server.database.groups.doc(String(groupId)).delete();
  } catch (error) {
    Server.logger.error(
      new Error(
        `Group deletion database error: ${
          error instanceof Error ? error : 'UNDEFINED'
        }`
      )
    );
    throw new Error('Cannot delete group, not found');
  }
}

/**
 * Get a group from the db by its telegram id or all groups if id it's not provided
 *
 * @param groupId - Optional The telegram id of the group
 *
 * @returns A promise that resolves to the group or undefined if not found
 *
 * @throws Error - If the group cannot be found
 */
async function getGroups(groupId?: bigint): Promise<GroupType[] | undefined> {
  try {
    const snapshot = await Server.database.groups.get();
    const docs =
      groupId !== undefined
        ? snapshot.docs.filter((doc) => doc.id === String(groupId))
        : snapshot.docs;

    if (docs.length === 0) {
      return undefined;
    }

    return docs.map((doc) => doc.data());
  } catch (error) {
    Server.logger.error(
      new Error(
        `Group deletion find error: ${
          error instanceof Error ? error : 'UNDEFINED'
        }`
      )
    );
    throw new Error('Cannot get group, not found');
  }
}

export default { getGroups, createGroup, deleteGroup };
