import Server from '../server.js';
import UsersController from '../Controllers/users.controller.js';

/**
 * Adds the users routes
 */
function init() {
  Server.chatBot.onText(/\/start/, UsersController.start);
  Server.chatBot.on('callback_query', UsersController.callbackQuery);
  Server.chatBot.on('message', UsersController.createAdminListener);
  Server.logger.info('Users routes initialized');
}

export default { init };
