import dayjs from 'dayjs';
import { Message } from 'node-telegram-bot-api';
import TokensService from '../Services/tokens.service.js';
import SubscriptionsService from '../Services/subscriptions.service.js';
import UsersService from '../Services/users.service.js';
import Server, { ADMIN_COMMANDS_IDS } from '../server.js';
import {
  FastifyReplyTypebox,
  FastifyRequestTypebox,
} from '../Utils/types.util.js';
import { CreateTokenSchema } from '../Models/tokens.dto.js';
import CommandsUtil from '../Utils/commands.util.js';

const usersRedeeming: number[] = [];

/**
 * Callback when the user sends the token to the bot
 *
 * @param msg - The message object
 *
 * @returns A promise that resolves with the validation message
 *
 * @throws Error if the message object is not valid or the redeeming process fails
 */
async function redeemTokenListener(msg: Message): Promise<Message> {
  if (msg.chat.id && msg.text) {
    try {
      await Server.chatBot.removeTextListener(/.+/);

      await TokensService.redeemToken(msg.text);
      Server.logger.info(
        `${msg.chat?.id ?? 'NO_SENDER_ID'} redeemed token ${msg.text}`
      );

      const token = await TokensService.getTokenById(msg.text);

      await UsersService.createUser(BigInt(msg.chat.id));

      await SubscriptionsService.createSubscription(
        BigInt(msg.chat.id),
        BigInt(token.groupId),
        dayjs().add(token.subscriptionDurationInDays, 'day').toDate()
      );

      const subscription = (
        await SubscriptionsService.getSubscriptions(
          BigInt(msg.chat.id),
          BigInt(token.groupId)
        )
      )[0];

      Server.logger.info(
        `Subscription created for group ${subscription.groupId} until ${subscription.expiresAt} `
      );
      return await Server.chatBot.sendMessage(
        msg.chat.id,
        `Subscripción activada correctamente, expira el ${dayjs(
          subscription.expiresAt
        ).format('DD/MM/YYYY')}`
      );
    } catch (error) {
      Server.logger.error(new Error(`Error redeeming token ${msg.text}`));
      return await Server.chatBot.sendMessage(
        msg.chat.id,
        'No se pudo activar la subscripción'
      );
    }
  }
  const error = new Error(
    'Error getting message informations from telegram API'
  );
  Server.logger.error(error);
  throw error;
}

/**
 * Sends a message requesting the token to the user and returns a promise that resolves when the token is redeemed
 *
 * @param msg - The message object
 *
 * @returns A promise that resolves when the token is redeemed
 *
 * @throws Error if the message object is not valid
 */
async function redeemToken(msg: Message): Promise<Message | boolean> {
  if (usersRedeeming.includes(msg.chat.id)) return false;

  if (msg.chat.id && msg.text) {
    usersRedeeming.push(msg.chat.id);

    Server.logger.info(`Token requested to user ${msg.chat.id}`);

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
        } finally {
          usersRedeeming.splice(usersRedeeming.indexOf(msg.chat.id), 1);
        }
      });
    });
  }
  const error = new Error(
    'Error getting message informations from telegram API'
  );
  Server.logger.error(error);
  throw error;
}

/**
 * Callback when the user/admin selects the group to create the token
 * @param msg - The message object
 */
async function createTokenListener(msg: Message) {
  try {
    if (
      msg.chat_shared &&
      msg.chat_shared.request_id === ADMIN_COMMANDS_IDS.createToken
    ) {
      const token = await TokensService.createToken(
        BigInt(msg.chat_shared.chat_id),
        30
      );
      Server.logger.info(
        `Token ${token.tokenId} created for group ${token.groupId}`
      );
      await Server.chatBot.sendMessage(
        msg.chat.id,
        `Token creado correctamente: ${token.tokenId}`,
        {
          reply_markup: CommandsUtil.commandsReplyMarkup(
            [
              {
                id: 4,
                description: 'Volver',
                handler: () => Promise.resolve(true),
                resendCommands: 'same',
              },
            ],
            await UsersService.userIsAdmin(BigInt(msg.chat.id))
          ),
        }
      );
    }
  } catch (error) {
    Server.logger.error(new Error(`Error creating token ${msg.text}`));
    await Server.chatBot.sendMessage(msg.chat.id, 'No se pudo crear el token', {
      reply_markup: CommandsUtil.commandsReplyMarkup(
        [
          {
            id: 4,
            description: 'Volver',
            handler: () => Promise.resolve(true),
            resendCommands: 'same',
          },
        ],
        await UsersService.userIsAdmin(BigInt(msg.chat.id))
      ),
    });
  }
}

/**
 * Handles the token creation on the chatbot
 *
 * @param msg - The message object
 *
 * @returns A promise that resolves with the validation message
 */
async function createToken(msg: Message): Promise<Message | boolean> {
  if (msg.chat.id && msg.text) {
    await Server.chatBot.sendMessage(
      msg.chat.id,
      'El token se esta generando, selecciona el grupo',
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: 'Seleccionar grupo',
                request_chat: {
                  request_id: ADMIN_COMMANDS_IDS.createToken,
                  chat_is_channel: false,
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

/**
 * Handles the creation of a new token on the route `/tokens`
 * @param request - The request object
 * @param reply - The reply object
 */
async function createTokenRouteHandler(
  request: FastifyRequestTypebox<typeof CreateTokenSchema>,
  reply: FastifyReplyTypebox<typeof CreateTokenSchema>
) {
  try {
    const { groupId, subscriptionDurationInDays } = request.body;

    const token = await TokensService.createToken(
      BigInt(groupId),
      subscriptionDurationInDays
    );

    reply.status(200).send({
      ...token,
      groupId: token.groupId.toString(),
    });
    Server.logger.info(
      `Token ${token.tokenId} created for group ${token.groupId}`
    );
  } catch (error) {
    Server.logger.error(new Error(`Error creating token`));
    reply.status(500).send({
      message: `${error instanceof Error ? error?.message : String(error)}`,
    });
  }
}

export default {
  redeemToken,
  createTokenRouteHandler,
  createToken,
  createTokenListener,
};
