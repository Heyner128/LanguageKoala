import { Message, CallbackQuery } from 'node-telegram-bot-api';
import Server, { ADMIN_COMMANDS_IDS } from '../server.js';
import { SubscriptionType } from '../Models/subscription.dto.js';
import SubscriptionsService from '../Services/subscriptions.service.js';
import CommandsUtil, { Command } from '../Utils/commands.util.js';
import UsersService from '../Services/users.service.js';
import SubscriptionsController from './subscriptions.controller.js';
import TokensController from './tokens.controller.js';

/**
 * Prompts the user to select a user to be added as admin
 *
 * @param msg - The message object
 *
 * @returns A promise that resolves to the message sent
 */
async function createAdmin(msg: Message): Promise<Message | boolean> {
  if (msg.chat.id && msg.text) {
    Server.logger.info(`Admin creation requested by ${msg.chat.id}`);

    await Server.chatBot.sendMessage(
      msg.chat.id,
      'Para añadir el usuario, seleccionalo de la lista',
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: 'Seleccionar usuario',
                request_user: {
                  request_id: ADMIN_COMMANDS_IDS.createAdmin,
                },
              },
            ],
          ],
          one_time_keyboard: true,
        },
      }
    );
  }
  return false;
}

async function resendCommands(msg: Message): Promise<Message | boolean> {
  if (msg.chat.id && msg.text) {
    return Server.chatBot.editMessageText(
      `Hola ${
        msg.chat.first_name ? msg.chat.first_name : 'Pepito perez'
      }! Estas son las opciones disponibles:`,
      {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
      }
    );
  }

  return false;
}

const commandList: Command[] = [
  {
    id: 0,
    description: 'Mis subscripciones',
    handler: SubscriptionsController.sendUserSubscriptions,
    resendCommands: 'same',
  },
  {
    id: 1,
    description: 'Activar subscripcion',
    handler: TokensController.redeemToken,
    resendCommands: 'back',
  },
  {
    id: 2,
    description: 'Generar Token',
    handler: TokensController.createToken,
    resendCommands: 'back',
    adminCommand: true,
  },
  {
    id: 3,
    description: 'Agregar administrador',
    handler: createAdmin,
    resendCommands: 'back',
    adminCommand: true,
  },
  {
    id: 4,
    description: 'Volver',
    handler: resendCommands,
    resendCommands: 'same',
    backCommand: true,
  },
];

/**
 * The command list to be sent to the user as buttons
 */
const userCommands: Command[] = commandList.filter(
  (command) => !command.backCommand
);

/**
 * The back command to show when a new message is sent
 */
const backCommand: Command = commandList.filter(
  (command) => command.backCommand
)[0];

/**
 * Callback when a user is selected to be added as admin
 * @param msg - The message received
 */
async function createAdminListener(msg: Message): Promise<void> {
  if (
    msg.user_shared &&
    msg.user_shared.request_id === ADMIN_COMMANDS_IDS.createAdmin
  ) {
    try {
      const userId = msg.user_shared.user_id;

      await UsersService.createUser(BigInt(userId), true);

      Server.logger.info(`User ${userId} created as admin`);

      await Server.chatBot.sendMessage(msg.chat.id, 'Administrador creado', {
        reply_markup: CommandsUtil.commandsReplyMarkup([backCommand], true),
      });
    } catch (error) {
      Server.logger.error(error);
      await Server.chatBot.sendMessage(msg.chat.id, 'Error creando admin');
    }
  }
}

/**
 * Sends the command list on private chats
 * @param msg - The message received
 */
async function start(msg: Message) {
  const chatId = msg.chat.id;
  if (msg.chat.type !== 'private') return;
  const message = `Hola ${
    msg.from?.first_name ? msg.from.first_name : 'Pepito perez'
  }! Estas son las opciones disponibles:`;
  await Server.chatBot.sendMessage(chatId, message, {
    reply_markup: CommandsUtil.commandsReplyMarkup(
      userCommands,
      await UsersService.userIsAdmin(BigInt(chatId))
    ),
  });
  Server.logger.info(`Commands sent to user ${chatId}`);
}

/**
 * Handles the callback query from the command list if resendCommands value it's `same` resends the command list
 * if it's `back` send a back button with the resendCommands value set to `same`
 *
 * @see {@link https://core.telegram.org/bots/api#callbackquery} for details on how the CallbackQuery works
 *
 * @param msg - The callback query received
 *
 * @returns A promise that resolves to the message sent
 */
async function callbackQuery(msg: CallbackQuery) {
  const command = commandList.find((cmd) => cmd.id === Number(msg.data));
  if (command && command.handler) {
    command.handler(msg.message as Message).then(async (sentMessage) => {
      if (
        command.resendCommands === 'same' &&
        typeof sentMessage !== 'boolean'
      ) {
        return Server.chatBot.editMessageReplyMarkup(
          CommandsUtil.commandsReplyMarkup(
            userCommands,
            await UsersService.userIsAdmin(BigInt(sentMessage.chat.id))
          ),
          {
            chat_id: sentMessage.chat.id,
            message_id: sentMessage.message_id,
          }
        );
      }
      if (
        command.resendCommands === 'back' &&
        typeof sentMessage !== 'boolean'
      ) {
        return Server.chatBot.editMessageReplyMarkup(
          CommandsUtil.commandsReplyMarkup(
            [backCommand],
            await UsersService.userIsAdmin(BigInt(sentMessage.chat.id))
          ),
          {
            chat_id: sentMessage.chat.id,
            message_id: sentMessage.message_id,
          }
        );
      }
      return sentMessage;
    });
  }
}

export default { start, callbackQuery, createAdminListener };
