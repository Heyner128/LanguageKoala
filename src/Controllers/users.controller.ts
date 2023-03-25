import { Message, CallbackQuery } from 'node-telegram-bot-api';
import SubscriptionsController from './subscriptions.controller';
import TokensController from './tokens.controller';
import CommandsUtil, { Command } from '../Utils/commands.util';
import Server from '../server';

const commands: Command[] = [
  {
    description: 'Mis subscripciones',
    handler: SubscriptionsController.sendUserSubscriptions,
    resendCommands: true,
  },
  {
    description: 'Activar subscripcion',
    handler: TokensController.redeemToken,
    resendCommands: true,
  },
];

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

function callbackQuery(msg: CallbackQuery) {
  const command = commands[Number(msg.data)];
  if (command) {
    command.handler(msg.message as Message).then((sentMessage) => {
      if (command.resendCommands) {
        return Server.chatBot.editMessageReplyMarkup(
          CommandsUtil.commandsReplyMarkup(commands),
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
