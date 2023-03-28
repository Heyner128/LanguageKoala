import { Message, CallbackQuery } from 'node-telegram-bot-api';
import SubscriptionsController from './subscriptions.controller';
import TokensController from './tokens.controller';
import CommandsUtil, { Command } from '../Utils/commands.util';
import Server from '../server';

/**
 * The command list to be sent to the user as buttons
 */
const commands: Command[] = [
  {
    description: 'Mis subscripciones',
    handler: SubscriptionsController.sendUserSubscriptions,
    resendCommands: 'same',
  },
  {
    description: 'Activar subscripcion',
    handler: TokensController.redeemToken,
    resendCommands: 'back',
  },
];

/**
 * The back command to show when a new message is sent
 */
const backCommand: Command = {
  description: 'Volver',
  handler: () => Promise.resolve(true),
  resendCommands: 'same',
};

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
    reply_markup: CommandsUtil.commandsReplyMarkup(commands),
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
function callbackQuery(msg: CallbackQuery) {
  const command = commands[Number(msg.data)];
  if (command) {
    command.handler(msg.message as Message).then((sentMessage) => {
      if (
        command.resendCommands === 'same' &&
        typeof sentMessage !== 'boolean'
      ) {
        return Server.chatBot.editMessageReplyMarkup(
          CommandsUtil.commandsReplyMarkup(commands),
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
          CommandsUtil.commandsReplyMarkup([backCommand]),
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

export default { start, callbackQuery };
