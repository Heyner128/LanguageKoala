import { Message, CallbackQuery } from 'node-telegram-bot-api';
import { Subscription } from '@prisma/client';
import Server from '../server';
import UsersService from '../Services/users.service';

type Command = {
  description: string;
  handler: (msg: Message) => void;
};

async function mySubscriptions(msg: Message) {
  console.log('My subscriptions');
  const userId = msg.chat?.id;
  if (userId) {
    const subscriptions: Subscription[] =
      await UsersService.getSubscriptionsByUserId(userId);
    await Server.chatBot.sendMessage(
      userId,
      `
      Your subscriptions:
      ${subscriptions.map((subscription) => JSON.stringify(subscription))}
      `
    );
  }
}

const commands: Command[] = [
  {
    description: 'My subscriptions',
    handler: mySubscriptions,
  },
];

async function start(msg: Message) {
  const chatId = msg.chat.id;
  if (msg.chat.type !== 'private') return;
  const message = `Hi ${
    msg.from?.first_name ? msg.from.first_name : 'Pepito perez'
  }! Please choose an option:`;
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

function callbackQuery(msg: CallbackQuery) {
  const command = commands[Number(msg.data)];
  if (command) {
    command.handler(msg.message as Message);
  }
}

export default { start, callbackQuery };
