import TelegramBot from 'node-telegram-bot-api';
import SubscriptionsService from '../Services/subscriptions.service.js';
import GroupsService from '../Services/groups.service.js';
import {
  FastifyReplyTypebox,
  FastifyRequestTypebox,
} from '../Utils/types.util.js';
import HelperFunctions from '../Utils/functions.util.js';
import Server from '../server.js';
import { GetGroupsSchema } from '../Models/groups.dto.js';

const VALIDATION_TIMEOUT_IN_MINUTES: number = 5;

/**
 * Handler for the `/groups` route
 * @param request - The request object
 * @param reply - The reply object
 */
async function getGroups(
  request: FastifyRequestTypebox<typeof GetGroupsSchema>,
  reply: FastifyReplyTypebox<typeof GetGroupsSchema>
) {
  try {
    // Here does string casting because Typebox 2.5.9 does not support BigInt
    const groups = await GroupsService.getGroups();
    reply.status(200).send(groups);
  } catch (error) {
    Server.logger.error(
      new Error(
        `error getting groups ${
          error instanceof Error ? error.message : 'UNDEFINED'
        }`
      )
    );
    reply.status(500).send({
      message: `${error instanceof Error ? error?.message : String(error)}`,
    });
  }
}

/**
 * Handles the bot membership updates, requests to be added as administrator if it's not and
 * send a confirmation message when it's active
 * @param chatMemberUpdate - The chat member update object
 *
 * @see {@link https://core.telegram.org/bots/api#chatmemberupdated} for details
 */
async function botMembershipUpdate(
  chatMemberUpdate: TelegramBot.ChatMemberUpdated
) {
  const newStatus = chatMemberUpdate.new_chat_member.status;
  try {
    if (newStatus === 'member') {
      await Server.chatBot.sendMessage(
        chatMemberUpdate.chat.id,
        `
        Hola! para que pueda funcionar correctamente en este grupo, por favor agregame como administrador.
      `
      );
      Server.logger.info(
        `Bot added to group as member ${chatMemberUpdate.chat.id}`
      );
    } else if (newStatus === 'administrator') {
      await GroupsService.createGroup(
        BigInt(chatMemberUpdate.chat.id),
        chatMemberUpdate.chat.title ?? 'NO_NAME'
      );
      await Server.chatBot.sendMessage(
        chatMemberUpdate.chat.id,
        `
        Bot activado desde ahora todos los nuevos miembros deben validar su suscripción.
      `
      );
      Server.logger.info(
        `Bot added to group as administrator ${chatMemberUpdate.chat.id}`
      );
      Server.logger.info(`Group ${chatMemberUpdate.chat.id} created`);
    } else if (newStatus === 'left' || newStatus === 'kicked') {
      Server.logger.info(`Bot kicked from group ${chatMemberUpdate.chat.id}`);
    }
  } catch (error) {
    Server.logger.error(
      new Error(`
      Error updating groups: ${
        error instanceof Error ? error.message : 'UNDEFINED'
      }
    `)
    );
  }
}

/**
 * Handles the new members in the group, if the new member is not the bot, it checks if the user has a valid subscription
 * if it does, it sends a welcome message, if it doesn't, it sends a message to validate the subscription and if the user
 * doesn't validate it in a given time kicks the user from the group
 * @param msg - The message object
 */
function newMembers(msg: TelegramBot.Message) {
  if (
    msg &&
    msg.new_chat_members &&
    !msg.new_chat_members.some(
      (member) => member.username === process.env.BOT_USERNAME
    )
  ) {
    msg.new_chat_members.forEach(async (newMember) => {
      try {
        const hasSubscription =
          await SubscriptionsService.userHasActiveSubscription(
            BigInt(newMember.id),
            BigInt(msg.chat.id)
          );

        if (hasSubscription) {
          await Server.chatBot.sendMessage(
            msg.chat.id,
            `Bienvenido ${newMember.first_name}!`
          );

          Server.logger.info(
            `User ${newMember.first_name} joined group ${msg.chat.id}`
          );
        } else if (!hasSubscription && !newMember.is_bot) {
          await Server.chatBot.sendMessage(
            msg.chat.id,
            `Bienvenido ${newMember.first_name} por favor valida tu suscripción presionando el botón`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Validar suscripción',
                      url: `https://t.me/${process.env.BOT_USERNAME}?start`,
                    },
                  ],
                ],
              },
            }
          );

          Server.logger.info(
            `User subscription request sent to ${newMember.first_name} in group ${msg.chat.id}`
          );
          await HelperFunctions.delay(
            VALIDATION_TIMEOUT_IN_MINUTES * 60 * 1000
          );
          if (
            await SubscriptionsService.userHasActiveSubscription(
              BigInt(newMember.id),
              BigInt(msg.chat.id)
            )
          ) {
            Server.logger.info(
              `The user ${newMember.first_name} has a valid subscription to group ${msg.chat.id}`
            );
            return;
          }

          await Server.chatBot.banChatMember(msg.chat.id, String(newMember.id));
          await Server.chatBot.sendMessage(
            msg.chat.id,
            `${newMember.first_name} Baneado! Razon: No tiene una suscripcion activa.`
          );
          Server.logger.info(
            `The user ${newMember.first_name} has been banned from group ${msg.chat.id} for not having a valid subscription`
          );
        }
      } catch (error) {
        Server.logger.error('Error on-boarding new member: ', error);
      }
    });
  }
}

/**
 * Handles the left members in the group, if the left member is not the bot, it unbans the user from the group
 * This is because telegram API doesn't provide a kick command so the ban would prevent the user from joining again
 * @param msg - The message object
 */
async function leftMember(msg: TelegramBot.Message) {
  if (
    msg &&
    msg.left_chat_member &&
    msg.left_chat_member.username !== process.env.BOT_USERNAME
  ) {
    try {
      Server.logger.info(
        `User ${msg.left_chat_member.id} left group ${msg.chat.id}`
      );
      await Server.chatBot.unbanChatMember(
        msg.chat.id,
        String(msg.left_chat_member.id)
      );
      Server.logger.info(
        `User ${msg.left_chat_member.id} unbanned from group ${msg.chat.id}`
      );
    } catch (error) {
      Server.logger.error(
        `Error executing left member event: ${
          error instanceof Error ? error.message : 'UNDEFINED'
        }`
      );
    }
  }
}

export default { getGroups, newMembers, leftMember, botMembershipUpdate };
