import { Group } from '@prisma/client';
import Server from '../server';

async function getGroupById(groupId: number): Promise<Group | null> {
  return Server.database.group.findUnique({
    where: {
      telegramId: groupId,
    },
  });
}

export default { getGroupById };
