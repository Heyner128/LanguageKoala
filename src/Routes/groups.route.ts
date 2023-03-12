import GroupsController from '../Controllers/groups.controller';
import Server from '../server';

function init() {
  Server.chatBot.on('new_chat_members', GroupsController.newMembers);
  Server.chatBot.on('left_chat_member', GroupsController.leftMember);
}

export default { init };
