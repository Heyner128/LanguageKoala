import { GetGroupsSchema, GroupType } from '../Models/groups.dto.js';
import GroupsController from '../Controllers/groups.controller.js';
import Server from '../server.js';
import HelperFunctions from '../Utils/functions.util.js';
import { ApiHeaders } from '../Utils/types.util.js';

/**
 * Adds the groups routes, and adds the hooks of pre-validation and validation to fastify
 */
function init() {
  Server.chatBot.on('my_chat_member', GroupsController.botMembershipUpdate);
  Server.chatBot.on('new_chat_members', GroupsController.newMembers);
  Server.chatBot.on('left_chat_member', GroupsController.leftMember);
  Server.httpServer.get<{
    Reply: GroupType[];
    Headers: ApiHeaders;
  }>(
    '/groups',
    {
      schema: GetGroupsSchema,
      preValidation: HelperFunctions.apiKeyPreValidation,
    },
    GroupsController.getGroups
  );
  Server.logger.info('Groups routes initialized');
}

export default { init };
