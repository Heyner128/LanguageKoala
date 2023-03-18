import dayjs from 'dayjs';
import { Message } from 'node-telegram-bot-api';
import TokensService from '../Services/tokens.service';
import SubscriptionsService from '../Services/subscriptions.service';
import Server from '../server';

async function redeemTokenListener(msg: Message): Promise<Message> {
  if (msg.chat.id && msg.text) {
    try {
      const token = await TokensService.redeemToken(msg.text);
      await SubscriptionsService.createSubscription(
        msg.chat.id,
        token.groupId,
        dayjs().add(token.subscriptionDurationInDays, 'day').toDate()
      );
      await Server.chatBot.removeTextListener(/.+/);
      return await Server.chatBot.sendMessage(
        msg.chat.id,
        'Subscripción activada correctamente'
      );
    } catch (error) {
      await Server.chatBot.removeTextListener(/.+/);
      return Server.chatBot.sendMessage(
        msg.chat.id,
        'No se pudo activar la subscripción'
      );
    }
  }
  throw new Error('No se pudo obtener el id del usuario');
}

async function redeemToken(msg: Message): Promise<Message> {
  if (msg.chat.id && msg.text) {
    await Server.chatBot.sendMessage(
      msg.chat.id,
      'Escribe el código de la subscripción'
    );

    return new Promise((resolve, reject) => {
      Server.chatBot.onText(/.+/, (msgCB: Message) => {
        try {
          resolve(redeemTokenListener(msgCB));
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  throw new Error('No se pudo obtener el id del usuario');
}

export default { redeemToken };
