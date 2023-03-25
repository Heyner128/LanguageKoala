import { Group } from '@prisma/client';
import Server from '../server';

async function createGroup(telegramId: bigint, name: string): Promise<Group> {
  try {
    return await Server.database.group.create({
      data: {
        telegramId,
        name,
      },
    });
  } catch (error) {
    Server.logger.error('Group creation database error', error);
    throw new Error('Cannot create group, already exists');
  }
}

async function deleteGroup(groupId: bigint): Promise<Group> {
  try {
    return await Server.database.group.delete({
      where: {
        telegramId: groupId,
      },
    });
  } catch (error) {
    Server.logger.error('Group deletion database error', error);
    throw new Error('Cannot delete group, not found');
  }
}

async function getGroupById(groupId: bigint): Promise<Group | null> {
  try {
    return await Server.database.group.findUnique({
      where: {
        telegramId: groupId,
      },
    });
  } catch (error) {
    Server.logger.error('Group get database error', error);
    throw new Error('Cannot get group, not found');
  }
}

export default { getGroupById, createGroup, deleteGroup };
