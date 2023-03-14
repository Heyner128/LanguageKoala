import { Message, CallbackQuery } from 'node-telegram-bot-api';
import { Subscription } from '@prisma/client';
import dayjs from 'dayjs';
import Server from '../server';
import UsersService from '../Services/users.service';
import GroupsService from '../Services/groups.service';

type Command = {
  description: string;
  handler: (msg: Message) => void;
};

async function parseSubscription(subscription: Subscription): Promise<string> {
  return `
    Grupo: ${(await GroupsService.getGroupById(subscription.groupId))?.name}
    Valida hasta: ${dayjs(subscription.expiresAt).format('DD/MM/YYYY')}
    Estado: ${subscription.expiresAt > dayjs().toDate() ? 'Activa' : 'Inactiva'}
  `;
}

async function mySubscriptions(msg: Message) {
  console.log('Mis subscripciones');
  const userId = msg.chat?.id;
  if (userId) {
    const subscriptions: Subscription[] =
      await UsersService.getSubscriptionsByUserId(userId);
    const parsedSubscriptions = await Promise.all(
      subscriptions.map((subscription) => parseSubscription(subscription))
    );
    const messageText =
      subscriptions.length > 0
        ? `
      Estas son tus subscripciones:
      ${parsedSubscriptions.join('\n')}
      `
        : 'No tienes subscripciones activas';
    await sendCommands(userId, messageText);
  }
}

const commands: Command[] = [
  {
    description: 'Mis subscripciones',
    handler: mySubscriptions,
  },
];

async function sendCommands(chatId: number, message: string) {
  const options = {
    reply_markup: {
      inline_keyboard: commands.map((command, index) => [
        {
          text: command.description,
          callback_data: index.toString(),
        },
      ]),
    },
  };
  await Server.chatBot.sendMessage(chatId, message, options);
}

async function start(msg: Message) {
  const chatId = msg.chat.id;
  if (msg.chat.type !== 'private') return;
  const message = `Hola ${
    msg.from?.first_name ? msg.from.first_name : 'Pepito perez'
  }! Estas son las opciones disponibles:`;
  await sendCommands(chatId, message);
}

function callbackQuery(msg: CallbackQuery) {
  const command = commands[Number(msg.data)];
  if (command) {
    command.handler(msg.message as Message);
  }
}

export default { start, callbackQuery };
