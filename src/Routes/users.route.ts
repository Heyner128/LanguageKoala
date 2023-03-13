import Server from '../server';
import UsersController from '../Controllers/users.controller';

function init() {
  Server.chatBot.onText(/\/start/, UsersController.start);
  Server.chatBot.on('callback_query', UsersController.callbackQuery);
}

export default { init };
