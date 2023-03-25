import { GetGroupsSchema, GroupsType } from '../Models/groups.dto';
import GroupsController from '../Controllers/groups.controller';
import Server from '../server';

function init() {
  Server.chatBot.on('my_chat_member', GroupsController.botMembershipUpdate);
  Server.chatBot.on('new_chat_members', GroupsController.newMembers);
  Server.chatBot.on('left_chat_member', GroupsController.leftMember);
  Server.httpServer.get<{ Reply: GroupsType }>(
    '/groups',
    {
      schema: GetGroupsSchema,
    },
    GroupsController.getGroups
  );
  Server.logger.info('Groups routes initialized');
}

export default { init };
