import { Subscription } from '@prisma/client';
import dayjs from 'dayjs';
import { Message } from 'node-telegram-bot-api';
import Server from '../server';
import GroupsService from '../Services/groups.service';
import SubscriptionsService from '../Services/subscriptions.service';

async function parseSubscription(subscription: Subscription): Promise<string> {
  let status: string;
  if (dayjs(subscription.expiresAt).isAfter(new Date())) {
    status = 'Activa';
  } else {
    status = 'Expirada';
  }

  return `
    Grupo: ${(await GroupsService.getGroupById(subscription.groupId))?.name}
    Valida hasta: ${dayjs(subscription.expiresAt).format('DD/MM/YYYY')}
    Estado: ${status}
  `;
}

async function sendUserSubscriptions(msg: Message): Promise<Message | boolean> {
  const userId = msg.chat?.id;
  if (userId) {
    const subscriptions: Subscription[] =
      await SubscriptionsService.getSubscriptionsByUserId(BigInt(userId));
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
    Server.logger.info(`User ${userId} requested his subscriptions`);
    return Server.chatBot.editMessageText(messageText, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    });
  }

  const error = new Error(
    'Error getting message informations from telegram API'
  );
  Server.logger.error(error);
  throw error;
}

export default { sendUserSubscriptions };
