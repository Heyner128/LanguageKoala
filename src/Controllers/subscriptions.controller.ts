import dayjs from 'dayjs';
import { Message } from 'node-telegram-bot-api';
import Server from '../server.js';
import GroupsService from '../Services/groups.service.js';
import SubscriptionsService from '../Services/subscriptions.service.js';
import { SubscriptionType } from '../Models/subscription.dto.js';

/**
 * Parses a subscription to a string
 * @param subscription - The subscription to parse
 *
 * @returns A promise that resolves with the parsed subscription
 */
async function parseSubscription(
  subscription: SubscriptionType
): Promise<string> {
  let status: string;
  if (dayjs(subscription.expiresAt).isAfter(new Date())) {
    status = 'Activa';
  } else {
    status = 'Expirada';
  }

  const groups = await GroupsService.getGroups(subscription.groupId);

  return `
    Grupo: ${
      groups && groups.length > 0 ? groups[0].name : 'Grupo no encontrado'
    }
    Valida hasta: ${dayjs(subscription.expiresAt).format('DD/MM/YYYY')}
    Estado: ${status}
  `;
}

/**
 * Sends the user his subscriptions on a single message
 * @param msg - The message object
 *
 * @returns A promise that resolves with the message object
 *
 * @throws Error if the message object is not valid
 */
async function sendUserSubscriptions(msg: Message): Promise<Message | boolean> {
  const userId = msg.chat?.id;
  if (userId) {
    const subscriptions: SubscriptionType | SubscriptionType[] =
      await SubscriptionsService.getSubscriptions(BigInt(userId));
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
