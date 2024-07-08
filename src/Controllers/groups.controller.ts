import TelegramBot from 'node-telegram-bot-api';
import UsersService from '../Services/users.service.js';
import Server from '../server.js';
import SubscriptionsService from '../Services/subscriptions.service.js';
import HelperFunctions from '../Utils/functions.util.js';
import GroupsService from '../Services/groups.service.js';
import {
  FastifyReplyTypebox,
  FastifyRequestTypebox,
} from '../Utils/types.util.js';
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
    await GroupsService.getGroups();
    reply.status(200).send();
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

function newMembers(msg: TelegramBot.Message) {
  if (msg && msg.new_chat_members) {
    msg.new_chat_members.forEach(async (newMember) => {
      const user = await UsersService.getUserById(BigInt(newMember.id));
      const hasSubscription =
        await SubscriptionsService.userHasActiveSubscription(
          BigInt(newMember.id),
          BigInt(msg.chat.id)
        );

      if (user && hasSubscription) {
        await Server.chatBot.sendMessage(
          msg.chat.id,
          `Welcome ${user.userId}!`
        );
      } else if (!user) {
        await Server.chatBot.banChatMember(msg.chat.id, newMember.id);
        await Server.chatBot.sendMessage(
          msg.chat.id,
          `Welcome ${newMember.first_name} benned! Reason: Not a premium user.`
        );
      } else if (!hasSubscription) {
        await Server.chatBot.sendMessage(
          msg.chat.id,
          `Welcome ${user.userId} please confirm your subscription by pressing on the button`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Confirm Subscription',
                    url: `https://t.me/${process.env.BOT_USERNAME}?start=${user.userId}`,
                  },
                ],
              ],
            },
          }
        );
        await HelperFunctions.delay(2 * 60 * 1000);
        if (
          await SubscriptionsService.userHasActiveSubscription(
            BigInt(newMember.id),
            BigInt(msg.chat.id)
          )
        )
          return;
        await Server.chatBot.banChatMember(msg.chat.id, newMember.id);
        await Server.chatBot.sendMessage(
          msg.chat.id,
          `${newMember.first_name} Banned! Reason: Doesn't have an active subscription.`
        );
      }
    });
  }
}

async function leftMember(msg: TelegramBot.Message) {
  if (msg && msg.left_chat_member) {
    await Server.chatBot.unbanChatMember(msg.chat.id, msg.left_chat_member.id);
  }
}

export default { newMembers, leftMember, getGroups, botMembershipUpdate };
