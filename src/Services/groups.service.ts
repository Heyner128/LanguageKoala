import { WriteResult } from '@google-cloud/firestore';
import Server from '../server.js';
import { GroupType } from '../Models/groups.dto.js';

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
  return Server.database.groups.doc(String(telegramId)).set({
    telegramId: String(telegramId),
    name,
  });
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
  return Server.database.groups.doc(String(groupId)).delete();
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
async function getGroups(groupId?: bigint): Promise<GroupType[]> {
  const snapshot = await Server.database.groups.get();
  const docs =
    groupId !== undefined
      ? snapshot.docs.filter(
          (
            doc: FirebaseFirestore.QueryDocumentSnapshot<
              Partial<Partial<GroupType>>
            >
          ) => doc.id === String(groupId)
        )
      : snapshot.docs;

  if (docs.length === 0) {
    throw new Error('Group not found');
  }

  return docs.map((doc) => doc.data());
}

export default { getGroups, createGroup, deleteGroup };
